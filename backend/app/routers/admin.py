"""
Admin API Routes
Handles all administrative operations including user management,
review verification, document verification, and audit logging.

Admin Email: rudrakharexx@gmail.com
Authentication: Magic Link (email-based)
"""

from fastapi import APIRouter, Depends, HTTPException, status, Request
from sqlalchemy.orm import Session
from sqlalchemy import desc, func, or_
from app.db import get_db
from app.models import User, Property, Review, VerificationDocument, AdminLog
from app.middleware.admin import get_current_admin, log_admin_action, create_admin_token
from pydantic import BaseModel, EmailStr
from typing import Optional, List
from datetime import datetime, timedelta
import secrets
import os

router = APIRouter(prefix="/api/v1/admin", tags=["Admin"])

# In-memory store for magic links (use Redis in production)
magic_links = {}

# ============================================
# AUTHENTICATION SCHEMAS
# ============================================

class MagicLinkRequest(BaseModel):
    email: EmailStr

class MagicLinkVerify(BaseModel):
    token: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = 604800  # 7 days in seconds

# ============================================
# AUTHENTICATION ROUTES
# ============================================

@router.post("/magic-link/request", summary="Request magic link for admin login")
async def request_magic_link(
    data: MagicLinkRequest,
    db: Session = Depends(get_db)
):
    """
    Request a magic link for admin authentication.
    Only works for users with admin role (rudrakharexx@gmail.com).
    
    Magic link expires in 15 minutes.
    """
    user = db.query(User).filter(User.email == data.email).first()
    
    # Don't reveal if user exists or has admin role (security)
    if not user or user.role != "admin":
        return {
            "message": "If you're an admin, a magic link has been sent to your email",
            "success": True
        }
    
    # Generate secure token
    token = secrets.token_urlsafe(32)
    magic_links[token] = {
        "user_id": user.id,
        "email": user.email,
        "expires": datetime.utcnow() + timedelta(minutes=15)
    }
    
    # Get frontend URL from environment variable or use production URL
    frontend_url = os.getenv('FRONTEND_URL', 'https://bengalurutenants.in')
    magic_link = f"{frontend_url}/admin/login?token={token}"
    
    print(f"\n{'='*60}")
    print(f"🔐 ADMIN MAGIC LINK GENERATED")
    print(f"{'='*60}")
    print(f"Admin: {user.email}")
    print(f"Link: {magic_link}")
    print(f"Expires: {magic_links[token]['expires'].strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"{'='*60}\n")
    
    return {
        "message": "Magic link sent to your email",
        "success": True,
        "dev_link": magic_link  # REMOVE IN PRODUCTION
    }


@router.post("/magic-link/verify", response_model=TokenResponse, summary="Verify magic link and get access token")
async def verify_magic_link(
    data: MagicLinkVerify,
    db: Session = Depends(get_db)
):
    """
    Verify magic link token and return JWT access token.
    The JWT token is valid for 7 days.
    """
    link_data = magic_links.get(data.token)
    
    if not link_data:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired magic link"
        )
    
    # Check expiration
    if link_data["expires"] < datetime.utcnow():
        del magic_links[data.token]
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Magic link has expired (15 minutes). Please request a new one."
        )
    
    # Create JWT token
    jwt_token = create_admin_token(link_data["user_id"], link_data["email"])
    
    # Delete used magic link (one-time use)
    del magic_links[data.token]
    
    # Log successful login
    log_admin_action(
        db=db,
        admin_id=link_data["user_id"],
        action="admin_login",
        details={"method": "magic_link", "email": link_data["email"]}
    )
    
    print(f"✅ Admin logged in: {link_data['email']}")
    
    return TokenResponse(
        access_token=jwt_token,
        token_type="bearer",
        expires_in=604800  # 7 days
    )


# ============================================
# DASHBOARD
# ============================================

