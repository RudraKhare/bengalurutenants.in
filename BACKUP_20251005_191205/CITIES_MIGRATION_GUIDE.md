# Cities and Localities Database Migration

This guide walks you through migrating from hardcoded city/locality data to database-driven data.

## Overview

We're moving from:
- Hardcoded data in `frontend/src/lib/localities.ts`
- Static imports in components

To:
- Database tables (`cities`, `localities`)
- Dynamic API endpoints
- Frontend fetches data via API

## Benefits

✅ Scalable: Add 100+ cities without code changes  
✅ Dynamic: Update localities without redeploying  
✅ Performant: Server-side filtering and search  
✅ Maintainable: Single source of truth in database  
✅ Fuzzy search: Still works on frontend with fetched data  

## Migration Steps

### 1. Database Migration

Run the SQL migration in your Supabase SQL editor:

```bash
# Copy the contents of migration_cities_localities.sql
# Paste into Supabase SQL Editor
# Execute the query
```

Or use the file directly:
```sql
-- See: migration_cities_localities.sql
```

### 2. Seed the Database

Run the seed script to populate cities and localities:

```bash
cd backend
python -m app.seed_cities
```

This will add:
- 7 major cities (Bengaluru, Mumbai, Delhi, Chennai, Hyderabad, Kolkata, Pune)
- 50+ localities per city
- Properly linked relationships
- Popular locality flags for the top 20 in each city

### 3. Start Backend Server

Make sure your FastAPI backend is running:

```bash
cd backend
# Activate virtual environment first
.\venv\Scripts\activate  # Windows
source venv/bin/activate  # Linux/Mac

# Start server
python -m uvicorn app.main:app --reload
```

### 4. Test API Endpoints

Test the new endpoints:

```bash
# Get all cities
curl http://localhost:8000/api/cities

# Get localities for Bengaluru
curl http://localhost:8000/api/cities/Bengaluru/localities

# Search localities
curl "http://localhost:8000/api/cities/Bengaluru/localities?search=koramangala"
```

### 5. Test Frontend

```bash
cd frontend
npm run dev
```

Visit http://localhost:3000 and test:
- City dropdown (should load from API)
- Locality suggestions (should load from API and use fuzzy search)
- Search functionality

## API Endpoints

### GET /api/cities
Returns all active cities.

**Response:**
```json
[
  {
    "id": 1,
    "name": "Bengaluru",
    "state": "Karnataka",
    "country": "India",
    "lat": 12.9716,
    "lng": 77.5946
  }
]
```

### GET /api/cities/{city_name}/localities
Returns localities for a specific city.

**Query Parameters:**
- `search` (optional): Filter localities by name
- `popular_only` (optional): Show only popular localities
- `limit` (optional): Limit number of results

**Response:**
```json
[
  {
    "id": 1,
    "name": "Koramangala",
    "city_id": 1,
    "region": "East Bengaluru",
    "is_popular": true
  }
]
```

### GET /api/cities/all-with-localities
Returns all cities with their localities in a single request (useful for initial load).

## Adding More Cities

### Option 1: Using the Seed Script (Recommended for bulk)

1. Edit `backend/app/seed_cities.py`
2. Add your cities to the `CITIES_DATA` dictionary:

```python
CITIES_DATA = {
    # ... existing cities ...
    "YourCity": {
        "state": "YourState",
        "lat": 12.34,
        "lng": 56.78,
        "localities": [
            "Locality 1",
            "Locality 2",
            # ... up to 50+ localities
        ]
    }
}
```

3. Clear existing data and reseed:
```sql
-- In Supabase SQL Editor
DELETE FROM localities;
DELETE FROM cities;
```

4. Run seed script:
```bash
python -m app.seed_cities
```

### Option 2: Direct Database Insert (For individual cities)

```sql
-- Add a city
INSERT INTO cities (name, state, country, lat, lng, is_active)
VALUES ('Jaipur', 'Rajasthan', 'India', 26.9124, 75.7873, TRUE);

-- Get the city ID
SELECT id FROM cities WHERE name = 'Jaipur';

-- Add localities (replace <city_id> with actual ID)
INSERT INTO localities (name, city_id, is_popular, is_active)
VALUES 
    ('Malviya Nagar', <city_id>, TRUE, TRUE),
    ('Vaishali Nagar', <city_id>, TRUE, TRUE),
    ('C Scheme', <city_id>, TRUE, TRUE);
    -- ... add more localities
```

### Option 3: Using Admin API (Future Enhancement)

Create an admin endpoint to add cities/localities via API calls.

## Fuzzy Search

Fuzzy search still works! The frontend:
1. Fetches all localities for the selected city
2. Stores them in state
3. Uses `getFuzzyLocalitySuggestions()` function on the fetched data
4. Shows filtered results as user types

This gives the best of both worlds:
- Database scalability
- Fast, client-side fuzzy matching

## Troubleshooting

### Cities not loading in dropdown

Check:
1. Backend server is running
2. Database tables exist: `SELECT * FROM cities;`
3. Browser console for errors
4. Network tab for failed API calls

### Localities not showing

Check:
1. Selected city exists in database
2. Localities are linked to correct city_id
3. `is_active` flag is `TRUE`
4. API endpoint returns data: `curl http://localhost:8000/api/cities/Bengaluru/localities`

### Fuzzy search not working

Check:
1. `getFuzzyLocalitySuggestions()` function exists in `frontend/src/lib/fuzzyLocality.ts`
2. Fuse.js is installed: `npm list fuse.js`
3. Localities are loaded in component state before searching

## Rollback

If you need to rollback to hardcoded data:

1. Revert frontend changes:
```bash
git checkout main -- frontend/src/components/search/SearchInput.tsx
git checkout main -- frontend/src/app/review/add/page.tsx
```

2. Keep database tables (they won't interfere with hardcoded data)

## Next Steps

- [ ] Add admin panel for managing cities/localities
- [ ] Add city/locality search endpoint with better performance
- [ ] Cache localities on frontend to reduce API calls
- [ ] Add support for 100+ cities
- [ ] Add region/zone grouping for better organization
- [ ] Add popularity metrics based on property count

## Files Changed

### Backend
- ✅ `backend/app/models.py` - Added City and Locality models
- ✅ `backend/app/routers/cities.py` - New API endpoints
- ✅ `backend/app/main.py` - Registered cities router
- ✅ `backend/app/seed_cities.py` - Database seed script

### Frontend
- ✅ `frontend/src/lib/api.ts` - Added Cities API endpoints
- ✅ `frontend/src/components/search/SearchInput.tsx` - Fetch from API
- ✅ `frontend/src/app/review/add/page.tsx` - Fetch from API

### Database
- ✅ `migration_cities_localities.sql` - Database schema

## Support

If you encounter issues:
1. Check backend logs for errors
2. Verify database connection
3. Test API endpoints directly with curl/Postman
4. Check browser console for frontend errors

---

**Migration Date:** October 3, 2025  
**Status:** ✅ Complete and Ready to Use
