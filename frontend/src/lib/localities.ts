/**
 * List of localities in Bengaluru sorted by region
 */

interface LocalityGroup {
  name: string;
  localities: string[];
}

export const BengaluruLocalities: LocalityGroup[] = [
  {
    name: "Central Bengaluru",
    localities: [
      "Adugodi",
      "Austin Town",
      "Bengaluru Pete",
      "Chamarajpet",
      "Chickpet",
      "Cooke Town",
      "Cox Town",
      "Fraser Town",
      "Gandhi Nagar",
      "Kalasipalyam",
      "Murphy Town",
      "Richmond Town",
      "Seshadripuram",
      "Shivajinagar",
      "Ulsoor",
      "Vasanth Nagar",
      "Vivek Nagar",
      "Wilson Garden"
    ]
  },
  {
    name: "East Bengaluru",
    localities: [
      "Agara",
      "Akshay Nagar",
      "Baiyyappanahalli",
      "Baiyyappanahalli Manavarthe Kaval",
      "Begur",
      "Bellandur",
      "Binnamangala",
      "Binnamangala Manavarthe Kaval",
      "Bommanahalli",
      "Brookefield",
      "BTM Layout",
      "Carmelaram",
      "CV Raman Nagar",
      "Domlur",
      "Ejipura",
      "Electronic City",
      "G. M. Palya",
      "Garudacharpalya",
      "Hoodi",
      "HSR Layout",
      "Immadihalli",
      "Indiranagar",
      "Jakkasandra",
      "Jeevanbimanagar",
      "Kadugodi",
      "Kaggadasapura",
      "Kodihalli",
      "Koramangala",
      "Krishnarajapuram",
      "Kundalahalli",
      "Madiwala",
      "Mahadevapura",
      "Marathahalli",
      "Murugeshpalya",
      "Ramagondanahalli",
      "Ramamurthy Nagar",
      "Singasandra",
      "Varthur",
      "Vimanapura",
      "Whitefield"
    ]
  },
  {
    name: "North Bengaluru",
    localities: [
      "Babusapalya",
      "Bahubalinagar",
      "Banaswadi",
      "Devanahalli",
      "Devara Jeevanahalli",
      "Dollars Colony",
      "Gangamma Circle",
      "Ganganagar",
      "Hebbal",
      "Horamavu",
      "Jakkur",
      "Jalahalli",
      "Kalkere",
      "Kalyan Nagar",
      "Kammanahalli",
      "Kodigehalli",
      "Lingarajapuram",
      "Muthyalanagar",
      "R. T. Nagar",
      "Ramachandrapura",
      "Sahakara Nagar",
      "Sanjaynagar",
      "Thanisandra",
      "Thindlu",
      "Vidyaranyapura",
      "Yelahanka"
    ]
  },
  {
    name: "South Bengaluru",
    localities: [
      "Anjanapura",
      "Arekere",
      "Banashankari",
      "Basavanagudi",
      "Bilekahalli",
      "BTM Layout",
      "Chikkalasandra",
      "Devarachikkanahalli",
      "Girinagar",
      "Gottigere",
      "Gowdanapalya",
      "Hanumanthanagar",
      "Hulimavu",
      "Ittamadu",
      "Jayanagar",
      "Jayaprakash Nagar",
      "Konanakunte",
      "Kumaraswamy Layout",
      "Padmanabhanagar",
      "Puttenahalli",
      "Ramanjaneyanagar",
      "Siddapura",
      "Suddaguntepalya",
      "Thyagarajanagar",
      "Uttarahalli",
      "Yelachenahalli"
    ]
  },
  {
    name: "West Bengaluru",
    localities: [
      "Banashankari",
      "Basaveshwaranagara",
      "Bharathnagar",
      "Byatarayanapura",
      "Dasarahalli",
      "Girinagar",
      "Kamakshipalya",
      "Kengeri",
      "Mahalakshmi Layout",
      "Malleshwaram",
      "Milk Colony",
      "Nagarbhavi",
      "Nandini Layout",
      "Nayandahalli",
      "Palace Guttahalli",
      "Peenya",
      "Rajajinagar",
      "Rajarajeshwari Nagar",
      "Sadashivanagar",
      "Ullalu",
      "Vijayanagar",
      "Vyalikaval",
      "Yeswanthpur"
    ]
  }
];

