"""
Script to find and remove properties with coordinates outside India
India's approximate bounds: Lat 8-37, Lng 68-97
"""
import sys
sys.path.append('.')

from app.db import SessionLocal
from app.models import Property

def fix_properties():
    db = SessionLocal()
    try:
        # Query all properties with coordinates
        properties = db.query(Property).filter(
            Property.lat.isnot(None),
            Property.lng.isnot(None)
        ).all()
        
        print(f"\nFound {len(properties)} properties with coordinates\n")
        
        # India's approximate bounds
        INDIA_LAT_MIN = 8.0
        INDIA_LAT_MAX = 37.0
        INDIA_LNG_MIN = 68.0
        INDIA_LNG_MAX = 97.0
        
        properties_to_delete = []
        
        for prop in properties:
            is_in_india = (
                INDIA_LAT_MIN <= prop.lat <= INDIA_LAT_MAX and
                INDIA_LNG_MIN <= prop.lng <= INDIA_LNG_MAX
            )
            
            status = "✓ IN INDIA" if is_in_india else "✗ OUTSIDE INDIA"
            print(f"{status} - ID: {prop.id}, Address: {prop.address}")
            print(f"           Lat: {prop.lat}, Lng: {prop.lng}\n")
            
            if not is_in_india:
                properties_to_delete.append(prop)
        
        if properties_to_delete:
            print(f"\n{'='*60}")
            print(f"Found {len(properties_to_delete)} properties OUTSIDE India:")
            for prop in properties_to_delete:
                print(f"  - ID {prop.id}: {prop.address}")
            
            response = input(f"\nDo you want to DELETE these {len(properties_to_delete)} properties? (yes/no): ")
            
            if response.lower() == 'yes':
                from app.models import Review, TenantVerification
                
                for prop in properties_to_delete:
                    # First, delete associated reviews
                    reviews = db.query(Review).filter(Review.property_id == prop.id).all()
                    if reviews:
                        print(f"  Deleting {len(reviews)} review(s) for property {prop.id}...")
                        for review in reviews:
                            db.delete(review)
                    
                    # Delete associated verifications
                    verifications = db.query(TenantVerification).filter(TenantVerification.property_id == prop.id).all()
                    if verifications:
                        print(f"  Deleting {len(verifications)} verification(s) for property {prop.id}...")
                        for verification in verifications:
                            db.delete(verification)
                    
                    # Finally, delete the property
                    db.delete(prop)
                
                db.commit()
                print(f"\n✓ Successfully deleted {len(properties_to_delete)} properties and their associated data!")
            else:
                print("\n✗ Deletion cancelled.")
        else:
            print("\n✓ All properties are within India bounds!")
            
    except Exception as e:
        print(f"Error: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    fix_properties()
