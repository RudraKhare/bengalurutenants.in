"""
Cleanup old fake localities and reseed with REAL locality names.

This script will:
1. Delete ALL existing localities from the database
2. Keep the cities but reset their localities
3. Add real, researched locality names for each city

Usage:
    python -m app.cleanup_and_reseed
"""

from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Base, City, Locality

# Import the real localities data
from app.seed_real_localities import CITIES_WITH_REAL_LOCALITIES

def cleanup_and_reseed():
    """Delete all old localities and reseed with real ones."""
    db: Session = SessionLocal()
    
    try:
        print("="*70)
        print("CLEANUP AND RESEED PROCESS STARTED")
        print("="*70)
        
        # Step 1: Get current counts
        total_cities_before = db.query(City).count()
        total_localities_before = db.query(Locality).count()
        
        print(f"\nCurrent database state:")
        print(f"  Cities: {total_cities_before}")
        print(f"  Localities: {total_localities_before}")
        
        # Step 2: Delete ALL localities
        print(f"\nDeleting all {total_localities_before} existing localities...")
        deleted_count = db.query(Locality).delete()
        db.commit()
        print(f"  ✓ Deleted {deleted_count} localities")
        
        # Step 3: Add real localities
        print("\nAdding REAL localities for each city...")
        
        cities_updated = 0
        localities_added = 0
        cities_not_found = []
        
        for city_name, city_info in CITIES_WITH_REAL_LOCALITIES.items():
            # Find the city
            city = db.query(City).filter(City.name == city_name).first()
            
            if not city:
                cities_not_found.append(city_name)
                print(f"  ⚠ City not found: {city_name} - skipping")
                continue
            
            print(f"\n  Processing {city_name}...")
            
            # Update city coordinates and state
            city.lat = city_info["lat"]
            city.lng = city_info["lng"]
            city.state = city_info["state"]
            city.is_active = True
            cities_updated += 1
            
            # Add all localities
            localities = city_info["localities"]
            print(f"    Adding {len(localities)} localities...")
            
            for idx, locality_name in enumerate(localities):
                locality = Locality(
                    name=locality_name,
                    city_id=city.id,
                    is_popular=(idx < 20),  # Mark first 20 as popular
                    is_active=True
                )
                db.add(locality)
                localities_added += 1
            
            db.commit()
            print(f"    ✓ Added {len(localities)} localities for {city_name}")
        
        # Summary
        total_cities_after = db.query(City).count()
        total_localities_after = db.query(Locality).count()
        
        print("\n" + "="*70)
        print("CLEANUP AND RESEED COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\nResults:")
        print(f"  Cities in database: {total_cities_after}")
        print(f"  Cities updated with real data: {cities_updated}")
        print(f"  Old localities deleted: {deleted_count}")
        print(f"  New REAL localities added: {localities_added}")
        print(f"  Total localities now: {total_localities_after}")
        
        if cities_not_found:
            print(f"\n⚠ Cities not found in database ({len(cities_not_found)}):")
            for city in cities_not_found:
                print(f"    - {city}")
            print(f"\n  These cities need to be added to the database first.")
        
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Error during cleanup and reseed: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # Run cleanup and reseed
    cleanup_and_reseed()
