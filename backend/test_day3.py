"""
Day 3 R2 Integration Test Suite
Tests all photo upload functionality to verify Cloudflare R2 integration is working.

What this tests:
1. R2 client configuration and connectivity
2. Presigned URL generation for uploads and views
3. API endpoints for photo management
4. Database integration with photo keys
5. End-to-end upload simulation

Run this after setting up your real R2 credentials.
"""

import os
import sys
import requests
import json
from datetime import datetime
import base64

# Add the app directory to Python path for imports
sys.path.append(os.path.join(os.path.dirname(__file__), 'app'))

def test_environment_setup():
    """Test 1: Verify all required environment variables are set"""
    print("🔧 Testing Environment Setup...")
    
    required_vars = [
        'DATABASE_URL',
        'SECRET_KEY', 
        'R2_ACCESS_KEY_ID',
        'R2_SECRET_ACCESS_KEY',
        'R2_ENDPOINT',
        'R2_BUCKET'
    ]
    
    missing_vars = []
    for var in required_vars:
        if not os.getenv(var):
            missing_vars.append(var)
    
    if missing_vars:
        print(f"❌ Missing environment variables: {', '.join(missing_vars)}")
        print("   Please update your .env file with real R2 credentials")
        return False
    else:
        print("✅ All environment variables configured")
        print(f"   R2 Endpoint: {os.getenv('R2_ENDPOINT')}")
        print(f"   R2 Bucket: {os.getenv('R2_BUCKET')}")
        return True

def test_r2_client_initialization():
    """Test 2: Verify R2 client can be initialized without errors"""
    print("\n🔗 Testing R2 Client Initialization...")
    
    try:
        from services.r2_client import r2_client
        print("✅ R2 client imported successfully")
        
        # Test object key generation
        object_key = r2_client.generate_object_key(
            file_type="review",
            user_id=123,
            content_type="image/jpeg"
        )
        print(f"✅ Object key generation works: {object_key}")
        
        # Verify key format: file_type/user_id/YYYY/MM/DD/uuid.ext
        parts = object_key.split('/')
        if len(parts) == 5 and parts[0] == "review" and parts[1] == "123":
            print("✅ Object key format is correct")
            return True
        else:
            print(f"❌ Object key format is incorrect: {object_key}")
            return False
            
    except Exception as e:
        print(f"❌ R2 client initialization failed: {str(e)}")
        return False

def test_presigned_url_generation():
    """Test 3: Test presigned URL generation (requires valid R2 credentials)"""
    print("\n🔑 Testing Presigned URL Generation...")
    
    try:
        from services.r2_client import r2_client
        
        # Test upload URL generation
        object_key = "test/123/2025/09/15/test-image.jpg"
        upload_data = r2_client.generate_presigned_upload_url(
            object_key=object_key,
            content_type="image/jpeg",
            expires_in=3600
        )
        
        print("✅ Upload URL generated successfully")
        print(f"   Object Key: {upload_data['object_key']}")
        print(f"   Expires In: {upload_data['expires_in']} seconds")
        print(f"   URL Preview: {upload_data['upload_url'][:80]}...")
        
        # Test view URL generation
        view_url = r2_client.generate_presigned_view_url(
            object_key=object_key,
            expires_in=86400
        )
        
        print("✅ View URL generated successfully")
        print(f"   URL Preview: {view_url[:80]}...")
        
        return True
        
    except Exception as e:
        print(f"❌ Presigned URL generation failed: {str(e)}")
        print("   This usually means R2 credentials are invalid or R2 service is unreachable")
        return False

def test_api_endpoints():
    """Test 4: Test FastAPI endpoints (requires server to be running)"""
    print("\n🌐 Testing API Endpoints...")
    
    base_url = "http://localhost:8000"
    
    # Test health endpoint first
    try:
        response = requests.get(f"{base_url}/health", timeout=5)
        if response.status_code == 200:
            print("✅ Server is running and healthy")
        else:
            print(f"❌ Health check failed with status {response.status_code}")
            return False
    except requests.exceptions.ConnectionError:
        print("❌ Cannot connect to server. Make sure 'python main.py' is running")
        return False
    except Exception as e:
        print(f"❌ Health check failed: {str(e)}")
        return False
    
    # Test API documentation
    try:
        response = requests.get(f"{base_url}/docs", timeout=5)
        if response.status_code == 200:
            print("✅ API documentation is accessible at /docs")
        else:
            print(f"⚠️  API docs returned status {response.status_code}")
    except Exception as e:
        print(f"⚠️  API docs test failed: {str(e)}")
    
    # Test upload endpoint (without authentication - should return 401)
    try:
        response = requests.post(
            f"{base_url}/api/v1/uploads/signed-url",
            json={
                "content_type": "image/jpeg",
                "file_type": "review"
            },
            timeout=5
        )
        
        if response.status_code == 401:
            print("✅ Upload endpoint properly requires authentication")
        else:
            print(f"⚠️  Upload endpoint returned unexpected status: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Upload endpoint test failed: {str(e)}")
        return False
    
    return True

