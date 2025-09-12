"""
SQLAlchemy models for the Bengaluru Tenants platform.
Defines database schema for users, properties, reviews, and verifications.
"""

from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from db import Base
import enum

# Enums for controlled vocabulary
class UserRole(str, enum.Enum):
    TENANT = "tenant"
    LANDLORD = "landlord"
    ADMIN = "admin"

class VerificationMethod(str, enum.Enum):
    RENTAL_AGREEMENT = "rental_agreement"
    UTILITY_BILL = "utility_bill"
    UPI_TRANSACTION = "upi_transaction"
    BANK_STATEMENT = "bank_statement"
    PHOTOS = "photos"

class VerificationStatus(str, enum.Enum):
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class User(Base):
    """
    User model for tenants, landlords, and admins.
    Stores authentication and profile information.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    is_email_verified = Column(Boolean, default=False)
    role = Column(Enum(UserRole), default=UserRole.TENANT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # TODO: Add password hash field
    # password_hash = Column(String(255), nullable=False)
    # TODO: Add profile fields like name, bio, etc.
    
    # Relationships
    reviews = relationship("Review", back_populates="user")
    tenant_verifications = relationship("TenantVerification", back_populates="user")

class Property(Base):
    """
    Property model for rental properties.
    Stores location, contact info, and aggregate review data.
    """
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(Text, nullable=False)
    city = Column(String(100), nullable=False, index=True)
    area = Column(String(100), nullable=False, index=True)  # Neighborhood/locality
    
    # Geographic coordinates for mapping
    lat = Column(Float, nullable=True)  # Latitude
    lng = Column(Float, nullable=True)  # Longitude
    
    # Aggregate review metrics (updated when reviews are added/modified)
    avg_rating = Column(Float, nullable=True, default=0.0)
    review_count = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # TODO: Add property details
    # property_type = Column(String(50))  # apartment, house, pg, etc.
    # rent_range_min = Column(Integer)
    # rent_range_max = Column(Integer)
    # landlord_contact = Column(String(20))
    
    # Relationships
    reviews = relationship("Review", back_populates="property")
    tenant_verifications = relationship("TenantVerification", back_populates="property")

class Review(Base):
    """
    Review model for tenant experiences.
    Links users to properties with ratings and comments.
    """
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 scale
    comment = Column(Text, nullable=True)
    
    # Verification and trust signals
    verification_level = Column(String(20), default="unverified")  # unverified, basic, verified
    
    # Community engagement
    upvotes = Column(Integer, default=0)
    downvotes = Column(Integer, default=0)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # TODO: Add review categories
    # cleanliness_rating = Column(Integer)
    # landlord_rating = Column(Integer) 
    # location_rating = Column(Integer)
    # value_for_money_rating = Column(Integer)
    
    # Relationships
    user = relationship("User", back_populates="reviews")
    property = relationship("Property", back_populates="reviews")
    tenant_verification = relationship("TenantVerification", back_populates="review", uselist=False)

class TenantVerification(Base):
    """
    Tenant verification model for proving tenancy.
    Links users to properties with proof of residence.
    """
    __tablename__ = "tenant_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=True)  # Optional: link to specific review
    
    # Verification details
    method = Column(Enum(VerificationMethod), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING)
    
    # Evidence storage
    proof_url = Column(String(500), nullable=True)  # S3/MinIO URL for uploaded documents
    upi_txn_id = Column(String(100), nullable=True)  # UPI transaction ID for rent payments
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # TODO: Add verification metadata
    # verified_by_user_id = Column(Integer, ForeignKey("users.id"))  # Admin who verified
    # verification_notes = Column(Text)
    # expiry_date = Column(DateTime)  # When verification expires
    
    # Relationships
    user = relationship("User", back_populates="tenant_verifications")
    property = relationship("Property", back_populates="tenant_verifications")
    review = relationship("Review", back_populates="tenant_verification")

# Database indexes for performance
# These will be created via Alembic migrations

"""
Additional indexes to consider for production:

1. Reviews by property and rating:
   CREATE INDEX idx_reviews_property_rating ON reviews(property_id, rating DESC);

2. Reviews by verification level:
   CREATE INDEX idx_reviews_verification ON reviews(verification_level, created_at DESC);

3. Properties by location:
   CREATE INDEX idx_properties_location ON properties(city, area);

4. Geographic search (PostGIS):
   CREATE INDEX idx_properties_geom ON properties USING GIST (ST_Point(lng, lat));

5. User reviews by date:
   CREATE INDEX idx_user_reviews_date ON reviews(user_id, created_at DESC);
"""
