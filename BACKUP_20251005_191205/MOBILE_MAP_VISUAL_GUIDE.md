# Mobile Map Feature - Visual Guide

## 📱 Mobile View Layout

### Before Opening Map (Normal View)
```
┌───────────────────────────────────┐
│  ╔═══════════════════════════╗    │
│  ║  Header / Search Bar      ║    │ ← Fixed at top
│  ╚═══════════════════════════╝    │
├───────────────────────────────────┤
│                                   │
│  ┌─────────────────────────────┐  │
│  │  🏠 Property Card #1        │  │
│  │  Address, Rating, Reviews   │  │
│  │  [View Details]             │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  🏠 Property Card #2        │  │ ← Scrollable list
│  │  Address, Rating, Reviews   │  │
│  │  [View Details]             │  │
│  └─────────────────────────────┘  │
│                                   │
│  ┌─────────────────────────────┐  │
│  │  🏠 Property Card #3        │  │
│  │  Address, Rating, Reviews   │  │
│  │  [View Details]             │  │
│  └─────────────────────────────┘  │
│                                   │
│                        ┌────────┐ │
│                        │   📍   │ │ ← Floating
│                        │  MAP   │ │   button
│                        └────────┘ │   (NEW!)
│                                   │
├───────────────────────────────────┤
│  ╔═══════════════════════════╗   │
│  ║ 🏠  🔍  ➕  📍  👤        ║   │ ← Mobile footer
│  ╚═══════════════════════════╝   │   navigation
└───────────────────────────────────┘
```

### After Tapping Map Button (Map Overlay)
```
┌───────────────────────────────────┐
│  ╔═══════════════════════════╗   │
│  ║ Properties Near You    ✖  ║   │ ← Blue gradient
│  ╚═══════════════════════════╝   │   header
├───────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │ 📊 15 properties with       │ │ ← Info bar
│  │    location data            │ │   (light blue)
│  └─────────────────────────────┘ │
├───────────────────────────────────┤
│                                   │
│         🗺️  INTERACTIVE MAP      │
│                                   │
│    📍        📍       📍          │
│        📍         📍              │
│                        📍         │ ← Full-screen
│  📍      📍                  📍   │   map with
│             📍                    │   property
│      📍           📍         📍   │   markers
│                 📍                │
│  📍                    📍    📍   │
│          📍                       │
│                                   │
│  [+] [-] [⚙️] [🛰️] [🧭]           │ ← Map controls
│                                   │
├───────────────────────────────────┤
│  ┌─────────────────────────────┐ │
│  │   📋 Back to List View      │ │ ← Close button
│  └─────────────────────────────┘ │   (gradient blue)
└───────────────────────────────────┘
```

---

## 🖥️ Desktop View (Unchanged)

```
┌─────────────────────────────────────────────────────────────────┐
│  ╔═══════════════════════════════════════════════════════════╗  │
│  ║  Header / Navigation / Search Bar                         ║  │
│  ╚═══════════════════════════════════════════════════════════╝  │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌────────┬─────────────────────────────────┬───────────────┐  │
│  │ FILTER │      PROPERTY LISTINGS          │   MAP VIEW    │  │
│  │ PANEL  │                                 │   (STICKY)    │  │
│  │        │  ┌─────────┐  ┌─────────┐      │               │  │
│  │ Type:  │  │ Card #1 │  │ Card #2 │      │   🗺️ MAP     │  │
│  │ ○ All  │  └─────────┘  └─────────┘      │               │  │
│  │ ○ Villa│                                 │  📍 📍 📍    │  │
│  │ ○ Flat │  ┌─────────┐  ┌─────────┐      │     📍        │  │
│  │ ○ PG   │  │ Card #3 │  │ Card #4 │      │ 📍      📍   │  │
│  │        │  └─────────┘  └─────────┘      │        📍     │  │
│  │ Range: │                                 │   📍    📍   │  │
│  │ ○ 2km  │  ┌─────────┐  ┌─────────┐      │               │  │
│  │ ○ 5km  │  │ Card #5 │  │ Card #6 │      │ [Controls]    │  │
│  │ ○ 10km │  └─────────┘  └─────────┘      │               │  │
│  │        │                                 │               │  │
│  └────────┴─────────────────────────────────┴───────────────┘  │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
        ⬆                                            ⬆
    20% width          50% width              30% width (sticky)
    Filters           2-column grid            Static map sidebar
```

