"""
Complete Application Testing Script
Run this to test all functionality of your Bengaluru Tenants application.
"""

import requests
import json
from datetime import datetime

BASE_URL = "http://localhost:8000"
FRONTEND_URL = "http://localhost:3001"

def test_backend_health():
    """Test backend health and basic endpoints."""
    print("🔍 Testing Backend Health...")
    
    try:
        # Health check
        response = requests.get(f"{BASE_URL}/health")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Health Check: {data['status']}")
            print(f"   Version: {data.get('version', 'N/A')}")
            print(f"   Service: {data.get('service', 'N/A')}")
        else:
            print(f"❌ Health Check Failed: {response.status_code}")
            
        # Root endpoint
        response = requests.get(f"{BASE_URL}/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Root Endpoint: {data.get('message', 'OK')}")
        else:
            print(f"❌ Root Endpoint Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Backend Connection Failed: {e}")

def test_properties_api():
    """Test properties CRUD operations."""
    print("\n🏠 Testing Properties API...")
    
    try:
        # List properties
        response = requests.get(f"{BASE_URL}/api/v1/properties/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ List Properties: Found {len(data.get('properties', []))} properties")
            print(f"   Total: {data.get('total', 0)}")
        else:
            print(f"❌ List Properties Failed: {response.status_code}")
            
        # Test single property (might be 404 if no data)
        response = requests.get(f"{BASE_URL}/api/v1/properties/1")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Get Property: {data.get('address', 'No address')}")
        elif response.status_code == 404:
            print("ℹ️  No properties in database yet (expected for new setup)")
        else:
            print(f"❌ Get Property Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Properties API Failed: {e}")

def test_reviews_api():
    """Test reviews API."""
    print("\n⭐ Testing Reviews API...")
    
    try:
        response = requests.get(f"{BASE_URL}/api/v1/reviews/")
        if response.status_code == 200:
            data = response.json()
            print(f"✅ List Reviews: Found {len(data.get('reviews', []))} reviews")
            print(f"   Total: {data.get('total', 0)}")
        else:
            print(f"❌ List Reviews Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Reviews API Failed: {e}")

def test_authentication_flow():
    """Test magic link authentication."""
    print("\n🔐 Testing Authentication Flow...")
    
    try:
        # Test magic link generation
        test_email = "test@example.com"
        response = requests.post(
            f"{BASE_URL}/api/v1/auth/magic-link",
            json={"email": test_email}
        )
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Magic Link Generated for: {test_email}")
            print(f"   Message: {data.get('message', 'N/A')}")
            print(f"   Magic Token: {data.get('magic_token', 'N/A')[:20]}...")
            return data.get('magic_token')
        else:
            print(f"❌ Magic Link Failed: {response.status_code}")
            
    except Exception as e:
        print(f"❌ Authentication Failed: {e}")
    
    return None

def test_frontend_pages():
    """Test frontend page accessibility."""
    print("\n🌐 Testing Frontend Pages...")
    
    pages = [
        ("/", "Home Page"),
        ("/auth/login", "Login Page"),
        ("/property/1", "Property Detail Page"),
    ]
    
    for path, name in pages:
        try:
            response = requests.get(f"{FRONTEND_URL}{path}")
            if response.status_code == 200:
                print(f"✅ {name}: Loading successfully")
            else:
                print(f"❌ {name}: Failed ({response.status_code})")
        except Exception as e:
            print(f"❌ {name}: Connection failed")

def main():
    """Run all tests."""
    print("🚀 Bengaluru Tenants Application Testing")
    print("=" * 50)
    print(f"Backend URL: {BASE_URL}")
    print(f"Frontend URL: {FRONTEND_URL}")
    print(f"Test Time: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print("=" * 50)
    
    # Run all tests
    test_backend_health()
    test_properties_api()
    test_reviews_api()
    magic_token = test_authentication_flow()
    test_frontend_pages()
    
    print("\n🎯 Test Summary:")
    print("If you see ✅ for most tests, your application is working well!")
    print("\nNext steps:")
    print("1. Add some property data through the API")
    print("2. Test the complete user flow in browser")
    print("3. Try the authentication flow end-to-end")
    
    if magic_token:
        print(f"\n🔗 Test verification URL:")
        print(f"{FRONTEND_URL}/auth/verify?token={magic_token}")

if __name__ == "__main__":
    main()
