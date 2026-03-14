

## Plan: What-If Semester Selector + Attendance Calculator

### Part 1: What-If Calculator — Semester Selector

**Current behavior**: User manually enters CGPA/credits and can edit semester numbers freely.
**New behavior**: User selects their current semester (1-8) from a dropdown. Future semesters auto-populate as the remaining ones (e.g., if current = 3, predict options are semesters 4-8). Remove the editable semester number input.

**Changes to `src/pages/WhatIfCalculator.tsx`**:
- Add `currentSemester` state (1-8 dropdown) in the "Current Standing" section
- Derive `remainingSemesters = 8 - currentSemester` as max future count
- Replace the "Semesters to predict" dropdown options with `1..remainingSemesters`
- Auto-label future semester cards as `Semester {currentSemester + i + 1}` (read-only label, no editable input)
- Remove the `semNumber` editable `Input` field from each future semester card
- Persist `currentSemester` in localStorage saved state

### Part 2: Attendance Calculator — New Page

**New file: `src/pages/AttendanceCalculator.tsx`**

A single-page calculator with 4 input sections and a live result panel. All values saved to localStorage, no submit button — everything updates live.

**Section 1 — Current Attendance**
- Two large numeric inputs: "Classes Attended" and "Total Classes Held"
- Validation: if attended > total, red border + clamp

**Section 2 — Weekly Schedule**
- 6 toggle buttons (Mon-Sat), each with a small number input for classes/day
- Defaults: Mon-Fri = 6, Sat = 4
- Toggle off = holiday (grayed out, count = 0)

**Section 3 — College End Date**
- Date input, default 3 months from today

**Section 4 — Target % Slider**
- Range 50-100%, step 1, default 75%

**Result Panel** (auto-updates on every change):
1. **Circular SVG progress ring** — current %, colored green/amber/red vs target
2. **3 stat chips** — Present/Total, Classes remaining, Weeks remaining
3. **4 projection cards (2x2)** — "If attend all", "If bunk all", "Can bunk now", "Safe bunks in remaining"
4. **Timeline strip (3 rows)** — Right now %, Best case %, Worst case %
5. **Smart insight line** — auto-generated 1-2 sentence summary
6. **Reset button** with confirm dialog

**Calculation logic**: Uses the exact functions specified (countRemainingClasses, canBunk, mustAttend) plus projection formulas. All edge cases handled (total=0, attended>total, past end date, remClasses=0, impossible target).

**Changes to `src/components/Navbar.tsx`**:
- Add nav item: `{ to: "/attendance", label: "Attendance", icon: ClipboardCheck }`

**Changes to `src/App.tsx`**:
- Import `AttendanceCalculator` and add route `<Route path="/attendance" ...>`

### File Summary

| Action | File |
|--------|------|
| Edit | `src/pages/WhatIfCalculator.tsx` (add semester selector, remove editable sem numbers) |
| Create | `src/pages/AttendanceCalculator.tsx` (full attendance calculator) |
| Edit | `src/components/Navbar.tsx` (add Attendance nav item) |
| Edit | `src/App.tsx` (add /attendance route) |

No new dependencies. No database changes. Pure client-side math + localStorage.

