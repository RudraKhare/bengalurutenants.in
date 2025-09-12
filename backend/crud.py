"""
CRUD operations for database interactions.
Contains helper functions for creating, reading, updating, and deleting records.
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import Optional, List
import models
import schemas

# User CRUD operations
def get_user(db: Session, user_id: int) -> Optional[models.User]:
    """Get a user by ID."""
    return db.query(models.User).filter(models.User.id == user_id).first()
"""
Without CRUD separation (Bad):

@app.get("/users/{user_id}")
def get_user_endpoint(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()  # Database logic mixed with API logic
    if not user:
        raise HTTPException(404, "User not found")
    return user
"""

def get_user_by_email(db: Session, email: str) -> Optional[models.User]:
    """Get a user by email address."""
    return db.query(models.User).filter(models.User.email == email).first()

def create_user(db: Session, user: schemas.UserCreate) -> models.User:
    """Create a new user."""
    db_user = models.User(
        email=user.email,
        phone=user.phone,
        role=user.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_users(db: Session, skip: int = 0, limit: int = 100) -> List[models.User]:
    """Get a list of users with pagination."""
    return db.query(models.User).offset(skip).limit(limit).all()

# Property CRUD operations
def get_property(db: Session, property_id: int) -> Optional[models.Property]:
    """Get a property by ID."""
    return db.query(models.Property).filter(models.Property.id == property_id).first()

def create_property(db: Session, property_data: schemas.PropertyCreate) -> models.Property:
    """Create a new property."""
    db_property = models.Property(
        address=property_data.address,
        city=property_data.city,
        area=property_data.area,
        lat=property_data.lat,
        lng=property_data.lng
    )
    db.add(db_property)
    db.commit()
    db.refresh(db_property)
    return db_property

def get_properties(
    db: Session, 
    skip: int = 0, 
    limit: int = 100,
    city: Optional[str] = None,
    area: Optional[str] = None
) -> List[models.Property]:
    """Get a list of properties with optional filtering."""
    query = db.query(models.Property)
    
    if city:
        query = query.filter(models.Property.city.ilike(f"%{city}%"))
    if area:
        query = query.filter(models.Property.area.ilike(f"%{area}%"))
    
    return query.offset(skip).limit(limit).all()

def search_properties_by_location(
    db: Session,
    city: str,
    area: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
) -> List[models.Property]:
    """Search properties by city and optional area."""
    query = db.query(models.Property).filter(models.Property.city.ilike(f"%{city}%"))
    
    if area:
        query = query.filter(models.Property.area.ilike(f"%{area}%"))
    
    return query.offset(skip).limit(limit).all()

# Review CRUD operations
def get_review(db: Session, review_id: int) -> Optional[models.Review]:
    """Get a review by ID."""
    return db.query(models.Review).filter(models.Review.id == review_id).first()

def create_review(
    db: Session, 
    review: schemas.ReviewCreate, 
    user_id: int
) -> models.Review:
    """Create a new review."""
    db_review = models.Review(
        user_id=user_id,
        property_id=review.property_id,
        rating=review.rating,
        comment=review.comment
    )
    db.add(db_review)
    db.commit()
    db.refresh(db_review)
    
    # Update property aggregate ratings
    update_property_ratings(db, review.property_id)
    
    return db_review

def get_reviews_by_property(
    db: Session, 
    property_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[models.Review]:
    """Get all reviews for a specific property."""
    return (
        db.query(models.Review)
        .filter(models.Review.property_id == property_id)
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def get_reviews_by_user(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[models.Review]:
    """Get all reviews by a specific user."""
    return (
        db.query(models.Review)
        .filter(models.Review.user_id == user_id)
        .order_by(models.Review.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_property_ratings(db: Session, property_id: int):
    """Update property aggregate rating and review count."""
    # Calculate average rating and count
    result = (
        db.query(
            func.avg(models.Review.rating).label('avg_rating'),
            func.count(models.Review.id).label('review_count')
        )
        .filter(models.Review.property_id == property_id)
        .first()
    )
    
    # Update property
    property_obj = get_property(db, property_id)
    if property_obj:
        property_obj.avg_rating = float(result.avg_rating) if result.avg_rating else 0.0
        property_obj.review_count = result.review_count or 0
        db.commit()

# Tenant verification CRUD operations
def create_tenant_verification(
    db: Session,
    verification: schemas.TenantVerificationCreate,
    user_id: int
) -> models.TenantVerification:
    """Create a new tenant verification."""
    db_verification = models.TenantVerification(
        user_id=user_id,
        property_id=verification.property_id,
        review_id=verification.review_id,
        method=verification.method,
        proof_url=verification.proof_url,
        upi_txn_id=verification.upi_txn_id
    )
    db.add(db_verification)
    db.commit()
    db.refresh(db_verification)
    return db_verification

def get_verification(db: Session, verification_id: int) -> Optional[models.TenantVerification]:
    """Get a verification by ID."""
    return db.query(models.TenantVerification).filter(
        models.TenantVerification.id == verification_id
    ).first()

def get_verifications_by_user(
    db: Session, 
    user_id: int, 
    skip: int = 0, 
    limit: int = 100
) -> List[models.TenantVerification]:
    """Get all verifications for a specific user."""
    return (
        db.query(models.TenantVerification)
        .filter(models.TenantVerification.user_id == user_id)
        .order_by(models.TenantVerification.created_at.desc())
        .offset(skip)
        .limit(limit)
        .all()
    )

def update_verification_status(
    db: Session,
    verification_id: int,
    status: models.VerificationStatus
) -> Optional[models.TenantVerification]:
    """Update verification status (admin function)."""
    verification = get_verification(db, verification_id)
    if verification:
        verification.status = status
        db.commit()
        db.refresh(verification)
    return verification

# Utility functions
def get_property_stats(db: Session, property_id: int) -> dict:
    """Get comprehensive stats for a property."""
    property_obj = get_property(db, property_id)
    if not property_obj:
        return {}
    
    # Get rating distribution
    rating_distribution = (
        db.query(
            models.Review.rating,
            func.count(models.Review.id).label('count')
        )
        .filter(models.Review.property_id == property_id)
        .group_by(models.Review.rating)
        .all()
    )
    
    # Get verification stats
    verification_stats = (
        db.query(
            models.TenantVerification.status,
            func.count(models.TenantVerification.id).label('count')
        )
        .filter(models.TenantVerification.property_id == property_id)
        .group_by(models.TenantVerification.status)
        .all()
    )
    
    return {
        "property": property_obj,
        "rating_distribution": {str(r.rating): r.count for r in rating_distribution},
        "verification_stats": {str(v.status): v.count for v in verification_stats},
        "total_reviews": property_obj.review_count,
        "average_rating": property_obj.avg_rating
    }

# TODO: Add full-text search functions
# TODO: Add geographic search functions (PostGIS)
# TODO: Add caching for frequently accessed data
# TODO: Add bulk operations for data imports
# TODO: Add soft delete functionality