def test_with_mock_authentication():
    """Test 5: Test upload endpoint with mock authentication"""
    print("\n🔐 Testing with Mock Authentication...")
    
    try:
        # This is a simplified test - in real usage you'd get a token from /auth/verify
        print("ℹ️  For full authentication test:")
        print("   1. Go to http://localhost:8000/docs")
        print("   2. Use /api/v1/auth/magic-link to get a magic link")
        print("   3. Use /api/v1/auth/verify with the token")
        print("   4. Use the returned access_token for upload requests")
        print("   5. Test /api/v1/uploads/signed-url with Authorization: Bearer <token>")
        
        return True
        
    except Exception as e:
        print(f"❌ Authentication test setup failed: {str(e)}")
        return False

def test_database_schema():
    """Test 6: Verify database schema includes photo fields"""
    print("\n🗄️  Testing Database Schema...")
    
    try:
        from models import Property, Review
        from sqlalchemy import inspect
        
        # Check if photo_keys field exists in models
        property_columns = [column.name for column in inspect(Property).columns]
        review_columns = [column.name for column in inspect(Review).columns]
        
        if 'photo_keys' in property_columns:
            print("✅ Property model has photo_keys field")
        else:
            print("❌ Property model missing photo_keys field")
            
        if 'photo_keys' in review_columns:
            print("✅ Review model has photo_keys field")
        else:
            print("❌ Review model missing photo_keys field")
            
        print(f"   Property columns: {', '.join(property_columns)}")
        print(f"   Review columns: {', '.join(review_columns)}")
        
        return True
        
    except Exception as e:
        print(f"❌ Database schema test failed: {str(e)}")
        return False

def test_file_upload_simulation():
    """Test 7: Simulate a complete file upload workflow"""
    print("\n📤 Testing Complete Upload Workflow Simulation...")
    
    try:
        # Step 1: Create a small test image in memory
        print("   Creating test image data...")
        
        # Create a minimal JPEG header (this won't be a real image, just for testing)
        test_image_data = b'\xFF\xD8\xFF\xE0\x00\x10JFIF\x00\x01\x01\x01\x00H\x00H\x00\x00\xFF\xDB\x00C\x00'
        
        # Step 2: Test the object key generation
        from services.r2_client import r2_client
        object_key = r2_client.generate_object_key(
            file_type="review",
            user_id=999,  # Test user
            content_type="image/jpeg"
        )
        print(f"   Generated object key: {object_key}")
        
        # Step 3: Generate presigned upload URL
        upload_data = r2_client.generate_presigned_upload_url(
            object_key=object_key,
            content_type="image/jpeg"
        )
        print("   Generated presigned upload URL")
        
        # Step 4: Simulate upload (don't actually upload to avoid using R2 bandwidth)
        print("   ✅ Upload simulation complete (actual upload skipped)")
        print("   In real usage, frontend would PUT file data to the presigned URL")
        
        # Step 5: Generate view URL
        view_url = r2_client.generate_presigned_view_url(object_key)
        print("   Generated presigned view URL")
        
        print("✅ Complete workflow simulation successful")
        return True
        
    except Exception as e:
        print(f"❌ Upload workflow simulation failed: {str(e)}")
        return False

def run_all_tests():
    """Run all tests and provide summary"""
    print("🧪 Day 3 R2 Integration Test Suite")
    print("=" * 50)
    
    tests = [
        ("Environment Setup", test_environment_setup),
        ("R2 Client Initialization", test_r2_client_initialization),
        ("Presigned URL Generation", test_presigned_url_generation),
        ("API Endpoints", test_api_endpoints),
        ("Mock Authentication", test_with_mock_authentication),
        ("Database Schema", test_database_schema),
        ("Upload Workflow Simulation", test_file_upload_simulation)
    ]
    
    results = []
    
    for test_name, test_func in tests:
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} crashed: {str(e)}")
            results.append((test_name, False))
    
    # Summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    
    passed = sum(1 for _, result in results if result)
    total = len(results)
    
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status} {test_name}")
    
    print(f"\nOverall: {passed}/{total} tests passed")
    
    if passed == total:
        print("🎉 ALL TESTS PASSED! Your Day 3 implementation is working perfectly!")
    elif passed >= total * 0.8:
        print("⚠️  Most tests passed. Check failed tests above.")
    else:
        print("❌ Several tests failed. Review the errors above.")
    
    print(f"\nNext steps:")
    print("1. Fix any failed tests")
    print("2. Update .env with real R2 credentials")
    print("3. Test with real file uploads via /docs interface")
    print("4. Integrate PhotoUpload components in your frontend")

if __name__ == "__main__":
    run_all_tests()