@router.get("/dashboard", summary="Get admin dashboard statistics")
async def get_admin_dashboard(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get comprehensive dashboard statistics for admin panel.
    Includes user stats, property stats, review stats, and recent activity.
    """
    
    # Basic statistics
    total_users = db.query(func.count(User.id)).scalar() or 0
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar() or 0
    total_properties = db.query(func.count(Property.id)).scalar() or 0
    total_reviews = db.query(func.count(Review.id)).scalar() or 0
    verified_reviews = db.query(func.count(Review.id)).filter(Review.is_verified == True).scalar() or 0
    
    # Pending verifications
    pending_documents = db.query(func.count(VerificationDocument.id)).filter(
        VerificationDocument.status == "pending"
    ).scalar() or 0
    
    # Recent activity (last 10 items)
    recent_users = db.query(User).order_by(desc(User.created_at)).limit(10).all()
    recent_reviews = db.query(Review).order_by(desc(Review.created_at)).limit(10).all()
    recent_properties = db.query(Property).order_by(desc(Property.created_at)).limit(10).all()
    
    # Recent admin activity
    recent_admin_logs = db.query(AdminLog).order_by(desc(AdminLog.created_at)).limit(20).all()
    
    return {
        "stats": {
            "total_users": total_users,
            "verified_users": verified_users,
            "total_properties": total_properties,
            "total_reviews": total_reviews,
            "verified_reviews": verified_reviews,
            "pending_verifications": pending_documents,
            "verification_rate": round((verified_reviews / total_reviews * 100) if total_reviews > 0 else 0, 1)
        },
        "recent_activity": {
            "users": [
                {
                    "id": u.id,
                    "email": u.email,
                    "name": u.name,
                    "is_verified": u.is_verified,
                    "created_at": u.created_at.isoformat() if u.created_at else None
                } for u in recent_users
            ],
            "reviews": [
                {
                    "id": r.id,
                    "rating": r.rating,
                    "property_id": r.property_id,
                    "is_verified": r.is_verified,
                    "created_at": r.created_at.isoformat() if r.created_at else None
                } for r in recent_reviews
            ],
            "properties": [
                {
                    "id": p.id,
                    "address": p.address,
                    "city": p.city,
                    "area": p.area,
                    "created_at": p.created_at.isoformat() if p.created_at else None
                } for p in recent_properties
            ],
            "admin_logs": [
                {
                    "id": log.id,
                    "action": log.action,
                    "target_type": log.target_type,
                    "target_id": log.target_id,
                    "created_at": log.created_at.isoformat() if log.created_at else None
                } for log in recent_admin_logs
            ]
        },
        "admin": {
            "email": current_admin.email,
            "name": current_admin.name,
            "id": current_admin.id
        }
    }


# ============================================
# USER MANAGEMENT
# ============================================

@router.get("/users", summary="Get all users with pagination")
async def get_all_users(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    verified_only: Optional[bool] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all users with optional search and filters.
    Supports pagination and searching by email or name.
    """
    query = db.query(User)
    
    # Apply search filter
    if search:
        query = query.filter(
            or_(
                User.email.ilike(f"%{search}%"),
                User.name.ilike(f"%{search}%") if User.name is not None else False
            )
        )
    
    # Apply verified filter
    if verified_only is not None:
        query = query.filter(User.is_verified == verified_only)
    
    # Get total count before pagination
    total = query.count()
    
    # Apply pagination
    users = query.order_by(desc(User.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "users": [
            {
                "id": u.id,
                "email": u.email,
                "name": u.name,
                "phone": u.phone,
                "role": u.role,
                "is_verified": u.is_verified,
                "is_email_verified": u.is_email_verified,
                "verified_at": u.verified_at.isoformat() if u.verified_at else None,
                "created_at": u.created_at.isoformat() if u.created_at else None
            } for u in users
        ]
    }


@router.get("/users/{user_id}", summary="Get user details")
async def get_user_details(
    user_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a specific user.
    Includes reviews, verification documents, and activity history.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    # Get user's reviews
    reviews = db.query(Review).filter(Review.user_id == user_id).all()
    
    # Get verification documents
    documents = db.query(VerificationDocument).filter(
        VerificationDocument.user_id == user_id
    ).all()
    
    return {
        "user": {
            "id": user.id,
            "email": user.email,
            "name": user.name,
            "phone": user.phone,
            "role": user.role,
            "is_verified": user.is_verified,
            "is_email_verified": user.is_email_verified,
            "verified_at": user.verified_at.isoformat() if user.verified_at else None,
            "created_at": user.created_at.isoformat() if user.created_at else None
        },
        "reviews": [
            {
                "id": r.id,
                "property_id": r.property_id,
                "rating": r.rating,
                "comment": r.comment,
                "is_verified": r.is_verified,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in reviews
        ],
        "documents": [
            {
                "id": d.id,
                "document_type": d.document_type,
                "status": d.status,
                "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None,
                "reviewed_at": d.reviewed_at.isoformat() if d.reviewed_at else None
            } for d in documents
        ],
        "stats": {
            "total_reviews": len(reviews),
            "verified_reviews": sum(1 for r in reviews if r.is_verified),
            "pending_documents": sum(1 for d in documents if d.status == "pending")
        }
    }


@router.patch("/users/{user_id}/verify", summary="Manually verify a user")
async def verify_user(
    user_id: int,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Manually verify a user as authentic.
    This gives the user a verified badge and increases trust.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.is_verified:
        return {"message": "User is already verified", "user_id": user_id}
    
    # Verify the user
    user.is_verified = True
    user.verified_at = datetime.utcnow()
    user.verified_by = current_admin.id
    
    db.commit()
    
    # Log the action
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action="verify_user",
        target_type="user",
        target_id=user_id,
        details={"email": user.email, "name": user.name},
        ip_address=request.client.host if request.client else None
    )
    
    print(f"✅ User verified: {user.email} by {current_admin.email}")
    
    return {
        "message": "User verified successfully",
        "user_id": user_id,
        "verified_at": user.verified_at.isoformat()
    }


@router.patch("/users/{user_id}/unverify", summary="Remove verification from user")
async def unverify_user(
    user_id: int,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Remove verification status from a user.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.is_verified = False
    user.verified_at = None
    user.verified_by = None
    
    db.commit()
    
    # Log the action
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action="unverify_user",
        target_type="user",
        target_id=user_id,
        details={"email": user.email},
        ip_address=request.client.host if request.client else None
    )
    
    return {"message": "User verification removed successfully", "user_id": user_id}


@router.delete("/users/{user_id}", summary="Delete a user")
async def delete_user(
    user_id: int,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a user permanently.
    Cannot delete admin users.
    """
    user = db.query(User).filter(User.id == user_id).first()
    
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    if user.role == "admin":
        raise HTTPException(
            status_code=403,
            detail="Cannot delete admin user"
        )
    
    # Log before deleting
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action="delete_user",
        target_type="user",
        target_id=user_id,
        details={"email": user.email, "name": user.name},
        ip_address=request.client.host if request.client else None
    )
    
    # Delete user
    db.delete(user)
    db.commit()
    
    print(f"🗑️ User deleted: {user.email} by {current_admin.email}")
    
    return {"message": "User deleted successfully", "user_id": user_id}


# ============================================
# REVIEW VERIFICATION
# ============================================

@router.get("/reviews/pending", summary="Get unverified reviews")
async def get_pending_reviews(
    skip: int = 0,
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all reviews pending verification.
    """
    reviews = db.query(Review).filter(
        Review.is_verified == False
    ).order_by(desc(Review.created_at)).offset(skip).limit(limit).all()
    
    total_pending = db.query(func.count(Review.id)).filter(
        Review.is_verified == False
    ).scalar()
    
    return {
        "total_pending": total_pending,
        "skip": skip,
        "limit": limit,
        "reviews": [
            {
                "id": r.id,
                "property_id": r.property_id,
                "user_id": r.user_id,
                "rating": r.rating,
                "comment": r.comment,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in reviews
        ]
    }


class VerifyReviewRequest(BaseModel):
    notes: Optional[str] = None


@router.patch("/reviews/{review_id}/verify", summary="Verify a review")
async def verify_review(
    review_id: int,
    data: VerifyReviewRequest,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Mark a review as verified (authentic).
    This increases trust and shows a verified badge.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    if review.is_verified:
        return {"message": "Review is already verified", "review_id": review_id}
    
    print(f"🔍 Verifying review #{review_id}: current is_verified={review.is_verified}")
    
    # Verify the review
    review.is_verified = True
    review.verified_at = datetime.utcnow()
    review.verified_by = current_admin.id
    review.verification_notes = data.notes
    
    db.commit()
    db.refresh(review)  # Refresh to ensure changes are persisted
    
    # Log the action
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action="verify_review",
        target_type="review",
        target_id=review_id,
        details={"notes": data.notes, "property_id": review.property_id},
        ip_address=request.client.host if request.client else None
    )
    
    print(f"✅ Review #{review_id} verified by {current_admin.email}")
    print(f"✅ Verification status: is_verified={review.is_verified}")
    
    return {
        "message": "Review verified successfully",
        "review_id": review_id,
        "verified_at": review.verified_at.isoformat()
    }


@router.delete("/reviews/{review_id}", summary="Delete a review")
async def delete_review(
    review_id: int,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a review permanently.
    Use this for spam, fake, or inappropriate reviews.
    """
    review = db.query(Review).filter(Review.id == review_id).first()
    
    if not review:
        raise HTTPException(status_code=404, detail="Review not found")
    
    # Log before deleting
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action="delete_review",
        target_type="review",
        target_id=review_id,
        details={
            "property_id": review.property_id,
            "user_id": review.user_id,
            "rating": review.rating
        },
        ip_address=request.client.host if request.client else None
    )
    
    # Delete review
    db.delete(review)
    db.commit()
    
    print(f"🗑️ Review #{review_id} deleted by {current_admin.email}")
    
    return {"message": "Review deleted successfully", "review_id": review_id}


# ============================================
# DOCUMENT VERIFICATION
# ============================================

@router.get("/documents/pending", summary="Get pending verification documents")
async def get_pending_documents(
    skip: int = 0,
    limit: int = 50,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all documents pending verification (Aadhaar, PAN, etc.).
    """
    documents = db.query(VerificationDocument).filter(
        VerificationDocument.status == "pending"
    ).order_by(desc(VerificationDocument.uploaded_at)).offset(skip).limit(limit).all()
    
    total_pending = db.query(func.count(VerificationDocument.id)).filter(
        VerificationDocument.status == "pending"
    ).scalar()
    
    return {
        "total_pending": total_pending,
        "skip": skip,
        "limit": limit,
        "documents": [
            {
                "id": d.id,
                "user_id": d.user_id,
                "document_type": d.document_type,
                "document_url": d.document_url,
                "uploaded_at": d.uploaded_at.isoformat() if d.uploaded_at else None
            } for d in documents
        ]
    }


class VerifyDocumentRequest(BaseModel):
    status: str  # 'approved' or 'rejected'
    rejection_reason: Optional[str] = None


@router.patch("/documents/{document_id}/verify", summary="Approve or reject document")
async def verify_document(
    document_id: int,
    data: VerifyDocumentRequest,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Approve or reject a verification document.
    If approved, the user is automatically verified.
    """
    if data.status not in ["approved", "rejected"]:
        raise HTTPException(
            status_code=400,
            detail="Status must be 'approved' or 'rejected'"
        )
    
    document = db.query(VerificationDocument).filter(
        VerificationDocument.id == document_id
    ).first()
    
    if not document:
        raise HTTPException(status_code=404, detail="Document not found")
    
    # Update document status
    document.status = data.status
    document.reviewed_at = datetime.utcnow()
    document.reviewed_by = current_admin.id
    
    if data.status == "rejected":
        document.rejection_reason = data.rejection_reason
    
    # If approved, verify the user
    if data.status == "approved":
        user = db.query(User).filter(User.id == document.user_id).first()
        if user and not user.is_verified:
            user.is_verified = True
            user.verified_at = datetime.utcnow()
            user.verified_by = current_admin.id
    
    db.commit()
    
    # Log action
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action=f"document_{data.status}",
        target_type="document",
        target_id=document_id,
        details={
            "user_id": document.user_id,
            "document_type": document.document_type,
            "reason": data.rejection_reason
        },
        ip_address=request.client.host if request.client else None
    )
    
    print(f"✅ Document #{document_id} {data.status} by {current_admin.email}")
    
    return {
        "message": f"Document {data.status} successfully",
        "document_id": document_id,
        "status": data.status
    }


# ============================================
# PROPERTY MANAGEMENT
# ============================================

@router.get("/properties", summary="Get all properties")
async def get_all_properties(
    skip: int = 0,
    limit: int = 50,
    search: Optional[str] = None,
    city: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get all properties with optional search and filters.
    """
    query = db.query(Property)
    
    # Apply search filter
    if search:
        query = query.filter(
            or_(
                Property.address.ilike(f"%{search}%"),
                Property.city.ilike(f"%{search}%"),
                Property.area.ilike(f"%{search}%") if Property.area is not None else False
            )
        )
    
    # Apply city filter
    if city:
        query = query.filter(Property.city == city)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    properties = query.order_by(desc(Property.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "properties": [
            {
                "id": p.id,
                "address": p.address,
                "city": p.city,
                "area": p.area,
                "property_type": p.property_type.value if p.property_type else None,
                "avg_rating": p.avg_rating,
                "review_count": p.review_count,
                "created_at": p.created_at.isoformat() if p.created_at else None
            } for p in properties
        ]
    }


@router.get("/properties/{property_id}", summary="Get property details")
async def get_property_details(
    property_id: int,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed information about a property.
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Get all reviews for this property
    reviews = db.query(Review).filter(Review.property_id == property_id).all()
    
    return {
        "property": {
            "id": property.id,
            "address": property.address,
            "city": property.city,
            "area": property.area,
            "property_type": property.property_type.value if property.property_type else None,
            "lat": property.lat,
            "lng": property.lng,
            "avg_rating": property.avg_rating,
            "review_count": property.review_count,
            "photo_keys": property.photo_keys,
            "created_at": property.created_at.isoformat() if property.created_at else None
        },
        "reviews": [
            {
                "id": r.id,
                "user_id": r.user_id,
                "rating": r.rating,
                "comment": r.comment,
                "is_verified": r.is_verified,
                "created_at": r.created_at.isoformat() if r.created_at else None
            } for r in reviews
        ],
        "stats": {
            "total_reviews": len(reviews),
            "verified_reviews": sum(1 for r in reviews if r.is_verified),
            "average_rating": property.avg_rating
        }
    }


@router.delete("/properties/{property_id}", summary="Delete a property")
async def delete_property(
    property_id: int,
    request: Request,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Delete a property permanently.
    Also deletes all associated reviews.
    """
    property = db.query(Property).filter(Property.id == property_id).first()
    
    if not property:
        raise HTTPException(status_code=404, detail="Property not found")
    
    # Log before deleting
    log_admin_action(
        db=db,
        admin_id=current_admin.id,
        action="delete_property",
        target_type="property",
        target_id=property_id,
        details={
            "address": property.address,
            "city": property.city,
            "area": property.area
        },
        ip_address=request.client.host if request.client else None
    )
    
    # Delete property (cascades to reviews)
    db.delete(property)
    db.commit()
    
    print(f"🗑️ Property #{property_id} deleted by {current_admin.email}")
    
    return {"message": "Property deleted successfully", "property_id": property_id}


# ============================================
# ACTIVITY LOGS
# ============================================

@router.get("/logs", summary="Get admin activity logs")
async def get_activity_logs(
    skip: int = 0,
    limit: int = 100,
    action: Optional[str] = None,
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get admin activity logs for audit trail.
    """
    query = db.query(AdminLog)
    
    # Filter by action if specified
    if action:
        query = query.filter(AdminLog.action == action)
    
    # Get total count
    total = query.count()
    
    # Apply pagination
    logs = query.order_by(desc(AdminLog.created_at)).offset(skip).limit(limit).all()
    
    return {
        "total": total,
        "skip": skip,
        "limit": limit,
        "logs": [
            {
                "id": log.id,
                "admin_id": log.admin_id,
                "action": log.action,
                "target_type": log.target_type,
                "target_id": log.target_id,
                "details": log.details,
                "ip_address": log.ip_address,
                "created_at": log.created_at.isoformat() if log.created_at else None
            } for log in logs
        ]
    }


@router.get("/stats", summary="Get comprehensive statistics")
async def get_admin_stats(
    current_admin: User = Depends(get_current_admin),
    db: Session = Depends(get_db)
):
    """
    Get detailed statistics for analytics.
    """
    # User statistics
    total_users = db.query(func.count(User.id)).scalar() or 0
    verified_users = db.query(func.count(User.id)).filter(User.is_verified == True).scalar() or 0
    new_users_today = db.query(func.count(User.id)).filter(
        func.date(User.created_at) == datetime.utcnow().date()
    ).scalar() or 0
    
    # Property statistics
    total_properties = db.query(func.count(Property.id)).scalar() or 0
    properties_with_reviews = db.query(func.count(Property.id)).filter(
        Property.review_count > 0
    ).scalar() or 0
    
    # Review statistics
    total_reviews = db.query(func.count(Review.id)).scalar() or 0
    verified_reviews = db.query(func.count(Review.id)).filter(Review.is_verified == True).scalar() or 0
    avg_rating = db.query(func.avg(Review.rating)).scalar() or 0.0
    
    # Document statistics
    total_documents = db.query(func.count(VerificationDocument.id)).scalar() or 0
    pending_documents = db.query(func.count(VerificationDocument.id)).filter(
        VerificationDocument.status == "pending"
    ).scalar() or 0
    approved_documents = db.query(func.count(VerificationDocument.id)).filter(
        VerificationDocument.status == "approved"
    ).scalar() or 0
    
    return {
        "users": {
            "total": total_users,
            "verified": verified_users,
            "verification_rate": round((verified_users / total_users * 100) if total_users > 0 else 0, 1),
            "new_today": new_users_today
        },
        "properties": {
            "total": total_properties,
            "with_reviews": properties_with_reviews,
            "review_coverage": round((properties_with_reviews / total_properties * 100) if total_properties > 0 else 0, 1)
        },
        "reviews": {
            "total": total_reviews,
            "verified": verified_reviews,
            "verification_rate": round((verified_reviews / total_reviews * 100) if total_reviews > 0 else 0, 1),
            "average_rating": round(float(avg_rating), 2)
        },
        "documents": {
            "total": total_documents,
            "pending": pending_documents,
            "approved": approved_documents,
            "rejected": total_documents - pending_documents - approved_documents
        }
    }
