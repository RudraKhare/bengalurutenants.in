"""
JWT token utilities for magic link and access token management.
Handles token creation, verification, and claims parsing with proper security.
"""

import os
from datetime import datetime, timedelta
from typing import Optional
from jose import JWTError, jwt
from dotenv import load_dotenv

load_dotenv()

# JWT configuration from environment
SECRET_KEY = os.getenv("SECRET_KEY")
ALGORITHM = os.getenv("ALGORITHM", "HS256")
ACCESS_TOKEN_EXPIRE_HOURS = int(os.getenv("ACCESS_TOKEN_EXPIRE_HOURS", 168))  # 7 days default
MAGIC_TOKEN_EXPIRE_SECONDS = int(os.getenv("MAGIC_TOKEN_EXPIRE_SECONDS", 600))  # 10 minutes default

if not SECRET_KEY:
    raise ValueError("SECRET_KEY environment variable is required for JWT signing")

def create_magic_token(email: str) -> str:
    """
    Create a short-lived magic token for email verification.
    
    Magic tokens have:
    - typ: "magic" claim to distinguish from access tokens
    - Short expiry (10 minutes) to limit replay attack window
    - Email in sub claim for verification
    
    Args:
        email: User's email address
        
    Returns:
        Signed JWT magic token string
    """
    expire = datetime.utcnow() + timedelta(seconds=MAGIC_TOKEN_EXPIRE_SECONDS)
    
    claims = {
        "sub": email,           # Subject: the email being verified
        "typ": "magic",         # Type: distinguishes from access tokens
        "exp": expire,          # Expiry: short-lived for security
        "iat": datetime.utcnow() # Issued at: when token was created
    }
    
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)

def verify_magic_token(token: str) -> str:
    """
    Verify and decode a magic token to extract the email.
    
    Verification checks:
    - Signature validity (prevents tampering)
    - Expiry time (prevents old token reuse)
    - Token type claim (prevents access token misuse)
    
    Args:
        token: JWT magic token string
        
    Returns:
        Email address from token
        
    Raises:
        JWTError: If token is invalid, expired, or wrong type
    """
    try:
        # Decode and verify token signature and expiry
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Verify this is actually a magic token
        if payload.get("typ") != "magic":
            raise JWTError("Invalid token type - expected magic token")
        
        # Extract email from subject claim
        email: str = payload.get("sub")
        if email is None:
            raise JWTError("Token missing email claim")
            
        return email
        
    except JWTError:
        # Re-raise JWT errors for proper 401 handling in routes
        raise

def create_access_token(user_id: int, hours: int = ACCESS_TOKEN_EXPIRE_HOURS) -> str:
    """
    Create a long-lived access token for API authentication.
    
    Access tokens have:
    - No typ claim (standard JWT for API access)
    - Long expiry (7 days default) for better UX
    - User ID in sub claim for user identification
    
    Args:
        user_id: Database user ID
        hours: Token lifetime in hours (default from env)
        
    Returns:
        Signed JWT access token string
    """
    expire = datetime.utcnow() + timedelta(hours=hours)
    
    claims = {
        "sub": str(user_id),    # Subject: user ID for identification
        "exp": expire,          # Expiry: longer-lived than magic tokens
        "iat": datetime.utcnow() # Issued at: when token was created
    }
    
    return jwt.encode(claims, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> int:
    """
    Decode and validate an access token to get user ID.
    
    Verification process:
    - Check signature (prevents tampering)
    - Check expiry (prevents old token use)
    - Extract user ID from claims
    
    Args:
        token: JWT access token string
        
    Returns:
        User ID as integer
        
    Raises:
        JWTError: If token is invalid or expired
    """
    try:
        # Decode and verify token
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Extract user ID from subject claim
        user_id_str: str = payload.get("sub")
        if user_id_str is None:
            raise JWTError("Token missing user ID claim")
        
        # Convert to integer (database user ID)
        user_id = int(user_id_str)
        return user_id
        
    except (JWTError, ValueError):
        # Re-raise for proper 401 handling in dependencies
        raise JWTError("Invalid access token")
