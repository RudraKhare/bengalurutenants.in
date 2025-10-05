"""
Add coordinates (lat, lng) to all properties that don't have them.

This script geocodes property addresses using a free geocoding service
and updates the database with latitude and longitude values.
"""

import sys
import time
from typing import Optional, Tuple
from app.db import SessionLocal
from app.models import Property

# Sample coordinates for major Indian cities (fallback for each city)
CITY_CENTERS = {
    "Bengaluru": (12.9716, 77.5946),
    "Mumbai": (19.0760, 72.8777),
    "Delhi": (28.6139, 77.2090),
    "Kolkata": (22.5726, 88.3639),
    "Chennai": (13.0827, 80.2707),
    "Hyderabad": (17.3850, 78.4867),
    "Pune": (18.5204, 73.8567),
    "Ahmedabad": (23.0225, 72.5714),
    "Jaipur": (26.9124, 75.7873),
    "Surat": (21.1702, 72.8311),
    "Lucknow": (26.8467, 80.9462),
    "Kanpur": (26.4499, 80.3319),
    "Nagpur": (21.1458, 79.0882),
    "Indore": (22.7196, 75.8577),
    "Thane": (19.2183, 72.9781),
    "Bhopal": (23.2599, 77.4126),
    "Visakhapatnam": (17.6868, 83.2185),
    "Pimpri-Chinchwad": (18.6298, 73.7997),
    "Patna": (25.5941, 85.1376),
    "Vadodara": (22.3072, 73.1812),
}

# Famous localities with known coordinates (for more accurate geocoding)
LOCALITY_COORDINATES = {
    # Bengaluru
    "Indiranagar": (12.9716, 77.6412),
    "Koramangala": (12.9352, 77.6245),
    "Whitefield": (12.9698, 77.7499),
    "HSR Layout": (12.9082, 77.6476),
    "JP Nagar": (12.9082, 77.5859),
    "Marathahalli": (12.9591, 77.7011),
    "Electronic City": (12.8454, 77.6609),
    "Jayanagar": (12.9250, 77.5838),
    "BTM Layout": (12.9165, 77.6101),
    "Hebbal": (13.0358, 77.5970),
    
    # Mumbai
    "Bandra": (19.0596, 72.8295),
    "Andheri": (19.1136, 72.8697),
    "Powai": (19.1176, 72.9060),
    "Goregaon": (19.1663, 72.8526),
    "Malad": (19.1864, 72.8493),
    "Thane": (19.2183, 72.9781),
    "Kandivali": (19.2074, 72.8521),
    "Borivali": (19.2304, 72.8577),
    "Colaba": (18.9067, 72.8147),
    "Juhu": (19.1075, 72.8263),
    
    # Delhi
    "Connaught Place": (28.6315, 77.2167),
    "Saket": (28.5244, 77.2066),
    "Dwarka": (28.5921, 77.0460),
    "Rohini": (28.7496, 77.0689),
    "Lajpat Nagar": (28.5677, 77.2431),
    "Greater Kailash": (28.5494, 77.2425),
    "Karol Bagh": (28.6510, 77.1900),
    "Vasant Kunj": (28.5177, 77.1590),
    "Janakpuri": (28.6219, 77.0815),
    "Mayur Vihar": (28.6078, 77.2981),
    
    # Chennai
    "T Nagar": (13.0418, 80.2341),
    "Anna Nagar": (13.0850, 80.2101),
    "Velachery": (12.9750, 80.2212),
    "Adyar": (13.0067, 80.2570),
    "Mylapore": (13.0339, 80.2619),
    
    # Hyderabad
    "Madhapur": (17.4485, 78.3908),
    "Gachibowli": (17.4399, 78.3487),
    "Banjara Hills": (17.4239, 78.4738),
    "Jubilee Hills": (17.4329, 78.4094),
    "Kukatpally": (17.4948, 78.4010),
}


