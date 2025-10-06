"""
Quick check to see what photo_keys data exists in the database
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from app.db import SessionLocal
from app.models import Property

def check_photo_keys():
    """Check if any properties have photo_keys data"""
    print("🔍 CHECKING PHOTO KEYS IN DATABASE")
    print("=" * 40)
    
    db = SessionLocal()
    try:
        # Get all properties
        properties = db.query(Property).all()
        
        print(f"📊 Total Properties: {len(properties)}")
        
        # Check photo_keys status
        with_photos = 0
        without_photos = 0
        
        for prop in properties:
            if prop.photo_keys:
                with_photos += 1
                print(f"  ✅ Property {prop.id}: {prop.address} - HAS PHOTOS: {prop.photo_keys[:50]}...")
            else:
                without_photos += 1
                print(f"  ❌ Property {prop.id}: {prop.address} - NO PHOTOS")
        
        print(f"\n📈 SUMMARY:")
        print(f"  Properties with photos: {with_photos}")
        print(f"  Properties without photos: {without_photos}")
        
        if without_photos > 0:
            print(f"\n💡 DIAGNOSIS: Properties are using Picsum placeholders because")
            print(f"   the photo_keys field is NULL/empty in the database.")
            print(f"   To use R2 photos, you need to:")
            print(f"   1. Upload photos via the photo upload API")
            print(f"   2. Associate them with properties via photo_keys")
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_photo_keys()
