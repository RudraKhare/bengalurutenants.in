"""
Analyze and fix city ID duplicates.
This script identifies duplicate city IDs and reassigns them sequentially.

Usage:
    python -m app.fix_city_ids
"""

from sqlalchemy.orm import Session
from sqlalchemy import func, text
from app.db import SessionLocal
from app.models import City, Locality

def analyze_city_ids():
    """Analyze city IDs to identify duplicates."""
    db: Session = SessionLocal()
    
    try:
        print("="*90)
        print("ANALYZING CITY IDs")
        print("="*90)
        
        # Get all cities sorted by ID
        cities = db.query(City).order_by(City.id).all()
        
        print(f"\nTotal Cities: {len(cities)}")
        
        # Check for duplicate IDs
        city_ids = [city.id for city in cities]
        unique_ids = set(city_ids)
        
        if len(city_ids) != len(unique_ids):
            print(f"\n⚠️  DUPLICATE CITY IDs FOUND!")
            print(f"Total city records: {len(city_ids)}")
            print(f"Unique IDs: {len(unique_ids)}")
            print(f"Duplicates: {len(city_ids) - len(unique_ids)}")
            
            # Find duplicates
            seen = set()
            duplicates = []
            for city_id in city_ids:
                if city_id in seen:
                    duplicates.append(city_id)
                seen.add(city_id)
            
            print(f"\nDuplicate City IDs: {sorted(set(duplicates))}")
            
            # Show cities with duplicate IDs
            for dup_id in sorted(set(duplicates)):
                dup_cities = db.query(City).filter(City.id == dup_id).all()
                print(f"\n  City ID {dup_id} is used by {len(dup_cities)} cities:")
                for city in dup_cities:
                    locality_count = db.query(Locality).filter(Locality.city_id == city.id).count()
                    print(f"    - {city.name} (State: {city.state}, Localities: {locality_count})")
        else:
            print("\n✓ No duplicate city IDs found!")
        
        # Show ID distribution
        print(f"\n{'-'*90}")
        print("CITY ID DISTRIBUTION")
        print(f"{'-'*90}")
        print(f"Minimum City ID: {min(city_ids)}")
        print(f"Maximum City ID: {max(city_ids)}")
        print(f"Expected range: 1 to {len(cities)}")
        
        # Check for gaps
        expected_ids = set(range(1, len(cities) + 1))
        actual_ids = set(city_ids)
        missing_ids = expected_ids - actual_ids
        extra_ids = actual_ids - expected_ids
        
        if missing_ids:
            print(f"\n⚠️  Missing IDs (gaps): {sorted(missing_ids)[:20]}")
            if len(missing_ids) > 20:
                print(f"   ... and {len(missing_ids) - 20} more")
        
        if extra_ids:
            print(f"\n⚠️  Extra IDs (beyond expected range): {sorted(extra_ids)[:20]}")
            if len(extra_ids) > 20:
                print(f"   ... and {len(extra_ids) - 20} more")
        
        # Show sample cities
        print(f"\n{'-'*90}")
        print("SAMPLE CITIES (First 10 and Last 10)")
        print(f"{'-'*90}")
        
        for city in cities[:10]:
            locality_count = db.query(Locality).filter(Locality.city_id == city.id).count()
            print(f"  [{city.id:3d}] {city.name:20s} | State: {city.state:20s} | Localities: {locality_count}")
        
        if len(cities) > 20:
            print("  ...")
            for city in cities[-10:]:
                locality_count = db.query(Locality).filter(Locality.city_id == city.id).count()
                print(f"  [{city.id:3d}] {city.name:20s} | State: {city.state:20s} | Localities: {locality_count}")
        
        print("="*90)
        
        return len(city_ids) != len(unique_ids)  # Return True if duplicates found
        
    except Exception as e:
        print(f"\n❌ Error analyzing cities: {e}")
        raise
    finally:
        db.close()