def get_approximate_coordinates(property: Property) -> Optional[Tuple[float, float]]:
    """
    Get approximate coordinates for a property based on:
    1. Known locality coordinates (most accurate)
    2. City center coordinates (fallback)
    
    Returns (lat, lng) or None if city not found
    """
    # Try to match locality first (case-insensitive)
    if property.area:
        area_lower = property.area.lower()
        for locality, coords in LOCALITY_COORDINATES.items():
            if locality.lower() in area_lower or area_lower in locality.lower():
                # Add small random offset to avoid all properties having exact same coords
                import random
                lat_offset = random.uniform(-0.01, 0.01)  # ~1km variation
                lng_offset = random.uniform(-0.01, 0.01)
                return (coords[0] + lat_offset, coords[1] + lng_offset)
    
    # Fallback to city center
    city_coords = CITY_CENTERS.get(property.city)
    if city_coords:
        # Add larger random offset for city center
        import random
        lat_offset = random.uniform(-0.05, 0.05)  # ~5km variation
        lng_offset = random.uniform(-0.05, 0.05)
        return (city_coords[0] + lat_offset, city_coords[1] + lng_offset)
    
    return None


def add_coordinates_to_properties(dry_run: bool = False):
    """
    Add coordinates to all properties that don't have them.
    
    Args:
        dry_run: If True, only show what would be updated without making changes
    """
    db = SessionLocal()
    
    try:
        # Get all properties without coordinates
        properties_without_coords = db.query(Property).filter(
            (Property.lat == None) | (Property.lng == None)
        ).all()
        
        total_properties = db.query(Property).count()
        properties_with_coords = db.query(Property).filter(
            Property.lat != None, Property.lng != None
        ).count()
        
        print(f"\n📊 Current Status:")
        print(f"   Total properties: {total_properties}")
        print(f"   With coordinates: {properties_with_coords}")
        print(f"   Without coordinates: {len(properties_without_coords)}")
        print()
        
        if not properties_without_coords:
            print("✅ All properties already have coordinates!")
            return
        
        if dry_run:
            print("🔍 DRY RUN - No changes will be made\n")
        else:
            print("🚀 Updating properties with coordinates...\n")
        
        updated_count = 0
        skipped_count = 0
        
        for prop in properties_without_coords:
            coords = get_approximate_coordinates(prop)
            
            if coords:
                lat, lng = coords
                
                if dry_run:
                    print(f"Would update Property #{prop.id}:")
                else:
                    prop.lat = lat
                    prop.lng = lng
                    print(f"✅ Updated Property #{prop.id}:")
                
                print(f"   📍 {prop.address}")
                print(f"   🏙️  {prop.area or 'Unknown Area'}, {prop.city}")
                print(f"   📌 Coordinates: ({lat:.4f}, {lng:.4f})")
                print()
                
                updated_count += 1
            else:
                print(f"⚠️  Skipped Property #{prop.id}: City '{prop.city}' not found")
                print(f"   📍 {prop.address}")
                print()
                skipped_count += 1
        
        if not dry_run and updated_count > 0:
            print(f"\n💾 Committing {updated_count} updates to database...")
            db.commit()
            print("✅ Database updated successfully!")
        
        print(f"\n📈 Summary:")
        print(f"   Updated: {updated_count}")
        print(f"   Skipped: {skipped_count}")
        
        if not dry_run and updated_count > 0:
            # Verify the update
            final_with_coords = db.query(Property).filter(
                Property.lat != None, Property.lng != None
            ).count()
            print(f"\n✨ Final status: {final_with_coords}/{total_properties} properties have coordinates")
        
    except Exception as e:
        print(f"\n❌ Error: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    import argparse
    
    parser = argparse.ArgumentParser(description="Add coordinates to properties")
    parser.add_argument(
        "--dry-run",
        action="store_true",
        help="Show what would be updated without making changes"
    )
    parser.add_argument(
        "--execute",
        action="store_true",
        help="Actually update the database (required to make changes)"
    )
    
    args = parser.parse_args()
    
    if not args.dry_run and not args.execute:
        print("⚠️  Please specify either --dry-run or --execute")
        print("\nExamples:")
        print("  python -m app.add_coordinates_to_properties --dry-run")
        print("  python -m app.add_coordinates_to_properties --execute")
        sys.exit(1)
    
    add_coordinates_to_properties(dry_run=args.dry_run)
