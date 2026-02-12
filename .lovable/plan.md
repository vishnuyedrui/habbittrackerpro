

# Week Selector, Visual Redesign, Mobile Responsiveness & PWA

## 1. Week Selector

Add navigation arrows and a date display above the tracking table so users can move between weeks.

- Add `selectedWeekStart` state (defaults to current week's Monday)
- Left/right arrow buttons to go to previous/next week (using `addWeeks` from date-fns)
- Display the week range (e.g., "Feb 10 - Feb 16, 2026")
- Disable "next" button if already on the current week
- When the selected week changes, load that week's entries from the database (for authenticated users)
- `saveEntryToDB` uses the selected week instead of always the current week
- For temporary users, only the current week is available (arrows hidden or disabled)

## 2. Visual Design Overhaul

### Custom Color Palette
Update CSS variables in `src/index.css` with a modern, vibrant palette:
- **Primary**: Indigo/violet tones (e.g., `243 75% 59%`)
- **Accent**: Teal/emerald for success indicators
- **Cards**: Subtle gradient backgrounds or soft shadows
- **Chart bars**: Gradient fills instead of flat colors

### Animations (via tailwind.config.ts)
Add keyframes and utility classes:
- `fade-in` for cards appearing on load
- `scale-in` for stat cards
- Smooth checkbox toggle transitions
- Hover effects on habit chips and buttons (scale, shadow lift)

### Polish
- Add a gradient or colored header bar
- Rounded stat cards with colored borders based on completion percentage (red/yellow/green)
- Better typography hierarchy
- Subtle card hover shadows
- Progress ring or colored badge for the weekly average

## 3. Mobile Responsiveness

- **Header**: Stack title and auth buttons vertically on small screens
- **Tracking Table**: Wrap in a horizontal scroll container on mobile, or switch to a card-based layout per habit
- **Daily Completion Grid**: Change from `grid-cols-7` to `grid-cols-4` on small screens, then `grid-cols-7` on larger
- **Chart**: Already responsive via Recharts `ResponsiveContainer`
- **Action Buttons**: Full-width stacking on mobile
- **Week Selector**: Compact layout with smaller buttons on mobile

## 4. PWA (Installable Web App)

- Install `vite-plugin-pwa`
- Configure in `vite.config.ts` with app manifest (name, icons, theme color, display: standalone)
- Add `navigateFallbackDenylist: [/^\/~oauth/]` to workbox config
- Add PWA meta tags to `index.html` (theme-color, apple-touch-icon)
- Create basic PWA icons in `public/` folder (192x192 and 512x512)
- The app will then be installable from mobile browsers via "Add to Home Screen"

## Technical Details

### Files to Create
- `src/components/WeekSelector.tsx` -- navigation arrows + week label

### Files to Modify
- `src/index.css` -- new color palette with vibrant, modern HSL values
- `tailwind.config.ts` -- add animation keyframes (fade-in, scale-in, slide-in)
- `src/pages/Index.tsx` -- integrate WeekSelector, apply responsive classes, animate cards, use selectedWeekStart for data loading
- `src/components/YearlyChart.tsx` -- apply new chart colors
- `index.html` -- update title, add PWA meta tags
- `vite.config.ts` -- add vite-plugin-pwa configuration
- `src/components/AuthDialog.tsx` -- minor styling polish
- `src/components/WelcomeDialog.tsx` -- minor styling polish

### New Dependencies
- `vite-plugin-pwa` -- for PWA support

