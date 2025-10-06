#!/usr/bin/env python3
"""
Photo System Diagnostic Script
Analyzes the photo storage and retrieval workflow to identify issues.
"""

import sys
import os
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))

from sqlalchemy import create_engine, text
from dotenv import load_dotenv

def diagnose_photo_system():
    """Diagnose photo system issues."""
    
    print("🔍 Photo System Diagnostic")
    print("=" * 50)
    
    # Load environment variables
    load_dotenv('backend/.env')
    database_url = os.getenv('DATABASE_URL')
    
    if not database_url:
        print("❌ DATABASE_URL not found in environment variables")
        return False
    
    try:
        # Connect to database
        engine = create_engine(database_url)
        
        with engine.connect() as conn:
            print("\n📊 Database Analysis:")
            print("-" * 30)
            
            # Check properties table structure
            result = conn.execute(text("""
                SELECT column_name, data_type, is_nullable 
                FROM information_schema.columns 
                WHERE table_name = 'properties' AND column_name = 'photo_keys'
            """))
            
            photo_keys_column = result.fetchone()
            if photo_keys_column:
                print(f"✅ properties.photo_keys column exists: {photo_keys_column[1]}")
            else:
                print("❌ properties.photo_keys column not found!")
                return False
            
            # Count properties with and without photos
            result = conn.execute(text("SELECT COUNT(*) FROM properties"))
            total_properties = result.scalar()
            
            result = conn.execute(text("SELECT COUNT(*) FROM properties WHERE photo_keys IS NOT NULL AND photo_keys != ''"))
            properties_with_photos = result.scalar()
            
            result = conn.execute(text("SELECT COUNT(*) FROM properties WHERE photo_keys IS NULL OR photo_keys = ''"))
            properties_without_photos = result.scalar()
            
            print(f"📈 Property Statistics:")
            print(f"  • Total properties: {total_properties}")
            print(f"  • Properties with photos: {properties_with_photos}")
            print(f"  • Properties without photos: {properties_without_photos}")
            
            # Show sample photo_keys
            if properties_with_photos > 0:
                print(f"\n📷 Sample Photo Keys:")
                result = conn.execute(text("""
                    SELECT id, address, photo_keys 
                    FROM properties 
                    WHERE photo_keys IS NOT NULL AND photo_keys != ''
                    LIMIT 5
                """))
                
                for row in result:
                    prop_id, address, photo_keys = row
                    print(f"  • Property {prop_id}: {address[:40]}...")
                    print(f"    Photo keys: {photo_keys}")
                    
                    # Analyze photo key structure
                    if photo_keys:
                        keys = [key.strip() for key in photo_keys.split(',') if key.strip()]
                        print(f"    Number of photos: {len(keys)}")
                        for i, key in enumerate(keys[:2]):  # Show first 2 keys
                            parts = key.split('/')
                            if len(parts) >= 4:
                                file_type, user_id, date_part = parts[0], parts[1], '/'.join(parts[2:4])
                                filename = parts[-1]
                                print(f"      Photo {i+1}: {file_type}/{user_id}/{date_part}/{filename}")
                            else:
                                print(f"      Photo {i+1}: {key} (unexpected format)")
                        if len(keys) > 2:
                            print(f"      ... and {len(keys) - 2} more photos")
                    print()
            
            # Check reviews table for comparison
            result = conn.execute(text("SELECT COUNT(*) FROM reviews"))
            total_reviews = result.scalar()
            print(f"📝 Review Statistics:")
            print(f"  • Total reviews: {total_reviews}")
            
            # Check recent reviews
            result = conn.execute(text("""
                SELECT r.id, r.property_id, r.user_id, r.created_at, p.address
                FROM reviews r
                JOIN properties p ON r.property_id = p.id
                ORDER BY r.created_at DESC
                LIMIT 5
            """))
            
            print(f"\n🕒 Recent Reviews:")
            for row in result:
                review_id, prop_id, user_id, created_at, address = row
                print(f"  • Review {review_id}: Property {prop_id} by User {user_id}")
                print(f"    Address: {address[:50]}...")
                print(f"    Created: {created_at}")
                print()
                
    except Exception as e:
        print(f"❌ Database error: {e}")
        return False
    
    print("\n🔗 Photo URL Analysis:")
    print("-" * 30)
    
    # Show what URLs PropertyCard would generate
    sample_keys = [
        "review/3/2025/09/18/8c2c4273-65F3-4148-a84e-2cc64c2eea80.jpg",
        "property/1/2025/09/15/uuid-example.png"
    ]
    
    for key in sample_keys:
        encoded_key = key.replace('/', '%2F')
        api_url = f"/api/v1/uploads/view/{encoded_key}"
        print(f"📍 Object key: {key}")
        print(f"🔗 API URL: {api_url}")
        print(f"🌐 Full URL: http://localhost:3000{api_url}")
        print()
    
    print("🎯 Debugging Next Steps:")
    print("-" * 30)
    print("1. Run the cleanup SQL to remove invalid photo_keys")
    print("2. Test photo upload through /review/add form")
    print("3. Check browser console for upload success/failure")
    print("4. Verify photos appear in R2 dashboard")
    print("5. Test photo viewing on property cards")
    print()
    print("💡 Common Issues:")
    print("• CORS policy not configured on R2 bucket")
    print("• Upload fails silently due to browser security")
    print("• Photo keys saved but files never reached R2")
    print("• R2 credentials incorrect or expired")
    
    return True

if __name__ == "__main__":
    success = diagnose_photo_system()
    sys.exit(0 if success else 1)
