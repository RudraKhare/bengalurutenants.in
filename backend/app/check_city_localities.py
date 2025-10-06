"""
Check how many localities each city has in the database.

Usage:
    python -m app.check_city_localities
"""

from sqlalchemy.orm import Session
from sqlalchemy import func
from app.db import SessionLocal
from app.models import City, Locality

def check_city_localities():
    """Display locality count for each city."""
    db: Session = SessionLocal()
    
    try:
        print("="*70)
        print("CITY LOCALITIES REPORT")
        print("="*70)
        
        # Get all cities with their locality counts
        cities_with_counts = db.query(
            City.name,
            City.state,
            func.count(Locality.id).label('locality_count')
        ).outerjoin(
            Locality, City.id == Locality.city_id
        ).group_by(
            City.id, City.name, City.state
        ).order_by(
            func.count(Locality.id).desc()
        ).all()
        
        total_cities = len(cities_with_counts)
        total_localities = sum(c.locality_count for c in cities_with_counts)
        cities_with_localities = sum(1 for c in cities_with_counts if c.locality_count > 0)
        cities_without_localities = sum(1 for c in cities_with_counts if c.locality_count == 0)
        
        print(f"\n📊 SUMMARY:")
        print(f"  Total Cities: {total_cities}")
        print(f"  Total Localities: {total_localities}")
        print(f"  Cities with localities: {cities_with_localities}")
        print(f"  Cities without localities: {cities_without_localities}")
        print(f"  Average localities per city: {total_localities/total_cities:.1f}")
        
        print(f"\n📍 CITIES WITH LOCALITIES ({cities_with_localities}):")
        print("-" * 70)
        for city in cities_with_counts:
            if city.locality_count > 0:
                bar = "█" * (city.locality_count // 2)  # Visual bar
                print(f"  {city.name:20} ({city.state:15}) : {city.locality_count:3} {bar}")
        
        if cities_without_localities > 0:
            print(f"\n⚠️  CITIES WITHOUT LOCALITIES ({cities_without_localities}):")
            print("-" * 70)
            for city in cities_with_counts:
                if city.locality_count == 0:
                    print(f"  • {city.name} ({city.state})")
        
        print("\n" + "="*70)
        
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_city_localities()
