"""
Add real localities for 30 more Indian cities.
This will bring the total to 51 cities with real locality data.

Usage:
    python -m app.seed_30_more_cities
"""

from sqlalchemy.orm import Session
from app.db import SessionLocal, engine
from app.models import Base, City, Locality

# Real localities for 30 more major Indian cities
ADDITIONAL_CITIES_WITH_REAL_LOCALITIES = {
    "Kanpur": {
        "state": "Uttar Pradesh",
        "lat": 26.4499,
        "lng": 80.3319,
        "localities": [
            "Civil Lines", "Swaroop Nagar", "Kakadeo", "Kidwai Nagar", "Arya Nagar",
            "Kalyanpur", "Panki", "Barra", "Shastri Nagar", "Fazalganj",
            "Govind Nagar", "Rawatpur", "Kakadev", "Tilak Nagar", "Jajmau",
            "Chakeri", "Harsh Nagar", "Naubasta", "Yashoda Nagar", "Keshav Nagar",
            "Nawabganj", "Juhi", "Lalpur", "Vikas Nagar", "Saket Nagar",
            "Green Park", "Kidwai Nagar", "GT Road", "Mall Road", "Birhana Road",
            "Kanpur Central", "IIT Kanpur", "Ramadevi", "Kaushalpuri", "Colonelganj",
            "Meston Road", "Generalganj", "Cawnpore", "Lal Bangla", "Gumti Number 5",
            "Sarsaiya Ghat", "Parade", "Lajpat Nagar", "Ashok Nagar", "Tili Ghat",
            "Ganga Ghat", "The Mall", "Nehru Nagar", "GTB Nagar", "Rave Motipur"
        ]
    },
    "Agra": {
        "state": "Uttar Pradesh",
        "lat": 27.1767,
        "lng": 78.0081,
        "localities": [
            "Taj Ganj", "Sadar Bazaar", "MG Road", "Sanjay Place", "Kamla Nagar",
            "Dayalbagh", "Sikandra", "Tajganj", "Lohamandi", "Pratap Pura",
            "Fatehabad Road", "Balkeshwar", "Shahganj", "Belanganj", "Chhatta",
            "Rakabganj", "Kachhpura", "Nunhai", "Trans Yamuna", "Agra Cantt",
            "Civil Lines", "Medical College", "Padao", "Kamla Nagar", "Rawatpara",
            "Tajganj", "Mantola", "Chipitola", "Daulat Ganj", "Shah Market",
            "Hing Ki Mandi", "Purani Mandi", "Bhagwan Talkies", "Raja Ki Mandi",
            "Namner", "Kheria", "Artoni", "Jagner", "Khandari", "Mantola",
            "Hariparvat", "Bodla", "Kiraoli", "Runkata", "Jaipur House",
            "Idgah Colony", "Nagla Padi", "Belanganj", "Shahzadi Mandi", "Rambagh"
        ]
    },
    "Varanasi": {
        "state": "Uttar Pradesh",
        "lat": 25.3176,
        "lng": 82.9739,
        "localities": [
            "Assi Ghat", "Dashashwamedh Ghat", "Godowlia", "Lahurabir", "Lanka",
            "Sarnath", "Bhelupur", "Sigra", "Mahmoorganj", "Cantt",
            "Nadesar", "Rathyatra", "Chowk", "Luxa", "Maldahiya",
            "Ramapura", "Shivpur", "Bhojubir", "Pandeypur", "Chetganj",
            "Kotwali", "Adampura", "Golghar", "Kabir Chaura", "Madanpura",
            "Pandu Nagar", "Benia Bagh", "Sonarpura", "Ramnagar", "Newada",
            "BHU", "Rajghat", "Vishwanath Gali", "Kashi Railway Station", "Sampurnanand Sanskrit University",
            "Ramnagar Fort", "Tulsi Ghat", "Panchganga Ghat", "Hanuman Ghat", "Kedar Ghat",
            "Trilochan Ghat", "Jangambari", "DLW Colony", "Khojwan", "Orderly Bazaar",
            "Mughalsarai", "Susuwahi", "Chauka Ghat", "Durga Kund", "Telibagh"
        ]
    },
    "Nashik": {
        "state": "Maharashtra",
        "lat": 19.9975,
        "lng": 73.7898,
        "localities": [
            "College Road", "Panchavati", "Sharanpur Road", "Makhmalabad", "Cidco",
            "Gangapur Road", "Mumbai Naka", "Pathardi Phata", "Trimbak Road", "Nashik Road",
            "Satpur", "Ambad", "Dwarka", "Jail Road", "Canada Corner",
            "Malegaon Road", "Indira Nagar", "Ashoka Marg", "Sharanpur", "Govindnagar",
            "Rajiv Nagar", "Adgaon", "Bhadrakali", "Peth Road", "Old Gangapur Naka",
            "Wadala", "Takli", "Tapovan", "Deolali", "Deolali Camp",
            "Panchavati Colony", "Golf Club Road", "MG Road", "Suyojit City", "Mahatma Nagar",
            "New Cidco", "Shalimar", "Uttamnagar", "Jail Road", "Samata Nagar",
            "Swami Vivekanand Nagar", "Shramik Nagar", "Ashok Stambh", "Gitai", "Kalika Nagar",
            "Nimani", "Vilholi Phata", "Indiranagar", "Meri Colony", "Dindori Road"
        ]
    },
    "Faridabad": {
        "state": "Haryana",
        "lat": 28.4089,
        "lng": 77.3178,
        "localities": [
            "NIT Faridabad", "Sector 15", "Sector 16", "Sector 21", "Old Faridabad",
            "New Industrial Town", "Ballabhgarh", "Greater Faridabad", "Sector 12", "Sector 11",
            "Sector 7", "Sector 8", "Sector 9", "Sector 10", "Sector 31",
            "Nehru Ground", "Ajronda", "Badarpur Border", "Sector 37", "Sector 41",
            "Sector 46", "Sector 54", "Sector 55", "Sector 56", "Sector 58",
            "Sector 66", "Sector 75", "Sector 76", "Sector 81", "Sector 82",
            "Sector 86", "Sector 89", "Surajkund", "Tigaon", "Pali Road",
            "Dabua Colony", "Baselwa", "Mujesar", "Sikri", "Saran",
            "Railway Road", "Bata Chowk", "Town Park", "Company Bagh", "Gandhi Park",
            "Huda Colony", "Mithapur", "Aravali Golf Course", "Anangpur", "Atali"
        ]
    },
    "Meerut": {
        "state": "Uttar Pradesh",
        "lat": 28.9845,
        "lng": 77.7064,
        "localities": [
            "Civil Lines", "Sadar Bazaar", "Shastri Nagar", "Begum Bridge", "Hapur Road",
            "Delhi Road", "Garh Road", "Partapur", "Lisari Gate", "Abu Lane",
            "Brahmpuri", "Lalkurti", "Victoria Park", "Kanker Khera", "Jagriti Vihar",
            "Ganga Nagar", "Suraj Kund Road", "Meerut Cantt", "Pallavpuram", "Defence Colony",
            "Rohta Road", "Modi Nagar Road", "Ganganagar", "Kailash Nagar", "Kavi Nagar",
            "Rajendra Nagar", "Kamla Nagar", "Shivaji Nagar", "Kishan Pura", "Khaspur",
            "Jali Kothi", "Shradhanand Puri", "Panchli", "Heli Mandi", "Nauchandi Ground",
            "Modipuram", "Maw ana", "Phaphunda", "Kharkhoda Road", "Meerut City",
            "Suraj Kund", "Medical College", "Victoria Park", "Abulane", "Brahmpuri",
            "Daurli", "Makanpur", "ITC Crossing", "Tanda Road", "Kachehri Gate"
        ]
    },
    "Rajkot": {
        "state": "Gujarat",
        "lat": 22.3039,
        "lng": 70.8022,
        "localities": [
            "Kotecha Chowk", "Raiya Road", "Kalawad Road", "University Road", "Yagnik Road",
            "Jamnagar Road", "Gondal Road", "150 Feet Ring Road", "Mavdi Main Road", "Sorathiyawadi",
            "Kalavad Road", "Bhakti Nagar", "Moti Tanki Chowk", "Trikon Baug", "Race Course",
            "Pedak Road", "Kothariya Road", "Amin Marg", "Panchnath Road", "Rajkot Airport Road",
            "Bedi", "Greenland", "Kuvadva Road", "Sardarnagar", "Imperial Heights",
            "Mahatma Gandhi Road", "Sadar Bazaar", "Panchsheel Road", "Dhebar Road", "Crystal Mall Area",
            "Tagore Road", "Nana Mava Road", "Gundavadi", "Raiya Circle", "Aji Dam Road",
            "Science College Road", "Kotharia", "Virani Chowk", "Madhuvan Society", "Pushpak Society",
            "Silver Park", "Jakat Naka", "Mavdi Plot", "Bhomeshwar", "Panchvati Circle",
            "Hadala", "Gauridad", "Saurashtra University", "Jalaram Plot", "Kuvadva"
        ]
    },
    "Ghaziabad": {
        "state": "Uttar Pradesh",
        "lat": 28.6692,
        "lng": 77.4538,
        "localities": [
            "Raj Nagar", "Vasundhara", "Indirapuram", "Vaishali", "Kaushambi",
            "Crossings Republik", "Vijay Nagar", "Govindpuram", "Sahibabad", "Mohan Nagar",
            "Maliwara", "Lohia Nagar", "Kavi Nagar", "Rajendra Nagar", "Pratap Vihar",
            "Shakti Khand", "Nyay Khand", "Ahinsa Khand", "Rail Vihar", "Niti Khand",
            "Govindpuri", "NH-24", "Noida Link Road", "GT Road", "Lal Kuan",
            "Delhi Border", "Dilshad Garden", "New Seemapuri", "Wave City", "Raj Bagh",
            "Hindon Vihar", "Sihani Gate", "Bhopura", "Khoda Colony", "Brij Vihar",
            "Dundahera", "Loni", "Muradnagar", "Pilkhuwa", "Dadri",
            "Masuri", "Raj Nagar Extension", "Nyay Khand 1", "Nyay Khand 2", "Nyay Khand 3",
            "Shipra Suncity", "Crossings GH7", "NH 9", "Hapur Chungi", "Arthala"
        ]
    },
    "Ludhiana": {
        "state": "Punjab",
        "lat": 30.9010,
        "lng": 75.8573,
        "localities": [
            "Civil Lines", "Model Town", "Sarabha Nagar", "Ferozepur Road", "Pakhowal Road",
            "Dugri", "Haibowal", "Gill Road", "Miller Ganj", "Chaura Bazaar",
            "Ghumar Mandi", "BRS Nagar", "Lohara", "PAU", "Shimlapuri",
            "Samrala Chowk", "Jamalpur", "Focal Point", "Dhandari", "Jalandhar Road",
            "Daba", "Chandigarh Road", "Clock Tower", "Rishi Nagar", "Kitchlu Nagar",
            "Salem Tabri", "Tibba Road", "Mall Road", "Bharat Nagar", "Gurdev Nagar",
            "New Kiran Cinema", "Basant Cinema", "Krishna Market", "Aarti Chowk", "Flamez Mall Area",
            "Jodhewal", "Barewal", "Dehlon", "Tajpur Road", "Machhiwara Road",
            "Raikot Road", "Chandigarh Highway", "Mohali Road", "Field Ganj", "Gole Market",
            "Purana Bazar", "Railway Road", "Civil Hospital", "DMC", "Punjab Agricultural University"
        ]
    },
    "Amritsar": {
        "state": "Punjab",
        "lat": 31.6340,
        "lng": 74.8723,
        "localities": [
            "Golden Temple Area", "Ranjit Avenue", "Lawrence Road", "Mall Road", "Majitha Road",
            "GT Road", "Court Road", "Queens Road", "Circular Road", "Putlighar",
            "Hall Bazaar", "Katra Jaimal Singh", "Kennedy Avenue", "Model Town", "Chheharta",
            "Batala Road", "Tarn Taran Road", "Ajnala Road", "Attari Road", "Verka",
            "Jandiala Road", "IIM Road", "Amritsar Cantt", "Sultanwind Gate", "Ram Bagh",
            "Company Bagh", "Jallianwala Bagh", "Town Hall", "Basant Avenue", "Green Avenue",
            "White Avenue", "Vijay Nagar", "Gumtala", "Ranjit Avenue Extension", "Novelty Chowk",
            "Alpha One", "Crystal Chowk", "Gurdwara Baba Deep Singh Ji", "Rani Ka Bagh",
            "Raja Sansi", "Daburji", "Rasulpur", "Islamabad", "Kot Khalsa",
            "Gol Bagh", "Kairon", "Sathiala", "Chatiwind", "Manawala", "Ramdass"
        ]
    },
    "Allahabad": {
        "state": "Uttar Pradesh",
        "lat": 25.4358,
        "lng": 81.8463,
        "localities": [
            "Civil Lines", "Georgetown", "Colonelganj", "Mumfordganj", "Kareli",
            "Shivkuti", "Katra", "Lowtherroad", "Daraganj", "Sangam",
            "Attarsuiya", "Bamrauli", "Naini", "Rasoolabad", "Baluaghat",
            "Khuldabad", "Meerapur", "Sulem Sarai", "Salori", "Karbala",
            "Lukarganj", "Chowk", "Phaphamau", "Manauri", "Shahganj",
            "Kydganj", "Atala", "Alopi Bagh", "Mahila Mahavidyalaya", "Allahabad University",
            "Tagore Town", "Ashok Nagar", "Dhoomanganj", "Kaushambi", "Karchana",
            "Jhunsi", "Soraon", "Handia", "Triveni Sangam", "Akbar Fort Area",
            "All Saints Cathedral Area", "Mayo Hall", "Minto Park", "Stanley Road", "Tashkent Marg",
            "MG Marg", "Sardar Patel Marg", "Thornhill Road", "Hastings Road", "Park Road"
        ]
    },
    "Ranchi": {
        "state": "Jharkhand",
        "lat": 23.3441,
        "lng": 85.3096,
        "localities": [
            "Main Road", "Lalpur", "Kanke Road", "Hinoo", "Argora",
            "Doranda", "Harmu", "Morabadi", "Bariatu", "Ashok Nagar",
            "Ratu Road", "Birsa Chowk", "Ranchi Railway Station", "Upper Bazaar", "Lower Bazaar",
            "Karamtoli", "HEC Colony", "Hatia", "Namkum", "Booty More",
            "Khelgaon", "MECON Colony", "Piska More", "Dhurwa", "Kanka",
            "Circular Road", "Tagore Hill", "BIT Mesra", "Ormanjhi", "Tumudag",
            "Ranchi Lake", "Pahari Mandir Area", "Jagannath Temple Area", "Chutia", "Bargaon",
            "Sukhdeonagar", "Khunti Road", "Jhiri", "Mandar", "Baridih",
            "Rajapur", "Tatisilwai", "Topa", "Tupudana", "Hehal",
            "Kokar", "Kadru", "Roshanbagh", "Saraidhela", "Jumar"
        ]
    },
    "Jabalpur": {
        "state": "Madhya Pradesh",
        "lat": 23.1815,
        "lng": 79.9864,
        "localities": [
            "Napier Town", "Civil Lines", "Wright Town", "Sadar Bazaar", "Russell Chowk",
            "Gohalpur", "Vijay Nagar", "Adhartal", "Khamaria", "Gorakhpur",
            "Madan Mahal", "Gwarighat", "Narmada Road", "Hanumantal", "Tilwara Ghat",
            "Bhedaghat", "Bargi", "Lamheta Ghat", "Jabalpur Cantonment", "Damoh Naka",
            "Ranjhi", "Ghamapur", "Katangi Road", "Sihora Road", "Patan",
            "Civil Lines Extension", "Jackson Ganj", "Medical College", "Engineering College", "Rani Durgavati Museum Area",
            "Khandari", "Bilhara", "Bhanwartal", "Panagar", "Khermai",
            "Richhai", "Naya Bans", "Padhuawan", "Pipariya", "Simaria",
            "Devtal", "Tewar", "Sidhi Road", "Mandla Road", "Panjara Pole",
            "Pachpedi", "Maharajpur", "Madhtal", "Bamhori", "Kundam"
        ]
    },
    "Gwalior": {
        "state": "Madhya Pradesh",
        "lat": 26.2183,
        "lng": 78.1828,
        "localities": [
            "Lashkar", "Morar", "City Centre", "Gwalior Fort Area", "Thatipur",
            "Jhansi Road", "Jayendraganj", "Kampoo", "Padav", "Bahodapur",
            "Jiwaji Ganj", "Maharaj Bada", "Phool Bagh", "Hazira", "Murar Cantt",
            "Gola Ka Mandir", "Residency Area", "Shivpuri Link Road", "Barah", "Badora",
            "Purani Chawni", "Sarafa Bazaar", "Subhash Market", "Patankar Bazaar", "MLBs College Area",
            "Jiwaji University Area", "Narwar Road", "Dabra Road", "Daulat Ganj", "Tighra",
            "Jai Vilas Palace Area", "Scindia School Area", "Gwalior Zoo Area", "Tansen Memorial Area", "Urwai Gate",
            "Sarafa", "Dabra", "Banmore", "Bhitarwar", "Mahaa",
            "Narwar", "Khurai", "Narwar", "Antri", "Daboh",
            "Bilaua", "Ghatigaon", "Bhander", "Mohan Ganj", "Sithouli"
        ]
    },
    "Vijayawada": {
        "state": "Andhra Pradesh",
        "lat": 16.5062,
        "lng": 80.6480,
        "localities": [
            "Benz Circle", "MG Road", "Governorpet", "Labbipet", "Eluru Road",
            "Bhavanipuram", "Auto Nagar", "Nunna", "Gannavaram Road", "Gunadala",
            "Patamata", "Moghalrajpuram", "Ayodhya Nagar", "Krishnalanka", "Kanuru",
            "Prakash Nagar", "Ramalingeswara Nagar", "Suryaraopet", "One Town", "Two Town",
            "Three Town", "Four Town", "Five Town", "Gunadala", "Gollapudi",
            "Kanchikacherla", "Ibrahimpatnam", "Penamaluru", "Tadepalli", "Mangalagiri",
            "Vij ayawada Junction", "Chalasani Nagar", "Seetharampuram", "Autonagar", "Bhavanipuram",
            "Satyanarayanapuram", "Tarapet", "Gandhinagar", "PMG Circle", "Pamarru",
            "Kankipadu", "Poranki", "Kondapalli", "Mylavaram", "Movva",
            "Agiripalli", "Pedana", "Machilipatnam Road", "NH 16", "Bandar Road"
        ]
    },
    "Jodhpur": {
        "state": "Rajasthan",
        "lat": 26.2389,
        "lng": 73.0243,
        "localities": [
            "Paota", "Ratanada", "Sardarpura", "Shastri Nagar", "Chopasni Housing Board",
            "Pal Link Road", "Residency Road", "Circuit House Road", "Airport Road", "Mandore Road",
            "Basni", "Pratap Nagar", "Kudi Housing Board", "Lohawat Road", "Pal Road",
            "Pali Road", "Bhagat Ki Kothi", "Soorsagar", "Station Road", "High Court Road",
            "Sardarpura", "New Rati Talai", "Old Rati Talai", "Clock Tower", "Mehrangarh Fort Area",
            "Umaid Bhawan Area", "Jaswant Thada Area", "Kaylana Lake", "Balsamand Lake Area", "Machia Biological Park",
            "Civil Lines", "Chopasni Road", "Police Line Area", "Raika Bagh", "Rajasthan High Court Area",
            "IIT Jodhpur Road", "AIIMS Jodhpur Road", "Boranada", "Salawas", "Osiyan Road",
            "Phalodi Road", "Barmer Road", "Jaisalmer Road", "Nagaur Road", "Bikaner Road",
            "Jhanwar Road", "Kuri Bhagtasani", "Daijar", "Gangana", "Dechu"
        ]
    },
    "Madurai": {
        "state": "Tamil Nadu",
        "lat": 9.9252,
        "lng": 78.1198,
        "localities": [
            "Meenakshi Temple Area", "Anna Nagar", "K Pudur", "Arapalayam", "SS Colony",
            "Sellur", "Simmakkal", "Goripalayam", "Tallakulam", "Vilangudi",
            "Pasumalai", "Thiruparankundram", "Samayanallur", "Tirupparankundram", "Avaniyapuram",
            "Uthangudi", "Thirunagar", "Harveypatti", "Anuppanadi", "Nehru Nagar",
            "Ponmeni", "BB Kulam", "KK Nagar", "Nagamalai Pudukottai", "Vaigai Dam",
            "Mattuthavani", "Periyar Bus Stand", "Railway Station", "Meenakshi Mission Hospital Area", "Apollo Hospital Area",
            "American College Area", "Madurai Kamaraj University Area", "Bypass Road", "Ring Road", "Airport Road",
            "Kappalur", "Vandiyur", "Arasaradi", "Melur Road", "Sivaganga Road",
            "Thanjavur Road", "Dindigul Road", "Periyakulam Road", "Viruthunagar Road", "Alanganallur Road",
            "Nagamalai", "Teppakulam", "Mekkarai", "Sholavandan Road", "Usilampatti Road"
        ]
    },
    "Raipur": {
        "state": "Chhattisgarh",
        "lat": 21.2514,
        "lng": 81.6296,
        "localities": [
            "Civil Lines", "Shankar Nagar", "Pandri", "Tatibandh", "Mowa",
            "Devendra Nagar", "Kabir Nagar", "Kota", "Gudhiyari", "Durg Road",
            "Bilaspur Road", "Raigarh Road", "NH 6", "Fafadih", "Pachpedi Naka",
            "Avanti Vihar", "Telibandha", "Bhatagaon", "Santoshi Nagar", "Hirapur",
            "New Rajendra Nagar", "Samta Colony", "Vidhyut Nagar", "Kamal Vihar", "Khamardih",
            "Byron Bazaar", "Ganj", "Purani Basti", "Railway Station", "Raipur Junction",
            "Lalpur", "Tikrapara", "Saddu", "Kharun Nagar", "Sunder Nagar",
            "Bhilai Road", "Dhamtari Road", "Mahasamund Road", "Abhanpur Road", "Nava Raipur (Atal Nagar)",
            "Borsi", "Bhanpuri", "Sarona", "Amlidih", "Sejbahar",
            "Urla", "Kumhari", "Mandir Hasaud", "Simga", "Bhilai Nagar"
        ]
    },
    "Kota": {
        "state": "Rajasthan",
        "lat": 25.2138,
        "lng": 75.8648,
        "localities": [
            "Aerodrome Circle", "Dadabari", "Mahaveer Nagar", "Gumanpura", "Vigyan Nagar",
            "Talwandi", "Rangbari", "Kota Industrial Area", "Landmark City", "Kunhari",
            "Rajeev Gandhi Nagar", "Keshav Puram", "Chhavni", "Borkhera", "Nayapura",
            "Indraprastha Industrial Area", "Kota University Area", "Rampura", "Shopping Centre", "Shrinath Puram",
            "Gopalpura Bypass", "Vallabh Nagar", "JK Lon Road", "Dhanmandi", "Station Road",
            "Civil Lines", "Balaji Market", "New Colony", "Chhatrapura", "Shakti Nagar",
            "RajivGandhi Circle", "DCM Road", "Kota Coaching Hub", "Allen Area", "Bansal Classes Area",
            "Resonance Area", "Career Point Area", "Motion IIT JEE Area", "Vibrant Academy Area", "VKS Institute Area",
            "Jhalawar Road", "Bundi Road", "Ajmer Road", "Jawahar Nagar", "Balaji Nagar",
            "Chawandia Kalan", "Sultanpur", "Kithod", "Rawatbhata Road", "Chechat"
        ]
    },
    "Chandigarh (Additional)": {
        "state": "Chandigarh",
        "lat": 30.7333,
        "lng": 76.7794,
        "localities": [
            "Sector 51", "Sector 52", "Sector 61", "Sector 62", "Sector 63",
            "Sector 64", "Sector 65", "Sector 66", "Sector 67", "Sector 68",
            "Sector 69", "Sector 70", "Mohali Border", "Panchkula Border", "Zirakpur Highway",
            "Sukhna Lake", "Rock Garden", "Rose Garden", "Leisure Valley", "Botanical Garden",
            "PGI Chandigarh", "GMCH 32", "Panjab University", "Post Graduate Government College", "MCM DAV College",
            "Government College of Art", "Elante Mall", "North Country Mall", "Piccadilly Square", "Chandigarh Golf Club",
            "Cricket Stadium", "Hockey Stadium", "Punjab Raj Bhawan", "Haryana Raj Bhawan", "UT Secretariat",
            "Vidhan Sabha", "High Court", "District Courts", "Grain Market", "Sector 26 Market",
            "Sector 17 Plaza", "Sector 22 Market", "Sector 19 Market", "Sector 23 Market", "Sector 7 Market",
            "IT Park Phase 1", "IT Park Phase 2", "Aerocity", "Airport Road", "Patiala Road"
        ]
    },
    "Mysuru": {
        "state": "Karnataka",
        "lat": 12.2958,
        "lng": 76.6394,
        "localities": [
            "Mysore Palace Area", "Chamundeshwari Temple", "Brindavan Gardens", "Bannimantap", "Jayalakshmi Puram",
            "Kuvempu Nagar", "Vijayanagar", "Saraswathipuram", "Hebbal", "Hinkal",
            "VV Mohalla", "Gokulam", "Yadavagiri", "Siddarthanagar", "Ramakrishna Nagar",
            "Bogadi", "Chamundi Hill", "Hunsur Road", "Bannur Road", "T Narasipura Road",
            "Ooty Road", "Nanjangud Road", "KRS Road", "Ring Road", "Outer Ring Road",
            "Devaraja Market Area", "Gun House Circle", "Hardinge Circle", "K R Circle", "Metropole Circle",
            "KSRTC Bus Stand", "City Bus Stand", "Railway Station", "Mysore Zoo", "Karanji Lake",
            "Lingambudhi Lake", "JSS Mahavidyapeetha", "University of Mysore", "Mysore Medical College", "NIE College",
            "Infosys Mysore", "Wipro Mysore", "Larsen & Toubro Mysore", "Brigade Millennium", "Century Township",
            "Metagalli", "Nazarbad", "Tilaknagar", "Lakshmipuram", "Mandi Mohalla"
        ]
    },
    "Guwahati (Additional)": {
        "state": "Assam",
        "lat": 26.1445,
        "lng": 91.7362,
        "localities": [
            "Uzanbazar", "Fancy Bazaar Extension", "Paltan Bazaar Extension", "Kamakhya Temple Area", "ISBT Adabari",
            "Khanapara Bus Stand", "Guwahati Railway Station", "Airport Gopinath Bordoloi", "Nehru Park", "Dighalipukhuri",
            "IIT Guwahati", "Gauhati University", "Assam Engineering College", "Cotton University", "Medical College",
            "AIIMS Guwahati", "Assam Secretariat", "Assembly", "High Court", "Rajiv Gandhi Indoor Stadium",
            "Indira Gandhi Athletic Stadium", "Brahmaputra Riverfront", "Umananda Island", "Kamakhya Wildlife Sanctuary", "Pobitora Wildlife Sanctuary",
            "Deepor Beel", "Nabagraha Temple", "Sukreswar Temple", "Ugratara Temple", "Basistha Ashram",
            "Meghdoot Market", "Fancy Bazar Market", "Paltan Bazaar Market", "Guwahati Central Mall", "Hub Mall",
            "Dona Planet", "Shopper's Point", "Anil Plaza", "City Centre Mall", "Forum Mall",
            "Lakhtokia", "Fatasil", "Bhangagarh Extension", "Narangi Military Station", "Satgaon",
            "Boragaon", "Amingaon", "Srimanta Sankardev Kalakshetra", "State Museum", "Planetarium"
        ]
    },
    "Dhanbad": {
        "state": "Jharkhand",
        "lat": 23.7957,
        "lng": 86.4304,
        "localities": [
            "Bank More", "City Centre", "Hirapur", "Wasseypur", "Jharia",
            "Katras", "Govindpur", "Chhatatand", "Sindri", "Nirsa",
            "Baliapur", "Putki", "Kusunda", "Kenduadih", "Bartand",
            "Jagjivan Nagar", "ISM Campus", "Saraidhela", "Tisra", "Tundi",
            "Dhanbad Railway Station", "Steel Gate", "Randhir Verma Chowk", "IIT ISM", "BIT Sindri",
            "DVC", "BCCL Headquarters", "Koyla Nagar", "Bartand Colliery", "Bhowra Colliery",
            "Lodna", "Topchanchi", "Jharia Coal Field", "Moonidih", "Bhaga",
            "Barwadda", "Bastacolla", "Jarangdih", "Baliapur", "Dhanbad Bus Stand",
            "Bartand Dam", "Tilaia Dam", "Maithon Dam", "Panchet Dam", "Topchanchi Lake",
            "Bhatinda More", "Jagjivanpur", "Murgasol", "Loyabad", "Jharia"
        ]
    },
    "Amravati": {
        "state": "Maharashtra",
        "lat": 20.9319,
        "lng": 77.7523,
        "localities": [
            "Rajkamal Chowk", "Jaistambh Chowk", "Camp", "Badnera Road", "Cotton Market",
            "Kathora Road", "Dastur Nagar", "Camp Area", "Morshi Road", "Chandur Railway Road",
            "Khallar", "Shankar Nagar", "Paratwada Road", "MIDC", "Tapovan",
            "Rukhmini Nagar", "Nandanvan", "Jaiprakash Nagar", "Warud Road", "Daryapur Road",
            "Achalpur Road", "Railway Station", "Bus Stand", "Sant Gadge Maharaj University", "Govt Medical College",
            "Ambajhari Lake", "Jaistambh Square", "Shivsena Maidan", "Nehru Garden", "District Court",
            "Commissioner Office", "Collector Office", "Police Lines", "Amravati Club", "Circuit House",
            "Jalkalyan", "Soyegaon", "Nandgaon Peth", "Tiwaskarwadi", "Warud",
            "Dhamangaon", "Anjangaon Surji", "Chikhaldara", "Melghat Tiger Reserve", "Semadoh",
            "Achalpur", "Paratwada", "Dharni", "Morshi", "Chandur Bazar"
        ]
    },
    "Bareilly": {
        "state": "Uttar Pradesh",
        "lat": 28.3670,
        "lng": 79.4304,
        "localities": [
            "Civil Lines", "Cantt", "Subhash Nagar", "Prem Nagar", "Rampur Garden",
            "Izzatnagar", "Farid Pur", "CB Ganj", "Nawabganj", "Qila",
            "Maheshganj", "Baradari", "Company Bagh", "Parsakheda", "Kaithkalan",
            "Bithri Chainpur", "Fatehganj", "Pilibhit Road", "Moradabad Road", "Nainital Road",
            "Rampur Road", "Budaun Road", "NH 24", "NH 9", "Railway Station",
            "Bus Station", "Medical College", "Rohilkhand University", "IVRI Campus", "MLN College",
            "Victoria Park", "Alakhnath Temple", "Dargah Aala Hazrat", "Phoenix United Mall", "Fun City Mall",
            "Kargaina", "Shergarh", "Baheri", "Mirganj", "Aonla",
            "Bhojipura", "Meerganj", "Bahedi", "Hafizganj", "Dataganj",
            "Rithora", "Richha", "Shahi", "Nawa", "Bithari"
        ]
    },
    "Aligarh": {
        "state": "Uttar Pradesh",
        "lat": 27.8974,
        "lng": 78.0880,
        "localities": [
            "AMU Campus", "Dhorra", "Sasni Gate", "Marris Road", "Delhi Gate",
            "Dodhpur", "Quarsi", "Centre Point", "Ramghat Road", "Medical College",
            "Sir Syed Nagar", "University Road", "Achal Tal", "Jamalpur", "Nagla Pala",
            "Badar Bagh", "Begpur", "Manik Chowk", "Sarai Sultani", "New High Ground",
            "Old City", "Uparkot", "Firdous Nagar", "Civil Lines", "Naurangabad Road",
            "Mathura Road", "Agra Road", "Anup Shahr Road", "Khair Road", "Railway Station",
            "Bus Stand", "Ramghat", "Khereshwar Mandir", "Jama Masjid", "AMU Hospital",
            "Aligarh Fort", "Dor Fortress", "Kol Aligarh", "Harduaganj", "Lodha",
            "Gonda", "Pisawa", "Atrauli", "Tappal", "Iglas",
            "Bijauli", "Gangiri", "Khair", "Jawan Sikandarpur", "Akrabad"
        ]
    },
    "Gorakhpur": {
        "state": "Uttar Pradesh",
        "lat": 26.7606,
        "lng": 83.3732,
        "localities": [
            "Civil Lines", "Gorakhnath Temple Area", "Railway Station", "Golghar", "Bank Road",
            "Betiahata", "Basharatpur", "Medical College", "BRD Medical College", "University Road",
            "Kunraghat", "Shahpur", "Ramgarh Tal", "City Mall", "Taramandal Road",
            "Sahjanwa", "Khorabar", "Pathardeva", "Transport Nagar", "GIDA",
            "Rapti Nagar", "Rajghat Colony", "Mohaddipur", "Pipraich Road", "Gulhariya",
            "Deoria Road", "Nautanwa Road", "Sonauli Road", "Badhalganj", "Cinema Road",
            "DDU Gorakhpur University", "MMICT&BM Gorakhpur", "Fertilizer Factory", "Railway Coach Factory", "Ordnance Factory",
            "Gorakhnath Mandir", "Ramgarh Tal Lake", "Taramandal", "Gita Vatika", "Geeta Press",
            "Barhaj", "Campierganj", "Chauri Chaura", "Bansgaon", "Gagaha",
            "Sahjanwa", "Khajani", "Pakri Araji", "Belghat", "Jungle Dusadh"
        ]
    },
    "Bikaner": {
        "state": "Rajasthan",
        "lat": 28.0229,
        "lng": 73.3119,
        "localities": [
            "Junagarh Fort Area", "Lalgarh Palace Area", "Kote Gate", "Station Road", "Rani Bazaar",
            "Sadul Ganj", "Sardarpura", "Mukta Prasad Colony", "Shiv Bari", "Jain Temple Area",
            "NH 11", "NH 15", "Karni Nagar", "Gangana gar Road", "Jaisalmer Road",
            "Jodhpur Road", "Sri Ganganagar Road", "Nagaur Road", "Suratgarh Road", "Dungargarh Road",
            "PBM Hospital Area", "Medical College", "University Area", "Engineering College", "Bikaner Fort",
            "Laxmi Niwas Palace", "Ganga Golden Jubilee Museum", "Karni Mata Temple Deshnoke", "Gajner Palace", "Kolayat",
            "Katariya Sar", "Lalgarh", "Shiv Nagar", "Govt Hospital Road", "Civil Lines",
            "RTO Office Area", "Collectorate", "District Court", "Ambedkar Circle", "Goga Gate",
            "Mohta Chowk", "Panchshati Circle", "Lal Singh Colony", "Sector 1 (Paras Ram Nagar)", "Sector 2 (Paras Ram Nagar)",
            "Sukhadia Circle", "Moti Colony", "Pawanpuri", "Adarsh Nagar", "Chopasni Housing Board"
        ]
    },
    "Dehradun": {
        "state": "Uttarakhand",
        "lat": 30.3165,
        "lng": 78.0322,
        "localities": [
            "Rajpur Road", "Mussoorie Road", "Saharanpur Road", "Haridwar Road", "Rishikesh Road",
            "Clock Tower", "Paltan Bazaar", "Indira Market", "Astley Hall", "EC Road",
            "Clement Town", "ISBT", "Railway Station", "Jolly Grant Airport", "IMA",
            "FRI", "ONGC", "Survey of India", "IITR", "Doon University",
            "Graphic Era", "DIT University", "Wadia Institute", "UCOST", "Wildlife Institute of India",
            "Malsi Deer Park", "Robber's Cave", "Sahastradhara", "Tapkeshwar Temple", "Kalanga Monument",
            "Chandrabani", "Premnagar", "Jakhan", "Raipur", "Ballupur",
            "Dalanwala", "Niranjanpur", "Harrawala", "Selaqui", "Vikasnagar",
            "Doiwala", "Lacchiwala", "Dakpathar", "Tyuni", "Mussoorie",
            "Landour", "Dhanaulti", "Chakrata", "Kalsi", "Assan Barrage"
        ]
    },
    "Cuttack": {
        "state": "Odisha",
        "lat": 20.5124,
        "lng": 85.8829,
        "localities": [
            "Buxi Bazaar", "Badambadi", "Link Road", "Barabati Stadium Area", "CDA Sector",
            "Jagatpur", "Madhupatna", "Nayasarak", "Mangalabag", "Dargha Bazaar",
            "Bidanasi", "Nuapatna", "Purighat", "Khan Nagar", "Tulasipur",
            "Sutahat", "Ranihat", "Chauliaganj", "Barang", "Choudhury Bazaar",
            "OMP Square", "Jobra", "Jail Road", "Ring Road", "NH 5",
            "Ravenshaw University", "SCB Medical College", "NIST", "OUAT", "CDA",
            "Mahanadi Barrage", "Dhabaleswar Temple", "Qadam Rasul", "Cuttack Fort", "Nandankanan Zoo",
            "Naraj", "Tangi", "Banki", "Athagarh", "Salipur",
            "Mahanga", "Kantapada", "Baramba", "Tigiria", "Niali",
            "Jagatsinghpur Road", "Kendrapara Road", "Jajpur Road", "Bhubaneswar Road", "Puri Road"
        ]
    },
    "Bhilai": {
        "state": "Chhattisgarh",
        "lat": 21.2095,
        "lng": 81.4293,
        "localities": [
            "Sector 1", "Sector 2", "Sector 3", "Sector 4", "Sector 5",
            "Sector 6", "Sector 7", "Sector 8", "Sector 9", "Sector 10",
            "Nehru Nagar", "Vaishali Nagar", "Khursipar", "Kohka", "Supela",
            "Smriti Nagar", "Risali", "Maroda", "Kumhari", "Durg",
            "Bhilai Steel Plant", "SAIL Township", "Ispat Club", "Maitri Bagh Zoo", "Nehru Art Gallery",
            "Civic Centre", "Bhilai Nagar Nigam", "Railway Station", "Bus Stand", "Bhilai Airport",
            "GEC Bilaspur Campus", "BIT Durg", "SSGI", "Shri Shankaracharya Institute", "Rungta College",
            "Jubilee Park", "Centenary Hospital", "JLN Hospital", "Apollo Hospital", "SAIL Hospital",
            "Hirapur", "Jamul", "Patripar", "Mokhala", "Bhilai 3",
            "Rawanbhata", "Durg-Raipur NH", "New Raipur Road", "Nagpur Highway", "Kanker Road"
        ]
    },
    "Warangal": {
        "state": "Telangana",
        "lat": 17.9689,
        "lng": 79.5941,
        "localities": [
            "Hanamkonda", "Kazipet", "Nakkalagutta", "Subedari", "Hunter Road",
            "Station Ghanpur", "Warangal Fort Area", "Kakatiya University", "MGM Hospital Area", "Balasamudram",
            "Kakaji Colony", "LB Nagar", "Shayampet", "Ramnagar", "Rangashaipet",
            "Janagoan Road", "Hyderabad Road", "Khammam Road", "Karimnagar Road", "NH 163",
            "NIT Warangal", "Kakatiya Medical College", "KIMS Hospital", "Thousand Pillar Temple", "Ramappa Temple",
            "Warangal Fort", "Bhadrakali Temple", "Kakatiya Musical Garden", "Laknavaram Lake", "Pakhal Lake",
            "Hanmakonda Railway Station", "Kazipet Railway Junction", "Bus Stand", "JNTU Warangal", "SRR Government College",
            "Industrial Estate", "APIIC", "Warangal Central Jail", "District Courts", "Collectorate",
            "Nakkalagutta", "Janagoan", "Bhupalpally", "Siddipet", "Mulugu",
            "Mahabubabad", "Narsampet", "Parkal", "Atmakur", "Geesugonda"
        ]
    }
}

