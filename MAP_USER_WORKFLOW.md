# 🗺️ Map Feature - Complete User Workflow Guide

## Overview
The map feature is integrated into the property review platform to help users **find properties**, **add new listings**, and **leave reviews** with location-based context.

---

## 📍 Current Workflow - How Users Interact with Maps

### **1. SEARCHING & BROWSING PROPERTIES (Main Use Case)**

#### **Entry Point**: `/property/search` page

#### **User Journey:**

```
┌─────────────────────────────────────────────────────────────┐
│                    PROPERTY SEARCH PAGE                      │
│                  /property/search                            │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  1. Search & Filter Options              │
        │  ───────────────────────────              │
        │  • Search by Area (Koramangala, etc.)    │
        │  • Filter by Property Type                │
        │    - Villa/House                          │
        │    - Flat/Apartment                       │
        │    - PG/Hostel                            │
        │  • Distance Filter (1km, 3km, 5km, 10km) │
        │    (Requires user's current location)     │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  2. View Mode Selection                  │
        │  ───────────────────────                 │
        │  📋 LIST VIEW   - Traditional list       │
        │  🗂️ SPLIT VIEW  - List + Map (Default)  │
        │  🗺️ MAP VIEW   - Full screen map         │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  3. View Results                         │
        └──────────────────────────────────────────┘
                    │              │
        ┌───────────┴──┐      ┌────┴──────────┐
        │ List Side    │      │  Map Side     │
        │              │      │               │
        │ Properties   │      │  PropertyMap  │
        │ displayed    │      │  Component    │
        │ as cards     │      │               │
        └──────┬───────┘      └───────┬───────┘
               │                      │
               └──────────┬───────────┘
                          │
                          ▼
           ┌────────────────────────────────┐
           │  Click Property                │
           └────────────────────────────────┘
                          │
                          ▼
           ┌────────────────────────────────┐
           │  Property Detail Page          │
           │  /property/[id]                │
           │                                │
           │  • Full property info          │
           │  • All reviews                 │
           │  • Add review button           │
           │  • (Map showing location)      │
           └────────────────────────────────┘
```

---

### **How Map Works in Search Page:**

#### **A. PropertyMap Component** (`PropertyMap.tsx`)

**Purpose**: Display multiple properties on an interactive map

**Features:**
```javascript
✅ Multiple markers - One per property
✅ Color-coded by rating:
   🟢 Green  = 4+ stars (Excellent)
   🟡 Yellow = 3-4 stars (Good)
   🔴 Red    = <3 stars (Poor)
   🔵 Blue   = No ratings yet

✅ Info windows - Click marker to see:
   • Property address
   • Property type
   • Rating & review count
   • "View Details" button

✅ Auto-fit bounds - Map zooms to show all properties
✅ Marker clustering (planned) - Groups nearby markers
```

**What User Sees:**
1. Map loads with all filtered properties
2. Each property = colored pin on map
3. Click pin → Info window pops up
4. Click "View Details" → Goes to property page

---

#### **B. Distance Filter Feature**

**How It Works:**
```
User clicks "Use Current Location" button
         ↓
Browser asks for location permission
         ↓
User allows location access
         ↓
JavaScript gets: { lat: 12.9716, lng: 77.5946 }
         ↓
User selects distance: 1km, 3km, 5km, or 10km
         ↓
API Call: GET /api/v1/properties?latitude=12.9716&longitude=77.5946&radius_km=3
         ↓
Backend calculates distance using Haversine formula
         ↓
Returns only properties within radius
         ↓
Map updates to show nearby properties only
```

---

### **2. ADDING A NEW PROPERTY**

#### **Entry Point**: `/property/add` page

#### **User Journey:**

