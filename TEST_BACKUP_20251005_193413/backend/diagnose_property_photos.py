"""
Diagnostic script to check property photo_keys in database
"""
from app.db import SessionLocal
from app.models import Property

def check_property_photos():
    db = SessionLocal()
    
    try:
        print("=" * 70)
        print("DATABASE DIAGNOSTIC: Property Photos")
        print("=" * 70)
        
        # Check total properties
        total_properties = db.query(Property).count()
        print(f"\n📊 Total Properties: {total_properties}")
        
        # Check properties with photo_keys
        props_with_photos = db.query(Property).filter(
            Property.photo_keys.isnot(None),
            Property.photo_keys != ''
        ).all()
        
        print(f"📸 Properties WITH photo_keys: {len(props_with_photos)}")
        print(f"🚫 Properties WITHOUT photo_keys: {total_properties - len(props_with_photos)}")
        
        if props_with_photos:
            print("\n" + "=" * 70)
            print("Properties with Photo Keys:")
            print("=" * 70)
            for prop in props_with_photos:
                print(f"\nProperty ID: {prop.id}")
                print(f"  Area: {prop.area}")
                print(f"  Address: {prop.address[:60]}...")
                print(f"  Photo Keys: {prop.photo_keys}")
                
                # Count photos
                keys = [k.strip() for k in prop.photo_keys.split(',') if k.strip()]
                print(f"  Number of photos: {len(keys)}")
        else:
            print("\n⚠️  WARNING: No properties have photo_keys!")
            print("   Properties will use placeholder images.")
            print("\n💡 To add photos:")
            print("   1. Users need to upload photos when adding properties")
            print("   2. OR run: add_sample_photo_keys.sql for testing")
        
        # Check first 5 properties
        print("\n" + "=" * 70)
        print("First 5 Properties (any):")
        print("=" * 70)
        first_props = db.query(Property).limit(5).all()
        for prop in first_props:
            photo_status = "HAS PHOTOS" if prop.photo_keys else "NO PHOTOS"
            print(f"ID {prop.id}: {prop.area or 'No area'} - {photo_status}")
            
    except Exception as e:
        print(f"\n❌ Error: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    check_property_photos()
