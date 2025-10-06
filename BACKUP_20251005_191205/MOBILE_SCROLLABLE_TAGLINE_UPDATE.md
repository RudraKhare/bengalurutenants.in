# Mobile Layout Update - Fixed Header with Scrollable Tagline

This document outlines the changes made to the mobile layout to implement a fixed header with a scrollable tagline section using the amber gradient from the reference image.

## Key Changes

### 1. Header Structure
- The header remains fixed at the top with glassmorphism effect
- Applied amber gradient: `bg-gradient-to-br from-amber-50 via-amber-100 to-amber-200`
- Hamburger menu positioned on the left side
- Logo "OpenReviews.in" centered
- Height maintained at 52px (py-3)

### 2. Tagline Placement
- **Moved the tagline out of the fixed navigation component**
- Tagline now placed at the top of the scrollable content area
- Added proper padding to account for the fixed header: `pt-[52px]`
- Text remains centered, bold, and clearly visible

### 3. Gradient Implementation
- Updated gradient to match the amber tones from the reference image
- Applied to both the header (with glassmorphism) and the scrollable content
- Gradient extends from tagline through search section and buttons
- Smooth transition to the white "Recent Reviews" section

### 4. Responsive Adjustments
- Maintained full width layout on mobile devices
- All changes wrapped in `md:hidden` to apply only to mobile screens
- Proper z-indexing to ensure elements display correctly
- Maintained existing border and shadow styling for depth

## Visual Layout

```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════╗   │ ← Fixed Header (z-50)
│ ║ ☰ Menu    OpenReviews.in      ║   │   Glassmorphism + Amber Gradient
│ ╚═══════════════════════════════╝   │   Height: 52px
├─────────────────────────────────────┤
│                                     │ ← Scrollable Content Begins
│ The landlord won't tell you.        │ ← Tagline Section
│ But we will.                        │   Part of Amber Gradient
├─────────────────────────────────────┤
│ ┌──────────────────┐ [🔍] [Near Me]│ ← Search Section
│ │ Search By City   │                │   Within Amber Gradient
│ └──────────────────┘                │   
│ [  Add Review  ] [ Explore All  ]   │   Action Buttons
├─────────────────────────────────────┤
│ ╭─────────────────────────────────╮ │ ← Recent Reviews (rounded top)
│ │ Recent Reviews        View All →│ │   White Background
│ │ [Review Cards...]               │ │   Begins where gradient ends
│ ╰─────────────────────────────────╯ │
└─────────────────────────────────────┘
```

## Technical Implementation

1. **MobileNavigation.tsx**:
   - Removed the tagline section
   - Updated header gradient to amber tones
   - Maintained existing layout structure

2. **MobileHomeView.tsx**:
   - Added tagline section at the top of scrollable content
   - Updated padding to account for fixed header only
   - Applied amber gradient to background
   - Maintained rounded transition to "Recent Reviews" section

3. **globals.css**:
   - Updated glassmorphism styles for amber gradient
   - Added new amber-gradient utility class
   - Maintained existing responsive styles

## Reference

The changes follow the gradient colors visible in the reference image, using an amber color palette that transitions from light (amber-50) to slightly darker (amber-200), creating a warm and inviting appearance.