```
┌─────────────────────────────────────────────────────────────┐
│                    ADD PROPERTY PAGE                         │
│                   /property/add                              │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  STEP 1: Address Input                   │
        │  ────────────────────                    │
        │  User enters:                            │
        │  • Property address                      │
        │  • City (default: Bengaluru)             │
        │  • Area/locality                         │
        │  • Property type                         │
        │                                          │
        │  Buttons:                                │
        │  [🔍 Find Location] - Auto-geocode       │
        │  [📍 Manual Pin-drop] - Skip to map      │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  AUTO-GEOCODING                          │
        │  Backend API Call:                       │
        │  POST /api/v1/geocoding/geocode          │
        │  {                                       │
        │    "address": "Koramangala, Bengaluru"   │
        │  }                                       │
        │                                          │
        │  Response:                               │
        │  {                                       │
        │    "latitude": 12.9352,                  │
        │    "longitude": 77.6245,                 │
        │    "formatted_address": "...",           │
        │    "from_cache": false                   │
        │  }                                       │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  STEP 2: Location Confirmation           │
        │  ────────────────────────                │
        │  ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓    │
        │  ┃  MapPicker Component           ┃    │
        │  ┃  ────────────────────           ┃    │
        │  ┃  Interactive map with:          ┃    │
        │  ┃  • Draggable red marker         ┃    │
        │  ┃  • [📍 Use Current Location]    ┃    │
        │  ┃  • Reverse geocoding on drag    ┃    │
        │  ┃                                 ┃    │
        │  ┃  User can:                      ┃    │
        │  ┃  1. Drag marker to exact spot   ┃    │
        │  ┃  2. Click anywhere on map       ┃    │
        │  ┃  3. Use current location        ┃    │
        │  ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛    │
        │                                          │
        │  Selected Address: "123 Main St, ..."   │
        │                                          │
        │  [← Back] [Confirm Location ✓]          │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  STEP 3: Final Confirmation              │
        │  ────────────────────────                │
        │  Review all details:                     │
        │  ✓ Address                               │
        │  ✓ Location (lat, lng)                   │
        │  ✓ Property type                         │
        │                                          │
        │  [← Back] [Submit Property]              │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  BACKEND CREATES PROPERTY                │
        │  POST /api/v1/properties                 │
        │  {                                       │
        │    "address": "...",                     │
        │    "city": "Bengaluru",                  │
        │    "lat": 12.9352,                       │
        │    "lng": 77.6245,                       │
        │    "property_type": "FLAT_APARTMENT"     │
        │  }                                       │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  SUCCESS! Redirect to property page      │
        │  /property/[new_id]                      │
        └──────────────────────────────────────────┘
```

---

### **MapPicker Component Details**

**Features:**
```javascript
✅ Draggable marker - User can precisely position
✅ Click anywhere - Marker moves to clicked location
✅ Current location - Browser geolocation API
✅ Reverse geocoding - Shows address as marker moves
✅ Info display - Shows selected address below map
✅ Visual feedback - Marker animates on drop
```

**What Happens When User Drags:**
```
User drags marker
       ↓
JavaScript: marker.addListener('dragend')
       ↓
Get new position: { lat, lng }
       ↓
API Call: Google Geocoder.geocode({ location: { lat, lng } })
       ↓
Get formatted address
       ↓
Display: "Selected Address: 123 Main St, Koramangala..."
       ↓
Enable "Confirm Location" button
```

---

### **3. VIEWING A PROPERTY (Individual Page)**

#### **Entry Point**: `/property/[id]` page

```
┌─────────────────────────────────────────────────────────────┐
│                 PROPERTY DETAIL PAGE                         │
│                 /property/123                                │
└─────────────────────────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  Property Information                    │
        │  • Address                               │
        │  • Property type                         │
        │  • Rent amount                           │
        │  • Overall rating                        │
        │                                          │
        │  (Future: Small map showing location)    │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  All Reviews Section                     │
        │  • Individual tenant reviews             │
        │  • Ratings breakdown                     │
        │  • Comments                              │
        └──────────────────────────────────────────┘
                           │
                           ▼
        ┌──────────────────────────────────────────┐
        │  [+ Leave a Review] Button               │
        │                                          │
        │  Clicks → Review form appears            │
        └──────────────────────────────────────────┘
```

**Currently:** No map on individual property page (can be added!)

---

## 🔄 Backend Geocoding Workflow

### **Geocoding Cache System**

**Purpose**: Save money on Google Maps API calls (geocoding costs $5 per 1000 requests)

```
User adds property with address: "Koramangala, Bengaluru"
                    ↓
Backend checks cache table:
SELECT * FROM geocoding_cache WHERE address = 'Koramangala, Bengaluru'
                    ↓
        ┌───────────┴───────────┐
        │                       │
   Cache HIT              Cache MISS
        │                       │
        ▼                       ▼
Return cached coords    Call Google Geocoding API
{ lat, lng }                    │
                                ▼
                        Get coordinates
                                │
                                ▼
                        Save to cache
                        INSERT INTO geocoding_cache
                                │
                                ▼
                        Return coords
```

