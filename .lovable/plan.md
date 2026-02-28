
Goal: fix the roll-number save failure so SGPA/CGPA cards save reliably from both the popup and Save/Load panel.

What I found:
1. The app saves with:
   - `upsert(..., { onConflict: "roll_number" })`
   - in both `SavePromptDialog.tsx` and `RollNumberSave.tsx`.
2. The database currently has a unique index on `UPPER(roll_number)` (expression index), not on plain `roll_number`.
3. `on_conflict=roll_number` requires a real unique constraint/index on that exact column. With the current expression index, upsert conflict targeting does not match, so save fails.
4. RLS policies are already permissive in the backend, so this is not an RLS blockage now.

Implementation plan:

1) Fix database uniqueness to match app upsert behavior
- Add a migration that:
  - normalizes existing values to uppercase (`UPDATE ... SET roll_number = UPPER(TRIM(roll_number))`),
  - safely removes duplicates if any exist after normalization (keep latest `updated_at`),
  - drops the expression index `idx_saved_grade_cards_roll`,
  - creates a plain unique index (or unique constraint) on `roll_number`.
- Keep current RLS policies as-is (public save/load is intended for this feature).

2) Make frontend save payloads consistently normalized
- In `SavePromptDialog.tsx`, normalize roll number before validation and save using the same approach as `RollNumberSave.tsx` (`trim().toUpperCase()`).
- Keep regex validation 5–20 alphanumeric, but validate against normalized value to avoid whitespace edge cases.

3) Improve error visibility (so users see the actual reason if backend rejects save)
- In both `SavePromptDialog.tsx` and `RollNumberSave.tsx`, surface backend message in toast when available (instead of generic “Failed to save” only).
- This helps future debugging without needing repeated guesswork.

4) Verify both save entry points end-to-end
- Test from SGPA popup:
  - calculate SGPA → popup appears → save with roll number.
- Test from CGPA popup:
  - calculate CGPA → popup appears → save with roll number.
- Test from top-right Save/Load panel:
  - save then load same roll number.
- Confirm overwrite behavior works (same roll number updates existing record).
- Confirm invalid roll numbers are blocked as before.

Technical notes:
- This fix aligns backend indexing with current API contract (`onConflict: "roll_number"`), which is the cleanest and most reliable approach.
- No auth model changes are required for this grade-card save feature.
- No changes needed in generated integration files.
