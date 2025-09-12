"""
Pydantic schemas for API request/response validation.
Defines data shapes for serialization between API and database.
What data the API accepts (request validation)
What data the API returns (response formatting)
Data validation rules (type checking, constraints)
"""

from pydantic import BaseModel, EmailStr, Field, ConfigDict
from typing import Optional, List
from datetime import datetime
from models import UserRole, VerificationMethod, VerificationStatus



"""Before (Plain Python Class):
class User:
    def __init__(self, email, phone=None):
        self.email = email  # No validation!
        self.phone = phone  # Could be anything!

# Dangerous - no validation
user = User(email="invalid-email", phone=123456)  # Should phone be int or str?

After (Pydantic BaseModel):
class UserCreate(BaseModel):
    email: EmailStr                    # Must be valid email format
    phone: Optional[str] = None        # Must be string or None

# Safe - automatic validation
user = UserCreate(email="test@example.com", phone="123-456-7890")  # ✅ Valid
user = UserCreate(email="invalid", phone=123)                     # ❌ Validation error

Real-World Example - API Request Processing:
# When this JSON comes from frontend:
{
    "email": "user@example.com",
    "phone": "123-456-7890",
    "role": "tenant"
}

# Pydantic automatically:
1. Validates email format ✅
2. Checks phone is string ✅  
3. Converts role string to UserRole enum ✅
4. Creates UserCreate object ✅

🛡️ Validation Magic in Action:

class PropertyCreate(BaseModel):
    address: str = Field(..., min_length=10, max_length=500)
    lat: Optional[float] = Field(None, ge=-90, le=90)  # Latitude range
    lng: Optional[float] = Field(None, ge=-180, le=180)  # Longitude range

What BaseModel does automatically:
# Valid input
property_data = PropertyCreate(
    address="123 Main Street, Bengaluru",
    lat=12.9716,  # Valid Bengaluru latitude
    lng=77.5946   # Valid Bengaluru longitude
)  # ✅ Success

# Invalid input  
property_data = PropertyCreate(
    address="Too short",        # ❌ Less than 10 characters
    lat=200,                   # ❌ Invalid latitude (>90)
    lng=-300                   # ❌ Invalid longitude (<-180)
)  # ❌ Pydantic raises ValidationError with detailed messages
"""
# Base schemas with common fields
class TimestampMixin(BaseModel):
    """Common timestamp fields for all models."""
    created_at: datetime

# User schemas
class UserBase(BaseModel):
    """Base user fields shared between requests and responses."""
    email: EmailStr
    phone: Optional[str] = None
    role: UserRole = UserRole.TENANT

class UserCreate(UserBase):
    """Schema for creating a new user."""
    # TODO: Add password field
    # password: str = Field(..., min_length=8)
    pass

class UserUpdate(BaseModel):
    """Schema for updating user information."""
    phone: Optional[str] = None
    is_email_verified: Optional[bool] = None

class UserResponse(UserBase, TimestampMixin):
    """Schema for user data in API responses."""
    id: int
    is_email_verified: bool
    
    model_config = ConfigDict(from_attributes=True)

# Property schemas
class PropertyBase(BaseModel):
    """Base property fields shared between requests and responses."""
    address: str = Field(..., min_length=10, max_length=500)
    city: str = Field(..., min_length=2, max_length=100)
    area: str = Field(..., min_length=2, max_length=100)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)

class PropertyCreate(PropertyBase):
    """Schema for creating a new property."""
    pass

class PropertyUpdate(BaseModel):
    """Schema for updating property information."""
    address: Optional[str] = Field(None, min_length=10, max_length=500)
    city: Optional[str] = Field(None, min_length=2, max_length=100)
    area: Optional[str] = Field(None, min_length=2, max_length=100)
    lat: Optional[float] = Field(None, ge=-90, le=90)
    lng: Optional[float] = Field(None, ge=-180, le=180)

class PropertyResponse(PropertyBase, TimestampMixin):
    """Schema for property data in API responses."""
    id: int
    avg_rating: Optional[float] = None
    review_count: int = 0
    
    model_config = ConfigDict(from_attributes=True)

# Review schemas
class ReviewBase(BaseModel):
    """Base review fields shared between requests and responses."""
    rating: int = Field(..., ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)

class ReviewCreate(ReviewBase):
    """Schema for creating a new review."""
    property_id: int

class ReviewUpdate(BaseModel):
    """Schema for updating review information."""
    rating: Optional[int] = Field(None, ge=1, le=5)
    comment: Optional[str] = Field(None, max_length=2000)

class ReviewResponse(ReviewBase, TimestampMixin):
    """Schema for review data in API responses."""
    id: int
    user_id: int
    property_id: int
    verification_level: str
    upvotes: int = 0
    downvotes: int = 0
    
    # Nested relationships (optional)
    user: Optional[UserResponse] = None
    property: Optional[PropertyResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# Tenant verification schemas
class TenantVerificationBase(BaseModel):
    """Base verification fields shared between requests and responses."""
    method: VerificationMethod
    proof_url: Optional[str] = Field(None, max_length=500)
    upi_txn_id: Optional[str] = Field(None, max_length=100)

class TenantVerificationCreate(TenantVerificationBase):
    """Schema for creating a new tenant verification."""
    property_id: int
    review_id: Optional[int] = None

class TenantVerificationUpdate(BaseModel):
    """Schema for updating verification status (admin use)."""
    status: VerificationStatus
    # TODO: Add verification notes

class TenantVerificationResponse(TenantVerificationBase, TimestampMixin):
    """Schema for verification data in API responses."""
    id: int
    user_id: int
    property_id: int
    review_id: Optional[int] = None
    status: VerificationStatus
    
    # Nested relationships (optional)
    user: Optional[UserResponse] = None
    property: Optional[PropertyResponse] = None
    
    model_config = ConfigDict(from_attributes=True)

# List response schemas
class PropertyListResponse(BaseModel):
    """Schema for paginated property lists."""
    properties: List[PropertyResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

class ReviewListResponse(BaseModel):
    """Schema for paginated review lists."""
    reviews: List[ReviewResponse]
    total: int
    page: int
    per_page: int
    has_next: bool
    has_prev: bool

# Search and filter schemas
class PropertySearch(BaseModel):
    """Schema for property search parameters."""
    city: Optional[str] = None
    area: Optional[str] = None
    min_rating: Optional[float] = Field(None, ge=1, le=5)
    max_rating: Optional[float] = Field(None, ge=1, le=5)
    has_reviews: Optional[bool] = None
    
    # Pagination
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

class ReviewFilters(BaseModel):
    """Schema for review filtering parameters."""
    property_id: Optional[int] = None
    user_id: Optional[int] = None
    min_rating: Optional[int] = Field(None, ge=1, le=5)
    max_rating: Optional[int] = Field(None, ge=1, le=5)
    verification_level: Optional[str] = None
    
    # Pagination
    page: int = Field(1, ge=1)
    per_page: int = Field(20, ge=1, le=100)

# Error response schemas
class ErrorResponse(BaseModel):
    """Schema for error responses."""
    error: str
    detail: Optional[str] = None
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ValidationErrorResponse(BaseModel):
    """Schema for validation error responses."""
    error: str = "Validation Error"
    details: List[dict]
    timestamp: datetime = Field(default_factory=datetime.utcnow)

# Health check schema
class HealthResponse(BaseModel):
    """Schema for health check endpoint."""
    status: str
    timestamp: str
    service: str
    version: str
