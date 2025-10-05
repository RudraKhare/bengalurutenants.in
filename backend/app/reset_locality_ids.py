"""
Reset the locality ID sequence to start from 1.

This script will:
1. Delete all existing localities
2. Reset the auto-increment counter to 1
3. Re-add all real localities with IDs starting from 1

Usage:
    python -m app.reset_locality_ids
"""

from sqlalchemy import text
from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Base, City, Locality

# Import the real localities data
from app.seed_real_localities import CITIES_WITH_REAL_LOCALITIES

def reset_locality_ids():
    """Delete all localities, reset ID sequence, and reseed."""
    db: Session = SessionLocal()
    
    try:
        print("="*70)
        print("RESETTING LOCALITY IDs TO START FROM 1")
        print("="*70)
        
        # Step 1: Delete all localities
        print("\nDeleting all existing localities...")
        deleted_count = db.query(Locality).delete()
        db.commit()
        print(f"  ✓ Deleted {deleted_count} localities")
        
        # Step 2: Reset the auto-increment sequence
        print("\nResetting locality ID sequence to 1...")
        try:
            # For PostgreSQL (Supabase uses PostgreSQL)
            db.execute(text("ALTER SEQUENCE localities_id_seq RESTART WITH 1"))
            db.commit()
            print("  ✓ Sequence reset to 1")
        except Exception as e:
            print(f"  ⚠ Could not reset sequence: {e}")
            print("  Note: IDs may not start from 1, but this won't affect functionality")
        
        # Step 3: Re-add all real localities
        print("\nAdding REAL localities with fresh IDs...")
        
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
        
        # Get the ID range
        first_locality = db.query(Locality).order_by(Locality.id).first()
        last_locality = db.query(Locality).order_by(Locality.id.desc()).first()
        
        # Summary
        total_cities = db.query(City).count()
        total_localities = db.query(Locality).count()
        
        print("\n" + "="*70)
        print("LOCALITY ID RESET COMPLETED SUCCESSFULLY!")
        print("="*70)
        print(f"\nResults:")
        print(f"  Cities in database: {total_cities}")
        print(f"  Cities updated: {cities_updated}")
        print(f"  Total localities: {total_localities}")
        if first_locality and last_locality:
            print(f"  Locality ID range: {first_locality.id} to {last_locality.id}")
        
        if cities_not_found:
            print(f"\n⚠ Cities not found in database ({len(cities_not_found)}):")
            for city in cities_not_found:
                print(f"    - {city}")
        
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Error during reset: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # Run the reset
    reset_locality_ids()
