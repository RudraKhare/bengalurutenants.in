"""
Admin Authentication Middleware
Handles JWT authentication and admin role verification
"""

from fastapi import HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.db import get_db
from app.models import User, AdminLog
import jwt
from datetime import datetime, timedelta
import os

security = HTTPBearer()

SECRET_KEY = os.getenv("SECRET_KEY", "your-secret-key-change-this-in-production")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_DAYS = 7

def create_admin_token(user_id: int, email: str) -> str:
    """
    Create JWT token for admin authentication
    Token expires in 7 days
    """
    payload = {
        "user_id": user_id,
        "email": email,
        "exp": datetime.utcnow() + timedelta(days=ACCESS_TOKEN_EXPIRE_DAYS),
        "iat": datetime.utcnow(),
        "type": "admin_access"
    }
    return jwt.encode(payload, SECRET_KEY, algorithm=ALGORITHM)


def verify_admin_token(token: str) -> dict:
    """
    Verify and decode JWT token
    Raises HTTPException if token is invalid or expired
    """
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        
        # Check if it's an admin token
        if payload.get("type") != "admin_access":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        return payload
        
    except jwt.ExpiredSignatureError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired. Please login again."
        )
    except jwt.JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token. Please login again."
        )


def get_current_admin(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    Get current authenticated admin user
    This is used as a dependency in admin routes
    
    Usage:
        @router.get("/admin/dashboard")
        def dashboard(current_admin: User = Depends(get_current_admin)):
            return {"admin": current_admin.email}
    """
    token = credentials.credentials
    payload = verify_admin_token(token)
    
    # Get user from database
    user = db.query(User).filter(User.id == payload["user_id"]).first()
    
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Verify user has admin role
    if user.role != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required. You don't have permission to access this resource."
        )
    
    return user


def log_admin_action(
    db: Session,
    admin_id: int,
    action: str,
    target_type: str = None,
    target_id: int = None,
    details: dict = None,
    ip_address: str = None
):
    """
    Log admin actions for audit trail
    
    Args:
        db: Database session
        admin_id: ID of admin performing action
        action: Action performed (e.g., 'delete_user', 'verify_review')
        target_type: Type of target (e.g., 'user', 'review', 'property')
        target_id: ID of target
        details: Additional details as JSON
        ip_address: IP address of admin
    
    Example:
        log_admin_action(
            db=db,
            admin_id=1,
            action="delete_user",
            target_type="user",
            target_id=123,
            details={"reason": "spam", "email": "spam@example.com"},
            ip_address="192.168.1.1"
        )
    """
    log = AdminLog(
        admin_id=admin_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        details=details,
        ip_address=ip_address
    )
    db.add(log)
    db.commit()
    
    print(f"📝 Admin Action Logged: {action} by admin#{admin_id}")
