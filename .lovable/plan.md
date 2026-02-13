

# Add Grade Calculator with Navigation

## Overview
Add a Grade Calculator as the default landing page, with a navigation bar that lets users switch between the Grade Calculator and the Habit Tracker.

## Changes

### 1. Navigation Bar
- Add a top-level navbar component with two tabs: **Grade Calculator** (default) and **Habit Tracker**
- Use `react-router-dom` with `/` for Grade Calculator and `/habits` for Habit Tracker
- Clean, minimal navbar that fits the existing design system

### 2. New Files to Create

**`src/types/calculator.ts`**
- Recreate all types and functions used by the uploaded components: `Course`, `Assessment`, `GRADE_MAPPINGS`, `SPECIAL_SESSIONAL_GRADES`, `calculateWGP`, `getGradeFromWGP`, `calculateFinalGradePointWithLab`, `calculateSGPA`, `calculateCGPA`, `checkForFGrade`, `requiresMarksInput`, `getSessionalTotalMarks`, `getSessionalGradePoint`
- Reverse-engineered from the component usage patterns

**`src/components/calculator/CourseCard.tsx`** - Copied from uploaded file (remove PDF export references)

**`src/components/calculator/GradeBadge.tsx`** - Copied from uploaded file

**`src/components/calculator/GradeChart.tsx`** - Copied from uploaded file

**`src/components/calculator/SGPASection.tsx`** - Copied from uploaded file (remove PDF export)

**`src/components/calculator/CGPASection.tsx`** - Copied from uploaded file (remove PDF export)

**`src/components/calculator/StepIndicator.tsx`** - Copied from uploaded file

**`src/components/calculator/WGPFormula.tsx`** - Copied from uploaded file

**`src/components/Navbar.tsx`** - Navigation bar with Grade Calculator / Habit Tracker links

**`src/pages/GradeCalculator.tsx`** - Main page that orchestrates courses, step indicator, SGPA/CGPA sections

### 3. Files to Modify

**`src/App.tsx`** - Add Navbar, routes for `/` (GradeCalculator) and `/habits` (existing Index)

**`tailwind.config.ts`** - Add pop-art colors used by grade calculator components (`pop-pink`, `pop-cyan`, `pop-green`, `pop-orange`, `pop-yellow`, `pop-purple`, grade colors)

**`src/index.css`** - Add `pop-shadow`, `pop-shadow-lg`, `border-3`, and `animate-bounce-in` utility classes

### 4. New Dependency
- `canvas-confetti` - for celebration animations on SGPA/CGPA calculation

### 5. Routing Structure

```text
/         -> Grade Calculator (landing page)
/habits   -> Habit Tracker (existing page, moved from /)
```

## Technical Notes
- The `types/calculator.ts` file will be reconstructed based on function signatures and usage in the uploaded components (WGP calculation with sessional weights 0.30/0.45/0.25, ceiling to nearest integer, grade mapping from WGP to letter grades on a 10-point scale, CGPA weighted average formula)
- PDF export functionality is excluded per user preference
- The `canvas-confetti` package provides lightweight confetti animations triggered when results are calculated
- All grade calculator components use a "pop art" design style with bold colors, rounded corners, and playful shadows -- these custom utilities will be added to the CSS/Tailwind config