def fix_city_ids():
    """Fix city IDs by reassigning them sequentially."""
    db: Session = SessionLocal()
    
    try:
        print("="*90)
        print("FIXING CITY IDs - REASSIGNING SEQUENTIALLY")
        print("="*90)
        
        # Get all cities sorted by name (alphabetically)
        cities = db.query(City).order_by(City.name).all()
        
        print(f"\nTotal Cities: {len(cities)}")
        print("\nThis will:")
        print("  1. Sort all cities alphabetically by name")
        print("  2. Reassign IDs sequentially from 1 to", len(cities))
        print("  3. Update all locality references to use new city IDs")
        print("  4. Reset the city ID sequence")
        
        # Create a mapping of old ID to new ID
        id_mapping = {}
        
        # First pass: Create temporary negative IDs to avoid conflicts
        print("\nStep 1: Creating temporary IDs...")
        for idx, city in enumerate(cities, start=1):
            old_id = city.id
            temp_id = -(idx + 10000)  # Use large negative numbers as temp IDs
            id_mapping[old_id] = {'temp': temp_id, 'new': idx}
            
            # Update city with temp ID
            db.execute(
                text("UPDATE cities SET id = :temp_id WHERE id = :old_id"),
                {"temp_id": temp_id, "old_id": old_id}
            )
            
            # Update localities with temp city_id
            db.execute(
                text("UPDATE localities SET city_id = :temp_id WHERE city_id = :old_id"),
                {"temp_id": temp_id, "old_id": old_id}
            )
        
        db.commit()
        print(f"  ✓ Assigned temporary IDs to {len(cities)} cities")
        
        # Second pass: Assign final sequential IDs
        print("\nStep 2: Assigning final sequential IDs...")
        for old_id, ids in id_mapping.items():
            temp_id = ids['temp']
            new_id = ids['new']
            
            # Update city with final ID
            db.execute(
                text("UPDATE cities SET id = :new_id WHERE id = :temp_id"),
                {"new_id": new_id, "temp_id": temp_id}
            )
            
            # Update localities with final city_id
            db.execute(
                text("UPDATE localities SET city_id = :new_id WHERE city_id = :temp_id"),
                {"new_id": new_id, "temp_id": temp_id}
            )
        
        db.commit()
        print(f"  ✓ Assigned final IDs to {len(cities)} cities")
        
        # Reset the sequence
        print("\nStep 3: Resetting city ID sequence...")
        db.execute(text(f"ALTER SEQUENCE cities_id_seq RESTART WITH {len(cities) + 1}"))
        db.commit()
        print(f"  ✓ Sequence reset to {len(cities) + 1}")
        
        # Verify
        print("\nStep 4: Verifying...")
        cities_after = db.query(City).order_by(City.id).all()
        city_ids_after = [city.id for city in cities_after]
        
        expected_ids = list(range(1, len(cities) + 1))
        if city_ids_after == expected_ids:
            print("  ✓ All city IDs are now sequential from 1 to", len(cities))
        else:
            print("  ⚠️  Something went wrong - IDs are not sequential")
            return
        
        # Show sample
        print(f"\n{'-'*90}")
        print("SAMPLE CITIES AFTER FIX (First 10 and Last 10)")
        print(f"{'-'*90}")
        
        for city in cities_after[:10]:
            locality_count = db.query(Locality).filter(Locality.city_id == city.id).count()
            print(f"  [{city.id:3d}] {city.name:20s} | State: {city.state:20s} | Localities: {locality_count}")
        
        if len(cities_after) > 20:
            print("  ...")
            for city in cities_after[-10:]:
                locality_count = db.query(Locality).filter(Locality.city_id == city.id).count()
                print(f"  [{city.id:3d}] {city.name:20s} | State: {city.state:20s} | Localities: {locality_count}")
        
        print("\n" + "="*90)
        print("✅ CITY IDs FIXED SUCCESSFULLY!")
        print("="*90)
        print(f"\nResults:")
        print(f"  Total Cities: {len(cities_after)}")
        print(f"  IDs now range from: 1 to {len(cities_after)}")
        print(f"  All cities sorted alphabetically by name")
        print(f"  All locality references updated")
        print(f"  Sequence reset to: {len(cities_after) + 1}")
        print("="*90)
        
    except Exception as e:
        print(f"\n❌ Error fixing city IDs: {e}")
        db.rollback()
        raise
    finally:
        db.close()


if __name__ == "__main__":
    print("Step 1: Analyzing current city IDs...\n")
    has_duplicates = analyze_city_ids()
    
    if has_duplicates:
        print("\n" + "="*90)
        response = input("\nDo you want to fix the city IDs? (yes/no): ")
        if response.lower() in ['yes', 'y']:
            print()
            fix_city_ids()
        else:
            print("\nSkipping fix. Run this script again when ready.")
    else:
        print("\n✅ No fixes needed - city IDs are already properly assigned!")
