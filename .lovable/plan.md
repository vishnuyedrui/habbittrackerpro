

## Approach: GITAM Portal Data Bridge (Bookmarklet + Smart Import)

Since a full Chrome extension can't be built/deployed from Lovable, we'll create a **bookmarklet-based extraction system** that achieves the same goal — credentials never leave the student's browser.

### How It Works

```text
+---------------------------+       Copy/Paste or       +---------------------------+
|   GITAM Portal            |    Bookmarklet Click      |   Your Web App            |
|   (student logged in)     | ----------------------->  |   (habbittrackerpro)      |
|                           |    Extracted JSON data     |                           |
|   - Grades page           |                           |   - Dashboard display     |
|   - Attendance page       |                           |   - Charts & analytics    |
+---------------------------+                           |   - PDF/CSV export        |
                                                        +---------------------------+
```

### Plan

**1. Create a Bookmarklet Generator Page (`/import`)**

A new page in the app that:
- Shows step-by-step instructions for using the bookmarklet
- Provides a draggable "Extract My Data" bookmarklet button
- The bookmarklet is a small JavaScript snippet that:
  - Runs on the GITAM portal page while the student is logged in
  - Scrapes grades/attendance from the visible DOM
  - Copies the structured JSON to clipboard automatically
- Includes a "Paste Extracted Data" area that accepts the JSON

**2. Smart Data Import Component**

- Large textarea or "Paste JSON" button
- Parses the bookmarklet output (grades + attendance)
- Validates structure and shows preview before importing
- Populates the existing grade calculator and attendance calculator

**3. Enhanced Dashboard (`/dashboard`)**

- Combined view of grades + attendance after import
- Semester filter dropdown
- Subject cards showing: name, code, internals, externals, total grade, attendance %
- Warning badges for attendance below 75%
- GPA/CGPA calculation using existing calculator logic
- Visual charts (bar chart for grades, pie chart for attendance)

**4. Export Options**

- PDF download (using existing jsPDF setup)
- CSV download
- Both filtered by selected semester

**5. Bookmarklet Scripts**

Two small JavaScript snippets (generated in the app, not deployed separately):
- `extract-grades.js` — reads grades table from GITAM portal DOM
- `extract-attendance.js` — reads attendance table from GITAM portal DOM
- These run entirely in the student's browser on the GITAM domain

### Security Model

- Zero credential handling — student is already logged into GITAM in their browser
- Bookmarklet only reads visible DOM data (same as the student seeing it)
- No data is sent to any server — clipboard transfer only
- Imported data stays in browser localStorage (or optionally saved to backend if authenticated)

### Technical Details

**New files:**
- `src/pages/ImportData.tsx` — bookmarklet instructions + paste import page
- `src/pages/Dashboard.tsx` — combined grades + attendance dashboard
- `src/lib/gitam-data-parser.ts` — parser for bookmarklet JSON output
- `src/lib/bookmarklet-scripts.ts` — generates the bookmarklet JS code
- `src/components/dashboard/GradeCard.tsx` — individual subject grade display
- `src/components/dashboard/AttendanceWarning.tsx` — below-75% alerts
- `src/components/dashboard/SemesterFilter.tsx` — semester dropdown
- `src/components/dashboard/ExportButtons.tsx` — PDF/CSV export

**Modified files:**
- `src/App.tsx` — add `/import` and `/dashboard` routes
- `src/components/Navbar.tsx` — add navigation links

**No database changes needed** — data lives in localStorage or existing calculator state.

### Limitations

- Bookmarklets require the student to be on the correct GITAM portal page
- If GITAM changes their DOM structure, the bookmarklet scripts need updating
- This is not a Chrome extension (no auto-run, no background process)
- Student must manually trigger extraction each time
