

# Add Footer with TeamDino Branding and Social Links

## Overview
Create a new `Footer` component with a dark theme (matching the navbar), displaying "TeamDino" branding, copyright text, and colorful Instagram/WhatsApp logo icons linking to the provided URLs. The uploaded logo images will be copied into the project and used directly.

## Layout Reference
Based on the uploaded screenshot, the footer will have:
- Dark background matching the navbar
- "TeamDino" name on the left
- Copyright text centered
- Instagram and WhatsApp icons on the right, using the uploaded colorful logos

## Changes

### 1. Copy uploaded images into the project
- Copy `user-uploads://2227.jpg` to `src/assets/instagram-logo.jpg`
- Copy `user-uploads://410199-PD37U2-851.jpg` to `src/assets/whatsapp-logo.jpg`

### 2. Create `src/components/Footer.tsx`
- Dark background (`hsl(240, 15%, 6%)`) matching the navbar
- Left section: TeamDino logo (`/logo.png`) + "TeamDino" text
- Center: `Copyright 2026 TeamDino | All rights reserved` in italic muted text
- Right section: Instagram and WhatsApp icons (32x32px, rounded, object-cover) as links opening in new tabs
- Responsive: stack vertically on mobile, horizontal on desktop
- Hover effect on social icons (slight scale up)

### 3. Update `src/App.tsx`
- Import and render `<Footer />` below the `<Routes>` block so it appears on every page

## Technical Details

**Files created:**
- `src/components/Footer.tsx`

**Files modified:**
- `src/App.tsx` -- add Footer import and render

**Assets copied:**
- `src/assets/instagram-logo.jpg` -- colorful Instagram logo
- `src/assets/whatsapp-logo.jpg` -- colorful WhatsApp logo

