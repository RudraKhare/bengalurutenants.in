"""
SQLAlchemy ORM models for the tenant review platform.
Defines database schema for users, properties, reviews, and verifications.
"""

import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from .db import Base

class UserRole(str, enum.Enum):
    """User role enumeration matching database enum."""
    TENANT = "tenant"
    LANDLORD = "landlord" 
    ADMIN = "admin"

class VerificationMethod(str, enum.Enum):
    """Verification method enumeration matching database enum."""
    RENTAL_AGREEMENT = "rental_agreement"
    UTILITY_BILL = "utility_bill"
    UPI_TRANSACTION = "upi_transaction"
    BANK_STATEMENT = "bank_statement"
    PHOTOS = "photos"

class VerificationStatus(str, enum.Enum):
    """Verification status enumeration matching database enum."""
    PENDING = "pending"
    VERIFIED = "verified"
    REJECTED = "rejected"

class User(Base):
    """
    User model for authentication and profile management.
    Stores email, verification status, and timestamps.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    role = Column(Enum(UserRole), default=UserRole.TENANT, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships - allows you to access user.reviews and user.verifications
    reviews = relationship("Review", back_populates="user")
    properties = relationship("Property", back_populates="owner")
    verifications = relationship("TenantVerification", back_populates="user")

class Property(Base):
    """
    Property model for rental listings.
    Stores location data and allows for geographic searches.
    """
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    address = Column(Text, nullable=False)  # Full address
    city = Column(String(100), nullable=False, index=True)  # Indexed for city searches
    
    # Geographic coordinates for location-based searches
    lat = Column(Float, nullable=True)  # Latitude (-90 to 90)
    lon = Column(Float, nullable=True)  # Longitude (-180 to 180)
    
    # Rental information
    rent_amount = Column(Integer, nullable=False)  # Monthly rent
    deposit_amount = Column(Integer, nullable=True)  # Security deposit
    property_type = Column(String(50), nullable=False)  # Apartment, House, etc.
    bhk_count = Column(Integer, nullable=True)  # Number of bedrooms
    square_feet = Column(Integer, nullable=True)  # Property size
    description = Column(Text, nullable=True)  # Property description
    amenities = Column(Text, nullable=True)  # Available amenities
    
    # Ownership and timestamps
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships
    owner = relationship("User", back_populates="properties")
    reviews = relationship("Review", back_populates="property")
    verifications = relationship("TenantVerification", back_populates="property")

class Review(Base):
    """
    Review model for tenant feedback on properties.
    Links users to properties with ratings and verification levels.
    """
    __tablename__ = "reviews"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False, index=True)  # Indexed for fast property review lookups
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 scale
    body = Column(Text, nullable=True)  # Review text (max 5000 chars validated in schema)
    
    # Trust and verification system
    verification_level = Column(String(20), default="unverified", nullable=False)  # unverified, basic, verified
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)  # Indexed for date sorting
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    
    # Relationships - enables review.user and review.property access
    user = relationship("User", back_populates="reviews")
    property = relationship("Property", back_populates="reviews")

class TenantVerification(Base):
    """
    Tenant verification model for proving residency.
    Stores verification methods and status for trust scoring.
    """
    __tablename__ = "tenant_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    
    # Verification details
    method = Column(Enum(VerificationMethod), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    
    # Evidence storage
    upi_txn_id = Column(String(100), nullable=True)  # For UPI payment verifications
    proof_url = Column(String(500), nullable=True)   # URL to uploaded documents
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", back_populates="verifications")
    property = relationship("Property", back_populates="verifications")

# Database indexes for query performance
# These improve query speed for common access patterns

# Index for property address searches (ILIKE queries)
Index('idx_properties_address', Property.address)

# Composite index for geographic searches (lat, lon together)
Index('idx_properties_location', Property.lat, Property.lon)

# Index for getting reviews by property ordered by date
Index('idx_reviews_property_date', Review.property_id, Review.created_at.desc())

# Index for user verification status lookups
Index('idx_verifications_user_status', TenantVerification.user_id, TenantVerification.status)
