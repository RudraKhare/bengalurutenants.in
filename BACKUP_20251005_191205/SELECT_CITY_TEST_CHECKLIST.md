# 🧪 Select City Button - Testing Checklist

## Quick Test Guide

Use this checklist to verify the Select City button fix is working correctly on mobile.

---

## 🚀 Setup

1. **Start Development Server:**
   ```powershell
   cd frontend
   npm run dev
   ```

2. **Open Property Search Page:**
   ```
   http://localhost:3000/property/search
   ```

3. **Enable Mobile View:**
   - Open Chrome DevTools (F12)
   - Toggle Device Toolbar (Ctrl+Shift+M)
   - Select "iPhone 12 Pro" or similar

---

## ✅ Visual Inspection Checklist

### Button Appearance:
- [ ] Red location pin icon is visible (📍)
- [ ] City name "Bengaluru" is bold
- [ ] Button has 2px border (looks prominent)
- [ ] Button spans full width of screen
- [ ] Chevron arrow (▼) is visible
- [ ] Button height is comfortable for tapping (~48px)
- [ ] No text is cut off or truncated

### Button Position:
- [ ] Button is at top of search form
- [ ] Button is fully visible (not hidden behind anything)
- [ ] There's clear space below button (no overlap with search input)
- [ ] Button doesn't overlap with "Search" or "Nearby" buttons

### Hover Effects (Desktop/Tablet):
- [ ] Hovering changes border to red
- [ ] Shadow increases on hover
- [ ] Transition is smooth (not instant)
- [ ] Icon color stays red on hover

---

## 🎯 Interaction Testing

### Opening Dropdown:
- [ ] Tap/click button opens dropdown menu
- [ ] Chevron rotates from ▼ to ▲ when opened
- [ ] Dropdown appears below button (not behind it)
- [ ] Dropdown spans full width on mobile
- [ ] Search box appears at top of dropdown
- [ ] List of cities is visible

### Dropdown Content:
- [ ] City names are readable
- [ ] Current city (Bengaluru) is highlighted/marked
- [ ] Hovering/tapping city item shows red background
- [ ] City names are bold/prominent
- [ ] Scrolling works if many cities

### Closing Dropdown:
- [ ] Selecting a city closes dropdown
- [ ] Clicking outside dropdown closes it
- [ ] Chevron rotates back to ▼ when closed
- [ ] Button returns to normal state

### Search Filter:
- [ ] Typing in search box filters cities
- [ ] Partial matches work (e.g., "mum" shows "Mumbai")
- [ ] Clearing search shows all cities again
- [ ] Focus ring appears on search input (red)

---

## 📐 Layout Testing

### Mobile Portrait (320px - 767px):
- [ ] City button is full width
- [ ] Search input is full width
- [ ] Action buttons are full width
- [ ] Elements stack vertically
- [ ] Spacing between elements is consistent
- [ ] No horizontal scrolling

### Tablet (768px - 1023px):
- [ ] City button transitions to horizontal layout
- [ ] City button has minimum width (180px)
- [ ] Search input takes remaining space
- [ ] Action buttons align to right
- [ ] Elements fit without wrapping

### Desktop (1024px+):
- [ ] City button sized appropriately (~200px)
- [ ] All elements in single row
- [ ] Proper spacing between elements
- [ ] Dropdown doesn't extend off-screen

---

## 🔍 Z-Index Testing

### Dropdown Layer Testing:
- [ ] City dropdown appears above search input
- [ ] City dropdown appears above action buttons
- [ ] City dropdown appears above "Nearby" button
- [ ] "Nearby" dropdown (if opened) doesn't hide city dropdown
- [ ] No element covers the city dropdown menu

### Button Priority:
- [ ] City button is tappable (not blocked)
- [ ] Search input doesn't cover city button
- [ ] "Search" button doesn't cover city button
- [ ] "Nearby" button doesn't cover city button

---

## 🎨 Theme Consistency

