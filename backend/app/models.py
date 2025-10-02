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

class PropertyType(str, enum.Enum):
    """Property type enumeration matching database enum."""
    VILLA_HOUSE = "VILLA_HOUSE"
    FLAT_APARTMENT = "FLAT_APARTMENT"
    PG_HOSTEL = "PG_HOSTEL"

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
    # No relationships defined to avoid conflicts with database schema

class Property(Base):
    """
    Property model for rental listings.
    Stores location data and allows for geographic searches.
    Updated to exactly match Supabase schema.
    """
    __tablename__ = "properties"

    # Exactly matching Supabase DB columns:
    # id, address, city, area, lat, lng, avg_rating, review_count, photo_keys, property_owner_id, created_at
    id = Column(Integer, primary_key=True, index=True)
    address = Column(Text, nullable=False)  # Full address
    city = Column(String(100), nullable=False, index=True)  # Indexed for city searches
    area = Column(String(100), nullable=True)  # Area/neighborhood within city (can be null)
    property_type = Column(Enum(PropertyType), nullable=False, default=PropertyType.FLAT_APARTMENT)  # Type of property
    
    # Geographic coordinates for location-based searches
    lat = Column(Float, nullable=True)  # Latitude (-90 to 90)
    lng = Column(Float, nullable=True)  # Longitude (-180 to 180)
    
    # Review metrics stored at the property level for quick access
    avg_rating = Column(Float, default=0.0)  # Average of all review ratings
    review_count = Column(Integer, default=0)  # Number of reviews
    
    # Photo management
    photo_keys = Column(Text, nullable=True)  # Comma-separated R2 object keys
    
    # Ownership tracking
    property_owner_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    reviews = relationship("Review", back_populates="property")
    verifications = relationship("TenantVerification", back_populates="property")

class Review(Base):
    """
    Review model for tenant feedback on properties.
    Links users to properties with ratings and verification levels.
    Updated to exactly match Supabase schema.
    """
    __tablename__ = "reviews"

    # Columns in exact order from Supabase:
    # id, user_id, property_id, rating, comment, verification_level, upvote, downvote, created_at
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False, index=True)
    
    # Review content
    rating = Column(Integer, nullable=False)  # 1-5 scale
    comment = Column(Text, nullable=True)
    property_type = Column(Enum(PropertyType), nullable=True)  # User-confirmed property type
    
    # Trust and verification system
    verification_level = Column(String(20), default="unverified", nullable=False)
    
    # Voting system - using the correct plural column names
    upvotes = Column(Integer, default=0)  # Plural 'upvotes' to match database column
    downvotes = Column(Integer, default=0)  # Plural 'downvotes' to match database column
    
    created_at = Column(DateTime(timezone=True), server_default=func.now(), index=True)
    
    # Relationships - enables review.property access
    property = relationship("Property", back_populates="reviews")

class TenantVerification(Base):
    """
    Tenant verification model for proving residency.
    Stores verification methods and status for trust scoring.
    Updated to match Supabase schema.
    """
    __tablename__ = "tenant_verifications"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    review_id = Column(Integer, ForeignKey("reviews.id"), nullable=True)  # Link to the review being verified
    
    # Verification details
    method = Column(Enum(VerificationMethod), nullable=False)
    status = Column(Enum(VerificationStatus), default=VerificationStatus.PENDING, nullable=False)
    
    # Evidence storage
    proof_url = Column(String(500), nullable=True)   # URL to uploaded documents
    upi_txn_id = Column(String(100), nullable=True)  # For UPI payment verifications
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    property = relationship("Property", back_populates="verifications")
    # No user relationship since we're not using User model for backref links

# Database indexes for query performance
# These improve query speed for common access patterns

# Index for property address searches (ILIKE queries)
Index('idx_properties_address', Property.address)

# Composite index for geographic searches (lat, lng together)
Index('idx_properties_location', Property.lat, Property.lng)

# Index for getting reviews by property ordered by date
Index('idx_reviews_property_date', Review.property_id, Review.created_at.desc())

# Index for user verification status lookups
Index('idx_verifications_user_status', TenantVerification.user_id, TenantVerification.status)

# Geocoding Cache model for minimizing API calls
class GeocodingCache(Base):
    """
    Geocoding cache to minimize Google Maps API calls.
    Stores address-to-coordinates mappings with timestamps.
    """
    __tablename__ = "geocoding_cache"
    
    id = Column(Integer, primary_key=True, index=True)
    address = Column(String(500), unique=True, nullable=False, index=True)
    latitude = Column(Float, nullable=False)
    longitude = Column(Float, nullable=False)
    formatted_address = Column(String(500), nullable=True)
    cached_at = Column(DateTime(timezone=True), server_default=func.now())

# Index for geocoding cache address lookups
Index('idx_geocoding_cache_address', GeocodingCache.address)
