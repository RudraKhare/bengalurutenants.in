"""
Photo upload routes for Cloudflare R2 integration.
Provides presigned URLs for direct browser-to-R2 uploads.

What this enables:
- Users upload photos directly from browser to Cloudflare R2
- No files pass through our FastAPI server (saves bandwidth)
- Secure, time-limited upload permissions
- Global CDN distribution for fast photo access

Network flow:
1. Frontend requests upload URL from our API
2. Our API generates presigned URL with R2 credentials
3. Frontend uploads file directly to R2 using presigned URL
4. R2 validates signature and stores file globally
5. Frontend gets object_key to associate with reviews/properties
"""

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from ..db import get_db
from ..models import User
from ..dependencies import get_current_user
from ..schemas import PhotoUploadRequest, PhotoUploadResponse, PhotoViewResponse
from ..services.r2_client import r2_client

router = APIRouter(prefix="/api/v1/uploads", tags=["photo-uploads"])

@router.post("/signed-url", response_model=PhotoUploadResponse)
async def generate_upload_url(
    upload_request: PhotoUploadRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
) -> PhotoUploadResponse:
    """
    Generate a presigned URL for direct photo upload to Cloudflare R2.
    
    What happens step by step:
    1. Validate user is authenticated (current_user dependency)
    2. Validate content_type is an allowed image format
    3. Generate unique object_key based on user_id and file_type
    4. Create cryptographically signed URL that R2 will accept
    5. Return URL + metadata to frontend
    
    Under the hood (presigned URL process):
    - Our R2 credentials sign a request with specific parameters:
      * HTTP method (PUT for upload)
      * Bucket name and object key (file path)
      * Content-Type requirement (security)
      * Expiration timestamp
    - R2 validates this signature when browser makes the request
    - Only requests matching exact parameters are accepted
    - This allows secure uploads without exposing our API keys
    
    Args:
        upload_request: Contains content_type and file_type
        current_user: Authenticated user from JWT token
        db: Database session (for future audit logging)
        
    Returns:
        PhotoUploadResponse with upload_url, object_key, expires_in
        
    Raises:
        HTTPException 400: Invalid content type or file type
        HTTPException 500: R2 service error
    """
    
    try:
        # Generate unique object key for this upload
        # Format: file_type/user_id/YYYY/MM/DD/uuid.ext
        object_key = r2_client.generate_object_key(
            file_type=upload_request.file_type,
            user_id=current_user.id,
            content_type=upload_request.content_type
        )
        
        # Generate presigned URL for uploading
        # This creates a time-limited URL that allows PUT requests to R2
        upload_data = r2_client.generate_presigned_upload_url(
            object_key=object_key,
            content_type=upload_request.content_type,
            expires_in=3600  # 1 hour to complete upload
        )
        
        # Log the upload request for audit purposes
        print(f"Generated upload URL for user {current_user.id}: {object_key}")
        
        return PhotoUploadResponse(
            upload_url=upload_data['upload_url'],
            object_key=upload_data['object_key'],
            expires_in=upload_data['expires_in']
        )
        
    except Exception as e:
        print(f"Upload URL generation error: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate upload URL"
        )

@router.get("/view/{object_key:path}", response_model=PhotoViewResponse)
async def generate_view_url(
    object_key: str,
    current_user: User = Depends(get_current_user)
) -> PhotoViewResponse:
    """
    Generate a presigned URL for viewing an uploaded photo.
    
    Why we need this:
    - R2 bucket is private (not publicly accessible)
    - We control who can view which photos
    - Time-limited access for security
    - CDN optimization for global fast loading
    
    Under the hood (CDN flow):
    1. User clicks photo → Frontend requests view URL from our API
    2. We generate presigned GET URL with R2 signature
    3. Browser requests photo using presigned URL
    4. Request hits Cloudflare edge server nearest to user
    5. If cached: Edge server serves photo immediately
    6. If not cached: Edge fetches from R2, caches, then serves
    7. Subsequent requests served from cache (very fast)
    
    Security considerations:
    - Object key path traversal protection
    - User authorization (future: check if user owns photo)
    - Time-limited URLs prevent unauthorized sharing
    
    Args:
        object_key: Path to the file in R2 (e.g., 'property/123/2025/01/15/uuid.jpg')
        current_user: Authenticated user (future: authorization checks)
        
    Returns:
        PhotoViewResponse with view_url, object_key, expires_in
        
    Raises:
        HTTPException 404: File not found
        HTTPException 403: User not authorized to view file
        HTTPException 500: R2 service error
    """
    
    try:
        # TODO: Add authorization check
        # Verify user has permission to view this photo:
        # - User uploaded the photo, OR
        # - Photo is attached to public review/property, OR
        # - User is admin
        
        # For now, allow authenticated users to view any photo
        # In production, implement proper authorization logic
        
        # Generate presigned URL for viewing
        # This creates a time-limited URL that allows GET requests to R2
        view_url = r2_client.generate_presigned_view_url(
            object_key=object_key,
            expires_in=86400  # 24 hours
        )
        
        return PhotoViewResponse(
            view_url=view_url,
            object_key=object_key,
            expires_in=86400
        )
        
    except Exception as e:
        print(f"View URL generation error for {object_key}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to generate view URL"
        )

@router.delete("/delete/{object_key:path}")
async def delete_photo(
    object_key: str,
    current_user: User = Depends(get_current_user)
):
    """
    Delete a photo from R2 storage.
    
    What happens:
    1. Validate user has permission to delete this photo
    2. Delete file from R2 storage
    3. File is removed from all CDN edge caches
    4. Future requests return 404
    
    Args:
        object_key: Path to the file in R2
        current_user: Authenticated user
        
    Returns:
        Success message
        
    Raises:
        HTTPException 403: User not authorized to delete file
        HTTPException 404: File not found
        HTTPException 500: Deletion failed
    """
    
    try:
        # TODO: Add authorization check
        # Only allow deletion if:
        # - User uploaded the photo, OR
        # - User is admin
        
        # Extract user_id from object_key for authorization
        # object_key format: file_type/user_id/date/filename
        key_parts = object_key.split('/')
        if len(key_parts) >= 2:
            try:
                file_owner_id = int(key_parts[1])
                if file_owner_id != current_user.id:
                    # TODO: Check if user is admin
                    raise HTTPException(
                        status_code=status.HTTP_403_FORBIDDEN,
                        detail="Not authorized to delete this photo"
                    )
            except ValueError:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Invalid object key format"
                )
        
        # Delete the file from R2
        success = r2_client.delete_object(object_key)
        
        if not success:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Failed to delete photo"
            )
        
        return {"message": "Photo deleted successfully", "object_key": object_key}
        
    except HTTPException:
        # Re-raise HTTP exceptions
        raise
    except Exception as e:
        print(f"Photo deletion error for {object_key}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to delete photo"
        )

@router.get("/user-photos", response_model=List[str])
async def list_user_photos(
    file_type: str = None,
    current_user: User = Depends(get_current_user)
) -> List[str]:
    """
    List all photos uploaded by the current user.
    
    Useful for:
    - User's photo gallery
    - Photo management interface
    - Cleanup operations
    
    Args:
        file_type: Optional filter by 'property' or 'review'
        current_user: Authenticated user
        
    Returns:
        List of object_keys for user's photos
    """
    
    try:
        # Get list of user's photos from R2
        object_keys = r2_client.list_user_objects(
            user_id=current_user.id,
            file_type=file_type
        )
        
        return object_keys
        
    except Exception as e:
        print(f"Error listing photos for user {current_user.id}: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to list photos"
        )