**Note**: No floating button on desktop - map is always visible in sidebar.

---

## 🎨 Floating Button States

### Normal State (Not Pressed)
```
    ┌──────────┐
    │          │
    │    📍    │  ← Blue gradient (500→600)
    │   MAP    │     White icon
    │          │     Shadow: medium
    └──────────┘
      56×56 px
```

### Hover State (Finger Near)
```
    ┌──────────┐
    │   ~~~~   │  ← Darker blue (600→700)
    │    📍    │     Larger shadow
    │   MAP    │     Ripple animation
    │   ~~~~   │     Icon scales 1.1x
    └──────────┘
```

### Active State (Pressed)
```
    ┌────────┐
    │   📍   │    ← Scaled down (0.95x)
    │  MAP   │       Pressed effect
    └────────┘
```

---

## 🗺️ Map Overlay Components

### Header Component
```
┌─────────────────────────────────────┐
│  📍 Properties Near You         ✖   │ ← Gradient: blue-500 → blue-600
│                                     │    Text: white, font-semibold
│                                     │    Height: 48px
└─────────────────────────────────────┘
        ⬆                        ⬆
   Location icon              Close button
   (24×24 px)                (32×32 px circle)
```

### Info Bar Component
```
┌─────────────────────────────────────┐
│  📊 15 properties with location     │ ← Background: blue-50
│     data                            │    Border-bottom: blue-100
│                                     │    Height: 40px
└─────────────────────────────────────┘
```

### Map Component
```
┌─────────────────────────────────────┐
│                                     │
│       🗺️ Google Maps View          │
│                                     │
│    📍   Property markers            │
│ 📍         (red pins)          📍   │ ← Flex: 1 (fills space)
│         📍                          │    Height: auto
│    📍            📍       📍        │    Min-height: 400px
│              📍                     │
│                                     │
│  [+] [-] [⚙️] [🛰️] [🧭]            │ ← Map controls
│                                     │    (bottom-right)
└─────────────────────────────────────┘
```

### Footer Button Component
```
┌─────────────────────────────────────┐
│  ┌───────────────────────────────┐  │
│  │  📋 Back to List View         │  │ ← Gradient: blue-500 → blue-600
│  └───────────────────────────────┘  │    Text: white, font-semibold
│                                     │    Height: 64px
└─────────────────────────────────────┘    Full width button
```

---

## 🎯 Marker Interaction Flow

### 1. Initial Map View
```
     🗺️ MAP
  
  📍    📍    📍
     📍    📍
  📍         📍
```

### 2. User Taps Marker
```
     🗺️ MAP
  
  📍    📍    📍
     💥    📍      ← Tapped marker
  📍         📍
```

### 3. Info Window Appears
```
     🗺️ MAP
  
  📍    📍    📍
     ┌──────────────┐
     │ 🏠 Address   │ ← Info window
     │ ⭐ 4.5 Stars │    with property
     │ 👥 12 Reviews│    details
     │ [View →]     │
     └──────────────┘
  📍         📍
```

### 4. User Taps "View"
```
     🗺️ MAP
  
  📍    📍    📍
     
     [Navigating to
      property page...]
  📍         📍
```

---

## 🔄 State Transitions

### State Diagram
```
     [Property List View]
              │
              │ User taps
              │ floating button
              ▼
     [Map Overlay Opening]
              │
              │ Transition
              │ (300ms)
              ▼
      [Map Overlay Open]
       │           │
       │           │
   Tap × button   Tap "Back to List"
       │           │
       └─────┬─────┘
             ▼
     [Map Overlay Closing]
              │
              │ Transition
              │ (300ms)
              ▼
     [Property List View]
```