**Cache Benefits:**
- ✅ 80% cost reduction (most addresses repeat)
- ✅ Faster response (no API call)
- ✅ Works even if Google API is down

---

## 📊 Data Flow Summary

### **Property Creation:**
```
Frontend (User Input)
      ↓
  Address Text
      ↓
Backend Geocoding Service
      ↓
Google Maps Geocoding API
      ↓
{ lat: 12.9352, lng: 77.6245 }
      ↓
Database: properties table
      ↓
Frontend: Display on map
```

### **Property Search:**
```
Frontend (Search Page)
      ↓
User filters (area, type, distance)
      ↓
Backend: GET /api/v1/properties?latitude=X&longitude=Y&radius_km=3
      ↓
Database query with Haversine formula:
  WHERE (distance calculated from lat/lng) <= 3km
      ↓
Return filtered properties
      ↓
Frontend: PropertyMap component
      ↓
Display markers on map
```

---

## 🎯 Key Components

### **Frontend Components:**

| Component | Purpose | Location |
|-----------|---------|----------|
| `PropertyMap` | Display multiple properties on map | `/property/search` |
| `MapPicker` | Interactive location selection | `/property/add` |
| `SearchInput` | Search & filter UI | `/property/search` |
| `PropertyCard` | Property list item | `/property/search` |

### **Backend Services:**

| Service | Purpose | Endpoints |
|---------|---------|-----------|
| `GeocodingService` | Address ↔ Coordinates | `/api/v1/geocoding/*` |
| `PropertyRouter` | CRUD operations | `/api/v1/properties` |
| `GeocodingCache` | Cache layer | (Database model) |

---

## 🔮 Current vs. Future Features

### **✅ Currently Implemented:**

1. **Property Search with Map**
   - ✅ List/Split/Map views
   - ✅ Color-coded markers by rating
   - ✅ Info windows on click
   - ✅ Distance-based filtering
   - ✅ Property type filtering

2. **Add Property with Map**
   - ✅ Address input
   - ✅ Auto-geocoding
   - ✅ Manual pin-drop
   - ✅ Location confirmation
   - ✅ Reverse geocoding

3. **Backend**
   - ✅ Geocoding API integration
   - ✅ Caching system
   - ✅ Distance calculation
   - ✅ Geographic filtering

### **🚧 Not Yet Implemented:**

1. **Property Detail Page Map**
   - ❌ Small map showing property location
   - ❌ "Get Directions" button
   - ❌ Nearby properties

2. **Review with Location Context**
   - ❌ Map showing property when writing review
   - ❌ Verify user lived at property (location-based)

3. **Advanced Features**
   - ❌ Marker clustering for many properties
   - ❌ Draw search radius on map
   - ❌ Street view integration
   - ❌ Property comparison on map

---

## 💡 How Users Benefit

### **For Property Seekers:**
```
✅ Visual search - See properties on map, not just list
✅ Location context - Understand where property is
✅ Nearby search - Find properties close to work/school
✅ Quick comparison - Compare locations at a glance
✅ Rating visibility - Color-coded markers show quality
```

### **For Property Owners/Reviewers:**
```
✅ Accurate location - Pin exact property location
✅ Easy submission - Auto-geocoding from address
✅ Verification - Confirm location on map before submitting
✅ Flexibility - Can use address OR manual pin-drop
```

---

## 🛠️ Technical Stack

### **Frontend:**
- **Next.js 14** - React framework
- **Google Maps JavaScript API** - Map display
- **TypeScript** - Type safety
- **Tailwind CSS** - Styling

### **Backend:**
- **FastAPI** - Python web framework
- **SQLAlchemy** - ORM
- **Google Geocoding API** - Address → Coordinates
- **PostgreSQL** - Database (via Supabase)

### **APIs Used:**
- **Google Maps JavaScript API** - Map rendering
- **Google Geocoding API** - Address conversion
- **Browser Geolocation API** - User's current location

---

## 📝 Summary

**Current Map Usage:**

1. **Search**: Users browse properties on map with color-coded markers
2. **Add**: Users add properties with precise location via map picker
3. **Review**: Users can see property location context (future enhancement)

**Key Insight**: Maps enhance property discovery and ensure accurate location data, making the platform more reliable and user-friendly.

---

**For Full Details**: See `docs/MAP_FEATURE_GUIDE.md`
