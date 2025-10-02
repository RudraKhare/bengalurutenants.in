# Map Feature Testing Checklist

## Prerequisites
- [ ] Backend running at http://localhost:8000
- [ ] Frontend running at http://localhost:3000
- [ ] Google Maps API Key configured in `.env.local`
- [ ] `httpx` package installed in backend
- [ ] `@googlemaps/js-api-loader` package installed in frontend

## Backend API Tests

### Geocoding Endpoints

#### 1. Test Address Geocoding
```bash
curl -X POST http://localhost:8000/api/v1/geocoding/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Koramangala, Bengaluru"}'
```
**Expected**: Returns latitude, longitude, formatted_address, and from_cache flag

#### 2. Test Geocoding Cache
```bash
# Call the same address again
curl -X POST http://localhost:8000/api/v1/geocoding/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "Koramangala, Bengaluru"}'
```
**Expected**: Returns same result with `from_cache: true`

#### 3. Test Reverse Geocoding
```bash
curl -X POST http://localhost:8000/api/v1/geocoding/reverse-geocode \
  -H "Content-Type: application/json" \
  -d '{"latitude": 12.9352, "longitude": 77.6245}'
```
**Expected**: Returns formatted address for the coordinates

#### 4. Test Invalid Address
```bash
curl -X POST http://localhost:8000/api/v1/geocoding/geocode \
  -H "Content-Type: application/json" \
  -d '{"address": "XYZ Invalid Place 12345"}'
```
**Expected**: Returns 400 error with appropriate message

### Properties API Tests

#### 5. Test Geographic Filtering
```bash
# Get properties within 5km of Bengaluru center
curl "http://localhost:8000/api/v1/properties?latitude=12.9716&longitude=77.5946&radius_km=5"
```
**Expected**: Returns only properties within 5km radius

#### 6. Test Property Creation with Auto-Geocoding
```bash
# First, get auth token (replace with actual login)
TOKEN="your_access_token_here"

curl -X POST http://localhost:8000/api/v1/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "address": "123 Indiranagar, Bengaluru",
    "city": "Bengaluru",
    "area": "Indiranagar",
    "property_type": "FLAT_APARTMENT"
  }'
```
**Expected**: Property created with auto-geocoded coordinates

#### 7. Test Property Creation with Manual Coordinates
```bash
curl -X POST http://localhost:8000/api/v1/properties \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "address": "456 Koramangala",
    "city": "Bengaluru",
    "property_type": "VILLA_HOUSE",
    "lat": 12.9352,
    "lng": 77.6245
  }'
```
**Expected**: Property created with provided coordinates (no geocoding)

#### 8. Test Update Property Location
```bash
curl -X PUT http://localhost:8000/api/v1/geocoding/properties/1/location \
  -H "Content-Type: application/json" \
  -d '{
    "latitude": 12.9716,
    "longitude": 77.5946,
    "confirmed": true
  }'
```
**Expected**: Property location updated successfully

## Frontend UI Tests

### MapPicker Component Tests

#### 9. Test MapPicker Initialization
- [ ] Open http://localhost:3000/property/add
- [ ] Verify map loads correctly
- [ ] Verify marker appears at default location (Bengaluru center)

#### 10. Test Marker Dragging
- [ ] Drag the marker to a new location
- [ ] Verify marker moves smoothly
- [ ] Verify "Selected Address" updates with new address
- [ ] Verify coordinates update

#### 11. Test Current Location Detection
- [ ] Click "Use Current Location" button
- [ ] Allow browser geolocation when prompted
- [ ] Verify map centers on current location
- [ ] Verify marker moves to current location
- [ ] Verify address updates

#### 12. Test Map Click
- [ ] Click anywhere on the map
- [ ] Verify marker moves to clicked location
- [ ] Verify coordinates update

### PropertyMap Component Tests

#### 13. Test Multiple Property Display
- [ ] Open http://localhost:3000/property/search
- [ ] Switch to "Map" or "Split" view
- [ ] Verify all properties with coordinates show on map
- [ ] Verify markers are color-coded by rating:
  - Green: 4+ stars
  - Yellow: 3-4 stars
  - Red: <3 stars
  - Blue: No ratings

