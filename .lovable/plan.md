

## Fix: Timetable Image Extraction Keeps Failing

### Problem
The Gemini AI model consistently rejects uploaded timetable images with "Unable to process input image" even though the MIME type is now correctly set. The images are too large after compression (up to ~3MB base64), causing either AI rejection or network timeouts.

### Solution: Three-pronged fix

### 1. Reduce image size more aggressively
**File**: `src/components/attendance/ImageUploader.tsx`
- Reduce `MAX_DIMENSION` from 1600 to 1024 pixels
- Reduce `JPEG_QUALITY` from 0.8 to 0.6
- Reduce `MAX_BASE64_LENGTH` from 4MB to 1.5MB
- This ensures the payload stays small enough for reliable processing

### 2. Switch to a more capable vision model
**Files**: `supabase/functions/extract-timetable/index.ts`, `supabase/functions/extract-attendance/index.ts`
- Change model from `google/gemini-2.5-flash` to `google/gemini-2.5-pro`
- The Pro model is documented as "Strongest at handling image-text" and handles edge cases better
- Also add a request timeout to prevent hanging requests

### 3. Add retry logic on the frontend
**File**: `src/pages/AttendanceCalculator.tsx`
- If extraction fails with an image-related error, automatically retry once with further reduced quality
- Show clearer error messages guiding the user to crop or use a clearer image

### Technical Details

**ImageUploader.tsx changes:**
```
MAX_DIMENSION: 1600 -> 1024
JPEG_QUALITY: 0.8 -> 0.6
MAX_BASE64_LENGTH: 4MB -> 1.5MB
```

**Edge function model change:**
```
model: "google/gemini-2.5-flash" -> "google/gemini-2.5-pro"
```

**AttendanceCalculator.tsx:**
- Add a single retry with further compressed image (800px, 0.4 quality) if first attempt fails
- Better user-facing error messages

### Why this should work
- Smaller images mean faster uploads, smaller payloads, and less chance of Gemini rejecting them
- The Pro model has better image understanding capabilities
- Retry with even smaller image gives a second chance for tricky images

### No database or auth changes needed
