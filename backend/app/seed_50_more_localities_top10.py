"""
Add 50 more real localities to the top 10 cities.
This will expand the locality coverage for the most popular cities.

Usage:
    python -m app.seed_50_more_localities_top10
"""

from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Base, City, Locality

# 50 additional REAL localities for top 10 cities
ADDITIONAL_LOCALITIES_TOP10 = {
    "Bengaluru": [
        # Additional Central Areas
        "MG Road", "Brigade Road", "Commercial Street", "Residency Road", "St. Marks Road",
        "Cunningham Road", "Kasturba Road", "Lavelle Road", "Cubbon Park", "Shivaji Nagar",
        # Additional East
        "Hoodi", "Brookefield", "ITPL", "Kadugodi", "Hoskote Road",
        "Banaswadi Road", "Old Airport Road", "HAL Airport", "Murugeshpalya", "Tin Factory",
        # Additional North
        "Nagawara", "Manyata Tech Park", "HBR Layout", "Kacharakanahalli", "Ganganagar",
        "Thanisandra", "Kogilu", "Yelahanka New Town", "Attur", "Bagalur",
        # Additional South
        "Bilekahalli", "Bommanahalli", "Hongasandra", "Begur", "Hulimavu",
        "Arekere", "Gottigere", "Konanakunte", "Mico Layout", "BTM 1st Stage",
        # Additional West
        "Malleshpalya", "Rajaji Nagar", "Mahalakshmi Layout", "Magadi Road", "Chord Road",
        "Basaveshwara Nagar", "Nandini Layout", "Kamakshipalya", "Attiguppe", "RPC Layout"
    ],
    "Mumbai": {
        "localities": [
            # Additional South Mumbai
            "Cuffe Parade", "World Trade Centre", "Haji Ali", "Mahalaxmi", "Prabhadevi",
            "Worli Sea Face", "Nepean Sea Road", "Pedder Road", "August Kranti Marg", "Opera House",
            # Additional Western Suburbs
            "Bandra West", "Bandra East", "Khar West", "Khar East", "Santacruz West",
            "Santacruz East", "Andheri West", "Andheri East", "Oshiwara", "Lokhandwala Complex",
            "Four Bungalows", "Seven Bungalows", "DN Nagar", "Link Road", "SV Road",
            # Additional Eastern Suburbs
            "Trombay", "Ghatkopar West", "Ghatkopar East", "Vikhroli West", "Vikhroli East",
            "Bhandup West", "Bhandup East", "Nahur", "Tilak Nagar", "Kurla West",
            # Additional Central Mumbai
            "Elphinstone Road", "Dadar West", "Dadar East", "Parel West", "Sewri",
            "Chinchpokli", "Byculla", "Mumbai Central", "Grant Road East", "Mazgaon",
            # Additional Navi Mumbai
            "Seawoods", "Sanpada", "Kopar Khairane", "Ghansoli", "Turbhe",
            "Mahape", "Rabale", "Juinagar", "CBD Belapur", "Taloja"
        ]
    },
    "Delhi": [
        # Additional Central Delhi
        "Barakhamba Road", "Kasturba Gandhi Marg", "Janpath", "Parliament Street", "Raisina Hill",
        "India Gate", "Khan Market", "Jor Bagh", "Lodhi Colony", "Pandara Road",
        # Additional South Delhi
        "Vasant Vihar", "Vasant Kunj", "Chanakyapuri", "Mehrauli", "Sainik Farms",
        "Chattarpur", "Lado Sarai", "Panchsheel Park", "East of Kailash", "Greater Kailash 1",
        # Additional West Delhi
        "Patel Nagar East", "Kirti Nagar", "Rajendra Place", "Ramesh Nagar", "Naraina",
        "Mayapuri", "Subhash Nagar", "Tagore Garden", "Vikas Puri", "Janakpuri East",
        # Additional East Delhi
        "Karkardooma", "Krishna Nagar", "Gandhi Nagar", "Vivek Vihar", "IP Extension",
        "Anand Vihar", "Nirman Vihar", "Geeta Colony", "East Krishna Nagar", "New Ashok Nagar",
        # Additional North Delhi
        "Gulabi Bagh", "Shakti Nagar", "Timarpur", "Keshav Puram", "Tri Nagar",
        "Azadpur", "Badli", "Narela", "Bawana", "Alipur"
    ],
    "Chennai": [
        # Additional Central Chennai
        "Anna Salai", "Mount Road", "TTK Road", "Teynampet", "Thousand Lights",
        "Sterling Road", "Gopalapuram", "Chetpet", "Purasawalkam", "Perambur",
        # Additional South Chennai
        "RA Puram", "Abhiramapuram", "Kotturpuram", "Saidapet", "Adambakkam",
        "Nanganallur", "Selaiyur", "Sembakkam", "Kovilambakkam", "Neelankarai",
        # Additional North Chennai
        "Washermanpet", "Korukkupet", "Manali", "Ennore", "Madhavaram",
        "Redhills", "Ponneri", "Gummidipoondi", "Tiruvottiyur", "Minjur",
        # Additional West Chennai
        "Saligramam", "Koyambedu", "CMBT", "Vadapalani", "Arumbakkam",
        "Virugambakkam", "KK Nagar", "Ashok Nagar", "Ramapuram", "Mugalivakkam",
        # Additional OMR/ECR
        "Taramani", "Thiruvanmiyur", "Injambakkam", "Akkarai", "Neelankarai",
        "Palavakkam", "Nemmeli", "Muttukadu", "Kovalam", "Mahabalipuram"
    ],
    "Hyderabad": [
        # Additional Central Hyderabad
        "MJ Market", "Sultan Bazaar", "Abids Circle", "Mozamjahi Market", "Secunderabad Railway Station",
        "Paradise Circle", "Ramgopalpet", "Mahankali", "Rasoolpura", "West Marredpally",
        # Additional West Hyderabad
        "Serilingampally", "Lingampally", "Nanakramguda", "Gachibowli Junction", "Biodiversity Park",
        "Gopanpally", "Tellapur", "Kollur", "BHEL", "Miyapur Metro",
        # Additional East Hyderabad
        "Habsiguda", "Ngri", "ECIL", "AS Rao Nagar", "Sainikpuri",
        "Kapra", "Dammaiguda", "Chilkanagar", "Kushaiguda", "Boduppal",
        # Additional North Hyderabad
        "Jeedimetla", "Pragathi Nagar", "Quthbullapur", "Suchitra", "Hakimpet",
        "Bolaram", "Alwal Metro", "Lothkunta", "Yapral", "AOC Centre",
        # Additional South Hyderabad
        "Chandrayangutta", "Saidabad", "Santosh Nagar", "Moosarambagh", "Amberpet",
        "Ramanthapur", "Nagole Metro", "Vanasthalipuram", "Hayathnagar", "LB Nagar Metro"
    ],
    "Kolkata": [
        # Additional Central Kolkata
        "Chowringhee", "Dalhousie", "Shakespeare Sarani", "Theatre Road", "Camac Street",
        "AJC Bose Road", "Rashbehari Avenue", "Southern Avenue", "Ballygunge Circular Road", "Hazra Road",
        # Additional South Kolkata
        "Jodhpur Park", "Golpark", "Dover Lane", "Lansdowne", "Gariahat Road",
        "Triangular Park", "Prince Anwar Shah Road", "Jadavpur University", "Garia Station Road", "Narendrapur",
        # Additional North Kolkata
        "College Street", "Shyambazar", "Maniktala", "Chitpur", "Burrabazar",
        "Hatibagan", "Belgachia", "Cossipore", "Baghbazar", "Sovabazar",
        # Additional East Kolkata
        "EM Bypass", "Science City", "Sector V", "Unitech", "DLF IT Park",
        "Karunamoyee", "City Centre 1", "City Centre 2", "Chinar Park", "Action Area 2",
        # Additional West Kolkata
        "Alipore Road", "Tollygunge Station", "Rabindra Sarobar", "Jadavpur", "Netaji Nagar",
        "Behala Chowrasta", "Parnasree", "Budge Budge", "Santoshpur", "Garia More"
    ],
    "Pune": [
        # Additional Central Pune
        "FC Road", "JM Road", "Tilak Road", "Laxmi Road", "Budhwar Peth",
        "Shukrawar Peth", "Somwar Peth", "Mangalwar Peth", "Raviwar Peth", "Kasba Peth",
        # Additional East Pune
        "Koregaon Park Annexe", "Kalyani Nagar Road", "Nagar Road", "Lohegaon", "Kharadi Bypass",
        "Chandan Nagar", "Tingre Nagar", "Ghorpadi", "Salisbury Park", "Pune Airport",
        # Additional West Pune
        "Karve Road", "Prabhat Road", "Law College Road", "DP Road", "Senapati Bapat Road",
        "Shivaji Nagar", "Model Colony", "Apte Road", "Bhawani Peth", "Budhwar Peth",
        # Additional North Pune
        "Aundh Road", "University Road", "Pimple Gurav", "Sangvi", "Dapodi",
        "Kasarwadi", "Bhosari", "Dighi", "Moshi", "Alandi Road",
        # Additional South Pune
        "Satara Road", "Market Yard", "Vadgaon Budruk", "Dhankawadi Chowk", "Dandekar Bridge",
        "Swargate", "Guruwar Peth", "Pune Station", "Kondhwa Budruk", "NIBM Road"
    ],
    "Ahmedabad": [
        # Additional Central Ahmedabad
        "Mithakhali", "C Scheme", "Ambawadi", "Panchwati", "Swastik Society",
        "Nehru Bridge", "RTO Circle", "Sogo Mall", "Ashram Road Circle", "Khanpur",
        # Additional West Ahmedabad
        "Drive In Road", "Sindhu Bhavan Road", "SP Ring Road", "Pakwan Circle", "Satellite Road",
        "Jodhpur Cross Roads", "Prahlad Nagar Circle", "SG Mall", "Vastrapur Lake", "ISRO Circle",
        # Additional East Ahmedabad
        "CTM", "Rakhial", "Shahpur", "Gomtipur", "Hathijan",
        "Vatva GIDC", "Narol Circle", "Ramol", "Tragad", "Ghodasar",
        # Additional North Ahmedabad
        "Sabarmati Station", "Vadaj", "Usmanpura", "Nava Vadaj", "Ghatlodia",
        "Thaltej Cross Roads", "Sola Bridge", "Science City Road", "Raikhad", "Hansol",
        # Additional South Ahmedabad
        "Maninagar Station", "Jamalpur Gate", "Isanpur", "Bapunagar", "Odhav GIDC",
        "Vatva Circle", "Nikol Gam", "CTM Cross Roads", "Narol Aslali Highway", "Kankariya Lake"
    ],
    "Jaipur": [
        # Additional Central Jaipur
        "Statue Circle", "Panch Batti", "Rambagh Circle", "SMS Hospital", "Albert Hall",
        "Ajmer Road Railway Station", "Railway Station", "Johri Bazaar", "Tripolia Bazaar", "Bapu Bazaar",
        # Additional North Jaipur
        "Jhotwara Circle", "80 Feet Road", "Kalwar Road", "Sikar Road", "Vidhyadhar Nagar Extension",
        "Nirman Nagar Phase 2", "Bajaj Nagar", "Mahesh Nagar Extension", "Shastri Nagar Extension", "Raja Park Extension",
        # Additional South Jaipur
        "Mansarovar Extension", "Jagatpura Railway Station", "Malviya Nagar Industrial Area", "World Trade Park", "Gaurav Tower",
        "Sanganer Airport", "Sitapura Industrial Area", "Ajmer Road", "Vatika", "Mahindra SEZ",
        # Additional East Jaipur
        "Vidhan Sabha Road", "Jawahar Circle Garden", "Jhalana Gram", "Jhalana Doongri", "Bani Park Extension",
        "Hasanpura", "Jaipur Zoo", "Ramnagar", "Jhotwara Bypass", "Bindayaka",
        # Additional West Jaipur
        "Ajmer Highway", "Mahesh Nagar Tonk Road", "Durgapura Railway Station", "Jawahar Nagar Station", "Airport Road",
        "Sodala Circle", "Gopalpura Bypass", "JLN Marg", "Malviya Nagar Metro", "Mansarovar Metro"
    ],
    "Surat": [
        # Additional Central Surat
        "Chowk Bazaar", "Ring Road Circle", "Udhna Darwaja", "Delhi Gate", "Nanpura Circle",
        "Athwa Gate", "Rustampura", "Gopipura", "Sagrampura", "Salabatpura",
        # Additional South Surat
        "Althan Circle", "LP Savani", "Dumas Beach Road", "Magdalla Port", "Hazira",
        "Surat Airport", "Dumas Village", "Choryasi", "Bhatha", "Palsana",
        # Additional North Surat
        "Udhna Station", "Udhna Magdalla Road", "Variyav", "Barbodhan", "Kamrej",
        "Puna Kumbharia", "Kim", "Sachin GIDC", "Jahangirpura Circle", "Pandesara GIDC",
        # Additional East Surat
        "Rander Circle", "Rander Road", "Sayan", "Rundh", "Kosad",
        "Saroli GIDC", "Khadsad", "Bhestan", "Unn", "Variav",
        # Additional West Surat
        "Parle Point Circle", "Athwa Lines", "Ghod Dod Road Circle", "Majura Gate Circle", "Textile Market",
        "Surat Railway Station", "Ring Road New", "VIP Road Vesu", "Pal Canal Road", "Singanpore Canal"
    ]
}

