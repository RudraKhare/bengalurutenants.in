"""
Pydantic schemas for API request/response validation.
Validates incoming data before it reaches route logic and formats outgoing responses.
"""

from pydantic import BaseModel, Field, EmailStr, ConfigDict
from typing import Optional, List
from datetime import datetime
from .models import UserRole

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
    lat: Optional[float] = Field(None, ge=-90, le=90, description="Latitude coordinate")
    lon: Optional[float] = Field(None, ge=-180, le=180, description="Longitude coordinate")

class PropertyOut(BaseModel):
    """Response schema for property data."""
    id: int
    address: str
    city: str
    lat: Optional[float] = None
    lon: Optional[float] = None
    created_at: datetime
    
    # Aggregated stats (computed in route logic)
    avg_rating: Optional[float] = None
    review_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)  # Enables SQLAlchemy model conversion

# Review schemas  
class ReviewCreate(BaseModel):
    """Schema for creating a review - strict validation on rating and body length."""
    property_id: int = Field(..., gt=0, description="Valid property ID")
    rating: int = Field(..., ge=1, le=5, description="Rating from 1 to 5 stars")
    body: Optional[str] = Field(None, max_length=5000, description="Review text (optional)")

class ReviewOut(BaseModel):
    """Response schema for review data."""
    id: int
    property_id: int
    user_id: int
    rating: int
    body: Optional[str] = None
    verification_level: str
    created_at: datetime
    
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
