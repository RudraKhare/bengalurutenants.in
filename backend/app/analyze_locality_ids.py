"""
Analyze locality IDs and show sorted data by city.
This helps understand the ID distribution and identify any gaps or patterns.

Usage:
    python -m app.analyze_locality_ids
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import SessionLocal
from app.models import City, Locality

def analyze_locality_ids():
    """Analyze locality IDs and show data sorted by city."""
    db: Session = SessionLocal()
    
    try:
        print("="*90)
        print("LOCALITY ID ANALYSIS - SORTED BY CITY")
        print("="*90)
        
        # Get all cities with their localities, sorted by city name
        cities = db.query(City).order_by(City.name).all()
        
        total_localities = 0
        all_locality_ids = []
        
        for city in cities:
            # Get localities for this city, sorted by ID
            localities = db.query(Locality).filter(
                Locality.city_id == city.id
            ).order_by(Locality.id).all()
            
            if not localities:
                continue
            
            locality_count = len(localities)
            total_localities += locality_count
            
            # Get ID range
            locality_ids = [loc.id for loc in localities]
            all_locality_ids.extend(locality_ids)
            min_id = min(locality_ids)
            max_id = max(locality_ids)
            
            print(f"\n{city.name}")
            print(f"  City ID: {city.id}")
            print(f"  Localities: {locality_count}")
            print(f"  ID Range: {min_id} to {max_id}")
            print(f"  IDs: {locality_ids[:5]}{'...' if locality_count > 5 else ''}{locality_ids[-2:] if locality_count > 5 else ''}")
            
            # Show first 5 and last 2 locality names
            if locality_count <= 7:
                for loc in localities:
                    print(f"    - [{loc.id}] {loc.name}")
            else:
                for loc in localities[:5]:
                    print(f"    - [{loc.id}] {loc.name}")
                print(f"    ... ({locality_count - 7} more)")
                for loc in localities[-2:]:
                    print(f"    - [{loc.id}] {loc.name}")
        
        # Overall statistics
        print("\n" + "="*90)
        print("OVERALL STATISTICS")
        print("="*90)
        
        if all_locality_ids:
            all_locality_ids.sort()
            
            print(f"\nTotal Cities with Localities: {len([c for c in cities if db.query(Locality).filter(Locality.city_id == c.id).count() > 0])}")
            print(f"Total Localities: {total_localities}")
            print(f"Minimum Locality ID: {min(all_locality_ids)}")
            print(f"Maximum Locality ID: {max(all_locality_ids)}")
            print(f"ID Range Span: {max(all_locality_ids) - min(all_locality_ids) + 1}")
            
            # Check for gaps in IDs
            gaps = []
            for i in range(len(all_locality_ids) - 1):
                gap = all_locality_ids[i+1] - all_locality_ids[i]
                if gap > 1:
                    gaps.append((all_locality_ids[i], all_locality_ids[i+1], gap - 1))
            
            if gaps:
                print(f"\n⚠ Found {len(gaps)} gaps in locality IDs:")
                for start_id, end_id, gap_size in gaps[:10]:  # Show first 10 gaps
                    print(f"  Gap between ID {start_id} and {end_id} ({gap_size} missing IDs)")
                if len(gaps) > 10:
                    print(f"  ... and {len(gaps) - 10} more gaps")
                
                total_missing = sum(gap[2] for gap in gaps)
                print(f"\nTotal missing IDs in sequence: {total_missing}")
                print(f"This means {total_missing} locality IDs were deleted or skipped.")
            else:
                print("\n✓ No gaps found - all IDs are sequential!")
            
            # Show ID distribution
            print("\n" + "-"*90)
            print("WHY IDS ARE NOT SEQUENTIAL:")
            print("-"*90)
            print("""
When you delete records from PostgreSQL, the auto-increment sequence doesn't reset.
This is NORMAL and EXPECTED behavior. Here's what happened:

1. Initially, you had ~5,047 fake localities (IDs 1-5047)
2. You ran cleanup_and_reseed.py which DELETED all localities
3. The auto-increment sequence was at 5048
4. New localities were added starting from ID 5048
5. Later, you added more localities and they continued from where it left off

This is NOT a problem because:
✓ IDs are just unique identifiers
✓ They don't need to be 1, 2, 3, 4...
✓ Gaps are normal after deletions
✓ Your application works perfectly with non-sequential IDs

If you want IDs to start from 1, you would need to:
1. Delete all localities
2. Reset the sequence: ALTER SEQUENCE localities_id_seq RESTART WITH 1
3. Re-insert all localities

But this is NOT recommended unless you have a specific reason!
            """)
        
        print("="*90)
        
    except Exception as e:
        print(f"\n❌ Error analyzing localities: {e}")
        raise
    finally:
        db.close()

if __name__ == "__main__":
    analyze_locality_ids()
