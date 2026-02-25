import type { SubjectAttendance, TimetableSchedule, DayOfWeek } from "@/types/attendance";

const DAY_ALIASES: Record<string, DayOfWeek> = {
  mon: "Monday", monday: "Monday",
  tue: "Tuesday", tues: "Tuesday", tuesday: "Tuesday",
  wed: "Wednesday", wednesday: "Wednesday",
  thu: "Thursday", thur: "Thursday", thurs: "Thursday", thursday: "Thursday",
  fri: "Friday", friday: "Friday",
  sat: "Saturday", saturday: "Saturday",
};

function sanitize(text: string): string {
  return text.replace(/\f/g, "\n").replace(/\r\n?/g, "\n").replace(/\t/g, "  ");
}

// ─── Attendance Parser ───

export function parseAttendanceText(raw: string): SubjectAttendance[] | null {
  const text = sanitize(raw);
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const results: SubjectAttendance[] = [];

  for (const line of lines) {
    // Try pattern: CODE  Subject Name  Present  Total  Percentage
    // Also handles: CODE | Subject Name | 45 | 60 | 75.00%
    const cleaned = line.replace(/\|/g, "  ").replace(/%/g, "");

    // Extract numbers from end of line
    const nums = [...cleaned.matchAll(/(\d+\.?\d*)/g)].map(m => parseFloat(m[1]));
    if (nums.length < 2) continue;

    // Need at least present and total (and optionally percentage)
    const total = nums[nums.length - (nums.length >= 3 ? 2 : 1)];
    const present = nums[nums.length - (nums.length >= 3 ? 3 : 2)];
    const percentage = nums.length >= 3 ? nums[nums.length - 1] : (total > 0 ? (present / total) * 100 : 0);

    // Heuristic: percentage is usually 0-100, present <= total
    if (present > total) continue;
    if (total <= 0 || total > 500) continue;
    if (percentage < 0 || percentage > 100) continue;

    // Extract code and name from beginning (before the numbers)
    const lastNumIdx = cleaned.lastIndexOf(String(nums[nums.length - 1]));
    const textPart = cleaned.substring(0, cleaned.indexOf(String(nums[0]))).trim();

    // Try to split code from name
    const parts = textPart.split(/\s{2,}|\t/);
    let code = "";
    let name = textPart;

    if (parts.length >= 2) {
      code = parts[0].trim();
      name = parts.slice(1).join(" ").trim();
    } else {
      // Try: first word as code if it looks like a code (has digits or all caps)
      const words = textPart.split(/\s+/);
      if (words.length >= 2 && (/\d/.test(words[0]) || /^[A-Z]{2,}/.test(words[0]))) {
        code = words[0];
        name = words.slice(1).join(" ");
      } else {
        code = `SUBJ${results.length + 1}`;
        name = textPart || `Subject ${results.length + 1}`;
      }
    }

    if (!name) name = code;

    results.push({
      code,
      name,
      present: Math.round(present),
      total: Math.round(total),
      percentage: Math.round(percentage * 100) / 100,
    });
  }

  return results.length >= 1 ? results : null;
}

// ─── Timetable Parser ───

export function parseTimetableText(raw: string): TimetableSchedule | null {
  const text = sanitize(raw);
  const lines = text.split("\n").map(l => l.trim()).filter(Boolean);

  const schedule: TimetableSchedule = {};

  for (const line of lines) {
    // Try: "Monday: CS101, MA101, PH101" or "Monday | CS101 | MA101"
    const colonMatch = line.match(/^([A-Za-z]+)\s*[:|\-]\s*(.+)/);
    if (colonMatch) {
      const dayKey = colonMatch[1].toLowerCase();
      const day = DAY_ALIASES[dayKey];
      if (day) {
        const subjects = colonMatch[2]
          .split(/[,|;]\s*/)
          .map(s => s.trim())
          .filter(Boolean);
        if (subjects.length > 0) {
          schedule[day] = subjects;
        }
        continue;
      }
    }

    // Try: "Monday  CS101  MA101  PH101" (space-separated, first token is day)
    const tokens = line.split(/\s{2,}|\t/);
    if (tokens.length >= 2) {
      const dayKey = tokens[0].toLowerCase().replace(/[^a-z]/g, "");
      const day = DAY_ALIASES[dayKey];
      if (day) {
        schedule[day] = tokens.slice(1).map(s => s.trim()).filter(Boolean);
        continue;
      }
    }
  }

  const dayCount = Object.keys(schedule).length;
  return dayCount >= 3 ? schedule : null;
}

// ─── Content Detection ───

export function looksLikeAttendance(text: string): boolean {
  const lower = text.toLowerCase();
  const keywords = ["present", "total", "percentage", "attended", "conducted", "absent"];
  const matches = keywords.filter(k => lower.includes(k));
  return matches.length >= 2;
}

export function looksLikeTimetable(text: string): boolean {
  const lower = text.toLowerCase();
  const days = Object.keys(DAY_ALIASES);
  const matches = days.filter(d => lower.includes(d));
  return matches.length >= 3;
}
