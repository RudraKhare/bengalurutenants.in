"""
Property management routes for CRUD operations and geographic search.
Provides public listing and search with optional user-specific operations.
"""

from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, func

from ..db import get_db
from ..models import Property, User
from ..schemas import PropertyCreate, PropertyOut, PropertyListResponse
from ..dependencies import get_current_user, get_current_user_optional

router = APIRouter(prefix="/api/v1/properties", tags=["properties"])

@router.get("/", response_model=PropertyListResponse)
async def list_properties(
    db: Session = Depends(get_db),
    skip: int = Query(0, ge=0, description="Number of properties to skip (pagination)"),
    limit: int = Query(20, ge=1, le=100, description="Number of properties to return"),
    latitude: Optional[float] = Query(None, description="Center latitude for geographic search"),
    longitude: Optional[float] = Query(None, description="Center longitude for geographic search"),
    radius_km: Optional[float] = Query(None, ge=0.1, le=50, description="Search radius in kilometers"),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> PropertyListResponse:
    """
    List properties with optional geographic filtering and pagination.
    
    Search modes:
    1. No coordinates: Return all properties (paginated)
    2. With coordinates: Return properties within radius using Haversine formula
    
    Geographic search uses spherical distance calculation:
    - Formula: 6371 * 2 * ASIN(SQRT(sin²(Δlat/2) + cos(lat1)*cos(lat2)*sin²(Δlon/2)))
    - 6371 = Earth's radius in kilometers
    - Handles edge cases like crossing 180° longitude
    
    Pagination:
    - skip: Number of records to skip (offset)
    - limit: Maximum records to return (max 100 for performance)
    
    Args:
        db: Database session
        skip: Pagination offset
        limit: Maximum results per page
        latitude: Search center latitude (-90 to 90)
        longitude: Search center longitude (-180 to 180)
        radius_km: Search radius in kilometers (0.1 to 50)
        current_user: Optional authenticated user (for future personalization)
        
    Returns:
        List of properties with total count for pagination
    """
    
    # Start with base query
    query = db.query(Property)
    
    # Apply geographic filtering if coordinates provided
    if latitude is not None and longitude is not None:
        if radius_km is None:
            # Default 5km radius if coordinates given but no radius
            radius_km = 5.0
        
        # Haversine formula for spherical distance calculation
        # SQLAlchemy expression using radians and trigonometric functions
        lat1_rad = func.radians(latitude)
        lat2_rad = func.radians(Property.lat)
        delta_lat = func.radians(Property.lat - latitude)
        delta_lon = func.radians(Property.lon - longitude)
        
        # Haversine calculation components
        a = (func.sin(delta_lat / 2) * func.sin(delta_lat / 2) +
             func.cos(lat1_rad) * func.cos(lat2_rad) *
             func.sin(delta_lon / 2) * func.sin(delta_lon / 2))
        
        distance_km = 6371 * 2 * func.asin(func.sqrt(a))
        
        # Filter by radius
        query = query.filter(distance_km <= radius_km)
        
        # Order by distance (nearest first) when using geographic search
        query = query.order_by(distance_km)
    else:
        # Default ordering by newest first when no geographic search
        query = query.order_by(Property.created_at.desc())
    
    # Get total count for pagination (before applying skip/limit)
    total_count = query.count()
    
    # Apply pagination
    properties = query.offset(skip).limit(limit).all()
    
    return PropertyListResponse(
        properties=properties,
        total=total_count,
        skip=skip,
        limit=limit
    )

@router.get("/{property_id}", response_model=PropertyOut)
async def get_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_current_user_optional)
) -> PropertyOut:
    """
    Get single property by ID with full details.
    
    Public endpoint - no authentication required.
    Includes related data through SQLAlchemy relationships.
    
    Args:
        property_id: Unique property identifier
        db: Database session
        current_user: Optional authenticated user (for future features)
        
    Returns:
        Complete property details including owner information
        
    Raises:
        HTTPException 404: If property not found
    """
    
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    return property_obj

@router.post("/", response_model=PropertyOut, status_code=status.HTTP_201_CREATED)
async def create_property(
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PropertyOut:
    """
    Create new property listing.
    
    Requires authentication - property is automatically associated with current user.
    All fields are validated by Pydantic schema before reaching this function.
    
    Validation includes:
    - Address length (10-500 characters)
    - Coordinate bounds (lat: -90 to 90, lon: -180 to 180)
    - Rent amount (minimum 1)
    - Description and amenities length limits
    
    Args:
        property_data: Validated property creation data
        db: Database session
        current_user: Authenticated user (property owner)
        
    Returns:
        Created property with generated ID and timestamps
    """
    
    try:
        # Create property instance with current user as owner
        property_obj = Property(
            **property_data.model_dump(),
            owner_id=current_user.id
        )
        
        # Add to session and commit
        db.add(property_obj)
        db.commit()
        db.refresh(property_obj)
        
        return property_obj
        
    except Exception as e:
        db.rollback()
        print(f"Property creation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to create property"
        )

@router.put("/{property_id}", response_model=PropertyOut)
async def update_property(
    property_id: int,
    property_data: PropertyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
) -> PropertyOut:
    """
    Update existing property listing.
    
    Authorization: Only property owner can update their listings.
    Complete replacement of all updatable fields.
    
    Args:
        property_id: Property to update
        property_data: New property data (replaces all fields)
        db: Database session
        current_user: Authenticated user
        
    Returns:
        Updated property with new data
        
    Raises:
        HTTPException 404: If property not found
        HTTPException 403: If user doesn't own the property
    """
    
    # Find property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    # Authorization check - only owner can update
    if property_obj.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own properties"
        )
    
    try:
        # Update all fields from request data
        update_data = property_data.model_dump()
        for field, value in update_data.items():
            setattr(property_obj, field, value)
        
        db.commit()
        db.refresh(property_obj)
        
        return property_obj
        
    except Exception as e:
        db.rollback()
        print(f"Property update error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to update property"
        )

@router.delete("/{property_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_property(
    property_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """
    Delete property listing.
    
    Authorization: Only property owner can delete their listings.
    Cascading deletes: Related reviews are automatically deleted (FK constraint).
    
    Args:
        property_id: Property to delete
        db: Database session
        current_user: Authenticated user
        
    Returns:
        HTTP 204 No Content on success
        
    Raises:
        HTTPException 404: If property not found
        HTTPException 403: If user doesn't own the property
    """
    
    # Find property
    property_obj = db.query(Property).filter(Property.id == property_id).first()
    
    if property_obj is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Property with ID {property_id} not found"
        )
    
    # Authorization check - only owner can delete
    if property_obj.owner_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own properties"
        )
    
    try:
        # Delete property (cascades to reviews automatically)
        db.delete(property_obj)
        db.commit()
        
        # No content return for successful deletion
        
    except Exception as e:
        db.rollback()
        print(f"Property deletion error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete property"
        )