### Code State Flow
```javascript
// Initial state
showMobileMap = false
  ↓
// User taps floating button
onClick={() => setShowMobileMap(true)}
  ↓
showMobileMap = true
  ↓
// Overlay renders and displays map
{showMobileMap && <MapOverlay />}
  ↓
// User taps close button
onClick={() => setShowMobileMap(false)}
  ↓
showMobileMap = false
  ↓
// Overlay unmounts, back to list
```

---

## 📐 Responsive Breakpoints

### Mobile View (< 768px)
```
┌─────────────────────┐
│   MOBILE VIEW       │
│                     │
│  ✅ Floating button │
│  ✅ Map overlay     │
│  ❌ Desktop sidebar │
│                     │
│  [Property List]    │
│  [Property List]    │
│  [Property List]    │
│                     │
│           ┌───┐     │
│           │📍 │     │ ← Button visible
│           └───┘     │
└─────────────────────┘
     Width < 768px
```

### Desktop View (≥ 768px)
```
┌─────────────────────────────────────┐
│        DESKTOP VIEW                 │
│                                     │
│  ❌ Floating button                 │
│  ❌ Map overlay                     │
│  ✅ Desktop sidebar                 │
│                                     │
│  ┌────────┬──────────┬───────────┐ │
│  │Filters │Properties│ Map (30%) │ │
│  │        │          │  📍 📍 📍 │ │
│  │        │          │     📍    │ │
│  └────────┴──────────┴───────────┘ │
└─────────────────────────────────────┘
          Width ≥ 768px
```

---

## 🎨 Color Palette

### Blue Gradient Colors
```
██████  blue-500  (#3B82F6)  ← Button/Header start
██████  blue-600  (#2563EB)  ← Button/Header end
██████  blue-700  (#1D4ED8)  ← Hover state
██████  blue-50   (#EFF6FF)  ← Info bar background
██████  blue-100  (#DBEAFE)  ← Info bar border
```

### Neutral Colors
```
██████  white     (#FFFFFF)  ← Text on blue, overlay bg
██████  gray-900  (#111827)  ← Dark text
██████  gray-700  (#374151)  ← Body text
██████  gray-600  (#4B5563)  ← Secondary text
██████  gray-200  (#E5E7EB)  ← Borders
██████  gray-100  (#F3F4F6)  ← Light backgrounds
```

### Map Marker Colors
```
██████  red-500   (#EF4444)  ← Property pin (fill)
██████  white     (#FFFFFF)  ← Pin center dot
██████  white     (#FFFFFF)  ← Pin stroke (2px)
```

---

## 📏 Spacing & Sizing

### Button Dimensions
```
Floating Button:
├─ Width:  56px (w-14)
├─ Height: 56px (h-14)
├─ Bottom: 96px (bottom-24)
├─ Right:  16px (right-4)
├─ Z-Index: 40
└─ Icon:   28px × 28px (w-7 h-7)
```

### Overlay Sections
```
Map Overlay:
├─ Header:  48px height (py-3)
├─ Info:    40px height (py-2)
├─ Map:     Flex-1 (auto height)
└─ Footer:  64px height (py-3)
```

### Padding & Margins
```
Header/Footer: px-4 py-3  (16px × 12px)
Info Bar:      px-4 py-2  (16px × 8px)
Button:        No padding (icon centered)
Cards:         p-3 sm:p-4 (responsive)
```

---

## ⚡ Animation Timing

### Transitions
```
Button Hover:    200ms ease-in-out
Button Active:   150ms ease-out
Overlay Open:    300ms ease-out
Overlay Close:   300ms ease-in
Ripple Effect:   800ms infinite
```

### Animation Keyframes
```
Ripple Animation:
0%   → opacity: 0, scale: 1
100% → opacity: 0.2, scale: 2

Button Scale (Active):
Normal → scale(0.95)
Release → scale(1)
```

