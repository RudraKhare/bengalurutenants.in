"""
Authentication routes for magic link generation and token verification.
Handles passwordless login flow with email-based authentication.
"""

import os
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from datetime import datetime
from jose import JWTError

from ..db import get_db
from ..models import User
from ..schemas import EmailRequest, MagicTokenResponse, TokenResponse
from ..auth.utils import create_magic_token, verify_magic_token, create_access_token

router = APIRouter(prefix="/api/v1/auth", tags=["authentication"])

# Get configuration from environment
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:3000")

@router.post("/magic-link", response_model=MagicTokenResponse)
async def generate_magic_link(
    request: EmailRequest,
    db: Session = Depends(get_db)
) -> MagicTokenResponse:
    """
    Generate a magic link for passwordless authentication.
    
    Process:
    1. Validate email format (handled by Pydantic)
    2. Create short-lived JWT magic token
    3. Compose verification URL with token
    4. In DEV: Log link to outbox.log file
    5. In PROD: Send email (to be implemented)
    
    Args:
        request: EmailRequest with validated email
        db: Database session (for future user lookup optimizations)
        
    Returns:
        Success message confirming magic link generation
    """
    
    try:
        # Create magic token with 10-minute expiry
        magic_token = create_magic_token(request.email)
        
        # Compose verification URL for frontend
        verification_url = f"{FRONTEND_URL}/auth/verify?token={magic_token}"
        
        # Development: Write to outbox.log instead of sending email
        outbox_path = "outbox.log"
        timestamp = datetime.utcnow().isoformat()
        
        with open(outbox_path, "a", encoding="utf-8") as f:
            f.write(f"[{timestamp}] Magic link for {request.email}: {verification_url}\n")
        
        return MagicTokenResponse(message="Magic link generated")
        
    except Exception as e:
        # Log error and return generic message for security
        print(f"Magic link generation error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate magic link"
        )

@router.get("/verify", response_model=TokenResponse)
async def verify_magic_link(
    token: str = Query(..., description="Magic token from verification URL"),
    db: Session = Depends(get_db)
) -> TokenResponse:
    """
    Verify magic token and issue access token.
    
    Process:
    1. Decode and validate magic token
    2. Extract email from token claims
    3. Upsert user in database (create if new, update if exists)
    4. Mark email as verified
    5. Generate long-lived access token
    6. Return token for frontend storage
    
    Atomicity: Uses database transaction - if any step fails, no changes are committed.
    
    Args:
        token: Magic token from query parameter
        db: Database session
        
    Returns:
        Access token and token type for API authentication
        
    Raises:
        HTTPException 401: If magic token is invalid or expired
    """
    
    try:
        # Verify magic token and extract email
        email = verify_magic_token(token)
        
    except JWTError:
        # Invalid or expired magic token
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic token"
        )
    
    try:
        # Database transaction for user upsert
        # Check if user exists
        user = db.query(User).filter(User.email == email).first()
        
        if user is None:
            # Create new user with verified email
            user = User(
                email=email,
                is_email_verified=True
            )
            db.add(user)
        else:
            # Update existing user to mark email as verified
            user.is_email_verified = True
        
        # Commit transaction - this makes changes permanent
        db.commit()
        
        # Refresh to get updated user data (including auto-generated ID for new users)
        db.refresh(user)
        
        # Generate long-lived access token (7 days default)
        access_token = create_access_token(user.id)
        
        return TokenResponse(
            access_token=access_token,
            token_type="bearer"
        )
        
    except Exception as e:
        # Rollback transaction on any error
        db.rollback()
        print(f"User verification error: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to verify user"
        )
