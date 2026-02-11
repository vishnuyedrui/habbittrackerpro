

# Weekly Habit Tracker Excel Generator

## Overview
A clean, modern single-page app where users manage weekly habits, visualize completion stats, and download a professionally formatted Excel file — all client-side (no backend needed since ExcelJS runs in the browser).

## Page Layout

### 1. Header
- App title "Weekly Habit Tracker" with a clean, professional look

### 2. Habit Input Section
- Text input + "Add Habit" button to dynamically add habits
- List of added habits with delete buttons
- Ability to add unlimited habits

### 3. Weekly Tracking Table
- Table with columns: Habit Name | Mon | Tue | Wed | Thu | Fri | Sat | Sun
- Checkboxes for each habit × day cell
- Clean alternating row styling

### 4. Live Stats Dashboard
- **Daily completion percentages** shown below the table (one per day)
- **Overall weekly completion %** displayed prominently
- **Bar chart** (using Recharts) showing Mon–Sun daily percentages, updating live as checkboxes are toggled

### 5. Action Buttons
- **Preview** — scrolls to / highlights the stats dashboard
- **Download Excel** — generates and downloads a professional .xlsx file

## Excel File Details (generated client-side with ExcelJS)
- Sheet named "Habit Tracker"
- Habit table with TRUE/FALSE values
- Daily percentage row with Excel formulas (COUNTIF/COUNTA)
- Weekly average formula
- Professional formatting: bold headers, borders, auto column widths, frozen top row, percentage formatting
- Embedded bar chart (Mon–Sun vs %) that auto-updates when values change in Excel
- Dashboard-style appearance inspired by the reference image

## Technical Approach
- **All client-side** — no backend needed. ExcelJS supports full Excel generation including charts in the browser
- ExcelJS npm package for .xlsx creation with formulas, formatting, and charts
- Recharts for the live preview chart
- Tailwind CSS for styling
- React state to manage habits and checkbox data

