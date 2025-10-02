#!/usr/bin/env python3
"""
Test script to verify property type functionality is working
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_properties_endpoint():
    """Test the properties endpoint with property type filtering"""
    print("🧪 Testing Properties API with Property Type Filtering")
    print("=" * 60)
    
    # Test 1: Get all properties
    print("\n1. Testing GET /api/v1/properties/ (all properties)")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/properties/")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Total properties: {data.get('total', 0)}")
            print(f"   Properties returned: {len(data.get('properties', []))}")
            
            # Show first property if available
            if data.get('properties'):
                prop = data['properties'][0]
                print(f"   First property: {prop.get('address', 'N/A')} - Type: {prop.get('property_type', 'N/A')}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 2: Filter by FLAT_APARTMENT
    print("\n2. Testing GET /api/v1/properties/?property_type=FLAT_APARTMENT")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/properties/?property_type=FLAT_APARTMENT")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   Flat/Apartment properties: {len(data.get('properties', []))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")
    
    # Test 3: Filter by PG_HOSTEL
    print("\n3. Testing GET /api/v1/properties/?property_type=PG_HOSTEL")
    try:
        response = requests.get(f"{BASE_URL}/api/v1/properties/?property_type=PG_HOSTEL")
        print(f"   Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"   PG/Hostel properties: {len(data.get('properties', []))}")
        else:
            print(f"   Error: {response.text}")
    except Exception as e:
        print(f"   Error: {e}")

def test_health_endpoint():
    """Test the health endpoint"""
    print("\n🏥 Testing Health Endpoint")
    print("=" * 30)
    
    try:
        response = requests.get(f"{BASE_URL}/health")
        print(f"Status: {response.status_code}")
        if response.status_code == 200:
            data = response.json()
            print(f"Service: {data.get('service', 'unknown')}")
            print(f"Version: {data.get('version', 'unknown')}")
            print(f"Status: {data.get('status', 'unknown')}")
        else:
            print(f"Error: {response.text}")
    except Exception as e:
        print(f"Error: {e}")

if __name__ == "__main__":
    print("🚀 Property Type Integration Test")
    print("Testing backend API endpoints...")
    
    test_health_endpoint()
    test_properties_endpoint()
    
    print("\n✅ Test completed!")
    print("\nIf all tests pass, your property type integration is working correctly!")
