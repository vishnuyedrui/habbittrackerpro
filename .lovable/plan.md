

# Add Logo as Favicon and Google Search Branding

## Overview
Add the uploaded TeamDino logo as the site favicon and configure structured data so it appears in Google Search results.

## Changes

### 1. Copy the logo image
- Copy `user-uploads://cropped_circle_image.png` to `public/logo.png`
- This will serve as both the favicon and the site logo

### 2. Update `index.html`
- Replace the existing favicon reference with the new logo:
  ```html
  <link rel="icon" type="image/png" sizes="32x32" href="/logo.png" />
  <link rel="apple-touch-icon" href="/logo.png" />
  ```
- Update the Open Graph and Twitter meta image tags to use the logo
- Add structured data (JSON-LD) for Google Search appearance:
  ```html
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "TeamDino - Work Smart",
    "url": "https://habbittrackerpro.lovable.app",
    "image": "https://habbittrackerpro.lovable.app/logo.png"
  }
  </script>
  ```

### 3. Update PWA manifest icons
- Update `vite.config.ts` PWA manifest to reference `/logo.png` for the 192x192 and 512x512 icons (the single image will be scaled by browsers)

### 4. Add logo to the Navbar
- Import the logo in `src/components/Navbar.tsx` and display it next to the site name for consistent branding

## Technical Notes
- The logo is placed in `public/` so it can be referenced by HTML meta tags and the PWA manifest directly
- JSON-LD structured data helps Google display the logo in search results
- The `apple-touch-icon` ensures proper display on iOS home screens