def seed_30_more_cities():
    """Seed the database with real localities for 30 more cities."""
    db: Session = SessionLocal()
    
    try:
        print("="*70)
        print("SEEDING 30 MORE CITIES WITH REAL LOCALITIES")
        print("="*70)
        
        cities_added = 0
        cities_updated = 0
        localities_added = 0
        cities_not_found = []
        
        for city_name, city_info in ADDITIONAL_CITIES_WITH_REAL_LOCALITIES.items():
            # Check if city already exists
            existing_city = db.query(City).filter(City.name == city_name).first()
            
            if existing_city:
                print(f"\n  Processing {city_name}...")
                
                # Check how many localities already exist
                existing_localities_count = db.query(Locality).filter(
                    Locality.city_id == existing_city.id
                ).count()
                
                if existing_localities_count >= 40:
                    print(f"    Skipping {city_name} - already has {existing_localities_count} localities")
                    continue
                
                # Update city info
                existing_city.lat = city_info["lat"]
                existing_city.lng = city_info["lng"]
                existing_city.state = city_info["state"]
                existing_city.is_active = True
                cities_updated += 1
                
                # Get existing locality names to avoid duplicates
                existing_names = {loc.name for loc in db.query(Locality).filter(
                    Locality.city_id == existing_city.id
                ).all()}
                
                city_id = existing_city.id
            else:
                print(f"\n  ⚠ City not found: {city_name}")
                cities_not_found.append(city_name)
                continue
            
            # Add localities
            localities = city_info["localities"]
            new_localities = [loc for loc in localities if loc not in existing_names]
            
            print(f"    Adding {len(new_localities)} localities...")
            
            for idx, locality_name in enumerate(new_localities):
                locality = Locality(
                    name=locality_name,
                    city_id=city_id,
                    is_popular=(idx < 20),  # Mark first 20 as popular
                    is_active=True
                )
                db.add(locality)
                localities_added += 1
            
            db.commit()
            print(f"    ✓ Completed {city_name}")
        
        # Summary
        total_cities = db.query(City).count()
        total_localities = db.query(Locality).count()
        
        print("\n" + "="*70)
        print("30 MORE CITIES SEEDED SUCCESSFULLY!")
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
            print(f"\n  These cities need to be added to the database first.")
        
        print("="*70)
        
    except Exception as e:
        print(f"\n❌ Error seeding cities: {e}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    # Ensure tables exist
    print("Ensuring database tables exist...")
    Base.metadata.create_all(bind=engine)
    
    # Seed 30 more cities
    seed_30_more_cities()
