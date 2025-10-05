"""
Extended database seed script to populate 100 cities with 50 localities each.
Run this script to initialize the database with comprehensive city/locality data.

Usage:
    python -m app.seed_100_cities
"""

from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Base, City, Locality
import random

# Top 100 Indian cities with approximate coordinates
CITIES_DATA = [
    # Tier 1 Cities (Metro)
    {"name": "Mumbai", "state": "Maharashtra", "lat": 19.0760, "lng": 72.8777},
    {"name": "Delhi", "state": "Delhi", "lat": 28.6139, "lng": 77.2090},
    {"name": "Bengaluru", "state": "Karnataka", "lat": 12.9716, "lng": 77.5946},
    {"name": "Hyderabad", "state": "Telangana", "lat": 17.3850, "lng": 78.4867},
    {"name": "Ahmedabad", "state": "Gujarat", "lat": 23.0225, "lng": 72.5714},
    {"name": "Chennai", "state": "Tamil Nadu", "lat": 13.0827, "lng": 80.2707},
    {"name": "Kolkata", "state": "West Bengal", "lat": 22.5726, "lng": 88.3639},
    {"name": "Pune", "state": "Maharashtra", "lat": 18.5204, "lng": 73.8567},
    {"name": "Surat", "state": "Gujarat", "lat": 21.1702, "lng": 72.8311},
    {"name": "Jaipur", "state": "Rajasthan", "lat": 26.9124, "lng": 75.7873},
    
    # Tier 2 Cities
    {"name": "Lucknow", "state": "Uttar Pradesh", "lat": 26.8467, "lng": 80.9462},
    {"name": "Kanpur", "state": "Uttar Pradesh", "lat": 26.4499, "lng": 80.3319},
    {"name": "Nagpur", "state": "Maharashtra", "lat": 21.1458, "lng": 79.0882},
    {"name": "Indore", "state": "Madhya Pradesh", "lat": 22.7196, "lng": 75.8577},
    {"name": "Thane", "state": "Maharashtra", "lat": 19.2183, "lng": 72.9781},
    {"name": "Bhopal", "state": "Madhya Pradesh", "lat": 23.2599, "lng": 77.4126},
    {"name": "Visakhapatnam", "state": "Andhra Pradesh", "lat": 17.6869, "lng": 83.2185},
    {"name": "Pimpri-Chinchwad", "state": "Maharashtra", "lat": 18.6298, "lng": 73.7997},
    {"name": "Patna", "state": "Bihar", "lat": 25.5941, "lng": 85.1376},
    {"name": "Vadodara", "state": "Gujarat", "lat": 22.3072, "lng": 73.1812},
    {"name": "Ghaziabad", "state": "Uttar Pradesh", "lat": 28.6692, "lng": 77.4538},
    {"name": "Ludhiana", "state": "Punjab", "lat": 30.9010, "lng": 75.8573},
    {"name": "Agra", "state": "Uttar Pradesh", "lat": 27.1767, "lng": 78.0081},
    {"name": "Nashik", "state": "Maharashtra", "lat": 19.9975, "lng": 73.7898},
    {"name": "Faridabad", "state": "Haryana", "lat": 28.4089, "lng": 77.3178},
    {"name": "Meerut", "state": "Uttar Pradesh", "lat": 28.9845, "lng": 77.7064},
    {"name": "Rajkot", "state": "Gujarat", "lat": 22.3039, "lng": 70.8022},
    {"name": "Kalyan-Dombivali", "state": "Maharashtra", "lat": 19.2403, "lng": 73.1305},
    {"name": "Vasai-Virar", "state": "Maharashtra", "lat": 19.4612, "lng": 72.7985},
    {"name": "Varanasi", "state": "Uttar Pradesh", "lat": 25.3176, "lng": 82.9739},
    
    # Tier 3 and other major cities (70 more cities)
    {"name": "Srinagar", "state": "Jammu and Kashmir", "lat": 34.0837, "lng": 74.7973},
    {"name": "Aurangabad", "state": "Maharashtra", "lat": 19.8762, "lng": 75.3433},
    {"name": "Dhanbad", "state": "Jharkhand", "lat": 23.7957, "lng": 86.4304},
    {"name": "Amritsar", "state": "Punjab", "lat": 31.6340, "lng": 74.8723},
    {"name": "Navi Mumbai", "state": "Maharashtra", "lat": 19.0330, "lng": 73.0297},
    {"name": "Allahabad", "state": "Uttar Pradesh", "lat": 25.4358, "lng": 81.8463},
    {"name": "Ranchi", "state": "Jharkhand", "lat": 23.3441, "lng": 85.3096},
    {"name": "Howrah", "state": "West Bengal", "lat": 22.5958, "lng": 88.2636},
    {"name": "Coimbatore", "state": "Tamil Nadu", "lat": 11.0168, "lng": 76.9558},
    {"name": "Jabalpur", "state": "Madhya Pradesh", "lat": 23.1815, "lng": 79.9864},
    {"name": "Gwalior", "state": "Madhya Pradesh", "lat": 26.2183, "lng": 78.1828},
    {"name": "Vijayawada", "state": "Andhra Pradesh", "lat": 16.5062, "lng": 80.6480},
    {"name": "Jodhpur", "state": "Rajasthan", "lat": 26.2389, "lng": 73.0243},
    {"name": "Madurai", "state": "Tamil Nadu", "lat": 9.9252, "lng": 78.1198},
    {"name": "Raipur", "state": "Chhattisgarh", "lat": 21.2514, "lng": 81.6296},
    {"name": "Kota", "state": "Rajasthan", "lat": 25.2138, "lng": 75.8648},
    {"name": "Chandigarh", "state": "Chandigarh", "lat": 30.7333, "lng": 76.7794},
    {"name": "Guwahati", "state": "Assam", "lat": 26.1445, "lng": 91.7362},
    {"name": "Solapur", "state": "Maharashtra", "lat": 17.6599, "lng": 75.9064},
    {"name": "Hubli-Dharwad", "state": "Karnataka", "lat": 15.3647, "lng": 75.1240},
    {"name": "Mysore", "state": "Karnataka", "lat": 12.2958, "lng": 76.6394},
    {"name": "Tiruchirappalli", "state": "Tamil Nadu", "lat": 10.7905, "lng": 78.7047},
    {"name": "Bareilly", "state": "Uttar Pradesh", "lat": 28.3670, "lng": 79.4304},
    {"name": "Aligarh", "state": "Uttar Pradesh", "lat": 27.8974, "lng": 78.0880},
    {"name": "Tiruppur", "state": "Tamil Nadu", "lat": 11.1075, "lng": 77.3398},
    {"name": "Moradabad", "state": "Uttar Pradesh", "lat": 28.8389, "lng": 78.7378},
    {"name": "Jalandhar", "state": "Punjab", "lat": 31.3260, "lng": 75.5762},
    {"name": "Bhubaneswar", "state": "Odisha", "lat": 20.2961, "lng": 85.8245},
    {"name": "Salem", "state": "Tamil Nadu", "lat": 11.6643, "lng": 78.1460},
    {"name": "Warangal", "state": "Telangana", "lat": 17.9784, "lng": 79.6006},
    {"name": "Guntur", "state": "Andhra Pradesh", "lat": 16.3067, "lng": 80.4365},
    {"name": "Bhiwandi", "state": "Maharashtra", "lat": 19.3009, "lng": 73.0629},
    {"name": "Saharanpur", "state": "Uttar Pradesh", "lat": 29.9680, "lng": 77.5460},
    {"name": "Gorakhpur", "state": "Uttar Pradesh", "lat": 26.7606, "lng": 83.3732},
    {"name": "Bikaner", "state": "Rajasthan", "lat": 28.0229, "lng": 73.3119},
    {"name": "Amravati", "state": "Maharashtra", "lat": 20.9320, "lng": 77.7523},
    {"name": "Noida", "state": "Uttar Pradesh", "lat": 28.5355, "lng": 77.3910},
    {"name": "Jamshedpur", "state": "Jharkhand", "lat": 22.8046, "lng": 86.2029},
    {"name": "Bhilai", "state": "Chhattisgarh", "lat": 21.2091, "lng": 81.3718},
    {"name": "Cuttack", "state": "Odisha", "lat": 20.4625, "lng": 85.8830},
    {"name": "Firozabad", "state": "Uttar Pradesh", "lat": 27.1591, "lng": 78.3957},
    {"name": "Kochi", "state": "Kerala", "lat": 9.9312, "lng": 76.2673},
    {"name": "Nellore", "state": "Andhra Pradesh", "lat": 14.4426, "lng": 79.9865},
    {"name": "Bhavnagar", "state": "Gujarat", "lat": 21.7645, "lng": 72.1519},
    {"name": "Dehradun", "state": "Uttarakhand", "lat": 30.3165, "lng": 78.0322},
    {"name": "Durgapur", "state": "West Bengal", "lat": 23.5204, "lng": 87.3119},
    {"name": "Asansol", "state": "West Bengal", "lat": 23.6739, "lng": 86.9524},
    {"name": "Rourkela", "state": "Odisha", "lat": 22.2604, "lng": 84.8536},
    {"name": "Nanded", "state": "Maharashtra", "lat": 19.1383, "lng": 77.3210},
    {"name": "Kolhapur", "state": "Maharashtra", "lat": 16.7050, "lng": 74.2433},
    {"name": "Ajmer", "state": "Rajasthan", "lat": 26.4499, "lng": 74.6399},
    {"name": "Akola", "state": "Maharashtra", "lat": 20.7333, "lng": 77.0081},
    {"name": "Gulbarga", "state": "Karnataka", "lat": 17.3297, "lng": 76.8343},
    {"name": "Jamnagar", "state": "Gujarat", "lat": 22.4707, "lng": 70.0577},
    {"name": "Ujjain", "state": "Madhya Pradesh", "lat": 23.1765, "lng": 75.7885},
    {"name": "Loni", "state": "Uttar Pradesh", "lat": 28.7542, "lng": 77.2890},
    {"name": "Siliguri", "state": "West Bengal", "lat": 26.7271, "lng": 88.3953},
    {"name": "Jhansi", "state": "Uttar Pradesh", "lat": 25.4484, "lng": 78.5685},
    {"name": "Ulhasnagar", "state": "Maharashtra", "lat": 19.2183, "lng": 73.1382},
    {"name": "Jammu", "state": "Jammu and Kashmir", "lat": 32.7266, "lng": 74.8570},
    {"name": "Sangli-Miraj", "state": "Maharashtra", "lat": 16.8524, "lng": 74.5815},
    {"name": "Mangalore", "state": "Karnataka", "lat": 12.9141, "lng": 74.8560},
    {"name": "Erode", "state": "Tamil Nadu", "lat": 11.3410, "lng": 77.7172},
    {"name": "Belgaum", "state": "Karnataka", "lat": 15.8497, "lng": 74.4977},
    {"name": "Ambattur", "state": "Tamil Nadu", "lat": 13.0988, "lng": 80.1580},
    {"name": "Tirunelveli", "state": "Tamil Nadu", "lat": 8.7139, "lng": 77.7567},
    {"name": "Malegaon", "state": "Maharashtra", "lat": 20.5579, "lng": 74.5287},
    {"name": "Gaya", "state": "Bihar", "lat": 24.7955, "lng": 85.0002},
    {"name": "Jalgaon", "state": "Maharashtra", "lat": 21.0077, "lng": 75.5626},
    {"name": "Udaipur", "state": "Rajasthan", "lat": 24.5854, "lng": 73.7125},
    {"name": "Maheshtala", "state": "West Bengal", "lat": 22.5093, "lng": 88.2476},
]

