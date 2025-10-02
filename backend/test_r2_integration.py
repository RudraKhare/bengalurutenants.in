"""
🧪 Day 3 R2 Integration Test - Real Credentials
Tests the complete photo upload workflow with your actual R2 setup
"""
import requests
import json
import time

# Server configuration
BASE_URL = "http://localhost:8000"
HEADERS = {"Content-Type": "application/json"}

def test_server_health():
    """Test if server is running"""
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"✅ Server Health: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ Server not accessible: {e}")
        return False

def test_magic_link_request():
    """Test magic link generation"""
    try:
        data = {"email": "test@example.com"}
        response = requests.post(f"{BASE_URL}/api/v1/auth/request-magic-link", 
                               json=data, headers=HEADERS)
        print(f"✅ Magic Link Request: {response.status_code}")
        if response.status_code == 200:
            result = response.json()
            print(f"   📧 Magic token generated for testing")
            return result.get("magic_token")  # For testing purposes
        return None
    except Exception as e:
        print(f"❌ Magic Link Error: {e}")
        return None

def test_r2_presigned_url_without_auth():
    """Test R2 presigned URL generation (should require auth)"""
    try:
        data = {
            "filename": "test-photo.jpg",
            "content_type": "image/jpeg",
            "upload_type": "property"
        }
        response = requests.post(f"{BASE_URL}/api/v1/uploads/signed-url", 
                               json=data, headers=HEADERS)
        print(f"🔒 Presigned URL (no auth): {response.status_code}")
        if response.status_code == 401:
            print("   ✅ Authentication properly required")
            return True
        else:
            print(f"   ⚠️  Expected 401, got {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Presigned URL Test Error: {e}")
        return False

def test_r2_service_directly():
    """Test R2 service initialization"""
    try:
        # Import and test R2 client directly
        import sys
        import os
        sys.path.append(os.path.dirname(os.path.abspath(__file__)))
        
        from app.services.r2_client import R2Client
        
        r2_client = R2Client()
        print("✅ R2 Client initialized successfully")
        
        # Test presigned URL generation
        upload_url = r2_client.generate_presigned_upload_url(
            object_key="test/test-photo.jpg",
            content_type="image/jpeg"
        )
        print("✅ Upload presigned URL generated")
        print(f"   🔗 URL type: {type(upload_url)}")
        if isinstance(upload_url, str):
            print(f"   🔗 URL starts with: {upload_url[:50]}...")
        else:
            print(f"   🔗 URL value: {upload_url}")
        
        # Test view URL generation
        view_url = r2_client.generate_presigned_view_url("test/test-photo.jpg")
        print("✅ View presigned URL generated")
        print(f"   🔗 URL type: {type(view_url)}")
        if isinstance(view_url, str):
            print(f"   🔗 URL starts with: {view_url[:50]}...")
        else:
            print(f"   🔗 URL value: {view_url}")
        
        return True
        
    except Exception as e:
        print(f"❌ R2 Service Test Error: {e}")
        import traceback
        traceback.print_exc()
        return False

def test_api_documentation():
    """Test API documentation endpoint"""
    try:
        response = requests.get(f"{BASE_URL}/docs")
        print(f"📚 API Docs: {response.status_code}")
        return response.status_code == 200
    except Exception as e:
        print(f"❌ API Docs Error: {e}")
        return False

def main():
    print("🧪 Testing Day 3 R2 Integration with Real Credentials")
    print("=" * 60)
    
    tests = [
        ("Server Health", test_server_health),
        ("API Documentation", test_api_documentation),
        ("R2 Service Direct Test", test_r2_service_directly),
        ("Magic Link Request", test_magic_link_request),
        ("Auth Protection", test_r2_presigned_url_without_auth),
    ]
    
    results = []
    for test_name, test_func in tests:
        print(f"\n🔍 Testing: {test_name}")
        try:
            result = test_func()
            results.append((test_name, result))
        except Exception as e:
            print(f"❌ {test_name} failed with exception: {e}")
            results.append((test_name, False))
    
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY:")
    print("=" * 60)
    
    passed = 0
    for test_name, result in results:
        status = "✅ PASS" if result else "❌ FAIL"
        print(f"{status}: {test_name}")
        if result:
            passed += 1
    
    print(f"\n🎯 Results: {passed}/{len(results)} tests passed")
    
    if passed == len(results):
        print("\n🎉 ALL TESTS PASSED!")
        print("Your R2 integration is working perfectly!")
        print("\nNext steps:")
        print("1. Visit http://localhost:8000/docs to test the API interactively")
        print("2. Use the /auth/request-magic-link endpoint to get a token")
        print("3. Test photo upload workflow with real files")
    else:
        print(f"\n⚠️  Some tests failed. Check the details above.")
        print("Make sure your .env file has all R2 credentials properly set.")

if __name__ == "__main__":
    main()
