#!/usr/bin/env python3
"""
Quick script to check current property types in database
"""

import requests

response = requests.get('http://localhost:8000/api/v1/properties/')
if response.status_code == 200:
    data = response.json()
    properties = data.get('properties', [])
    
    print(f"Total properties: {len(properties)}")
    print("\nFirst 5 properties with their types:")
    for i, prop in enumerate(properties[:5], 1):
        prop_type = prop.get('property_type', 'NULL')
        address = prop.get('address', 'No address')[:50]
        print(f"{i}. ID: {prop.get('id')}, Type: {prop_type}, Address: {address}")
        
    # Count by type
    type_counts = {}
    for prop in properties:
        prop_type = prop.get('property_type', 'NULL')
        type_counts[prop_type] = type_counts.get(prop_type, 0) + 1
    
    print(f"\nProperty type distribution:")
    for prop_type, count in type_counts.items():
        print(f"  {prop_type}: {count}")
else:
    print(f"Error: {response.status_code} - {response.text}")
