import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const GLEARN_API = "https://glearn.gitam.edu/Student/getsemmarksdata";

function makeHeaders(sessionCookie: string) {
  return {
    Cookie: `.AspNetCore.Session=${sessionCookie}`,
    Accept: "application/json, text/javascript, */*; q=0.01",
    "Accept-Language": "en-US,en;q=0.9",
    Referer: "https://glearn.gitam.edu/Student/Marks1",
    "User-Agent":
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0",
    "X-Requested-With": "XMLHttpRequest",
  };
}

function availableSems(data: any[]): string[] {
  const sems = new Set<string>();
  for (const r of data) {
    const s = String(r.semester ?? "").trim();
    if (s) sems.add(s);
  }
  return [...sems].sort();
}

function nullCount(r: Record<string, any>): number {
  return Object.values(r).filter((v) => v === null || v === undefined).length;
}

function bestRows(rows: any[]): any[] {
  const seen: Record<string, any> = {};
  for (const r of rows) {
    const code = r.subjectcode || r.subjectname || "unknown";
    if (!seen[code] || nullCount(r) < nullCount(seen[code])) {
      seen[code] = r;
    }
  }
  return Object.values(seen);
}

function extractInternal(rows: any[]): any[] {
  const internal: any[] = [];
  const seen = new Set<string>();
  for (const r of rows) {
    const code = r.subjectcode || r.subjectname;
    if (!code || seen.has(code)) continue;
    const mid1 = r.mid1;
    const mid2 = r.mid2;
    const intM = r.int_marks;
    if (mid1 != null || mid2 != null || intM != null) {
      seen.add(code);
      internal.push({
        subject_name: r.subjectname || "",
        subject_code: r.subjectcode || "",
        internal_marks: intM ?? mid1 ?? mid2,
        mid1,
        mid2,
      });
    }
  }
  return internal;
}

function filterBySem(rawData: any[], sem: string) {
  const semStr = String(sem);
  const semRows = rawData.filter(
    (r) => String(r.semester ?? "").trim() === semStr
  );

  if (!semRows.length) {
    return {
      error: `No data found for semester ${semStr}. Available semesters: ${availableSems(rawData).join(", ")}`,
    };
  }

  let resultRows = semRows.filter(
    (r) => String(r.type ?? "").toUpperCase() === "R"
  );
  let sessionalRows = semRows.filter(
    (r) => String(r.type ?? "").toUpperCase() === "S"
  );

  if (!resultRows.length && !sessionalRows.length) {
    resultRows = semRows;
  }

  resultRows = bestRows(resultRows);
  sessionalRows = bestRows(sessionalRows);

  const infoRow = semRows.find((r) => r.sgpa) || semRows[0];
  let studentName = null;
  for (const r of semRows) {
    if (r.studentname) {
      studentName = r.studentname;
      break;
    }
  }

  return {
    student_name: studentName || infoRow.regdno || "—",
    regid: infoRow.regdno || "",
    semid: semStr,
    sgpa: infoRow.sgpa || "N/A",
    cgpa: infoRow.cgpa || "N/A",
    sem_credits: infoRow.semestercredits || "",
    cum_credits: infoRow.cumulativecredits || "",
    result_type:
      sessionalRows.length && !resultRows.length ? "sessional" : "semester",
    sem_table: resultRows.map((r) => ({
      course_name: r.subjectname || "",
      course_code: r.subjectcode || "",
      category: r.cbcs_category || "",
      credits: r.subject_credits || "",
      subject_type: r.subject_type || "",
      grade: r.grade || "",
      grade_points: r.grade_points,
      month: r.month || "",
      year: r.year || "",
    })),
    sessional_table: sessionalRows.map((r) => ({
      course_name: r.subjectname || "",
      course_code: r.subjectcode || "",
      category: r.cbcs_category || "",
      s1_grade: r.grade || "",
      s1_marks: r.mid1,
      s1_month: r.month || "",
      s1_year: r.year || "",
      s2_grade: null,
      s2_marks: r.mid2,
      s2_month: null,
      s2_year: null,
      final_grade: r.grade || "",
    })),
    internal_marks: extractInternal(semRows),
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { reg, sem } = await req.json();
    if (!reg || !sem) {
      return new Response(
        JSON.stringify({ error: "reg and sem are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const regUpper = String(reg).trim().toUpperCase();
    const semStr = String(sem).trim();

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Check cache
    const { data: cached } = await supabase
      .from("results_cache")
      .select("payload")
      .eq("reg", regUpper)
      .maybeSingle();

    if (cached?.payload) {
      const result = filterBySem(cached.payload as any[], semStr);
      return new Response(
        JSON.stringify({ ...result, _cached: true }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Fetch from GITAM
    const sessionCookie = Deno.env.get("GITAM_SESSION_COOKIE");
    if (!sessionCookie) {
      return new Response(
        JSON.stringify({ error: "GITAM session cookie not configured" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const resp = await fetch(`${GLEARN_API}?regdno=${regUpper}`, {
      headers: makeHeaders(sessionCookie),
    });

    if (resp.status === 401 || resp.status === 403) {
      return new Response(
        JSON.stringify({ error: "Session expired. Please update the GITAM session cookie." }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const data = await resp.json();
    if (!Array.isArray(data)) {
      return new Response(
        JSON.stringify({ error: "Unexpected response from GITAM API" }),
        { status: 502, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Cache it
    await supabase.from("results_cache").upsert({
      reg: regUpper,
      payload: data,
      fetched_at: new Date().toISOString(),
    });

    const result = filterBySem(data, semStr);
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    return new Response(
      JSON.stringify({ error: `Request failed: ${e.message}` }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
