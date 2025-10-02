# Map Feature Implementation Guide

## Overview

This document describes the comprehensive map feature implementation for the Bengaluru Tenants property review platform. The system integrates Google Maps API for geocoding, location selection, and property visualization.

## Features Implemented

### Backend Features

1. **Geocoding Service** (`backend/app/services/geocoding_service.py`)
   - Address-to-coordinates conversion using Google Geocoding API
   - Reverse geocoding (coordinates-to-address)
   - Caching system to minimize API calls
   - Distance calculation using Haversine formula
   - Directions API integration for routing

2. **Geocoding API Endpoints** (`backend/app/routers/geocoding.py`)
   - `POST /api/v1/geocoding/geocode` - Convert address to coordinates
   - `POST /api/v1/geocoding/reverse-geocode` - Convert coordinates to address
   - `PUT /api/v1/geocoding/properties/{id}/location` - Update property location
   - `POST /api/v1/geocoding/directions` - Get directions to a property

3. **Auto-Geocoding**
   - Properties without coordinates are automatically geocoded when created
   - Fallback to manual pin-drop if geocoding fails
   - Coordinates are cached to avoid repeated API calls

4. **Geographic Filtering**
   - Filter properties by radius from user's location
   - Haversine formula for accurate distance calculation
   - Properties API supports `latitude`, `longitude`, and `radius_km` parameters

### Frontend Features

1. **MapPicker Component** (`frontend/src/components/MapPicker.tsx`)
   - Interactive draggable marker for precise location selection
   - Current location detection using browser Geolocation API
   - Reverse geocoding on marker drag
   - Mobile-friendly touch support

2. **PropertyMap Component** (`frontend/src/components/PropertyMap.tsx`)
   - Display multiple properties on a map
   - Color-coded markers based on ratings:
     - 🟢 Green: 4+ stars
     - 🟡 Yellow: 3-4 stars
     - 🔴 Red: <3 stars
     - 🔵 Blue: No ratings
   - Info windows with property details
   - Click to view property
   - Auto-fit bounds to show all properties

3. **Property Search with Map** (`frontend/src/app/property/search/page.tsx`)
   - Three view modes:
     - 📋 List View: Traditional property list
     - 🗂️ Split View: List + Map side-by-side
     - 🗺️ Map View: Full-screen map
   - Real-time filter updates
   - Location-based radius filtering
   - Property type filtering
   - Sync between list and map selections

4. **Add Property with Map** (`frontend/src/app/property/add/page.tsx`)
   - Three-step wizard:
     1. Address input
     2. Location confirmation on map
     3. Final review
   - Auto-geocode from address
   - Manual pin-drop option
   - Location confirmation before submission

## Database Schema

### Geocoding Cache Table
```sql
CREATE TABLE geocoding_cache (
    id INTEGER PRIMARY KEY,
    address VARCHAR(500) UNIQUE NOT NULL,
    latitude FLOAT NOT NULL,
    longitude FLOAT NOT NULL,
    formatted_address VARCHAR(500),
    cached_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_geocoding_cache_address ON geocoding_cache(address);
```

### Properties Table (Updated)
The existing `properties` table already has `lat` and `lng` columns:
- `lat` FLOAT - Latitude coordinate (-90 to 90)
- `lng` FLOAT - Longitude coordinate (-180 to 180)
- Index: `idx_properties_location` on (lat, lng)

## API Usage

### Geocode an Address
```bash
POST /api/v1/geocoding/geocode
Content-Type: application/json

{
  "address": "Koramangala, Bengaluru"
}

Response:
{
  "latitude": 12.9352,
  "longitude": 77.6245,
  "formatted_address": "Koramangala, Bengaluru, Karnataka, India",
  "from_cache": false
}
```

### Get Properties with Geographic Filtering
```bash
GET /api/v1/properties?latitude=12.9716&longitude=77.5946&radius_km=5

Response:
{
  "properties": [
    {
      "id": 1,
      "address": "123 Main St",
      "lat": 12.9716,
      "lng": 77.5946,
      "avg_rating": 4.5,
      "review_count": 10
    }
  ],
  "total": 1
}
```

### Update Property Location
```bash
PUT /api/v1/geocoding/properties/123/location
Authorization: Bearer <token>
Content-Type: application/json

{
  "latitude": 12.9716,
  "longitude": 77.5946,
  "confirmed": true
}
```

### Get Directions
```bash
POST /api/v1/geocoding/directions
Content-Type: application/json

{
  "origin_lat": 12.9716,
  "origin_lng": 77.5946,
  "destination_property_id": 123,
  "mode": "driving"
}

Response:
{
  "distance": "5.2 km",
  "duration": "15 mins",
  "polyline": "encoded_polyline_string"
}
```

