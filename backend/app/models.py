"""
SQLAlchemy ORM models for the tenant review platform.
Defines database schema for users, properties, reviews, and verifications.
"""

import enum
from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, Text, ForeignKey, Index, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from sqlalchemy.dialects.postgresql import JSONB
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
    Stores email, verification status, role (user/admin), and timestamps.
    """
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(20), nullable=True)
    name = Column(String(100), nullable=True)
    is_email_verified = Column(Boolean, default=False, nullable=False)
    role = Column(String(20), default='user', nullable=False)  # 'user' or 'admin'
    is_verified = Column(Boolean, default=False, nullable=False)  # Manual admin verification
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
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
    
    # Admin verification fields
    is_verified = Column(Boolean, default=False, nullable=False)  # Admin verified
    verified_at = Column(DateTime(timezone=True), nullable=True)
    verified_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    verification_notes = Column(Text, nullable=True)
    
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

# City and Locality models for dynamic city/area management
class City(Base):
    """
    City model for managing supported cities.
    Stores city name and metadata for multi-city support.
    """
    __tablename__ = "cities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), unique=True, nullable=False, index=True)
    state = Column(String(100), nullable=True)
    country = Column(String(100), default="India", nullable=False)
    lat = Column(Float, nullable=True)  # City center latitude
    lng = Column(Float, nullable=True)  # City center longitude
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    localities = relationship("Locality", back_populates="city", cascade="all, delete-orphan")

class Locality(Base):
    """
    Locality model for managing neighborhoods/areas within cities.
    Supports fuzzy search and dynamic locality suggestions.
    """
    __tablename__ = "localities"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(200), nullable=False, index=True)
    city_id = Column(Integer, ForeignKey("cities.id"), nullable=False)
    region = Column(String(100), nullable=True)  # e.g., "East Bengaluru", "Central Mumbai"
    is_popular = Column(Boolean, default=False, nullable=False)
    is_active = Column(Boolean, default=True, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    city = relationship("City", back_populates="localities")

# Indexes for efficient city/locality queries
Index('idx_cities_name', City.name)
Index('idx_cities_active', City.is_active)
Index('idx_localities_city', Locality.city_id)
Index('idx_localities_name', Locality.name)
Index('idx_localities_city_name', Locality.city_id, Locality.name)
Index('idx_localities_popular', Locality.is_popular)


# ============================================
# ADMIN SYSTEM MODELS
# ============================================

class AdminLog(Base):
    """
    Admin activity log for audit trail.
    Tracks all admin actions for security and compliance.
    """
    __tablename__ = "admin_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    admin_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    action = Column(String(100), nullable=False)  # e.g., 'delete_user', 'verify_review'
    target_type = Column(String(50), nullable=True)  # e.g., 'user', 'review', 'property'
    target_id = Column(Integer, nullable=True)
    details = Column(JSONB, nullable=True)  # Additional context as JSON
    ip_address = Column(String(45), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    admin = relationship("User", foreign_keys=[admin_id])


class VerificationDocument(Base):
    """
    User verification documents (Aadhaar, PAN, rental agreement, etc.)
    Used for manual verification of tenant identity.
    """
    __tablename__ = "verification_documents"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    document_type = Column(String(50), nullable=False)  # 'aadhaar', 'pan', 'rental_agreement'
    document_url = Column(Text, nullable=False)  # R2/S3 URL
    status = Column(String(20), default="pending", nullable=False)  # 'pending', 'approved', 'rejected'
    rejection_reason = Column(Text, nullable=True)
    uploaded_at = Column(DateTime(timezone=True), server_default=func.now())
    reviewed_at = Column(DateTime(timezone=True), nullable=True)
    reviewed_by = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    reviewer = relationship("User", foreign_keys=[reviewed_by])


# Indexes for admin features
Index('idx_admin_logs_admin_id', AdminLog.admin_id)
Index('idx_admin_logs_created_at', AdminLog.created_at.desc())
Index('idx_admin_logs_action', AdminLog.action)
Index('idx_verification_documents_user_id', VerificationDocument.user_id)
Index('idx_verification_documents_status', VerificationDocument.status)
Index('idx_verification_documents_reviewed_at', VerificationDocument.reviewed_at)