#### 14. Test Marker Clustering (if many properties)
- [ ] Add 10+ properties close together
- [ ] Verify markers cluster at zoomed out view
- [ ] Click cluster
- [ ] Verify zoom in and expand

#### 15. Test Info Window
- [ ] Click a property marker
- [ ] Verify info window opens with:
  - Property address
  - Rating (if available)
  - Review count
  - "View Details" button
- [ ] Click "View Details"
- [ ] Verify navigates to property page

#### 16. Test Map Auto-Fit
- [ ] Filter properties by area
- [ ] Verify map adjusts to show all filtered properties
- [ ] Verify zoom level is appropriate

### Property Search Page Tests

#### 17. Test View Mode Toggle
- [ ] Click "List" view → Verify only list shows
- [ ] Click "Split" view → Verify list + map side-by-side
- [ ] Click "Map" view → Verify full-screen map only

#### 18. Test List-Map Synchronization (Split View)
- [ ] Select "Split" view
- [ ] Click a property in the list
- [ ] Verify corresponding marker bounces/highlights on map
- [ ] Click a marker on the map
- [ ] Verify corresponding property highlights in list

#### 19. Test Distance Filter
- [ ] Select "Distance" filter (e.g., "5 km from current location")
- [ ] Allow geolocation when prompted
- [ ] Verify only properties within radius show
- [ ] Verify map centers on current location
- [ ] Verify properties outside radius are hidden

#### 20. Test Property Type Filter with Map
- [ ] Select "Villa/House" property type
- [ ] Verify map shows only villa/house properties
- [ ] Switch to "PG/Hostel"
- [ ] Verify map updates to show only PG/Hostel properties

### Add Property Flow Tests

#### 21. Test Add Property with Address Input
- [ ] Open http://localhost:3000/property/add
- [ ] Enter address: "Indiranagar, Bengaluru"
- [ ] Click "Find on Map"
- [ ] Verify loading indicator shows
- [ ] Verify map loads with marker at geocoded location
- [ ] Verify address confirmation message shows
- [ ] Adjust marker if needed
- [ ] Click "Confirm Location"
- [ ] Verify step 3 (Review) shows correct info
- [ ] Click "Add Property"
- [ ] Verify property created successfully

#### 22. Test Add Property with Manual Pin-Drop
- [ ] Open http://localhost:3000/property/add
- [ ] Enter address
- [ ] Click "Manual Pin-Drop" instead of "Find on Map"
- [ ] Verify map loads
- [ ] Click "Use Current Location"
- [ ] Drag marker to exact property location
- [ ] Verify address updates as marker moves
- [ ] Click "Confirm Location"
- [ ] Verify coordinates saved correctly

#### 23. Test Add Property - Back Navigation
- [ ] Start adding property
- [ ] Progress to step 2 (Location)
- [ ] Click "Back"
- [ ] Verify returns to step 1 with data preserved
- [ ] Change address
- [ ] Verify can proceed forward again

## Mobile Responsiveness Tests

#### 24. Test Mobile Map View
- [ ] Open site on mobile device or mobile emulator
- [ ] Test marker dragging with touch
- [ ] Verify smooth drag performance
- [ ] Test pinch-to-zoom
- [ ] Verify map controls are accessible

#### 25. Test Mobile Split View
- [ ] Open property search on mobile
- [ ] Switch to split view
- [ ] Verify layout stacks vertically (list above map)
- [ ] Verify scrolling works independently

## Error Handling Tests

#### 26. Test Network Error
- [ ] Disconnect internet
- [ ] Try to geocode an address
- [ ] Verify error message shows: "Failed to find address"
- [ ] Verify fallback to manual pin-drop is offered

#### 27. Test Invalid Address
- [ ] Enter gibberish address: "asdfghjkl zxcvbnm"
- [ ] Click "Find on Map"
- [ ] Verify error message shows
- [ ] Verify manual pin-drop option available

#### 28. Test Geolocation Denied
- [ ] Block geolocation in browser settings
- [ ] Click "Use Current Location"
- [ ] Verify error message: "Unable to get current location"
- [ ] Verify can still use map manually

#### 29. Test Property Without Coordinates
- [ ] Create property without providing coordinates
- [ ] View property details page
- [ ] Verify doesn't crash
- [ ] Verify "Location not available" message shows

