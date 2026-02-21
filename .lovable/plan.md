
# Add "Absolute Grading" Mode to Course Cards

## Overview
Add a toggle on each course card that switches between the existing "Relative Grading" (sessional-based WGP calculation) and a new "Absolute Grading" mode. In Absolute Grading, the user enters Marks Obtained and Maximum Marks, and the grade is auto-calculated from the percentage.

## How It Works
- Each course card gets a grading mode toggle: **Relative** (default, current behavior) or **Absolute**
- When "Absolute" is selected, the sessional assessment table is hidden and replaced with two input fields: **Marks Obtained** and **Maximum Marks**
- Percentage is calculated automatically: `(obtained / max) * 100`
- Grade is assigned based on the percentage scale:
  - 90+ = O (GP 10)
  - 80-89 = A+ (GP 9)
  - 70-79 = A (GP 8)
  - 60-69 = B+ (GP 7)
  - 50-59 = B (GP 6)
  - 40-49 = P (GP 4)
  - Below 40 = F (GP 0)
- The resulting `finalGradePoint` and `letterGrade` feed into the existing SGPA/CGPA calculation, so everything updates dynamically
- Lab toggle still works in Absolute mode (lab marks adjust the final GP the same way)
- Switching modes resets the course's grade data to avoid stale values

## Changes

### 1. Update `src/types/calculator.ts`
- Add `gradingMode: "relative" | "absolute"` to the `Course` interface (default: `"relative"`)
- Add `absoluteMarks: number | null` and `absoluteMaxMarks: number | null` to the `Course` interface
- Add a helper function `calculateAbsoluteGrade(obtained, max)` that returns `{ gradePoint, letterGrade, percentage }`
- Update `createNewCourse()` to include the new fields with defaults

### 2. Update `src/components/calculator/CourseCard.tsx`
- Add a two-option toggle (Relative / Absolute) below the course name and credits row
- When mode is "Absolute":
  - Hide the assessment grades table entirely
  - Show two inputs: "Marks Obtained" and "Maximum Marks"
  - Show calculated percentage and auto-assigned grade in real-time
  - On input change, compute the grade and call `onUpdate` with updated `finalGradePoint`, `letterGrade`, and `wgp`
- When mode is "Relative": show the existing sessional-based UI (no changes)
- Switching modes resets grade-related fields (`wgp`, `finalGradePoint`, `letterGrade`, assessments, absolute marks)

### 3. No changes needed to SGPA/CGPA logic
- The `calculateSGPA` function already reads `finalGradePoint` and `credits` from each course, so Absolute Grading courses will be included automatically

## Technical Details

**Absolute Grade Scale:**
```text
Percentage    Letter    Grade Point
>= 90         O         10
80 - 89       A+         9
70 - 79       A          8
60 - 69       B+         7
50 - 59       B          6
40 - 49       P          4
< 40          F          0
```

**New Course fields:**
- `gradingMode`: `"relative"` | `"absolute"` (default `"relative"`)
- `absoluteMarks`: `number | null`
- `absoluteMaxMarks`: `number | null` (default `100`)

**Files modified:**
- `src/types/calculator.ts` -- new fields and helper function
- `src/components/calculator/CourseCard.tsx` -- mode toggle UI and absolute grading inputs
