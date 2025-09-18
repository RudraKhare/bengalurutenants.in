"""
Review management routes for property reviews with user authorization.
Supports CRUD operations with property association and user validation.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_

from ..db import get_db
from ..models import Review, Property, User
from ..schemas import ReviewCreate, ReviewOut, ReviewListResponse, PropertyOut
from ..dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/v1/reviews", tags=["reviews"])

@router.get("/", response_model=ReviewListResponse)
async def list_reviews(
    db: Session = Depends(get_db),
    property_id: Optional[int] = Query(None, description="Filter reviews by property ID"),
    skip: int = Query(0, ge=0, description="Number of reviews to skip (pagination)"),
    limit: int = Query(20, ge=1, le=100, description="Number of reviews to return"),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> ReviewListResponse:
    """
    List reviews with optional property filtering and pagination.
    
    Filter modes:
    1. No property_id: Return all reviews (newest first)
    2. With property_id: Return reviews for specific property only
    
    Reviews include related user data through SQLAlchemy relationships.
    Public endpoint - shows reviews from all users.
    
    Args:
        db: Database session
        property_id: Optional property filter
        skip: Pagination offset
        limit: Maximum results per page (max 100)
        current_user: Optional authenticated user (for future features)
        
    Returns:
        List of reviews with user and property information
    """
    
    # Start with base query, include user relationship for review author info
    query = db.query(Review)
    
    # Apply property filter if specified
    if property_id is not None:
        # Validate property exists
        property_exists = db.query(Property).filter(Property.id == property_id).first()
        if property_exists is None:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Property with ID {property_id} not found"
            )
        
        query = query.filter(Review.property_id == property_id)
    
    # Order by newest first
    query = query.order_by(Review.created_at.desc())
    
    # Get total count for pagination
    total_count = query.count()
    
    # Apply pagination
    reviews = query.offset(skip).limit(limit).all()
    
    return ReviewListResponse(
        reviews=reviews,
        total=total_count,
        skip=skip,
        limit=limit
    )

@router.get("/my-reviews", response_model=ReviewListResponse)
async def get_my_reviews(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of reviews to skip (pagination)"),
    limit: int = Query(50, ge=1, le=100, description="Number of reviews to return"),
    current_user: User = Depends(get_current_user)
) -> ReviewListResponse:
    """
    Get all reviews created by the current authenticated user.
    
    This endpoint allows users to see their review history in a dashboard.
    Reviews are returned in descending order by creation date (newest first).
    
    Includes:
    - All review details (rating, comment, property_type, etc.)
    - Associated property information through relationships
    - Verification status and vote counts
    
    Args:
        db: Database session
        skip: Pagination offset (default: 0)
        limit: Maximum results per page (default: 50, max: 100)
        current_user: Authenticated user from JWT token
        
    Returns:
        List of user's reviews with associated property data
        
    Raises:
        401: If user is not authenticated
    """
    try:
        # Import relationship loading
        from sqlalchemy.orm import joinedload
        
        # Query reviews for the current user only with property relationship loaded
        print(f"Querying reviews for user ID: {current_user.id}")
        query = db.query(Review).options(joinedload(Review.property)).filter(Review.user_id == current_user.id)
        
        # Order by newest first for dashboard view
        query = query.order_by(Review.created_at.desc())
        
        # Get total count for pagination
        total_count = query.count()
        print(f"Found {total_count} reviews for user")
        
        # Apply pagination
        reviews = query.offset(skip).limit(limit).all()
        print(f"Retrieved {len(reviews)} reviews after pagination")
        
        # Try to serialize the response
        response = ReviewListResponse(
            reviews=reviews,
            total=total_count,
            skip=skip,
            limit=limit
        )
        print(f"Successfully created response")
        return response
        
    except Exception as e:
        print(f"Error fetching user reviews: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user reviews: {str(e)}"
        )

@router.get("/my-properties", response_model=List[dict])
async def get_my_properties(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> List[dict]:
    """
    Get all properties owned by the current authenticated user.
    
    This endpoint allows users to see properties they've created/listed.
    Useful for landlord dashboard or property management views.
    
    Args:
        db: Database session
        current_user: Authenticated user from JWT token
        
    Returns:
        List of properties owned by the user with review statistics
        
    Raises:
        401: If user is not authenticated
    """
    try:
        # Import Property model here to avoid circular imports
        from ..models import Property
        
        print(f"Querying properties for user ID: {current_user.id}")
        
        # Query properties owned by current user
        properties = db.query(Property).filter(
            Property.property_owner_id == current_user.id
        ).order_by(Property.created_at.desc()).all()
        
        print(f"Found {len(properties)} properties for user")
        
        # Convert to dict with additional stats
        result = []
        for prop in properties:
            prop_dict = {
                "id": prop.id,
                "address": prop.address,
                "city": prop.city,
                "area": prop.area,
                "property_type": prop.property_type.value if prop.property_type else None,
                "avg_rating": prop.avg_rating,
                "review_count": prop.review_count,
                "created_at": prop.created_at.isoformat() if prop.created_at else None
            }
            result.append(prop_dict)
        
        print(f"Successfully created response with {len(result)} properties")
        return result
        
    except Exception as e:
        print(f"Error fetching user properties: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to fetch user properties: {str(e)}"
        )

@router.get("/{review_id}", response_model=ReviewOut)
async def get_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> ReviewOut:
    """
    Get single review by ID with full details.
    
    Public endpoint - includes author and property information.
    Uses SQLAlchemy relationships to load related data.
    
    Args:
        review_id: Unique review identifier
        db: Database session
        current_user: Optional authenticated user (for future features)
        
    Returns:
        Complete review details with user and property info
        
    Raises:
        HTTPException 404: If review not found
    """
    
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review with ID {review_id} not found"
        )
    
    return review

@router.post("/", response_model=ReviewOut, status_code=status.HTTP_201_CREATED)
async def create_review(
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ReviewOut:
    """
    Create new property review.
    
    Requires authentication - review is automatically associated with current user.
    Validates property exists before creating review.
    
    Business rules:
    - User can create multiple reviews for the same property
    - Rating must be 1-5 (validated by Pydantic)
    - Review body max 5000 characters (validated by Pydantic)
    
    Args:
        review_data: Validated review creation data
        db: Database session
        current_user: Authenticated user (review author)
        
    Returns:
        Created review with generated ID and timestamps
        
    Raises:
        HTTPException 404: If property not found
    """
    
    # Validate property exists
    property_obj = db.query(Property).filter(Property.id == review_data.property_id).first()
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {review_data.property_id} not found"
        )
    
    try:
        # Create review instance with the columns that exist in the database
        # Columns: id, user_id, property_id, rating, comment, property_type, verification_level, upvotes, downvotes, created_at
        review = Review(
            user_id=current_user.id,
            property_id=review_data.property_id,
            rating=review_data.rating,
            comment=review_data.comment,
            property_type=review_data.property_type,  # User-confirmed property type
            verification_level="unverified",  # Default value
            upvotes=0,  # Using plural name to match database column
            downvotes=0  # Using plural name to match database column
        )
        
        # Add to session and commit
        db.add(review)
        db.commit()
        db.refresh(review)
        
        # Handle photo keys if provided - attach photos to the property
        if hasattr(review_data, 'photo_keys') and review_data.photo_keys:
            print(f"📸 Processing photo keys for property {property_obj.id}: {review_data.photo_keys}")
            
            # Get existing property photo keys
            existing_keys = []
            if property_obj.photo_keys:
                existing_keys = [key.strip() for key in property_obj.photo_keys.split(',') if key.strip()]
            
            # Get new photo keys from review
            new_keys = [key.strip() for key in review_data.photo_keys.split(',') if key.strip()]
            
            # Combine and deduplicate keys (avoid duplicates)
            all_keys = existing_keys + [key for key in new_keys if key not in existing_keys]
            
            # Update property with combined photo keys
            property_obj.photo_keys = ','.join(all_keys)
            db.commit()
            
            print(f"✅ Property {property_obj.id} updated with {len(all_keys)} photos: {property_obj.photo_keys}")
        
        return review
        
    except Exception as e:
        db.rollback()
        print(f"Review creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create review"
        )

@router.put("/{review_id}", response_model=ReviewOut)
async def update_review(
    review_id: int,
    review_data: ReviewCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> ReviewOut:
    """
    Update existing review.
    
    Authorization: Only review author can update their reviews.
    Complete replacement of rating and body fields.
    Property association cannot be changed (create new review instead).
    
    Args:
        review_id: Review to update
        review_data: New review data (rating and body)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated review with new data
        
    Raises:
        HTTPException 404: If review not found
        HTTPException 403: If user doesn't own the review
        HTTPException 400: If trying to change property association
    """
    
    # Find review
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review with ID {review_id} not found"
        )
    
    # Authorization check - only author can update
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own reviews"
        )
    
    # Prevent changing property association
    if review_data.property_id != review.property_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Cannot change property association. Create a new review instead."
        )
    
    try:
        # Update rating and comment (property_id remains unchanged)
        review.rating = review_data.rating
        review.comment = review_data.comment
        
        db.commit()
        db.refresh(review)
        
        return review
        
    except Exception as e:
        db.rollback()
        print(f"Review update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update review"
        )

@router.delete("/{review_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_review(
    review_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete review.
    
    Authorization: Only review author can delete their reviews.
    Permanent deletion - no soft delete or archiving.
    
    Args:
        review_id: Review to delete
        db: Database session
        current_user: Authenticated user
        
    Returns:
        HTTP 204 No Content on success
        
    Raises:
        HTTPException 404: If review not found
        HTTPException 403: If user doesn't own the review
    """
    
    # Find review
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if review is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Review with ID {review_id} not found"
        )
    
    # Authorization check - only author can delete
    if review.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own reviews"
        )
    
    try:
        # Delete review
        db.delete(review)
        db.commit()
        
        # No content return for successful deletion
        
    except Exception as e:
        db.rollback()
        print(f"Review deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete review"
        )