# Common locality patterns for generating realistic locality names
LOCALITY_PREFIXES = [
    "New", "Old", "East", "West", "North", "South", "Central", "Greater",
    "Upper", "Lower", "Outer", "Inner", "Model", "Civil", "Sector",
]

LOCALITY_TYPES = [
    "Nagar", "Colony", "Layout", "Extension", "Road", "Park", "Gardens", "Enclave",
    "Vihar", "Puram", "Town", "Area", "Phase", "Block", "Complex", "Avenue",
    "Estate", "Heights", "Hills", "Valley", "View", "Plaza", "Square", "Market",
]

LOCALITY_BASE_NAMES = [
    "Gandhi", "Nehru", "Rajiv", "Indira", "Ambedkar", "Shivaji", "Patel",
    "Tagore", "Vidya", "Sagar", "Kailash", "Anand", "Shaanti", "Vijay",
    "Lakshmi", "Rama", "Krishna", "Sai", "Vasant", "Madhav", "Sardar",
    "Mahatma", "Lal", "Bahadur", "Subhas", "Bhagat", "Raj", "Moti",
    "Tilak", "Gokhale", "Rana", "Pratap", "Akbar", "Ashok", "Chanakya",
]

def generate_localities(city_name: str, count: int = 50) -> list:
    """Generate realistic-sounding locality names for a city."""
    localities = []
    used_names = set()
    
    # Add some common patterns specific to the city
    base_patterns = [
        f"{city_name} City",
        f"{city_name} Cantonment",
        f"{city_name} Nagar",
        f"MG Road",
        f"Station Road",
        f"Market Area",
        f"Railway Colony",
        f"Civil Lines",
    ]
    
    for pattern in base_patterns[:min(8, count)]:
        localities.append(pattern)
        used_names.add(pattern)
    
    # Generate remaining localities
    attempts = 0
    max_attempts = count * 10
    
    while len(localities) < count and attempts < max_attempts:
        attempts += 1
        
        # Random generation strategy
        strategy = random.choice(['prefix_base_type', 'base_type', 'sector', 'phase'])
        
        if strategy == 'prefix_base_type':
            prefix = random.choice(LOCALITY_PREFIXES)
            base = random.choice(LOCALITY_BASE_NAMES)
            locality_type = random.choice(LOCALITY_TYPES)
            name = f"{prefix} {base} {locality_type}"
        elif strategy == 'base_type':
            base = random.choice(LOCALITY_BASE_NAMES)
            locality_type = random.choice(LOCALITY_TYPES)
            name = f"{base} {locality_type}"
        elif strategy == 'sector':
            sector_num = random.randint(1, 50)
            name = f"Sector {sector_num}"
        else:  # phase
            phase_num = random.randint(1, 10)
            base = random.choice(LOCALITY_BASE_NAMES)
            name = f"{base} Nagar Phase {phase_num}"
        
        if name not in used_names:
            localities.append(name)
            used_names.add(name)
    
    return localities[:count]

