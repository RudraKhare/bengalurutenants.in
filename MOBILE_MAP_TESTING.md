# Quick Testing Guide - Mobile Map Feature

## 🚀 How to Test

### 1. Start Development Server
```powershell
cd frontend
npm run dev
```

### 2. Open Property Search Page
Navigate to: **http://localhost:3000/property/search**

### 3. Test on Mobile View

#### **Option A: Browser DevTools (Recommended)**
1. Press `F12` to open DevTools
2. Click device toggle icon (or press `Ctrl+Shift+M`)
3. Select a mobile device (e.g., iPhone 12, Pixel 5)
4. Refresh the page

#### **Option B: Resize Browser**
1. Make browser window narrow (<768px width)
2. Refresh the page

#### **Option C: Real Mobile Device**
1. Find your computer's local IP address:
   ```powershell
   ipconfig
   # Look for IPv4 Address (e.g., 192.168.1.100)
   ```
2. On mobile device, navigate to:
   ```
   http://[YOUR_IP]:3000/property/search
   # Example: http://192.168.1.100:3000/property/search
   ```

---

## ✅ What to Check

### Floating Map Button
- [ ] **Appears** at bottom-right corner (above mobile footer)
- [ ] **Blue gradient** circular button with location pin icon
- [ ] **Shadow** and hover/active effects work
- [ ] **Only shows** when properties have GPS coordinates
- [ ] **Hidden** on desktop view (≥768px)

### Opening Map Overlay
- [ ] **Tap button** → Map overlay opens
- [ ] **Full screen** coverage
- [ ] **Blue header** with "Properties Near You" title
- [ ] **Close (×) button** visible in header
- [ ] **Info bar** shows property count
- [ ] **Map loads** and displays property markers

### Map Functionality
- [ ] **Red pin markers** appear at property locations
- [ ] **Tap marker** → Info window opens with property details
- [ ] **Pan** gesture works (drag map)
- [ ] **Zoom** controls work (pinch or +/- buttons)
- [ ] **Map type** button works (street/satellite)
- [ ] **Street view** icon works
- [ ] **Selected property** bounces on map

### Closing Map Overlay
- [ ] **Tap × button** (top-right) → Overlay closes
- [ ] **Tap "Back to List View"** (bottom) → Overlay closes
- [ ] **Returns to property listing** without reload
- [ ] **Scroll position** preserved (optional check)

### Responsive Behavior
- [ ] **Mobile (<768px)**: Floating button visible, desktop sidebar hidden
- [ ] **Desktop (≥768px)**: Floating button hidden, desktop sidebar visible
- [ ] **Works on all mobile screen sizes** (small to large phones)

---

## 🐛 Common Issues & Fixes

### Issue: Button not appearing
**Reason**: No properties with GPS coordinates  
**Fix**: Search for properties in areas with location data (e.g., Bangalore)

### Issue: Map shows empty/gray area
**Reason**: Google Maps API not loaded  
**Fix**: 
1. Check console for errors
2. Verify Google Maps API key in `.env.local`:
   ```
   NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_key_here
   ```
3. Restart dev server

### Issue: Markers not appearing
**Reason**: Properties don't have `lat` and `lng` values  
**Fix**: Use sample data or add coordinates to properties in database

### Issue: Overlay doesn't close
**Reason**: JavaScript error  
**Fix**: Check browser console for errors (F12 → Console tab)

---

## 📸 Visual Checklist

### Mobile View Layout
```
┌─────────────────────────┐
│   [Header/Search Bar]   │  ← Top navigation
├─────────────────────────┤
│                         │
│   Property Cards List   │  ← Scrollable list
│   ┌─────────────────┐   │
│   │  Property #1    │   │
│   └─────────────────┘   │
│   ┌─────────────────┐   │
│   │  Property #2    │   │
│   └─────────────────┘   │
│                         │
│              ┌────┐     │  ← Floating map button
│              │ 📍 │     │     (bottom-right)
│              └────┘     │
├─────────────────────────┤
│   [Mobile Footer Nav]   │  ← Bottom navigation
└─────────────────────────┘
```

