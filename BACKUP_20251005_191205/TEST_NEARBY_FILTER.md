# Test the Nearby Properties Filter - Quick Guide

## Prerequisites
✅ All 27 properties have coordinates (DONE!)
✅ Backend fixes applied (DONE!)
✅ Frontend fixes applied (DONE!)

---

## Step-by-Step Testing

### 1. Start Backend
```powershell
cd backend
uvicorn app.main:app --reload
```

**Expected Output**:
```
INFO:     Uvicorn running on http://127.0.0.1:8000
INFO:     Application startup complete.
```

---

### 2. Start Frontend (New Terminal)
```powershell
cd frontend
npm run dev
```

**Expected Output**:
```
- Local:        http://localhost:3000
- ready in XXXms
```

---

### 3. Open Browser
Navigate to: **http://localhost:3000/property/search**

---

### 4. Test Nearby Filter

#### Test 1: Basic 1km Search
1. Look at the **left sidebar** under "Distance from current location"
2. Click **"1 km from current location"**
3. Browser will ask for location permission → Click **"Allow"**
4. Open browser console (F12) to see logs

**Expected Console Output**:
```
📍 Getting user location for 1km search...
✅ Location obtained: {lat: XX.XXXX, lng: XX.XXXX}
🔍 Searching properties within 1km of location: {lat: XX.XXXX, lng: XX.XXXX}
🌐 Fetching properties from: http://localhost:8000/api/properties?latitude=...
📦 Received X properties (total: X)
```

**Expected UI**:
- "1 km" button highlighted in blue
- Properties appear in center column
- Properties sorted by distance (nearest first)
- Text below button: "Using your current location"

---

#### Test 2: Try Different Distances
Click each distance button:
- ✓ 2 km from current location
- ✓ 3 km from current location
- ✓ 4 km from current location
- ✓ 5 km from current location

**Expected Behavior**:
- More properties appear as radius increases
- Results update immediately
- Selected button highlighted in blue
- Properties re-sorted by distance each time

---

#### Test 3: Clear Filter
Click **"Clear distance filter"**

**Expected Behavior**:
- Blue highlighting removed
- Shows all properties (no distance filter)
- Back to default sorting (newest first)
- Text "Using your current location" disappears

---

#### Test 4: Combine with City Filter
1. Select **"Bengaluru"** from city dropdown
2. Click **"2 km from current location"**

**Expected Behavior**:
- Only Bengaluru properties shown
- Within 2km of your location
- Both filters applied together

---

## Troubleshooting

### No Properties Showing?

**Check Console Logs**:
```javascript
// Look for these in browser console (F12)
📍 Getting user location...
✅ Location obtained: {lat: X, lng: Y}
🔍 Searching properties...
📦 Received X properties
```

**Possible Issues**:

1. **Location Permission Denied**
   - Look for error: "Could not get your current location"
   - **Fix**: Allow location access in browser settings
   - Chrome: Click lock icon → Site settings → Location → Allow
   - Firefox: Click shield icon → Permissions → Location → Allow

2. **No Properties Within Radius**
   - Try increasing distance (5km instead of 1km)
   - Your location might be far from properties
   - All properties are in Bengaluru, so if you're elsewhere, increase radius

3. **Backend Not Running**
   - Check terminal for errors
   - Verify: http://localhost:8000/docs works
   - Look for "Application startup complete" message

4. **Frontend Not Running**
   - Check terminal for errors
   - Verify: http://localhost:3000 loads
   - Look for "ready in XXms" message

---

## Verify Backend Directly

### Test API Endpoint:
```powershell
# Replace with your coordinates
curl "http://localhost:8000/api/properties?latitude=12.9716&longitude=77.5946&radius_km=5"
```

**Expected Response**:
```json
{
  "properties": [
    {
      "id": 1,
      "address": "...",
      "city": "Bengaluru",
      "area": "...",
      "lat": 12.9716,
      "lng": 77.5946
    }
  ],
  "total": X,
  "skip": 0,
  "limit": 10
}
```

---

## Success Criteria

✅ Location permission prompt appears  
✅ User location obtained successfully  
✅ Properties appear in search results  
✅ Properties sorted by distance  
✅ Console logs show correct flow  
✅ Different distances show different results  
✅ Clear filter removes distance restriction  
✅ Works with other filters (city, property type)  

---

## Next Steps After Testing

If everything works:
1. ✅ Mark nearby filter feature as COMPLETE
2. 📝 Update project documentation
3. 🎨 Consider UI enhancements (show distance on property cards?)
4. 🗺️ Consider adding map view of results
5. 🚀 Deploy to production

If something doesn't work:
1. Check console logs (F12)
2. Check backend terminal for errors
3. Verify all fixes were applied
4. Re-run coordinate script if needed
5. Review NEARBY_PROPERTIES_FIX.md

---

## Backend Console Output to Look For

```
🔍 Geographic search: center=(12.9716, 77.5946), radius=1km
INFO:     127.0.0.1:XXXXX - "GET /api/properties?latitude=12.9716&longitude=77.5946&radius_km=1 HTTP/1.1" 200 OK
```

---

## Report Results

After testing, note:
- ✅ What worked
- ❌ What didn't work
- 📊 How many properties appeared at each distance
- 💡 Any improvements needed

---

**Ready to test? Start with Step 1 above!** 🚀
