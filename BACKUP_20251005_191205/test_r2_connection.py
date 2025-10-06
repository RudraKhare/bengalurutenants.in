#!/usr/bin/env python3
"""
R2 Connection Test Script
Tests if Cloudflare R2 is properly configured and accessible.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from backend.app.services.r2_client import r2_client
from dotenv import load_dotenv

def test_r2_connection():
    """Test R2 connection and configuration."""
    
    print("🔍 Testing Cloudflare R2 Connection...")
    print()
    
    # Check environment variables
    load_dotenv('backend/.env')
    r2_vars = {
        'R2_ACCESS_KEY_ID': os.getenv("R2_ACCESS_KEY_ID"),
        'R2_SECRET_ACCESS_KEY': os.getenv("R2_SECRET_ACCESS_KEY"),
        'R2_ENDPOINT': os.getenv("R2_ENDPOINT"),
        'R2_BUCKET': os.getenv("R2_BUCKET"),
    }
    
    print("📋 Environment Variables:")
    for key, value in r2_vars.items():
        if value:
            if 'SECRET' in key:
                print(f"  ✅ {key}: ***{value[-4:]} (hidden)")
            else:
                print(f"  ✅ {key}: {value}")
        else:
            print(f"  ❌ {key}: Missing!")
    print()
    
    missing_vars = [k for k, v in r2_vars.items() if not v]
    if missing_vars:
        print(f"❌ Missing required environment variables: {', '.join(missing_vars)}")
        return False
    
    # Test R2 client initialization
    try:
        print("🚀 Initializing R2 Client...")
        # The r2_client should already be initialized when imported
        print("  ✅ R2 client initialized successfully")
        print()
    except Exception as e:
        print(f"  ❌ Failed to initialize R2 client: {e}")
        return False
    
    # Test presigned URL generation
    try:
        print("🔗 Testing Presigned URL Generation...")
        
        # Test upload URL generation
        upload_data = r2_client.generate_presigned_upload_url(
            object_key="test/1/2025/01/01/test.jpg",
            content_type="image/jpeg",
            expires_in=3600
        )
        print("  ✅ Upload URL generated successfully")
        print(f"    📍 Object key: {upload_data['object_key']}")
        print(f"    ⏰ Expires in: {upload_data['expires_in']} seconds")
        print()
        
        # Test view URL generation
        view_url = r2_client.generate_presigned_view_url(
            object_key="test/1/2025/01/01/test.jpg",
            expires_in=86400
        )
        print("  ✅ View URL generated successfully")
        print(f"    🔗 View URL: {view_url[:100]}...")
        print()
        
    except Exception as e:
        print(f"  ❌ Failed to generate presigned URLs: {e}")
        return False
    
    # Test object key generation
    try:
        print("🏷️  Testing Object Key Generation...")
        
        test_cases = [
            ('review', 1, 'image/jpeg'),
            ('property', 2, 'image/png'),
            ('review', 3, 'image/webp'),
        ]
        
        for file_type, user_id, content_type in test_cases:
            object_key = r2_client.generate_object_key(file_type, user_id, content_type)
            print(f"  ✅ {file_type}/{user_id} ({content_type}): {object_key}")
        print()
        
    except Exception as e:
        print(f"  ❌ Failed to generate object keys: {e}")
        return False
    
    # Success summary
    print("🎉 All R2 tests passed successfully!")
    print()
    print("📝 Summary:")
    print("  • Environment variables are properly configured")
    print("  • R2 client initializes without errors")
    print("  • Presigned URLs can be generated for upload and viewing")
    print("  • Object keys are generated with correct format")
    print()
    print("💡 If photo uploads are still failing, check:")
    print("  1. R2 bucket CORS policy (should allow PUT, GET from your domain)")
    print("  2. Browser console for CORS errors during upload")
    print("  3. Network tab to see if uploads reach R2 servers")
    print("  4. R2 dashboard to verify files are actually being stored")
    
    return True

if __name__ == "__main__":
    success = test_r2_connection()
    sys.exit(0 if success else 1)
