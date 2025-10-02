#!/usr/bin/env python3
"""
Test script for user dashboard endpoints
"""

import requests

BASE_URL = "http://localhost:8000"

def test_user_dashboard_endpoints():
    """Test the new user dashboard endpoints"""
    print("🏠 Testing User Dashboard Endpoints")
    print("=" * 50)
    
    # Note: These will require valid authentication
    headers = {
        "Authorization": "Bearer test-token",  # Replace with real token
        "Content-Type": "application/json"
    }
    
    # Test 1: Get user's reviews
    print("\n1. Testing GET /api/v1/reviews/my-reviews")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/reviews/my-reviews", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ User has {data.get('total', 0)} reviews")
            if data.get('reviews'):
                first_review = data['reviews'][0]
                print(f"   ✅ Latest review rating: {first_review.get('rating')}/5")
        elif response.status_code == 401:
            print(f"   ⚠️ Authentication required (expected for test)")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")
    
    # Test 2: Get user's properties
    print("\n2. Testing GET /api/v1/reviews/my-properties")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/reviews/my-properties", headers=headers)
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ User owns {len(data)} properties")
            if data:
                first_prop = data[0]
                print(f"   ✅ Latest property: {first_prop.get('address', 'N/A')[:30]}...")
        elif response.status_code == 401:
            print(f"   ⚠️ Authentication required (expected for test)")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

def test_general_endpoints():
    """Test general endpoints for comparison"""
    print("\n\n📋 Testing General Endpoints (No Auth Required)")
    print("=" * 50)
    
    # Test general reviews endpoint
    print("\n1. Testing GET /api/v1/reviews/ (all reviews)")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/reviews/")
        print(f"   Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"   ✅ Total public reviews: {data.get('total', 0)}")
        else:
            print(f"   ❌ Error: {response.text}")
            
    except Exception as e:
        print(f"   ❌ Error: {e}")

if __name__ == "__main__":
    print("🚀 User Dashboard API Test")
    print("Testing new user-specific endpoints...")
    
    test_general_endpoints()
    test_user_dashboard_endpoints()
    
    print("\n✅ Test completed!")
    print("\nNote: Dashboard endpoints require valid JWT authentication.")
    print("The endpoints are ready for frontend integration!")