### Red Color Verification:
- [ ] Location icon is red (#EF4444)
- [ ] Hover border is red (#F87171)
- [ ] Dropdown item hover is light red (#FEF2F2)
- [ ] Focus ring is red (#EF4444)
- [ ] Colors match "Search" button
- [ ] Colors match "Nearby" button

### Design Consistency:
- [ ] Button style matches other buttons
- [ ] Border thickness matches input fields
- [ ] Shadow depth is appropriate
- [ ] Rounded corners match design
- [ ] Font sizes are consistent

---

## 🎭 Edge Cases

### Long City Names:
- [ ] Change city to one with long name
- [ ] Name doesn't overflow button
- [ ] Truncation works properly (shows "...")
- [ ] Tooltip shows full name (if applicable)

### Many Cities:
- [ ] Dropdown scrolls smoothly
- [ ] Scroll position resets when reopened
- [ ] Selected city is visible in list
- [ ] Performance is good (no lag)

### Rapid Interactions:
- [ ] Rapid open/close doesn't break UI
- [ ] Multiple city selections work correctly
- [ ] Animations don't stack/conflict
- [ ] State updates correctly each time

### Search Edge Cases:
- [ ] Searching for non-existent city shows "No cities found"
- [ ] Special characters work in search
- [ ] Empty search shows all cities
- [ ] Case-insensitive search works

---

## 📱 Device Testing

### iOS (Safari):
- [ ] Button renders correctly
- [ ] Tap target is large enough
- [ ] Dropdown opens smoothly
- [ ] Scrolling works properly
- [ ] No visual glitches

### Android (Chrome):
- [ ] Button renders correctly
- [ ] Tap target is large enough
- [ ] Dropdown opens smoothly
- [ ] Scrolling works properly
- [ ] No visual glitches

### Tablet (iPad):
- [ ] Horizontal layout works
- [ ] Touch interactions smooth
- [ ] Dropdown sized appropriately
- [ ] No layout breaking

---

## 🔄 Orientation Testing

### Portrait to Landscape:
- [ ] Layout adapts correctly
- [ ] Button remains visible
- [ ] No elements disappear
- [ ] Dropdown repositions properly

### Landscape to Portrait:
- [ ] Layout adapts back correctly
- [ ] Full-width mode activates
- [ ] Vertical stacking works
- [ ] No visual artifacts

---

## 🚨 Error Scenarios

### Network Issues:
- [ ] Cities don't load → shows loading state
- [ ] API error → shows error message
- [ ] Retry button appears (if applicable)
- [ ] Button remains functional

### Empty States:
- [ ] No cities available → shows message
- [ ] Button still clickable
- [ ] Dropdown opens with message
- [ ] No console errors

---

## ⚡ Performance Checks

### Rendering:
- [ ] Button appears immediately on page load
- [ ] No layout shift when button loads
- [ ] Dropdown opens within 100ms
- [ ] Animations are smooth (60fps)

### Memory:
- [ ] No memory leaks on repeated open/close
- [ ] Dropdown cleans up properly when closed
- [ ] Event listeners removed when unmounted

---

## 🐛 Regression Testing

### Existing Features:
- [ ] Search input still works
- [ ] "Search" button still works
- [ ] "Nearby" button still works
- [ ] Property type filters still work
- [ ] Property list still loads
- [ ] Desktop sidebar map still works (if on desktop)

### Other Pages:
- [ ] Homepage search still works
- [ ] Other pages with SearchInput still work
- [ ] No breaking changes elsewhere

---

## 📸 Screenshot Comparison

### Take Screenshots:
- [ ] Mobile portrait (before fix) - if available
- [ ] Mobile portrait (after fix)
- [ ] Mobile landscape (after fix)
- [ ] Tablet view (after fix)
- [ ] Desktop view (after fix)

### Verify:
- [ ] Button more prominent in "after" shots
- [ ] No visual regressions
- [ ] Consistent across devices

---

## ✅ Final Acceptance

### Must Pass All:
- [ ] ✅ Button is fully visible on mobile
- [ ] ✅ No overlap with other elements
- [ ] ✅ Dropdown appears above everything
- [ ] ✅ Red theme applied consistently
- [ ] ✅ Hover/focus effects work
- [ ] ✅ Responsive across all breakpoints
- [ ] ✅ No TypeScript errors
- [ ] ✅ No console errors
- [ ] ✅ Smooth animations
- [ ] ✅ Accessible (keyboard navigation)

---

## 🎉 Sign-Off

### Testing Completed By:
- **Name**: _________________
- **Date**: _________________
- **Environment**: _________________

### Test Results:
- **Total Tests**: ___ / ___
- **Passed**: ___
- **Failed**: ___
- **Blocked**: ___

### Overall Status:
- [ ] ✅ **PASS** - Ready for production
- [ ] ⚠️ **PASS WITH NOTES** - Minor issues noted
- [ ] ❌ **FAIL** - Needs fixes

### Notes:
```
_________________________________________
_________________________________________
_________________________________________
```

---

## 📞 Issue Reporting

### If Test Fails:

1. **Note Test Case Number**: ___________
2. **Describe Issue**: 
   ```
   _________________________________________
   _________________________________________
   ```
3. **Screenshot**: Attached? [ ]
4. **Console Errors**: Present? [ ]
5. **Reproduction Steps**:
   ```
   1. _____________________________________
   2. _____________________________________
   3. _____________________________________
   ```

---

## 🔗 Related Documentation

- **Technical Details**: `SELECT_CITY_MOBILE_FIX.md`
- **Quick Reference**: `SELECT_CITY_FIX_QUICK_REF.md`
- **Summary**: `SELECT_CITY_FIX_SUMMARY.md`
- **Visual Guide**: `SELECT_CITY_VISUAL_GUIDE.md`

---

**Testing Version**: 1.0  
**Last Updated**: June 2024  
**Status**: Ready for QA ✅
