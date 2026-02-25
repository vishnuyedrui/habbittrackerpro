
Issue re-stated clearly:
The same extraction failure keeps happening even for `.txt` uploads.  
From the latest evidence, this is not an OCR/image-quality problem anymore.

What I confirmed by investigation:
1. The frontend is sending `textContent` correctly to `extract-timetable` (seen in network request body).
2. Direct backend test calls to both `extract-timetable` and `extract-attendance` return:
   - `500`
   - `{ "error": "No image provided" }`
3. That exact error string does not exist in the current repository code, which means the live backend functions are running an older deployed version (stale deployment mismatch), not the code now shown in the editor.

Do I know what the issue is?
Yes.  
The app and backend are out of sync: frontend expects text-capable functions, but production-preview function runtime is still an older “image-only” build.

Implementation approach to permanently stop this loop:

1) Force-sync backend functions to current code
- Scope:
  - `supabase/functions/extract-timetable/index.ts`
  - `supabase/functions/extract-attendance/index.ts`
- Actions:
  - Redeploy both functions explicitly (manual deploy trigger, not relying on passive auto-sync).
  - Immediately verify with direct function test calls using `textContent`.
- Success criteria:
  - `extract-timetable` no longer returns “No image provided”.
  - `extract-attendance` no longer returns “No image provided”.

2) Add function build/version marker for drift detection
- Same files above.
- Add a constant build marker (e.g. `FUNCTION_VERSION = "2026-02-25-text-support-v1"`), include it in logs and optionally response headers/body in debug-safe way.
- Why:
  - Lets us confirm in one request whether the running function is the latest build.
  - Prevents future “it works in code but not in runtime” confusion.

3) Harden function input validation and error clarity for text path
- Same files above.
- Ensure text-mode path explicitly validates:
  - `typeof textContent === "string"`
  - `textContent.trim().length > 0`
- Return clear, typed 400 messages for malformed payload instead of generic 500.
- Why:
  - Avoids ambiguous fetch failures.
  - Makes user-visible errors actionable.

4) Harden frontend invoke error handling for backend failures
- File:
  - `src/pages/AttendanceCalculator.tsx`
- Actions:
  - Parse and surface backend error payloads from function invocation consistently (not just fallback network message).
  - Distinguish:
    - request transport failure
    - backend validation failure
    - AI extraction failure
- Why:
  - User currently sees repetitive generic failures.
  - Better diagnosis and less trial-and-error.

5) Add non-AI fallback parser for plain-text attendance/timetable (optional but recommended for reliability)
- Files:
  - `src/pages/AttendanceCalculator.tsx`
  - possibly new helper in `src/lib/` for deterministic parsing
- Behavior:
  - For `.txt` files, first attempt deterministic regex/table parser.
  - If parser confidence is low, then call AI backend.
- Why:
  - Eliminates external model dependency for common `.txt` formats.
  - Makes `.txt` path much more stable and faster.

6) End-to-end verification checklist
- Timetable `.txt` (step 1):
  - Upload valid timetable text -> extraction success -> editor auto-filled.
- Attendance `.txt` (step 2):
  - Upload valid attendance text -> extraction success -> attendance editor filled.
- Negative tests:
  - Empty text file -> clear validation error.
  - Random text -> clear “could not parse” message.
- Deployment drift test:
  - Trigger one direct backend call and confirm returned version marker matches latest build.
- Regression checks:
  - Image extraction still works.
  - Step navigation and PDF flow remain unchanged.

Technical notes:
- No database schema or policy changes are required.
- Root cause is backend deployment drift, not frontend file upload logic.
- The ref warnings in console are separate UI warnings and not the cause of extraction failure; they can be cleaned up in a follow-up task.