---

## 📊 Z-Index Layers

```
Layer 50:  Map Overlay        ← Highest (covers everything)
Layer 40:  Floating Button    ← Above content
Layer 30:  Mobile Header      ← Fixed header
Layer 20:  Mobile Footer      ← Fixed footer
Layer 10:  Modals/Dropdowns   ← Dropdown menus
Layer 0:   Page Content       ← Normal flow
```

---

## 🔍 Interactive Elements

### Clickable Areas
```
1. Floating Button:
   ┌────────┐
   │        │  ← Tap to open map
   │   📍   │     (entire button)
   │        │
   └────────┘

2. Close Button (×):
   ┌──┐
   │✖ │  ← Tap to close
   └──┘

3. Property Marker:
   📍  ← Tap to show info

4. Info Window:
   ┌──────────┐
   │ Property │
   │ Details  │
   │ [View →] │  ← Tap to navigate
   └──────────┘

5. Footer Button:
   ┌─────────────────┐
   │ Back to List    │  ← Tap to close
   └─────────────────┘
```

---

## 📱 Touch Gestures

### Map Interactions
```
Pan:      👆 Drag finger to move map
Zoom In:  👆👆 Pinch outward
Zoom Out: 👆👆 Pinch inward
Rotate:   👆👆 Two-finger rotate
Tap:      👆 Single tap on marker
```

### Button Interactions
```
Tap:      👆 Quick tap to activate
Hold:     👆 Long press (no action)
Swipe:    👆 Not supported
```

---

## 🎯 Component Hierarchy

```
PropertySearchPage (Root)
│
├─ Header / Search Section
│  └─ SearchInput
│
├─ Mobile View (< 768px)
│  ├─ Property List
│  │  └─ PropertyCard (×N)
│  │
│  ├─ Floating Button ◄── NEW!
│  │  └─ Map Icon
│  │
│  └─ Map Overlay (conditional) ◄── NEW!
│     ├─ Header
│     │  ├─ Title
│     │  └─ Close Button
│     ├─ Info Bar
│     ├─ PropertyMap
│     │  └─ Google Maps
│     │     ├─ Markers (×N)
│     │     └─ Info Windows
│     └─ Footer Button
│
└─ Desktop View (≥ 768px)
   ├─ Filters Sidebar (20%)
   ├─ Property Grid (50%)
   │  └─ PropertyCard (×N)
   └─ Map Sidebar (30%)
      └─ PropertyMap (sticky)
```

---

## ✅ Visual Checklist

Use this to verify the implementation:

### Floating Button
- [ ] Circular shape (perfect circle)
- [ ] Blue gradient background (lighter to darker)
- [ ] White location pin icon (centered)
- [ ] Drop shadow visible
- [ ] Fixed position (bottom-right)
- [ ] Above mobile footer (not overlapping)
- [ ] Hover effect (darker blue)
- [ ] Active effect (scales down)
- [ ] Hidden on desktop

### Map Overlay
- [ ] Covers full screen
- [ ] Blue gradient header
- [ ] "Properties Near You" title
- [ ] Close (×) button visible and white
- [ ] Info bar below header (light blue)
- [ ] Property count displayed
- [ ] Map fills middle section
- [ ] Map controls visible (bottom-right of map)
- [ ] Footer button visible (gradient blue)
- [ ] "Back to List View" text centered

### Map Functionality
- [ ] Red pin markers appear
- [ ] Markers at correct locations
- [ ] Pan gesture works
- [ ] Zoom gesture works
- [ ] Tap marker shows info window
- [ ] Info window shows property details
- [ ] "View Property" link works
- [ ] Map type button works
- [ ] Street view button works

---

**This visual guide complements the technical documentation.**

For code details, see: `MOBILE_MAP_FEATURE.md`  
For testing, see: `MOBILE_MAP_TESTING.md`  
For overview, see: `MOBILE_MAP_SUMMARY.md`
