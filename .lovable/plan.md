

# Speed Up External Pages (TeamDino, Feedback, Buy Me a Coffee)

## Problem
The three external pages (TeamDino, Feedback Form, Buy Me a Coffee) each use an iframe that loads a full external website. Every time you navigate to one, the entire remote site loads from scratch, causing noticeable delays. This is a fundamental limitation of embedding external sites.

## Solution
Improve the experience with two key changes:

### 1. Add a Loading State with Skeleton/Spinner
Show a visual loading indicator while the iframe content loads, so users know the page is working and not frozen.

### 2. Open External Links in New Tabs Instead of Iframes
For TeamDino and Buy Me a Coffee (Razorpay), open them in a new browser tab instead of embedding. This is faster because:
- The browser handles it natively without the overhead of your app's layout
- Many sites (especially payment pages) work better outside iframes
- Users can continue using your app while the external site loads separately

The Feedback form (Google Forms) can remain as an iframe since it embeds well, but with a loading spinner added.

## Technical Details

### Changes to `src/components/ExternalPage.tsx`
- Add an `onLoad` handler to the iframe to detect when it finishes loading
- Show a centered spinner/skeleton overlay until the iframe fires `onLoad`

### Changes to `src/components/Navbar.tsx`
- For TeamDino and Buy Me a Coffee nav items, change from internal `NavLink` routes to `<a>` tags with `target="_blank"` and `rel="noopener noreferrer"`
- Keep the Feedback form as an internal route with iframe

### Changes to `src/App.tsx`
- Remove the `/external/teamdino` and `/external/coffee` routes since they'll open in new tabs
- Keep `/external/feedback` route

### Alternative Approach (if you prefer keeping everything in-app)
If you'd rather keep all pages embedded inside your app, we can instead:
- Add loading spinners to all three iframes
- Use `loading="lazy"` on the iframes
- This won't make the external sites load faster, but will make the wait feel less jarring

### Files Modified
- `src/components/ExternalPage.tsx` -- add loading state
- `src/components/Navbar.tsx` -- open TeamDino and Coffee in new tabs
- `src/App.tsx` -- remove unused routes
- `src/components/FloatingCoffee.tsx` -- update coffee link to open in new tab

