# Mobile UI Gradient & Glassmorphism Implementation

This document outlines the implementation of the mobile header with glassmorphism effect and gradient background extending to the Recent Reviews section.

## Overview of Changes

### 1. Header with Glassmorphism Effect

- Implemented a fixed header with transparent frosted glass effect
- Used the same gray gradient as the web version: `from-gray-200 via-gray-300 to-gray-400`
- Applied backdrop blur via `.glass-header` CSS class
- Centered logo "OpenReviews.in" and moved hamburger menu to the left side
- Set `z-index: 50` to ensure header stays on top

### 2. Tagline Section

- Positioned directly below the fixed header (52px from top)
- Used the same gradient background as the header
- Applied glassmorphism effect via `.glass-gradient` CSS class
- Centered the tagline text: "The landlord won't tell you. But we will."
- Made text **bold** and properly sized for visibility

### 3. Gradient Background Extension

- Created a gradient background that extends from below the tagline section
- Applied the same gray gradient: `from-gray-200 via-gray-300 to-gray-400`
- Positioned search section and action buttons within this gradient area
- Added semi-transparent background to input fields for better contrast
- Created a smooth transition to white with rounded corners where Recent Reviews section begins

### 4. Recent Reviews Section

- Added a white background with rounded top corners (`rounded-t-3xl`)
- Slight shadow to create depth and separation from the gradient area
- Used a negative margin `-mt-4` to create a smooth overlap with the gradient section
- Ensured full width with proper padding

### 5. CSS Enhancements

Added these CSS classes to `globals.css`:

```css
/* Glassmorphism effects */
.glass-header {
  background: rgba(255, 255, 255, 0.7);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.2);
}

.glass-gradient {
  background: linear-gradient(
    to bottom right,
    rgba(229, 231, 235, 0.8),  /* from-gray-200/80 */
    rgba(209, 213, 219, 0.8),  /* via-gray-300/80 */
    rgba(156, 163, 175, 0.8)   /* to-gray-400/80 */
  );
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}
```

## Layout Structure

```
┌─────────────────────────────────────┐
│ ╔═══════════════════════════════╗   │ ← Fixed Header (z-50)
│ ║ ☰ Menu    OpenReviews.in      ║   │   Glassmorphism Effect
│ ╚═══════════════════════════════╝   │   Height: 52px
├─────────────────────────────────────┤
│ ╔═══════════════════════════════╗   │ ← Fixed Tagline (z-40)
│ ║ The landlord won't tell you.  ║   │   Same Glassmorphism Effect
│ ║ But we will.                  ║   │   Height: 48px
│ ╚═══════════════════════════════╝   │
├─────────────────────────────────────┤
│                                     │
│ ┌──────────────────┐ [🔍] [Near Me]│ ← Search Section
│ │ Search By City   │                │   Within Gradient Background
│ └──────────────────┘                │
│                                     │
│ [  Add Review  ] [ Explore All  ]   │ ← Action Buttons
│                                     │   Within Gradient Background
├─────────────────────────────────────┤
│ ╭─────────────────────────────────╮ │ ← Recent Reviews (rounded top)
│ │ Recent Reviews        View All →│ │   White Background
│ │                                 │ │   Slight Shadow for Depth
│ │ [Review Cards...]               │ │
│ │                                 │ │
│ ╰─────────────────────────────────╯ │
└─────────────────────────────────────┘
```

## Visual Transitions

1. Header: Gradient with glassmorphism
2. Tagline: Same gradient with glassmorphism
3. Content area begins with the same gradient background
4. Smooth transition to white background with rounded corners
5. The rest of the content has a white background

## Mobile-Only Implementation

All changes are wrapped in `md:hidden` to ensure they only apply to mobile devices (width < 768px) and do not affect the desktop layout.

## Spacing

- Fixed header: 52px height
- Fixed tagline: 48px height
- Content begins at 100px from top (`pt-[100px]`)
- Rounded white section overlaps slightly with gradient (-4px)
