

## Plan: Add SGPA → CGPA What-If Calculator

### Overview
Add a new standalone page at `/what-if` with a complete What-If CGPA calculator. Add a nav item to the existing navbar. Pure client-side math, no API calls.

### New Files

**`src/pages/WhatIfCalculator.tsx`** — Main page component containing all sections:

1. **Setup Section**: Total semesters dropdown (4/6/8), default credits input (20), grading scale toggle (10-point/4-point), toggle for uniform vs per-semester credits
2. **Semester Table**: Dynamic rows based on total semesters. Each row has: semester label, editable credits, SGPA input, and a Completed/What-If toggle. What-If rows are highlighted in indigo/purple with a slider (0-10 or 0-4) + number input side by side
3. **Scenarios Section**: 3 columns (Pessimistic 😴 / Realistic 😐 / Optimistic 🔥). Each has its own SGPA input for What-If semesters. CGPA auto-calculates per column. Clicking a column applies its values to the main table
4. **Results Card**: Live-updating projected CGPA with big bold number, previous vs new comparison with delta, progress bar colored by tier, milestone badges (Outstanding/Distinction/Good/Average/Needs Improvement), proximity message ("0.03 away from Distinction!")
5. **Reverse Calculator**: Target CGPA input → shows required SGPA in remaining semesters. "Achievable ✅" or "Not possible ❌"
6. **Save/Share**: localStorage save with auto-load + welcome-back toast. WhatsApp share button

Formula: `CGPA = Σ(SGPA × Credits) / Σ(Credits)`

All inputs trigger instant recalculation via React state — no calculate button needed.

### Modified Files

**`src/components/Navbar.tsx`** — Add one nav item `{ to: "/what-if", label: "What-If Calculator", icon: Target }` to the `navItems` array

**`src/App.tsx`** — Add route: `<Route path="/what-if" element={<ErrorBoundary><WhatIfCalculator /></ErrorBoundary>} />`

### Styling
Uses existing Tailwind classes, Card/Button/Input/Slider/Select/Badge/Progress components from shadcn/ui, and framer-motion for animations — all already installed. Color tiers use existing CSS variables (pop-pink, pop-cyan, pop-yellow, etc.) and the indigo/purple highlight for What-If rows.

### File Summary

| Action | File |
|--------|------|
| Create | `src/pages/WhatIfCalculator.tsx` |
| Edit | `src/components/Navbar.tsx` (add nav item) |
| Edit | `src/App.tsx` (add route) |

No new dependencies. No database changes.

