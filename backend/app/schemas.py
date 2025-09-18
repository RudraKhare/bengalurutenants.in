"""
Pydantic schemas for API request/response validation.
Validates incoming data before it reaches route logic and formats outgoing responses.
"""

from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import UserRole, PropertyType

# Authentication schemas
class EmailRequest(BaseModel):
    """Request schema for magic link generation - validates email format."""
    email: EmailStr = Field(..., description="Valid email address for magic link")

class MagicTokenResponse(BaseModel):
    """Response after magic link generation."""
    message: str = Field(default="Magic link generated", description="Success message")

class TokenResponse(BaseModel):
    """Response after successful token verification."""
    access_token: str = Field(..., description="JWT access token for API authentication")
    token_type: str = Field(default="bearer", description="Token type for Authorization header")

# Property schemas
class PropertyCreate(BaseModel):
    """Schema for creating a new property - strict validation."""
    address: str = Field(..., min_length=10, max_length=500, description="Complete property address")
    city: str = Field(..., min_length=2, max_length=100, description="City name")
    area: Optional[str] = Field(None, max_length=100, description="Area/neighborhood within city")
    property_type: PropertyType = Field(default=PropertyType.FLAT_APARTMENT, description="Type of property")
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    lng: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")
    photo_keys: Optional[str] = Field(None, description="Comma-separated R2 object keys for property photos")

class PropertyOut(BaseModel):
    """Response schema for property data."""
    id: int
    address: str
    city: str
    area: Optional[str] = None
    property_type: PropertyType
    lat: Optional[float] = None
    lng: Optional[float] = None
    avg_rating: Optional[float] = None
    review_count: int = 0
    photo_keys: Optional[str] = None  # Comma-separated R2 object keys
    property_owner_id: Optional[int] = None
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)  # Enables SQLAlchemy model conversion

# Review schemas  
class ReviewCreate(BaseModel):
    """Schema for creating a review - strict validation on rating and comment length."""
    property_id: int = Field(..., gt=0, description="Valid property ID")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    comment: Optional[str] = Field(None, max_length=5000, description="Review text (optional)")
    property_type: Optional[PropertyType] = Field(None, description="User-confirmed property type")
    # Note: photo_keys is accepted in the API but not stored directly in the reviews table
    photo_keys: Optional[str] = Field(None, description="Comma-separated R2 object keys for review photos")

class ReviewOut(BaseModel):
    """Response schema for review data."""
    id: int
    user_id: int
    property_id: int
    rating: int
    comment: Optional[str] = None
    property_type: Optional[PropertyType] = None
    verification_level: str
    upvotes: int = 0  # Using plural form to match database column
    downvotes: int = 0  # Using plural form to match database column
    created_at: datetime
    property: Optional[PropertyOut] = None  # Include related property data
    
    model_config = ConfigDict(from_attributes=True)

# User schemas
class UserOut(BaseModel):
    """Response schema for user data - excludes sensitive information."""
    id: int
    email: str
    phone: Optional[str] = None
    is_email_verified: bool
    role: UserRole
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# List response schemas for pagination
class PropertyListResponse(BaseModel):
    """Paginated list of properties."""
    properties: List[PropertyOut]
    total: int

class ReviewListResponse(BaseModel):
    """Paginated list of reviews."""
    reviews: List[ReviewOut]
    total: int
    skip: int = 0
    limit: int = 20

# Photo upload schemas for Day 3
class PhotoUploadRequest(BaseModel):
    """Request schema for generating presigned upload URLs."""
    content_type: str = Field(..., pattern="^image/(jpeg|png|webp|gif)$", description="Image MIME type")
    file_type: str = Field(..., pattern="^(property|review)$", description="Upload category")
    
class PhotoUploadResponse(BaseModel):
    """Response schema with presigned upload URL and metadata."""
    upload_url: str = Field(..., description="Presigned URL for direct upload to R2")
    object_key: str = Field(..., description="Unique identifier for the uploaded file")
    expires_in: int = Field(..., description="URL expiry time in seconds")

class PhotoViewResponse(BaseModel):
    """Response schema for viewing uploaded photos."""
    view_url: str = Field(..., description="Presigned URL for viewing the photo")
    object_key: str = Field(..., description="File identifier in storage")
    expires_in: int = Field(..., description="URL expiry time in seconds")

# Property photo management schemas
class PhotoUploadData(BaseModel):
    """Schema for adding a photo to a property."""
    photo_key: str = Field(..., description="R2 object key for the uploaded photo")
