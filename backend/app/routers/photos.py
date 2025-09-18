"""
Alternative photo viewing endpoint that proxies R2 requests.
This bypasses CORS issues by serving photos through our backend.
"""

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
import requests
import io

from ..db import get_db
from ..models import User
from ..dependencies import get_current_user
from ..services.r2_client import r2_client

router = APIRouter(prefix="/api/v1/photos", tags=["photo-proxy"])

@router.get("/view/{object_key:path}")
async def proxy_photo_view(
    object_key: str,
    current_user: User = Depends(get_current_user)
):
    """
    Proxy photo requests through our backend to bypass CORS issues.
    
    This endpoint:
    1. Generates a presigned R2 URL (server-side, no CORS)
    2. Fetches the image from R2 (server-to-server, no CORS)
    3. Streams the image back to the browser
    
    Args:
        object_key: R2 object key for the photo
        current_user: Authenticated user
        
    Returns:
        StreamingResponse with the image data
    """
    
    try:
        # Generate presigned URL (server-side, no CORS issues)
        view_url = r2_client.generate_presigned_view_url(
            object_key=object_key,
            expires_in=3600  # 1 hour
        )
        
        # Fetch image from R2 (server-to-server request)
        response = requests.get(view_url, stream=True)
        
        if not response.ok:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Photo not found"
            )
        
        # Get content type from R2 response
        content_type = response.headers.get('content-type', 'image/jpeg')
        
        # Stream the image data back to browser
        def generate():
            for chunk in response.iter_content(chunk_size=8192):
                if chunk:
                    yield chunk
        
        return StreamingResponse(
            generate(),
            media_type=content_type,
            headers={
                "Cache-Control": "public, max-age=86400",  # Cache for 24 hours
                "Access-Control-Allow-Origin": "*"        # Allow from any origin
            }
        )
        
    except Exception as e:
        print(f"Photo proxy error for {object_key}: {e}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to load photo"
        )
