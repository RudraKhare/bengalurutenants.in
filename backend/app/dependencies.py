"""
FastAPI dependency functions for database sessions and user authentication.
Provides reusable components for route functions through dependency injection.
"""

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Optional

from .db import get_db
from .models import User
from .auth.utils import decode_access_token
from jose import JWTError

# Security scheme for extracting Bearer tokens from Authorization header
security = HTTPBearer()

def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Dependency to get the currently authenticated user from JWT token.
    
    Process:
    1. Extract Bearer token from Authorization header
    2. Decode JWT to get user ID
    3. Query database to load user object
    4. Raise 401 if any step fails
    
    Usage in routes:
    @app.get("/protected")
    def protected_route(current_user: User = Depends(get_current_user)):
        return {"user_id": current_user.id}
    
    Args:
        credentials: JWT token from Authorization header
        db: Database session from dependency injection
        
    Returns:
        User object from database
        
    Raises:
        HTTPException 401: If token is invalid or user not found
    """
    
    # Create credentials exception for consistent error handling
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    try:
        # Extract token from Authorization: Bearer <token>
        token = credentials.credentials
        
        # Decode JWT to get user ID
        user_id = decode_access_token(token)
        
    except JWTError:
        # Invalid token format or expired
        raise credentials_exception
    
    # Query database for user
    user = db.query(User).filter(User.id == user_id).first()
    
    if user is None:
        # User ID from token doesn't exist in database
        raise credentials_exception
    
    return user

def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(HTTPBearer(auto_error=False)),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    Optional dependency to get current user if token is provided.
    Returns None if no token or invalid token (doesn't raise exception).
    
    Useful for routes that work for both authenticated and anonymous users.
    
    Args:
        credentials: Optional JWT token
        db: Database session
        
    Returns:
        User object if valid token provided, None otherwise
    """
    if credentials is None:
        return None
    
    try:
        token = credentials.credentials
        user_id = decode_access_token(token)
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except JWTError:
        return None
