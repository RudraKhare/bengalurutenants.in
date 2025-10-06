# Mobile UI - Quick Reference

## 🎯 Key Points

### What Was Done
✅ Created complete mobile-specific UI layout (screens < 768px)  
✅ Red banner header with "OpenReviews.in" logo + hamburger menu  
✅ Tagline: "The landlord won't tell you. But we will."  
✅ Search bar with "Search By City" + red button + "Near Me"  
✅ Two action buttons: "Add Review" and "Explore All"  
✅ "Recent Reviews" section with "View All →"  
✅ Mobile review cards: image left, details right  
✅ Bottom navigation: Home, Search, Explore, Profile icons  
✅ Desktop UI completely unchanged (hidden on mobile)  

### Files Created
1. `frontend/src/components/MobileNavigation.tsx` - Header + Bottom Nav
2. `frontend/src/components/MobileHomeView.tsx` - Mobile Home Layout

### Files Modified
1. `frontend/src/app/layout.tsx` - Conditional nav rendering
2. `frontend/src/app/page.tsx` - Mobile/desktop view split
3. `frontend/src/components/index.ts` - Export mobile components
4. `frontend/src/app/globals.css` - Mobile-specific styles

## 🚀 How to Test

### Desktop (>= 768px)
- Should see original desktop layout
- Glass header, animated background, grid layout
- Footer visible at bottom

### Mobile (< 768px)
- Should see new mobile layout
- Red header with hamburger menu
- Bottom navigation bar
- Compact review cards
- No footer (hidden)

### Testing Commands
```bash
# Start frontend
cd frontend
npm run dev

# Open in browser
http://localhost:3000

# Test mobile view
# Chrome DevTools: F12 → Toggle Device Toolbar (Ctrl+Shift+M)
# Select: iPhone SE, Pixel 5, or Custom (375px width)
```

## 📱 Breakpoint Logic

```typescript
// Mobile View (< 768px)
<div className="md:hidden">
  <MobileHomeView />
</div>

// Desktop View (>= 768px)
<div className="hidden md:block">
  <DesktopHomeView />
</div>
```

## 🎨 Color Scheme

- **Primary Red**: `bg-red-600` (#DC2626)
- **Hover Red**: `bg-red-700` (#B91C1C)
- **Active Red**: `text-red-600`
- **White**: `bg-white`
- **Gray Text**: `text-gray-600`, `text-gray-700`

## 🔧 Quick Fixes

### Issue: Mobile not showing
```bash
# Clear cache and hard refresh
Ctrl + Shift + R (Windows/Linux)
Cmd + Shift + R (Mac)
```

### Issue: Desktop nav on mobile
```typescript
// Check: Should have "hidden md:block"
<div className="hidden md:block">
  <Navigation />
</div>
```

### Issue: Mobile nav on desktop
```typescript
// Check: Should have "md:hidden"
<div className="md:hidden">
  <MobileNavigation />
</div>
```

## 📦 Component Structure

```
MobileNavigation
├── Header (Fixed Top)
│   ├── Logo: "OpenReviews.in"
│   └── Hamburger Menu
└── Bottom Nav (Fixed Bottom)
    ├── Home Icon
    ├── Search Icon
    ├── Explore Icon
    └── Profile Icon

MobileHomeView
├── Tagline Section
├── Search Section
│   ├── City Input
│   ├── Search Button (Red)
│   └── Near Me Button
├── Action Buttons
│   ├── Add Review (Red)
│   └── Explore All (Red)
└── Recent Reviews
    ├── Section Header
    └── Review Cards
        ├── Image (Left)
        └── Details (Right)
            ├── Address
            ├── Area/City
            ├── Review Text
            ├── Date
            └── Stars
```

## ✨ Features

### Navigation
- ✅ Hamburger menu slides down
- ✅ Auto-closes on link click
- ✅ Bottom nav highlights active page
- ✅ All links working

### Search
- ✅ City search redirects to `/property/search?city=X`
- ✅ Near Me uses geolocation
- ✅ Error handling for location permission

### Reviews
- ✅ Fetches from API
- ✅ Displays 6 recent reviews
- ✅ Images from R2 storage
- ✅ Fallback for missing images
- ✅ Star ratings displayed
- ✅ Time ago format
- ✅ Click to view property details

## 🔍 Debugging

### Check if mobile view is active
```javascript
// Open browser console (F12)
console.log(window.innerWidth);
// Should be < 768 for mobile

// Check computed styles
document.querySelector('.md\\:hidden').style.display;
// Should be "block" on mobile
```

### Verify API calls
```javascript
// Open Network tab in DevTools
// Look for:
// GET /api/v1/reviews/?skip=0&limit=6
// GET /api/v1/uploads/view/{key}
```

## 📝 Customization

### Change Primary Color
Find and replace in `MobileNavigation.tsx` and `MobileHomeView.tsx`:
- `bg-red-600` → `bg-blue-600`
- `hover:bg-red-700` → `hover:bg-blue-700`
- `text-red-600` → `text-blue-600`

### Change Breakpoint
Replace throughout:
- `md:hidden` → `lg:hidden` (mobile up to 1024px)
- `hidden md:block` → `hidden lg:block`

### Adjust Review Card Limit
In `page.tsx`:
```typescript
limit: '6'  →  limit: '10'  // Show more reviews
```

## ✅ Checklist

Before deploying:
- [ ] Test on iPhone SE (375px)
- [ ] Test on Pixel 5 (393px)
- [ ] Test on iPad (768px - should show desktop)
- [ ] Verify all links work
- [ ] Check images load
- [ ] Test search functionality
- [ ] Test Near Me geolocation
- [ ] Verify no horizontal scroll
- [ ] Check bottom nav doesn't overlap content
- [ ] Confirm desktop unchanged

## 🆘 Emergency Rollback

If issues arise, comment out in `layout.tsx`:
```typescript
// Temporarily disable mobile nav
{/* <MobileNavigation /> */}
```

And in `page.tsx`:
```typescript
// Temporarily disable mobile view
{/* <div className="md:hidden">
  <MobileHomeView ... />
</div> */}
```

Desktop layout will continue working normally.

---

**Status**: ✅ Implementation Complete  
**Last Updated**: December 2024  
**Documentation**: See `MOBILE_UI_IMPLEMENTATION.md` for full details
