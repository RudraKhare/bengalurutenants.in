"""
Database seed script to populate cities and localities.
Run this script to initialize the database with cities and their localities.

Usage:
    python -m backend.app.seed_cities
"""

from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Base, City, Locality

# City data with center coordinates
CITIES_DATA = {
    "Bengaluru": {
        "state": "Karnataka",
        "lat": 12.9716,
        "lng": 77.5946,
        "localities": [
            # Central Bengaluru
            "Adugodi", "Austin Town", "Bengaluru Pete", "Chamarajpet", "Chickpet", "Cooke Town", "Cox Town",
            "Fraser Town", "Gandhi Nagar", "Kalasipalyam", "Murphy Town", "Richmond Town", "Seshadripuram",
            "Shivajinagar", "Ulsoor", "Vasanth Nagar", "Vivek Nagar", "Wilson Garden",
            # East Bengaluru
            "Agara", "Akshay Nagar", "Baiyyappanahalli", "Begur", "Bellandur", "Binnamangala", "Bommanahalli",
            "Brookefield", "BTM Layout", "Carmelaram", "CV Raman Nagar", "Domlur", "Ejipura", "Electronic City",
            "Hoodi", "HSR Layout", "Indiranagar", "Jakkasandra", "Kadugodi", "Kaggadasapura", "Kodihalli",
            "Koramangala", "Krishnarajapuram", "Kundalahalli", "Madiwala", "Marathahalli", "Singasandra",
            "Varthur", "Whitefield"
        ]
    },
    "Mumbai": {
        "state": "Maharashtra",
        "lat": 19.0760,
        "lng": 72.8777,
        "localities": [
            "Andheri", "Bandra", "Borivali", "Chembur", "Colaba", "Dadar", "Goregaon", "Juhu", "Kandivali",
            "Kurla", "Malad", "Marine Lines", "Matunga", "Mulund", "Powai", "Santacruz", "Thane", "Vile Parle",
            "Worli", "Fort", "Nariman Point", "Tardeo", "Walkeshwar", "Malabar Hill", "Girgaon", "Kalbadevi",
            "Dongri", "Mazgaon", "Sewri", "Wadala", "Antop Hill", "Govandi", "Mankhurd", "Trombay", "Dharavi",
            "Mahim", "Lower Parel", "Upper Worli", "Versova", "Kandivali", "Bhandup", "Ghatkopar", "Vikhroli",
            "Kanjurmarg", "Bhandup", "Nahur", "Vidyavihar", "Sion", "Matunga", "Wadala"
        ]
    },
    "Delhi": {
        "state": "Delhi",
        "lat": 28.6139,
        "lng": 77.2090,
        "localities": [
            "Connaught Place", "Dwarka", "Saket", "Karol Bagh", "Lajpat Nagar", "Vasant Kunj", "Rohini",
            "Pitampura", "Janakpuri", "Greater Kailash", "South Extension", "Hauz Khas", "Green Park",
            "Malviya Nagar", "Defence Colony", "Preet Vihar", "Mayur Vihar", "Vikaspuri", "Rajouri Garden",
            "Punjabi Bagh", "Model Town", "Shalimar Bagh", "Ashok Vihar", "Civil Lines", "Yamuna Vihar",
            "Dilshad Garden", "Patparganj", "Inderpuri", "Moti Nagar", "Paschim Vihar", "Nehru Place",
            "Okhla", "Jasola", "Sarita Vihar", "Badarpur", "Mehrauli", "Chhatarpur", "Sultanpur", "Ghitorni",
            "Vasant Vihar", "Munirka", "RK Puram", "Lodhi Colony", "Chanakyapuri", "Mandir Marg", "Paharganj",
            "Daryaganj", "Kashmere Gate", "Old Delhi", "New Friends Colony"
        ]
    },
    "Chennai": {
        "state": "Tamil Nadu",
        "lat": 13.0827,
        "lng": 80.2707,
        "localities": [
            "Adyar", "Anna Nagar", "Besant Nagar", "T Nagar", "Velachery", "Mylapore", "Alwarpet",
            "Nungambakkam", "Kodambakkam", "Vadapalani", "Porur", "Guindy", "Saidapet", "Royapettah",
            "Egmore", "Kilpauk", "Perambur", "Ambattur", "Thiruvanmiyur", "Sholinganallur", "Pallavaram",
            "Tambaram", "Medavakkam", "Chromepet", "Avadi", "Manapakkam", "Poonamallee", "Mogappair",
            "Kotturpuram", "Mandaveli", "Triplicane", "Vepery", "Chetpet", "Aminjikarai", "Ashok Nagar",
            "West Mambalam", "East Tambaram", "Thirumangalam", "Thiruvottiyur", "Minjur", "Red Hills", "Padi",
            "Korattur", "Villivakkam", "Thirumullaivoyal", "Pattabiram", "Puzhal", "Vyasarpadi",
            "Washermanpet", "Royapuram"
        ]
    },
    "Hyderabad": {
        "state": "Telangana",
        "lat": 17.3850,
        "lng": 78.4867,
        "localities": [
            "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur", "Begumpet", "Ameerpet",
            "Secunderabad", "Hitech City", "Manikonda", "Kukatpally", "Dilsukhnagar", "LB Nagar", "Uppal",
            "Miyapur", "Chanda Nagar", "Attapur", "Mehdipatnam", "Tolichowki", "Somajiguda", "Kothapet",
            "Nagole", "Alwal", "Sainikpuri", "Malkajgiri", "Shamshabad", "Shamirpet", "Patancheru",
            "Ramachandrapuram", "Bowenpally", "Moosapet", "Erragadda", "Sanath Nagar", "Khairatabad",
            "Nampally", "Abids", "Koti", "Malakpet", "Amberpet", "Musheerabad", "Chikkadpally", "Narayanaguda",
            "Saidabad", "Charminar", "Falaknuma", "Bahadurpura", "Rajendranagar", "Hayathnagar", "Goshamahal",
            "Hafeezpet"
        ]
    },
    "Kolkata": {
        "state": "West Bengal",
        "lat": 22.5726,
        "lng": 88.3639,
        "localities": [
            "Salt Lake", "New Town", "Park Street", "Ballygunge", "Alipore", "Dum Dum", "Behala", "Garia",
            "Jadavpur", "Tollygunge", "Howrah", "Baranagar", "Baguiati", "Lake Town", "Kankurgachi",
            "Shyambazar", "Ultadanga", "Kasba", "Rajarhat", "Sodepur", "Belgharia", "Bansdroni", "Santoshpur",
            "Beliaghata", "Chinar Park", "Teghoria", "Nagerbazar", "Kestopur", "Budge Budge", "Sonarpur",
            "Dumdum Park", "Naktala", "Jodhpur Park", "Kalighat", "Hazra", "Chetla", "Kidderpore",
            "Garden Reach", "Metiabruz", "Barisha", "Maheshtala", "Serampore", "Barrackpore", "Khardah",
            "Dunlop", "Noapara", "Sinthi", "Patuli", "Gariahat", "Dhakuria"
        ]
    },
    "Pune": {
        "state": "Maharashtra",
        "lat": 18.5204,
        "lng": 73.8567,
        "localities": [
            "Koregaon Park", "Kalyani Nagar", "Viman Nagar", "Baner", "Aundh", "Hinjewadi", "Wakad",
            "Pimple Saudagar", "Magarpatta", "Hadapsar", "Kothrud", "Erandwane", "Deccan Gymkhana", "Camp",
            "Swargate", "Shivajinagar", "Karve Nagar", "Sinhagad Road", "Bibwewadi", "Dhankawadi", "Balewadi",
            "Pashan", "Sus", "Bavdhan", "Warje", "Narhe", "Ambegaon", "Dhanori", "Lohegaon", "Yerwada",
            "Mundhwa", "Manjri", "Undri", "NIBM Road", "Wanowrie", "Fatima Nagar", "Kondhwa", "Katraj",
            "Somatane", "Chinchwad", "Nigdi", "Akurdi", "Talegaon", "Chakan", "Moshi", "Alandi", "Ravet",
            "Thergaon", "Kalewadi", "Pimpri"
        ]
    }
}

def seed_cities_and_localities():
    """Seed the database with cities and localities."""
    db: Session = SessionLocal()
    
    try:
        print("Starting database seed...")
        
        # Check if cities already exist
        existing_cities = db.query(City).count()
        if existing_cities > 0:
            print(f"Database already contains {existing_cities} cities. Skipping seed.")
            print("To reseed, please manually delete cities from the database first.")
            return
        
        # Add cities and localities
        for city_name, city_data in CITIES_DATA.items():
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
            
            # Add localities for this city
            localities = city_data["localities"]
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
            print(f"  ✓ Added {city_name} with {len(localities)} localities")
        
        # Summary
        total_cities = db.query(City).count()
        total_localities = db.query(Locality).count()
        
        print("\n" + "="*50)
        print("Database seed completed successfully!")
        print(f"Total cities: {total_cities}")
        print(f"Total localities: {total_localities}")
        print("="*50)
        
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
    seed_cities_and_localities()
