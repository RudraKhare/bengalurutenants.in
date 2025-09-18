"""
Cloudflare R2 Object Storage Client
Handles photo uploads and retrieval for property and review images.

What this does:
- Configures boto3 to work with Cloudflare R2 (S3-compatible API)
- Generates presigned URLs for direct browser uploads
- Provides secure time-limited access to uploaded files
- Handles object key generation and validation

Under the hood:
- Presigned URLs contain cryptographic signatures that R2 validates
- Browser uploads go directly to R2 edge servers (bypassing our API)
- R2 automatically distributes files across Cloudflare's global network
- CDN caching serves files from the nearest edge location to users
"""

import os
import boto3
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
from urllib.parse import urlparse
import uuid
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class R2Client:
    """
    Cloudflare R2 client using boto3's S3-compatible interface.
    
    R2 is Cloudflare's object storage that's compatible with Amazon S3 APIs,
    which means we can use boto3 (the AWS Python SDK) to interact with it.
    """
    
    def __init__(self):
        """
        Initialize R2 client with Cloudflare credentials.
        
        Under the hood:
        - boto3 creates an S3 client but points it to R2's endpoint
        - Credentials are used to sign API requests cryptographically
        - R2 validates the signatures to authenticate requests
        """
        
        # Get R2 configuration from environment
        self.access_key_id = os.getenv("R2_ACCESS_KEY_ID")
        self.secret_access_key = os.getenv("R2_SECRET_ACCESS_KEY") 
        self.endpoint_url = os.getenv("R2_ENDPOINT")
        self.bucket_name = os.getenv("R2_BUCKET")
        
        # Validate required configuration
        if not all([self.access_key_id, self.secret_access_key, self.endpoint_url, self.bucket_name]):
            raise ValueError(
                "Missing R2 configuration. Please set R2_ACCESS_KEY_ID, "
                "R2_SECRET_ACCESS_KEY, R2_ENDPOINT, and R2_BUCKET environment variables."
            )
        
        # Create boto3 S3 client configured for Cloudflare R2
        # Note: We're using S3 client because R2 is S3-compatible
        self.client = boto3.client(
            's3',
            endpoint_url=self.endpoint_url,           # Points to R2 instead of AWS
            aws_access_key_id=self.access_key_id,     # R2 API token credentials
            aws_secret_access_key=self.secret_access_key,
            region_name='auto'                        # R2 uses 'auto' for global distribution
        )
    
    def generate_object_key(self, file_type: str, user_id: int, content_type: str) -> str:
        """
        Generate a unique object key (file path) for R2 storage.
        
        Args:
            file_type: 'property' or 'review' - categorizes the upload
            user_id: ID of the user uploading (for organization and security)
            content_type: MIME type of the file (e.g., 'image/jpeg')
            
        Returns:
            String like 'property/123/2025/01/15/uuid.jpg'
            
        Why this structure:
        - Organized by type and user for easy management
        - Date-based folders prevent too many files in one directory
        - UUID prevents filename conflicts and adds security
        - File extension based on MIME type for proper handling
        """
        
        # Extract file extension from MIME type
        # image/jpeg -> jpg, image/png -> png, etc.
        extension_map = {
            'image/jpeg': 'jpg',
            'image/png': 'png', 
            'image/webp': 'webp',
            'image/gif': 'gif'
        }
        extension = extension_map.get(content_type, 'bin')  # Default to .bin for unknown types
        
        # Create date-based folder structure (YYYY/MM/DD)
        now = datetime.utcnow()
        date_path = now.strftime('%Y/%m/%d')
        
        # Generate unique filename with UUID to prevent conflicts
        unique_filename = f"{uuid.uuid4()}.{extension}"
        
        # Combine into full object key: type/user_id/date/filename
        object_key = f"{file_type}/{user_id}/{date_path}/{unique_filename}"
        
        return object_key
    
    def generate_presigned_upload_url(self, object_key: str, content_type: str, expires_in: int = 3600) -> Dict[str, Any]:
        """
        Generate a presigned URL for uploading files directly to R2.
        
        What happens under the hood:
        1. We create a cryptographic signature using our R2 credentials
        2. The signature includes the object key, HTTP method (PUT), expiry time
        3. R2 will validate this signature when the browser makes the request
        4. This allows browsers to upload directly without our API credentials
        
        Args:
            object_key: The file path in R2 where the file will be stored
            content_type: MIME type that must match the upload
            expires_in: How long the URL is valid (seconds, default 1 hour)
            
        Returns:
            Dict with 'url' (for uploading) and 'object_key' (for later reference)
            
        Network flow:
        Browser → Presigned URL → R2 Edge Server → Global R2 Storage
        """
        
        try:
            # Generate presigned URL for PUT operation (file upload)
            # boto3 creates a URL with embedded signature that R2 will validate
            presigned_url = self.client.generate_presigned_url(
                'put_object',                    # HTTP PUT method for uploading
                Params={
                    'Bucket': self.bucket_name,  # Which R2 bucket to upload to
                    'Key': object_key,           # File path within the bucket
                    'ContentType': content_type  # Required MIME type (security)
                },
                ExpiresIn=expires_in             # URL expires after this many seconds
            )
            
            return {
                'upload_url': presigned_url,     # URL for browser to PUT file to
                'object_key': object_key,        # Reference to store in our database
                'expires_in': expires_in         # How long URL is valid
            }
            
        except Exception as e:
            raise Exception(f"Failed to generate presigned upload URL: {str(e)}")
    
    def generate_presigned_view_url(self, object_key: str, expires_in: int = 86400) -> str:
        """
        Generate a presigned URL for viewing/downloading files from R2.
        
        Why we need this:
        - R2 bucket is private for security (no public access)
        - Presigned URLs provide time-limited access to specific files
        - Users can only access files they're authorized to see
        
        Under the hood:
        - Creates a signed GET URL that R2 validates
        - When accessed, R2 serves the file through Cloudflare's CDN
        - CDN caches the file at edge locations worldwide for fast access
        
        Args:
            object_key: Path to the file in R2
            expires_in: How long the URL is valid (default 24 hours)
            
        Returns:
            Presigned URL string for viewing the file
            
        CDN behavior:
        User Request → Nearest CDN Edge → R2 Storage (if not cached)
        """
        
        try:
            # Generate presigned URL for GET operation (file download/view)
            presigned_url = self.client.generate_presigned_url(
                'get_object',                    # HTTP GET method for downloading
                Params={
                    'Bucket': self.bucket_name,  # Which R2 bucket to read from
                    'Key': object_key            # File path within the bucket
                },
                ExpiresIn=expires_in             # URL expires after this many seconds
            )
            
            return presigned_url
            
        except Exception as e:
            raise Exception(f"Failed to generate presigned view URL: {str(e)}")
    
    def delete_object(self, object_key: str) -> bool:
        """
        Delete a file from R2 storage.
        
        Use cases:
        - User deletes their uploaded photo
        - Admin removes inappropriate content
        - Cleanup of test uploads
        
        Args:
            object_key: Path to the file in R2
            
        Returns:
            True if deletion successful, False otherwise
        """
        
        try:
            # Delete the object from R2
            # This removes it from all CDN edge caches as well
            self.client.delete_object(
                Bucket=self.bucket_name,
                Key=object_key
            )
            return True
            
        except Exception as e:
            print(f"Failed to delete object {object_key}: {str(e)}")
            return False
    
    def list_user_objects(self, user_id: int, file_type: str = None) -> list:
        """
        List all files uploaded by a specific user.
        
        Useful for:
        - User's photo gallery
        - Admin moderation
        - Cleanup operations
        
        Args:
            user_id: User's ID to filter by
            file_type: Optional filter by 'property' or 'review'
            
        Returns:
            List of object keys for the user's files
        """
        
        try:
            # Construct prefix to filter by user
            if file_type:
                prefix = f"{file_type}/{user_id}/"
            else:
                # List both property and review photos for user
                prefix = f"*/{user_id}/"
            
            # List objects with the prefix
            response = self.client.list_objects_v2(
                Bucket=self.bucket_name,
                Prefix=prefix if file_type else ""
            )
            
            # Extract object keys from response
            objects = []
            if 'Contents' in response:
                for obj in response['Contents']:
                    # Filter by user_id if no file_type specified
                    if not file_type:
                        # Check if object key contains the user_id
                        key_parts = obj['Key'].split('/')
                        if len(key_parts) >= 2 and key_parts[1] == str(user_id):
                            objects.append(obj['Key'])
                    else:
                        objects.append(obj['Key'])
            
            return objects
            
        except Exception as e:
            print(f"Failed to list objects for user {user_id}: {str(e)}")
            return []

# Create a singleton instance for use across the application
# This ensures we reuse the same client connection
r2_client = R2Client()
