#!/usr/bin/env python3
"""
Debug script for dashboard API endpoints
"""

import requests
import json

# Base configuration
BASE_URL = "http://localhost:8000"
USER_EMAIL = "khare.rudra20@gmail.com"

def get_user_token():
    """Get authentication token for the user"""
    # First, let's get a magic link
    magic_response = requests.post(f"{BASE_URL}/api/v1/auth/magic-link", 
                                 json={"email": USER_EMAIL})
    print(f"Magic link response: {magic_response.status_code}")
    
    if magic_response.status_code != 200:
        print(f"Failed to get magic link: {magic_response.text}")
        return None
    
    print("Check your email for the verification token...")
    token = input("Enter the verification token from your email: ")
    
    # Verify the token
    verify_response = requests.post(f"{BASE_URL}/api/v1/auth/verify",
                                  json={"token": token})
    
    if verify_response.status_code == 200:
        data = verify_response.json()
        return data.get("access_token")
    else:
        print(f"Failed to verify token: {verify_response.text}")
        return None

def test_dashboard_endpoints(token):
    """Test the dashboard endpoints with detailed error reporting"""
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    print("\n=== Testing /api/v1/reviews/my-reviews ===")
    reviews_response = requests.get(f"{BASE_URL}/api/v1/reviews/my-reviews", headers=headers)
    print(f"Status: {reviews_response.status_code}")
    print(f"Response: {reviews_response.text}")
    
    print("\n=== Testing /api/v1/reviews/my-properties ===")
    properties_response = requests.get(f"{BASE_URL}/api/v1/reviews/my-properties", headers=headers)
    print(f"Status: {properties_response.status_code}")
    print(f"Response: {properties_response.text}")
    
    # Test user info to confirm authentication
    print("\n=== Testing /api/v1/auth/me ===")
    try:
        me_response = requests.get(f"{BASE_URL}/api/v1/auth/me", headers=headers)
        print(f"Status: {me_response.status_code}")
        print(f"Response: {me_response.text}")
    except Exception as e:
        print(f"Error testing /me endpoint: {e}")

if __name__ == "__main__":
    print("Dashboard API Debug Tool")
    print("=======================")
    
    # For testing, let's use a token if you have one
    token = input("Enter your auth token (or press Enter to get a new one): ").strip()
    
    if not token:
        token = get_user_token()
    
    if token:
        test_dashboard_endpoints(token)
    else:
        print("Could not get authentication token")
