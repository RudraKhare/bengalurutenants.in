#!/usr/bin/env python3
"""
Test script to verify property type is properly saved when creating properties
"""

import requests
import json

BASE_URL = "http://localhost:8000"

def test_property_creation_with_types():
    """Test creating properties with different property types"""
    print("🧪 Testing Property Creation with Different Property Types")
    print("=" * 60)
    
    # Test properties with different types
    test_properties = [
        {
            "address": "Test Villa 123, Test Area",
            "city": "Bengaluru", 
            "area": "Test Area",
            "property_type": "VILLA_HOUSE"
        },
        {
            "address": "Test PG 456, Test Area", 
            "city": "Bengaluru",
            "area": "Test Area", 
            "property_type": "PG_HOSTEL"
        },
        {
            "address": "Test Apartment 789, Test Area",
            "city": "Bengaluru",
            "area": "Test Area",
            "property_type": "FLAT_APARTMENT"
        }
    ]
    
    # Create a dummy auth header for testing (you'll need a real token)
    headers = {
        "Content-Type": "application/json",
        "Authorization": "Bearer test-token"  # Replace with real token if needed
    }
    
    for i, prop_data in enumerate(test_properties, 1):
        print(f"\n{i}. Testing creation of {prop_data['property_type']} property")
        try:
            response = requests.post(
                f"{BASE_URL}/api/v1/properties/",
                headers=headers,
                json=prop_data
            )
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 201:
                created_prop = response.json()
                print(f"   ✅ Property created with ID: {created_prop.get('id')}")
                print(f"   ✅ Property type saved as: {created_prop.get('property_type')}")
                print(f"   ✅ Address: {created_prop.get('address')}")
                
                # Verify the property type matches what we sent
                if created_prop.get('property_type') == prop_data['property_type']:
                    print(f"   ✅ Property type correctly saved!")
                else:
                    print(f"   ❌ Property type mismatch! Expected: {prop_data['property_type']}, Got: {created_prop.get('property_type')}")
                    
            elif response.status_code == 401:
                print(f"   ⚠️ Authentication required (expected for test)")
            else:
                print(f"   ❌ Error: {response.text}")
                
        except Exception as e:
            print(f"   ❌ Error: {e}")

def test_property_filtering():
    """Test filtering properties by type"""
    print("\n\n🔍 Testing Property Type Filtering")
    print("=" * 40)
    
    property_types = ["VILLA_HOUSE", "FLAT_APARTMENT", "PG_HOSTEL"]
    
    for prop_type in property_types:
        print(f"\nTesting filter for {prop_type}:")
        try:
            response = requests.get(f"{BASE_URL}/api/v1/properties/?property_type={prop_type}")
            print(f"   Status: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                count = len(data.get('properties', []))
                print(f"   Found {count} {prop_type} properties")
                
                # Show property types of returned properties
                for prop in data.get('properties', [])[:3]:  # Show first 3
                    print(f"   - {prop.get('address')} (Type: {prop.get('property_type')})")
                    
            else:
                print(f"   Error: {response.text}")
                
        except Exception as e:
            print(f"   Error: {e}")

if __name__ == "__main__":
    print("🚀 Property Type Creation & Filtering Test")
    print("Testing if property types are properly saved and filtered...")
    
    test_property_filtering()  # Test current state first
    test_property_creation_with_types()  # Test creation (might fail due to auth)
    
    print("\n✅ Test completed!")
    print("\nNote: Property creation tests may fail due to authentication requirements.")
    print("The important part is that filtering shows correct property types.")