## Performance Tests

#### 30. Test Geocoding Cache Performance
- [ ] Geocode "Koramangala, Bengaluru" (first time)
- [ ] Note response time (should be ~500ms)
- [ ] Geocode same address again
- [ ] Note response time (should be <50ms - from cache)

#### 31. Test Map with 50+ Properties
- [ ] Create 50+ properties with coordinates
- [ ] Load property search page
- [ ] Verify map loads within 3 seconds
- [ ] Verify markers cluster appropriately
- [ ] Test zoom in/out performance
- [ ] Verify smooth panning

#### 32. Test Large Distance Filter
- [ ] Set distance filter to 50km
- [ ] Verify query executes quickly (<1 second)
- [ ] Verify correct properties returned

## Security Tests

#### 33. Test API Key Restriction
- [ ] Verify API key is not exposed in source code
- [ ] Check Network tab for API calls
- [ ] Verify key is sent properly
- [ ] (Optional) Configure key restrictions in Google Cloud Console

#### 34. Test Authentication for Property Creation
- [ ] Try creating property without auth token
- [ ] Verify returns 401 Unauthorized
- [ ] Try updating property location without auth
- [ ] Verify returns 401 Unauthorized

## Database Tests

#### 35. Verify Geocoding Cache Table
```sql
SELECT * FROM geocoding_cache LIMIT 10;
```
- [ ] Verify table exists
- [ ] Verify cached addresses are stored
- [ ] Verify coordinates are accurate

#### 36. Verify Property Coordinates
```sql
SELECT id, address, lat, lng FROM properties WHERE lat IS NOT NULL LIMIT 10;
```
- [ ] Verify properties have coordinates
- [ ] Verify coordinates are in valid range (-90 to 90, -180 to 180)

## Integration Tests

#### 37. Test End-to-End Flow: Add Property → Search → View
1. [ ] Add new property with address "BTM Layout, Bengaluru"
2. [ ] Verify auto-geocoding works
3. [ ] Go to property search
4. [ ] Search for "BTM Layout"
5. [ ] Verify property appears in list
6. [ ] Switch to map view
7. [ ] Verify property marker appears on map
8. [ ] Click marker
9. [ ] Verify info window shows correct data
10. [ ] Click "View Details"
11. [ ] Verify navigates to property page

#### 38. Test End-to-End Flow: Filter by Distance
1. [ ] Go to property search
2. [ ] Allow geolocation
3. [ ] Select "2 km from current location"
4. [ ] Verify only nearby properties show
5. [ ] Switch to map view
6. [ ] Verify map centers on current location
7. [ ] Verify markers are only within 2km radius

## Documentation Tests

#### 39. Verify Setup Instructions
- [ ] Follow setup instructions in MAP_FEATURE_GUIDE.md
- [ ] Verify all commands work
- [ ] Verify all dependencies install correctly

#### 40. Verify API Documentation
- [ ] Test all API examples in documentation
- [ ] Verify responses match documentation
- [ ] Verify error codes match documentation

## Browser Compatibility Tests

#### 41. Test on Chrome
- [ ] All features work
- [ ] Map renders correctly
- [ ] Geolocation works

#### 42. Test on Firefox
- [ ] All features work
- [ ] Map renders correctly
- [ ] Geolocation works

#### 43. Test on Safari (macOS/iOS)
- [ ] All features work
- [ ] Map renders correctly
- [ ] Geolocation works

#### 44. Test on Edge
- [ ] All features work
- [ ] Map renders correctly
- [ ] Geolocation works

## Final Verification

#### 45. Code Quality
- [ ] No console errors in browser
- [ ] No Python errors in backend logs
- [ ] TypeScript types are correct
- [ ] No unused imports

#### 46. User Experience
- [ ] Loading states are clear
- [ ] Error messages are helpful
- [ ] Success messages appear
- [ ] Navigation is intuitive

#### 47. Documentation
- [ ] README updated
- [ ] API endpoints documented
- [ ] Setup guide complete
- [ ] Troubleshooting section added

## Test Results Summary

Total Tests: 47
- Passed: ___
- Failed: ___
- Skipped: ___

**Issues Found:**
1. 
2. 
3. 

**Notes:**
