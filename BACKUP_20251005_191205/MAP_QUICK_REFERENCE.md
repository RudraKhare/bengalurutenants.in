# Map Feature - Quick Reference Guide

## 🚀 Quick Start (2 minutes)

### Step 1: Install Dependencies
```bash
# Backend
cd backend
pip install httpx

# Frontend
cd frontend
npm install @googlemaps/js-api-loader
```

### Step 2: Configure Environment
```bash
# Frontend: Create/update .env.local
echo "NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=AIzaSyDFJf8xF1HeZO68GWFGmIUyPRSeNhCGJ2s" > .env.local
```

### Step 3: Start Services
```bash
# Backend (Terminal 1)
cd backend
uvicorn app.main:app --reload

# Frontend (Terminal 2)
cd frontend
npm run dev
```

### Step 4: Test Features
1. Open http://localhost:3000/property/search
2. Click "🗺️ Map" view toggle
3. See properties on map!

## 📍 Key URLs

| Feature | URL |
|---------|-----|
| Property Search with Map | http://localhost:3000/property/search |
| Add Property with Location | http://localhost:3000/property/add |
| Geocoding API Docs | http://localhost:8000/docs#/geocoding |

## 🎛️ API Endpoints

### Geocode Address
```bash
curl -X POST http://localhost:8000/api/v1/geocoding/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Koramangala, Bengaluru"}'
```

### Get Properties Near Location
```bash
curl "http://localhost:8000/api/v1/properties?latitude=12.9716&longitude=77.5946&radius_km=5"
```

### Update Property Location
```bash
curl -X PUT http://localhost:8000/api/v1/geocoding/properties/1/location \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{"latitude": 12.9716, "longitude": 77.5946, "confirmed": true}'
```

## 🎨 UI Features

### Property Search Page
- **List View (📋)**: Traditional property list
- **Split View (🗂️)**: List + Map side-by-side
- **Map View (🗺️)**: Full-screen map only

### Marker Colors
- 🟢 **Green**: 4+ star rating
- 🟡 **Yellow**: 3-4 star rating
- 🔴 **Red**: <3 star rating
- 🔵 **Blue**: No ratings yet

### Add Property Flow
1. **Step 1**: Enter address and property details
2. **Step 2**: Confirm location on map (or manual pin-drop)
3. **Step 3**: Review and submit

## ⌨️ Keyboard Shortcuts

When map is focused:
- **Arrow keys**: Pan map
- **+ / -**: Zoom in/out
- **Escape**: Close info window

## 🔧 Troubleshooting

### Map Not Loading?
1. Check browser console (F12)
2. Verify API key in `.env.local`
3. Check internet connection
4. Try refreshing page

### Geocoding Failed?
1. Check if API key is valid
2. Verify backend is running
3. Try manual pin-drop instead

### Current Location Not Working?
1. Allow location permission in browser
2. Use HTTPS in production (required)
3. Check browser console for errors

## 📊 Database Queries

### Check Geocoding Cache
```sql
SELECT COUNT(*) FROM geocoding_cache;
SELECT * FROM geocoding_cache ORDER BY cached_at DESC LIMIT 5;
```

### Properties with Coordinates
```sql
SELECT COUNT(*) FROM properties WHERE lat IS NOT NULL;
SELECT address, lat, lng FROM properties WHERE lat IS NOT NULL LIMIT 5;
```

### Properties Without Coordinates
```sql
SELECT id, address FROM properties WHERE lat IS NULL OR lng IS NULL;
```

## 🎯 Common Tasks

### Task: Add a property with auto-geocoding
1. Go to http://localhost:3000/property/add
2. Enter: "Indiranagar, Bengaluru"
3. Click "📍 Find on Map"
4. Adjust marker if needed
5. Click "Confirm Location"
6. Click "✓ Add Property"

### Task: Find properties near you
1. Go to http://localhost:3000/property/search
2. Click distance filter: "5 km from current location"
3. Allow geolocation permission
4. View filtered results

### Task: View all properties on map
1. Go to http://localhost:3000/property/search
2. Click "🗺️ Map" view toggle
3. Click any marker for details

## 🔑 Important Code Locations

| Component | File |
|-----------|------|
| Geocoding Service | `backend/app/services/geocoding_service.py` |
| Geocoding API | `backend/app/routers/geocoding.py` |
| Map Picker | `frontend/src/components/MapPicker.tsx` |
| Property Map | `frontend/src/components/PropertyMap.tsx` |
| Search Page | `frontend/src/app/property/search/page.tsx` |
| Add Property | `frontend/src/app/property/add/page.tsx` |

## 📖 Documentation Links

- **Full Guide**: `docs/MAP_FEATURE_GUIDE.md`
- **Testing Checklist**: `docs/MAP_TESTING_CHECKLIST.md`
- **Implementation Summary**: `docs/MAP_IMPLEMENTATION_SUMMARY.md`

## 💡 Pro Tips

1. **Use Caching**: Same address? Instant geocoding from cache!
2. **Manual Pin-Drop**: Most accurate for exact locations
3. **Split View**: Best for comparing properties
4. **Distance Filter**: Find properties near your workplace
5. **Mobile**: Touch and drag markers smoothly

## 🆘 Get Help

1. **Backend Logs**: Check terminal running `uvicorn`
2. **Frontend Logs**: Check browser console (F12)
3. **API Docs**: http://localhost:8000/docs
4. **Test Script**: Run `test-map-feature.bat`

## ✅ Feature Checklist

Quick check if everything works:
- [ ] Backend starts without errors
- [ ] Frontend shows map on search page
- [ ] Can add property with address
- [ ] Can drag marker on map
- [ ] Current location detection works
- [ ] Properties show on map with colors
- [ ] Info windows open on marker click
- [ ] Distance filter works

## 📞 Support

If stuck, check these in order:
1. Are both backend and frontend running?
2. Is API key set in `.env.local`?
3. Are dependencies installed (`httpx`, `@googlemaps/js-api-loader`)?
4. Any errors in browser console?
5. Any errors in backend terminal?

---

**Quick Test**: Open http://localhost:3000/property/search and click "🗺️ Map". You should see a map! 🎉