// Flat list of all localities for search/dropdown
export const AllBengaluruLocalities: string[] = BengaluruLocalities.reduce(
  (acc, group) => [...acc, ...group.localities], 
  [] as string[]
).sort();

// Localities for all major cities
export const AllCityLocalities: Record<string, string[]> = {
  Bengaluru: [
    "Whitefield", "Koramangala", "HSR Layout", "Indiranagar", "Jayanagar", "Malleshwaram", "Banashankari", "Bellandur", "Rajajinagar", "Marathahalli",
    "Hebbal", "Yelahanka", "BTM Layout", "Basavanagudi", "Ulsoor", "Sadashivanagar", "Frazer Town", "Vijayanagar", "Kengeri", "Sarjapur Road",
    "JP Nagar", "Magadi Road", "Bannerghatta Road", "Richmond Town", "Shivajinagar", "Seshadripuram", "Vasanth Nagar", "Domlur", "Hennur", "Kumaraswamy Layout",
    "Kalyan Nagar", "KR Puram", "Peenya", "Nagarbhavi", "Sanjay Nagar", "Cooke Town", "Basaveshwaranagar", "Chickpet", "Majestic", "Kammanahalli",
    "Banerghatta", "Electronic City", "Kanakapura Road", "Devanahalli", "Bagalur", "Hosur Road", "Attibele", "Nelamangala", "Jakkur", "Sahakar Nagar"
  ],
  Mumbai: [
    "Andheri", "Bandra", "Juhu", "Powai", "Borivali", "Malad", "Goregaon", "Dadar", "Worli", "Colaba",
    "Chembur", "Vile Parle", "Santacruz", "Khar", "Matunga", "Sion", "Kurla", "Ghatkopar", "Mulund", "Bhandup",
    "Vikhroli", "Chandivali", "Parel", "Byculla", "Mazgaon", "Grant Road", "Charni Road", "Marine Lines", "Churchgate", "Cuffe Parade",
    "Nariman Point", "Tardeo", "Walkeshwar", "Malabar Hill", "Girgaon", "Kalbadevi", "Dongri", "Mazgaon", "Sewri", "Wadala",
    "Antop Hill", "Govandi", "Mankhurd", "Trombay", "Dharavi", "Mahim", "Lower Parel", "Upper Worli", "Versova", "Kandivali"
  ],
  Delhi: [
    "Connaught Place", "Dwarka", "Saket", "Karol Bagh", "Lajpat Nagar", "Vasant Kunj", "Rohini", "Pitampura", "Janakpuri", "Greater Kailash",
    "South Extension", "Hauz Khas", "Green Park", "Malviya Nagar", "Defence Colony", "Preet Vihar", "Mayur Vihar", "Vikaspuri", "Rajouri Garden", "Punjabi Bagh",
    "Model Town", "Shalimar Bagh", "Ashok Vihar", "Civil Lines", "Yamuna Vihar", "Dilshad Garden", "Patparganj", "Inderpuri", "Moti Nagar", "Paschim Vihar",
    "Nehru Place", "Okhla", "Jasola", "Sarita Vihar", "Badarpur", "Mehrauli", "Chhatarpur", "Sultanpur", "Ghitorni", "Vasant Vihar",
    "Munirka", "RK Puram", "Lodhi Colony", "Chanakyapuri", "Mandir Marg", "Paharganj", "Daryaganj", "Kashmere Gate", "Old Delhi", "New Friends Colony"
  ],
  Chennai: [
    "Adyar", "Anna Nagar", "Besant Nagar", "T Nagar", "Velachery", "Mylapore", "Alwarpet", "Nungambakkam", "Kodambakkam", "Vadapalani",
    "Porur", "Guindy", "Saidapet", "Royapettah", "Egmore", "Kilpauk", "Perambur", "Ambattur", "Thiruvanmiyur", "Sholinganallur", "Pallavaram",
    "Tambaram", "Medavakkam", "Chromepet", "Avadi", "Manapakkam", "Poonamallee", "Mogappair", "Kotturpuram", "Mandaveli", "Triplicane",
    "Vepery", "Chetpet", "Aminjikarai", "Ashok Nagar", "West Mambalam", "East Tambaram", "Thirumangalam", "Thiruvottiyur", "Minjur", "Red Hills",
    "Padi", "Korattur", "Villivakkam", "Thirumullaivoyal", "Pattabiram", "Puzhal", "Vyasarpadi", "Washermanpet", "Royapuram", "Pulianthope"
  ],
  Hyderabad: [
    "Banjara Hills", "Jubilee Hills", "Gachibowli", "Madhapur", "Kondapur", "Begumpet", "Ameerpet", "Secunderabad", "Hitech City", "Manikonda",
    "Kukatpally", "Dilsukhnagar", "LB Nagar", "Uppal", "Miyapur", "Chanda Nagar", "Attapur", "Mehdipatnam", "Tolichowki", "Somajiguda",
    "Kothapet", "Nagole", "Alwal", "Sainikpuri", "Malkajgiri", "Shamshabad", "Shamirpet", "Patancheru", "Ramachandrapuram", "Bowenpally",
    "Moosapet", "Erragadda", "Sanath Nagar", "Khairatabad", "Nampally", "Abids", "Koti", "Malakpet", "Amberpet", "Musheerabad",
    "Chikkadpally", "Narayanaguda", "Saidabad", "Charminar", "Falaknuma", "Bahadurpura", "Rajendranagar", "Hayathnagar", "Goshamahal", "Hafeezpet"
  ],
  Kolkata: [
    "Salt Lake", "New Town", "Park Street", "Ballygunge", "Alipore", "Dum Dum", "Behala", "Garia", "Jadavpur", "Tollygunge",
    "Howrah", "Baranagar", "Baguiati", "Lake Town", "Kankurgachi", "Shyambazar", "Ultadanga", "Kasba", "Rajarhat", "Sodepur", "Belgharia",
    "Bansdroni", "Santoshpur", "Beliaghata", "Chinar Park", "Teghoria", "Nagerbazar", "Kestopur", "Budge Budge", "Sonarpur", "Dumdum Park",
    "Naktala", "Jodhpur Park", "Kalighat", "Hazra", "Chetla", "Kidderpore", "Garden Reach", "Metiabruz", "Barisha", "Maheshtala",
    "Serampore", "Barrackpore", "Khardah", "Dunlop", "Noapara", "Sinthi", "Patuli", "Gariahat", "Dhakuria", "Burrabazar"
  ],
  Pune: [
    "Koregaon Park", "Kalyani Nagar", "Viman Nagar", "Baner", "Aundh", "Hinjewadi", "Wakad", "Pimple Saudagar", "Magarpatta", "Hadapsar",
    "Kothrud", "Erandwane", "Deccan Gymkhana", "Camp", "Swargate", "Shivajinagar", "Karve Nagar", "Sinhagad Road", "Bibwewadi", "Dhankawadi",
    "Balewadi", "Pashan", "Sus", "Bavdhan", "Warje", "Narhe", "Ambegaon", "Dhanori", "Lohegaon", "Yerwada",
    "Mundhwa", "Manjri", "Undri", "NIBM Road", "Wanowrie", "Fatima Nagar", "Kondhwa", "Katraj", "Somatane", "Chinchwad",
    "Nigdi", "Akurdi", "Talegaon", "Chakan", "Moshi", "Alandi", "Ravet", "Thergaon", "Kalewadi", "Pimpri"
  ]
  // Add more cities and their top 50 localities as needed
};