### Map Overlay Layout (When Open)
```
┌─────────────────────────┐
│  Properties Near You  × │  ← Header with close
├─────────────────────────┤
│  15 properties with...  │  ← Info bar
├─────────────────────────┤
│                         │
│        🗺️ MAP          │  ← Full map view
│      📍 📍 📍          │     with markers
│    📍       📍         │
│                         │
├─────────────────────────┤
│  [Back to List View]    │  ← Footer button
└─────────────────────────┘
```

---

## 🎯 Quick Test Scenarios

### Scenario 1: Basic Flow
1. Open property search page on mobile
2. See floating map button (bottom-right)
3. Tap button → Map opens
4. See property markers on map
5. Tap × to close → Return to list

### Scenario 2: Marker Interaction
1. Open map overlay
2. Tap a property marker
3. Info window appears with details
4. Tap "View Property" link
5. Navigate to property detail page

### Scenario 3: Map Controls
1. Open map overlay
2. Pinch to zoom in/out
3. Drag to pan around
4. Tap map type button (satellite view)
5. Return to street view

### Scenario 4: Responsive Switch
1. Open on desktop (wide screen)
2. See sidebar map (right side)
3. No floating button visible
4. Resize to mobile width
5. Sidebar disappears
6. Floating button appears

---

## 📊 Performance Check

### What to Monitor
- **Load Time**: Map should open within 1 second
- **Smooth Animations**: Button hover and overlay transition (60 FPS)
- **No Lag**: Pan and zoom should be responsive
- **No Crashes**: No browser freezing or errors

### Browser Console
Open DevTools Console (F12) and check for:
- ✅ No red errors
- ✅ No warning about missing API key
- ⚠️ Info logs are OK (map initialization, marker creation)

---

## 💡 Pro Tips

### For Best Testing Experience
1. **Use Chrome DevTools** for mobile emulation (best accuracy)
2. **Test on real device** for touch gesture accuracy
3. **Check multiple screen sizes** (iPhone, iPad, Android phones)
4. **Test with different property counts** (5, 20, 100 properties)
5. **Test with/without GPS coordinates** in property data

### Keyboard Shortcuts (DevTools)
- `F12` - Open DevTools
- `Ctrl+Shift+M` - Toggle device emulation
- `Ctrl+Shift+C` - Inspect element
- `F5` - Refresh page
- `Ctrl+Shift+R` - Hard refresh (clear cache)

---

## ✅ Expected Results

After testing, you should observe:

### Visual
✅ Floating button appears on mobile (circular, blue, bottom-right)  
✅ Map overlay covers full screen when opened  
✅ Header has gradient blue background  
✅ Property count displayed in info bar  
✅ Map shows red pin markers at property locations  

### Functional
✅ Button opens overlay smoothly  
✅ Map is fully interactive (pan, zoom, markers)  
✅ Clicking markers shows property info  
✅ Close buttons work (× and "Back to List")  
✅ No console errors  

### Responsive
✅ Button hidden on desktop (≥768px)  
✅ Button visible on mobile (<768px)  
✅ Desktop sidebar unchanged  
✅ Works on all mobile screen sizes  

---

## 🎉 Success Criteria

**✅ Feature is working correctly if:**
- Floating button appears on mobile view
- Tapping button opens full-screen map overlay
- Map displays property markers correctly
- Users can interact with map (pan, zoom, click)
- Overlay closes cleanly via × or "Back" button
- No JavaScript errors in console
- Smooth animations and transitions
- Desktop view remains unchanged

---

## 📞 Need Help?

### Check These Files
- **Main Component**: `frontend/src/app/property/search/page.tsx`
- **Map Component**: `frontend/src/components/PropertyMap.tsx`
- **Documentation**: `MOBILE_MAP_FEATURE.md`

### Common Commands
```powershell
# Start dev server
cd frontend
npm run dev

# Check for errors
npm run build

# Clear cache and restart
Remove-Item -Recurse -Force .next
npm run dev
```

---

**Status**: Ready for Testing ✅

**Next**: Deploy to staging and gather user feedback!
