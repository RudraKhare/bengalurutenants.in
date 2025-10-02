# 🔄 Google Maps Migration - Quick Reference

## What Changed?

**OLD (Deprecated):**
```tsx
import { Loader } from '@googlemaps/js-api-loader';

const loader = new Loader({
  apiKey: 'YOUR_KEY',
  libraries: ['places']
});

loader.load().then(() => {
  const map = new google.maps.Map(element, options);
  const marker = new google.maps.Marker(markerOptions);
  marker.setPosition(position);
});
```

**NEW (Current):**
```tsx
// 1. Add script to layout.tsx:
<Script
  src="https://maps.googleapis.com/maps/api/js?key=YOUR_KEY&libraries=places,marker"
  strategy="beforeInteractive"
/>

// 2. In component:
const { Map } = await google.maps.importLibrary("maps");
const { Marker } = await google.maps.importLibrary("marker");

const map = new Map(element, { ...options, mapId: 'map-id' });
const marker = new Marker(markerOptions);
marker.position = position; // Direct property access
```

## API Differences

| Task | Old API | New API |
|------|---------|---------|
| **Load API** | `new Loader().load()` | `<Script>` in layout |
| **Import Map** | `new google.maps.Map()` | `await importLibrary("maps")` |
| **Import Marker** | `new google.maps.Marker()` | `await importLibrary("marker")` |
| **Set Position** | `marker.setPosition(pos)` | `marker.position = pos` |
| **Get Position** | `marker.getPosition()` | `marker.position` |
| **Map ID** | Optional | Recommended |

## Files Updated ✅

- ✅ `frontend/src/app/layout.tsx` - Added `<Script>` tag
- ✅ `frontend/src/components/PropertyMap.tsx` - New API
- ✅ `frontend/src/components/MapPicker.tsx` - New API
- ✅ `frontend/src/lib/googleMaps.ts` - Helper functions

## Quick Test

```powershell
# Start frontend
cd frontend
npm run dev

# Visit: http://localhost:3000/property/search
# Should see map without errors
```

## Common Issues & Solutions

### "google is not defined"
**Solution**: Wait for script to load in `useEffect`:
```tsx
useEffect(() => {
  const initMap = async () => {
    if (!window.google) return; // Wait for load
    // ... rest of code
  };
  initMap();
}, []);
```

### "importLibrary is not a function"
**Solution**: Check that `<Script>` tag is in `layout.tsx` with `strategy="beforeInteractive"`

### TypeScript errors
**Solution**: Cast library imports:
```tsx
const { Map } = await google.maps.importLibrary("maps") as google.maps.MapsLibrary;
```

## Resources

- 📖 [New API Docs](https://developers.google.com/maps/documentation/javascript/load-maps-js-api)
- 🔧 [Migration Guide](https://github.com/googlemaps/js-api-loader/blob/main/README.md)
- 💡 [Best Practices](https://developers.google.com/maps/documentation/javascript/best-practices)

---

**Status**: ✅ FIXED - All components migrated to new API
