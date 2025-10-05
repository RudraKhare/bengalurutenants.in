"""
Reorganize locality IDs to be sorted by city.
This will renumber all localities so they are grouped by city_id.

For example:
- City 1 localities: IDs 1-50
- City 2 localities: IDs 51-100
- City 3 localities: IDs 101-150
etc.

Usage:
    python -m app.sort_localities_by_city
"""

from sqlalchemy.orm import Session
from sqlalchemy import text
from app.db import SessionLocal, engine
from app.models import Base, City, Locality

def sort_localities_by_city():
    """Reorganize locality IDs to be sorted by city."""
    db: Session = SessionLocal()
    
    try:
        print("="*90)
        print("REORGANIZING LOCALITY IDs BY CITY")
        print("="*90)
        
        # Get all cities ordered by ID
        cities = db.query(City).order_by(City.id).all()
        
        print(f"\nTotal cities in database: {len(cities)}")
        
        # Count total localities
        total_localities = db.query(Locality).count()
        print(f"Total localities before reorganization: {total_localities}")
        
        if total_localities == 0:
            print("\n⚠ No localities found in database!")
            return
        
        print("\n" + "-"*90)
        print("STEP 1: Collecting all localities sorted by city...")
        print("-"*90)
        
        # Collect all localities sorted by city_id, then by name
        all_localities = []
        for city in cities:
            localities = db.query(Locality).filter(
                Locality.city_id == city.id
            ).order_by(Locality.name).all()
            
            if localities:
                print(f"  {city.name} (City ID {city.id}): {len(localities)} localities")
                all_localities.extend([(city, loc) for loc in localities])
        
        print(f"\nTotal localities collected: {len(all_localities)}")
        
        print("\n" + "-"*90)
        print("STEP 2: Creating temporary table for reorganization...")
        print("-"*90)
        
        # Create a temporary table to store the reorganized data
        db.execute(text("""
            CREATE TEMPORARY TABLE temp_localities (
                old_id INTEGER,
                new_id INTEGER,
                name VARCHAR,
                city_id INTEGER,
                is_popular BOOLEAN,
                is_active BOOLEAN
            )
        """))
        
        # Assign new sequential IDs
        new_id = 1
        for city, locality in all_localities:
            db.execute(text("""
                INSERT INTO temp_localities (old_id, new_id, name, city_id, is_popular, is_active)
                VALUES (:old_id, :new_id, :name, :city_id, :is_popular, :is_active)
            """), {
                "old_id": locality.id,
                "new_id": new_id,
                "name": locality.name,
                "city_id": locality.city_id,
                "is_popular": locality.is_popular,
                "is_active": locality.is_active
            })
            new_id += 1
        
        db.commit()
        print(f"✓ Prepared {new_id - 1} localities for reorganization")
        
        print("\n" + "-"*90)
        print("STEP 3: Deleting old localities...")
        print("-"*90)
        
        deleted_count = db.query(Locality).delete()
        db.commit()
        print(f"✓ Deleted {deleted_count} old localities")
        
        print("\n" + "-"*90)
        print("STEP 4: Inserting reorganized localities with new IDs...")
        print("-"*90)
        
        # Insert from temp table with new IDs
        db.execute(text("""
            INSERT INTO localities (id, name, city_id, is_popular, is_active)
            SELECT new_id, name, city_id, is_popular, is_active
            FROM temp_localities
            ORDER BY new_id
        """))
        
        db.commit()
        print(f"✓ Inserted {new_id - 1} localities with new sequential IDs")
        
        print("\n" + "-"*90)
        print("STEP 5: Resetting auto-increment sequence...")
        print("-"*90)
        
        # Reset the sequence to continue from the last ID
        db.execute(text(f"ALTER SEQUENCE localities_id_seq RESTART WITH {new_id}"))
        db.commit()
        print(f"✓ Sequence reset to start from {new_id}")
        
        print("\n" + "-"*90)
        print("STEP 6: Verifying reorganization...")
        print("-"*90)
        
        # Verify the reorganization
        current_city_id = None
        locality_ranges = []
        range_start = None
        
        for city in cities:
            localities = db.query(Locality).filter(
                Locality.city_id == city.id
            ).order_by(Locality.id).all()
            
            if localities:
                min_id = localities[0].id
                max_id = localities[-1].id
                count = len(localities)
                locality_ranges.append((city.name, city.id, min_id, max_id, count))
        
        print("\nLocality ID ranges by city:")
        print(f"{'City Name':<20} {'City ID':<10} {'Locality IDs':<20} {'Count':<10}")
        print("-" * 70)
        
        for city_name, city_id, min_id, max_id, count in locality_ranges[:20]:  # Show first 20
            print(f"{city_name:<20} {city_id:<10} {min_id:>5} - {max_id:<5}       {count:<10}")
        
        if len(locality_ranges) > 20:
            print(f"... and {len(locality_ranges) - 20} more cities")
        
        # Final statistics
        total_after = db.query(Locality).count()
        
        print("\n" + "="*90)
        print("REORGANIZATION COMPLETE!")
        print("="*90)
        print(f"\nStatistics:")
        print(f"  Cities with localities: {len(locality_ranges)}")
        print(f"  Total localities: {total_after}")
        print(f"  Localities before: {total_localities}")
        print(f"  Localities after: {total_after}")
        print(f"  IDs are now sorted by city_id!")
        
        if total_localities != total_after:
            print(f"\n⚠ WARNING: Locality count changed ({total_localities} → {total_after})")
        else:
            print(f"\n✓ All localities preserved!")
        
        print("\n" + "="*90)
        
    except Exception as e:
        print(f"\n❌ Error reorganizing localities: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    print("\n⚠ WARNING: This will reorganize all locality IDs!")
    print("This is safe and will preserve all data, just renumber IDs.\n")
    
    # Run the reorganization
    sort_localities_by_city()
