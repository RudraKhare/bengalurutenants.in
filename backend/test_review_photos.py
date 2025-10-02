"""
Test script to verify that reviews API returns property photo_keys
"""
import sys
from app.db import SessionLocal
from app.models import Review, Property
from sqlalchemy.orm import joinedload

def test_review_with_property():
    db = SessionLocal()
    
    try:
        print("=" * 60)
        print("Testing Review-Property Relationship with Photo Keys")
        print("=" * 60)
        
        # Check properties with photo_keys
        print("\n1. Checking properties with photo_keys:")
        print("-" * 60)
        properties = db.query(Property).filter(Property.photo_keys.isnot(None)).limit(5).all()
        if properties:
            for prop in properties:
                print(f"Property ID: {prop.id}")
                print(f"  Area: {prop.area}")
                print(f"  Address: {prop.address[:50]}...")
                print(f"  Photo Keys: {prop.photo_keys}")
                print()
        else:
            print("No properties with photo_keys found")
        
        # Check reviews with property relationship
        print("\n2. Testing reviews with joinedload:")
        print("-" * 60)
        reviews = db.query(Review).options(joinedload(Review.property)).limit(6).all()
        
        if reviews:
            for review in reviews:
                print(f"Review ID: {review.id}")
                print(f"  Rating: {review.rating} stars")
                print(f"  Property ID: {review.property_id}")
                if review.property:
                    print(f"  Property Area: {review.property.area}")
                    print(f"  Property photo_keys: {review.property.photo_keys}")
                else:
                    print(f"  Property: NOT LOADED")
                print()
        else:
            print("No reviews found")
        
        # Check total counts
        print("\n3. Summary:")
        print("-" * 60)
        total_properties = db.query(Property).count()
        properties_with_photos = db.query(Property).filter(Property.photo_keys.isnot(None)).count()
        total_reviews = db.query(Review).count()
        
        print(f"Total Properties: {total_properties}")
        print(f"Properties with Photos: {properties_with_photos}")
        print(f"Total Reviews: {total_reviews}")
        
    except Exception as e:
        print(f"\nError: {e}")
        import traceback
        traceback.print_exc()
    finally:
        db.close()

if __name__ == "__main__":
    test_review_with_property()