def seed_50_more_localities_top10():
    """Add 50 more real localities to top 10 cities."""
    db: Session = SessionLocal()
    
    try:
        print("="*70)
        print("ADDING 50 MORE LOCALITIES TO TOP 10 CITIES")
        print("="*70)
        
        cities_updated = 0
        localities_added = 0
        cities_not_found = []
        
        for city_name, localities_list in ADDITIONAL_LOCALITIES_TOP10.items():
            # Handle dict format for Mumbai (has nested dict)
            if isinstance(localities_list, dict):
                localities = localities_list["localities"]
            else:
                localities = localities_list
            
            # Find the city
            city = db.query(City).filter(City.name == city_name).first()
            
            if not city:
                cities_not_found.append(city_name)
                print(f"\n  ⚠ City not found: {city_name}")
                continue
            
            print(f"\n  Processing {city_name}...")
            
            # Get existing locality names to avoid duplicates
            existing_names = {loc.name for loc in db.query(Locality).filter(
                Locality.city_id == city.id
            ).all()}
            
            existing_count = len(existing_names)
            print(f"    Existing localities: {existing_count}")
            
            # Filter out duplicates
            new_localities = [loc for loc in localities if loc not in existing_names]
            
            if not new_localities:
                print(f"    ℹ No new localities to add (all already exist)")
                continue
            
            print(f"    Adding {len(new_localities)} new localities...")
            
            # Get current max for is_popular assignment
            current_popular_count = db.query(Locality).filter(
                Locality.city_id == city.id,
                Locality.is_popular == True
            ).count()
            
            for idx, locality_name in enumerate(new_localities):
                # Mark as popular if we need more popular localities (aim for ~30 popular per city)
                is_popular = current_popular_count < 30 and idx < (30 - current_popular_count)
                
                locality = Locality(
                    name=locality_name,
                    city_id=city.id,
                    is_popular=is_popular,
                    is_active=True
                )
                db.add(locality)
                localities_added += 1
            
            db.commit()
            cities_updated += 1
            
            # Get new count
            new_count = db.query(Locality).filter(Locality.city_id == city.id).count()
            print(f"    ✓ Completed {city_name} (now has {new_count} localities)")
        
        # Summary
        total_cities = db.query(City).count()
        total_localities = db.query(Locality).count()
        
        print("\n" + "="*70)
        print("50 MORE LOCALITIES ADDED TO TOP 10 CITIES!")
        print("="*70)
        print(f"\nResults:")
        print(f"  Cities updated: {cities_updated}")
        print(f"  New localities added: {localities_added}")
        print(f"  Total cities in database: {total_cities}")
        print(f"  Total localities in database: {total_localities}")
        
        if cities_not_found:
            print(f"\n⚠ Cities not found in database ({len(cities_not_found)}):")
            for city in cities_not_found:
                print(f"    - {city}")
        
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Error seeding localities: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # Seed 50 more localities for top 10 cities
    seed_50_more_localities_top10()