def seed_100_cities():
    """Seed the database with 100 cities and 50 localities each."""
    db: Session = SessionLocal()
    
    try:
        print("Starting database seed for 100 cities...")
        
        # Check if cities already exist
        existing_cities = db.query(City).count()
        if existing_cities >= 50:
            print(f"Database already contains {existing_cities} cities.")
            response = input("Do you want to continue and add more cities? (yes/no): ")
            if response.lower() != 'yes':
                print("Seed cancelled.")
                return
        
        cities_added = 0
        localities_added = 0
        
        # Add cities and localities
        for city_data in CITIES_DATA:
            city_name = city_data["name"]
            
            # Check if city already exists
            existing = db.query(City).filter(City.name == city_name).first()
            if existing:
                print(f"Skipping {city_name} (already exists)")
                continue
            
            print(f"Adding city: {city_name}")
            
            # Create city
            city = City(
                name=city_name,
                state=city_data["state"],
                country="India",
                lat=city_data.get("lat"),
                lng=city_data.get("lng"),
                is_active=True
            )
            db.add(city)
            db.flush()  # Get the city ID
            
            # Generate localities for this city
            localities = generate_localities(city_name, 50)
            print(f"  Adding {len(localities)} localities...")
            
            for idx, locality_name in enumerate(localities):
                locality = Locality(
                    name=locality_name,
                    city_id=city.id,
                    is_popular=(idx < 20),  # Mark first 20 as popular
                    is_active=True
                )
                db.add(locality)
            
            db.commit()
            cities_added += 1
            localities_added += len(localities)
            print(f"  ✓ Added {city_name} with {len(localities)} localities")
        
        # Summary
        total_cities = db.query(City).count()
        total_localities = db.query(Locality).count()
        
        print("\n" + "="*60)
        print("Database seed completed successfully!")
        print(f"Cities added in this run: {cities_added}")
        print(f"Localities added in this run: {localities_added}")
        print(f"Total cities in database: {total_cities}")
        print(f"Total localities in database: {total_localities}")
        print("="*60)
        
    except Exception as e:
        print(f"Error seeding database: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Create tables if they don't exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # Seed the database
    seed_100_cities()