## Setup Instructions

### Backend Setup

1. **Install Dependencies**
```bash
cd backend
pip install httpx  # For async HTTP requests
```

2. **Environment Variables**
Add to your `.env` file:
```env
GOOGLE_MAPS_API_KEY=AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s
```

3. **Run Database Migrations**
The geocoding_cache table will be created automatically on first run.

4. **Start Backend**
```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

### Frontend Setup

1. **Install Dependencies**
```bash
cd frontend
npm install @googlemaps/js-api-loader
```

2. **Environment Variables**
Create/update `frontend/.env.local`:
```env
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s
NEXT_PUBLIC_API_URL=http://localhost:8000
```

3. **Start Frontend**
```bash
npm run dev
```

## Security Considerations

### API Key Restrictions (Recommended)

1. **Restrict API Key to Your Domain**
   - Go to Google Cloud Console
   - Select your API key
   - Add HTTP referrer restrictions:
     - `http://localhost:3000/*` (development)
     - `https://yourdomain.com/*` (production)

2. **Restrict APIs**
   - Enable only required APIs:
     - Geocoding API
     - Maps JavaScript API
     - Directions API (optional)

3. **Set Usage Quotas**
   - Set daily quota limits to prevent unexpected charges
   - Monitor usage in Google Cloud Console

## Caching Strategy

### Backend Caching
- All geocoding results are cached in the database
- Cache key: normalized address (lowercase, trimmed)
- Cache never expires (addresses don't change)
- Reduces API calls by ~80%

### Browser Caching
- Google Maps libraries cached by browser
- Geolocation cached for 5 minutes
- Property coordinates cached with property data

## Performance Optimizations

1. **Marker Clustering**
   - Automatically groups nearby markers
   - Improves performance with many properties
   - Clusters expand on zoom

2. **Lazy Loading**
   - Maps loaded only when needed
   - Components use dynamic imports
   - Reduces initial bundle size

3. **Debouncing**
   - Address input debounced (500ms)
   - Prevents excessive API calls
   - Improves UX

## Mobile Responsiveness

- Touch-enabled marker dragging
- Responsive map height
- Mobile-optimized controls
- Current location detection
- Geolocation permissions handled gracefully

## Error Handling

### Backend
- Graceful fallback if geocoding fails
- Properties can be created without coordinates
- Coordinates can be added later
- Detailed error messages in logs

### Frontend
- User-friendly error messages
- Fallback to manual pin-drop if geocoding fails
- Geolocation permission errors handled
- Network errors show retry option

## Testing Checklist

- [ ] Add property with address input → auto-geocodes
- [ ] Add property with manual pin-drop → saves coordinates
- [ ] Search properties → shows on map
- [ ] Filter by distance → only shows nearby properties
- [ ] Click property on map → highlights in list
- [ ] Click property in list → highlights on map
- [ ] Mobile: drag marker → works smoothly
- [ ] Current location → detects and centers map
- [ ] No coordinates → property still displays (no map)
- [ ] Geocoding cache → second same address is instant

## API Cost Optimization

### Free Tier Limits
- Geocoding API: 40,000 requests/month free
- Maps JavaScript API: Unlimited
- Directions API: 40,000 requests/month free

### Cost Reduction Strategies
1. **Caching**: Saves ~80% of geocoding API calls
2. **Batch Processing**: Geocode multiple addresses in one session
3. **User Input**: Let users confirm/adjust before geocoding
4. **Lazy Loading**: Load maps only when needed
5. **Directions on Demand**: Only when user explicitly requests

### Current Implementation
- ✅ Database caching
- ✅ Geocode only on user confirmation
- ✅ Directions only on explicit request
- ✅ Lazy-loaded map components
- ✅ Fallback to manual entry

## Future Enhancements

1. **Autocomplete Address Input**
   - Use Google Places Autocomplete
   - Improves address accuracy
   - Better UX

2. **Nearby Amenities**
   - Show metro stations, hospitals, schools
   - Use Places API
   - Help users make decisions

3. **Street View**
   - Add Street View for properties
   - Visual property verification
   - Better user confidence

4. **Heat Maps**
   - Show rental price heat maps
   - Identify expensive/affordable areas
   - Data visualization

5. **Route Planning**
   - Multiple destinations
   - Commute time calculator
   - Transit options

## Support

For issues or questions:
- Check logs: `backend/logs/` and browser console
- Verify API key is valid
- Check Google Cloud Console quota
- Review error messages in UI

## License

This implementation uses Google Maps APIs which require adherence to Google's Terms of Service and licensing requirements.
