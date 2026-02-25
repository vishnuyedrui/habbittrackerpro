
Root cause confirmed from logs:
- I checked the backend function logs for `extract-timetable`.
- Requests are reaching the function (so this is not a browser CORS/preflight block anymore).
- The function fails when calling the AI gateway with:
  - HTTP 400
  - Provider error: `INVALID_ARGUMENT`
  - Message: `Unable to process input image`
- Do I know what the issue is? Yes.

What is actually broken:
- The frontend now compresses images as JPEG (`canvas.toDataURL("image/jpeg", ...)`), then strips the prefix and sends only raw base64.
- The backend reconstructs the image as `data:image/png;base64,...`.
- That means JPEG bytes are being labeled as PNG, which can cause the model provider to reject the image as invalid/corrupt input.

Implementation plan to fix this reliably:

1) Pass image MIME type from uploader to caller
- File: `src/components/attendance/ImageUploader.tsx`
- Change `onImageSelected` contract from `(base64: string) => void` to something like `(image: { base64: string; mimeType: string }) => void`.
- In compression step, return both:
  - `base64` (compressed image bytes)
  - `mimeType` (actual output type, e.g. `image/jpeg`).
- Keep preview behavior unchanged.

2) Send MIME type in function invoke payloads
- File: `src/pages/AttendanceCalculator.tsx`
- Update both extraction handlers (`extractTimetable`, `extractAttendance`) to accept `{ base64, mimeType }`.
- Invoke backend functions with:
  - `imageBase64`
  - `mimeType`
- Keep existing loading states and toasts.

3) Use MIME type when building `data:` URL in backend functions
- Files:
  - `supabase/functions/extract-timetable/index.ts`
  - `supabase/functions/extract-attendance/index.ts`
- Parse `mimeType` from request body, validate it against allowed image types (`image/jpeg`, `image/png`, `image/webp`), and default safely.
- Build `image_url.url` as:
  - ``data:${mimeType};base64,${imageBase64}``
- This removes the PNG/JPEG mismatch causing INVALID_ARGUMENT.

4) Improve error mapping for provider image failures
- Files:
  - `supabase/functions/extract-timetable/index.ts`
  - `supabase/functions/extract-attendance/index.ts`
  - `src/pages/AttendanceCalculator.tsx` (small message polish)
- If gateway returns 400 with provider “Unable to process input image”, return a clear user-facing error:
  - “This image format/quality could not be read. Try a clearer screenshot or crop tightly around the timetable.”
- Keep manual entry path usable.

5) Verification checklist (end-to-end)
- Test timetable upload with:
  - regular screenshot
  - very large screenshot
  - photo from phone camera
- Confirm:
  - No 400 INVALID_ARGUMENT for valid images
  - `extract-timetable` logs show successful tool call path
  - UI displays “Timetable extracted” and editor fills data
- Regression:
  - Attendance extraction still works with same MIME handling
  - Preview and clear actions still function
  - No changes to calculation/PDF flow

Technical notes:
- No database migration needed.
- No auth changes needed.
- This is a data-URL construction bug (media type mismatch), not a transport/CORS issue.
