import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight, Download } from "lucide-react";
import { addMonths } from "date-fns";
import { toast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { AttendanceStepIndicator } from "@/components/attendance/AttendanceStepIndicator";
import { ImageUploader, compressImageFromBase64, RETRY_MAX_DIMENSION, RETRY_JPEG_QUALITY } from "@/components/attendance/ImageUploader";
import type { FileUploadResult } from "@/components/attendance/ImageUploader";
import { TimetableEditor } from "@/components/attendance/TimetableEditor";
import { AttendanceEditor } from "@/components/attendance/AttendanceEditor";
import { DateRangeConfig } from "@/components/attendance/DateRangeConfig";
import { ResultsDashboard } from "@/components/attendance/ResultsDashboard";
import { WhatIfSimulator } from "@/components/attendance/WhatIfSimulator";
import { calculateSubjectResults, calculateOverallResult } from "@/lib/attendance-calculator";
import { generateAttendancePDF } from "@/lib/attendance-pdf";
import {
  parseTimetableText,
  parseAttendanceText,
  looksLikeAttendance,
  looksLikeTimetable,
} from "@/lib/attendance-text-parser";
import type { TimetableSchedule, SubjectAttendance, AttendanceConfig, DayOfWeek } from "@/types/attendance";

const defaultConfig: AttendanceConfig = {
  fromDate: new Date(),
  toDate: addMonths(new Date(), 2),
  workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"] as DayOfWeek[],
  holidays: [],
  targetPercentage: 75,
};

export default function AttendanceCalculator() {
  const [step, setStep] = useState(1);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  // Step 1
  const [timetable, setTimetable] = useState<TimetableSchedule>({});
  const [ttImage, setTtImage] = useState<string | null>(null);
  const [ttText, setTtText] = useState<string | null>(null);
  const [ttLoading, setTtLoading] = useState(false);

  // Step 2
  const [attendance, setAttendance] = useState<SubjectAttendance[]>([]);
  const [attImage, setAttImage] = useState<string | null>(null);
  const [attText, setAttText] = useState<string | null>(null);
  const [attLoading, setAttLoading] = useState(false);

  // Step 3
  const [config, setConfig] = useState<AttendanceConfig>(defaultConfig);

  // Calculations
  const subjectResults = useMemo(
    () => (attendance.length > 0 ? calculateSubjectResults(attendance, timetable, config) : []),
    [attendance, timetable, config]
  );
  const overallResult = useMemo(
    () => calculateOverallResult(subjectResults, config.targetPercentage),
    [subjectResults, config.targetPercentage]
  );

  const isImageError = (msg: string) =>
    msg.includes("image") || msg.includes("Unable to process") || msg.includes("INVALID_ARGUMENT");

  const parseEdgeFunctionError = (e: any): string => {
    if (e?.context?.body) {
      try {
        const body = typeof e.context.body === "string" ? JSON.parse(e.context.body) : e.context.body;
        if (body?.error) return body.error;
      } catch {}
    }
    const msg = e?.message || "";
    if (msg.includes("fetch") || msg.includes("network") || msg.includes("Failed to fetch"))
      return "Couldn't reach backend service. For .txt files, try the format shown in the hint. You can also edit data manually below.";
    return msg || "Extraction failed. Please try again.";
  };

  const extractTimetable = async (result: FileUploadResult) => {
    setTtLoading(true);
    if (result.type === "image") {
      setTtImage(result.base64);
      setTtText(null);
    } else {
      setTtText(result.textContent);
      setTtImage(null);
    }

    // For text uploads: local parse first
    if (result.type === "text") {
      // Wrong-step guardrail
      if (looksLikeAttendance(result.textContent) && !looksLikeTimetable(result.textContent)) {
        toast({
          title: "Wrong step?",
          description: "This looks like attendance data. Please upload it in Step 2 instead.",
          variant: "destructive",
        });
        setTtLoading(false);
        setTtText(null);
        return;
      }

      const localResult = parseTimetableText(result.textContent);
      if (localResult) {
        setTimetable(localResult);
        toast({ title: "Timetable parsed!", description: "Parsed locally — review and edit below." });
        setTtLoading(false);
        return;
      }

      // Local parse failed, try backend AI
      try {
        const { data, error } = await supabase.functions.invoke("extract-timetable", {
          body: { textContent: result.textContent },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setTimetable(data);
        toast({ title: "Timetable extracted!", description: "Review and edit below." });
      } catch (e: any) {
        const msg = parseEdgeFunctionError(e);
        toast({ title: "Extraction failed", description: msg, variant: "destructive" });
      } finally {
        setTtLoading(false);
      }
      return;
    }

    // Image flow (unchanged)
    const buildBody = (r: FileUploadResult) =>
      r.type === "text"
        ? { textContent: r.textContent }
        : { imageBase64: r.base64, mimeType: r.mimeType };

    try {
      const { data, error } = await supabase.functions.invoke("extract-timetable", {
        body: buildBody(result),
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setTimetable(data);
      toast({ title: "Timetable extracted!", description: "Review and edit below." });
    } catch (e: any) {
      if (isImageError(e.message || "")) {
        try {
          toast({ title: "Retrying with smaller image..." });
          const smaller = await compressImageFromBase64(result.base64, RETRY_MAX_DIMENSION, RETRY_JPEG_QUALITY);
          const { data, error } = await supabase.functions.invoke("extract-timetable", {
            body: { imageBase64: smaller.base64, mimeType: smaller.mimeType },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          setTimetable(data);
          toast({ title: "Timetable extracted!", description: "Review and edit below." });
          return;
        } catch {
          // Fall through
        }
      }
      const msg = parseEdgeFunctionError(e);
      toast({ title: "Extraction failed", description: msg, variant: "destructive" });
    } finally {
      setTtLoading(false);
    }
  };

  const extractAttendance = async (result: FileUploadResult) => {
    setAttLoading(true);
    if (result.type === "image") {
      setAttImage(result.base64);
      setAttText(null);
    } else {
      setAttText(result.textContent);
      setAttImage(null);
    }

    // For text uploads: local parse first
    if (result.type === "text") {
      // Wrong-step guardrail
      if (looksLikeTimetable(result.textContent) && !looksLikeAttendance(result.textContent)) {
        toast({
          title: "Wrong step?",
          description: "This looks like a timetable. Please upload it in Step 1 instead.",
          variant: "destructive",
        });
        setAttLoading(false);
        setAttText(null);
        return;
      }

      const localResult = parseAttendanceText(result.textContent);
      if (localResult) {
        setAttendance(localResult);
        toast({ title: "Attendance parsed!", description: "Parsed locally — review and edit below." });
        setAttLoading(false);
        return;
      }

      // Local parse failed, try backend AI
      try {
        const { data, error } = await supabase.functions.invoke("extract-attendance", {
          body: { textContent: result.textContent },
        });
        if (error) throw error;
        if (data?.error) throw new Error(data.error);
        setAttendance(data);
        toast({ title: "Attendance extracted!", description: "Review and edit below." });
      } catch (e: any) {
        const msg = parseEdgeFunctionError(e);
        toast({ title: "Extraction failed", description: msg, variant: "destructive" });
      } finally {
        setAttLoading(false);
      }
      return;
    }

    // Image flow (unchanged)
    const buildBody = (r: FileUploadResult) =>
      r.type === "text"
        ? { textContent: r.textContent }
        : { imageBase64: r.base64, mimeType: r.mimeType };

    try {
      const { data, error } = await supabase.functions.invoke("extract-attendance", {
        body: buildBody(result),
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      setAttendance(data);
      toast({ title: "Attendance extracted!", description: "Review and edit below." });
    } catch (e: any) {
      if (isImageError(e.message || "")) {
        try {
          toast({ title: "Retrying with smaller image..." });
          const smaller = await compressImageFromBase64(result.base64, RETRY_MAX_DIMENSION, RETRY_JPEG_QUALITY);
          const { data, error } = await supabase.functions.invoke("extract-attendance", {
            body: { imageBase64: smaller.base64, mimeType: smaller.mimeType },
          });
          if (error) throw error;
          if (data?.error) throw new Error(data.error);
          setAttendance(data);
          toast({ title: "Attendance extracted!", description: "Review and edit below." });
          return;
        } catch {
          // Fall through
        }
      }
      const msg = parseEdgeFunctionError(e);
      toast({ title: "Extraction failed", description: msg, variant: "destructive" });
    } finally {
      setAttLoading(false);
    }
  };

  const goNext = () => {
    if (step === 1 && Object.keys(timetable).length === 0) {
      toast({ title: "Add timetable first", variant: "destructive" });
      return;
    }
    if (step === 2 && attendance.length === 0) {
      toast({ title: "Add attendance data first", variant: "destructive" });
      return;
    }
    setCompletedSteps((prev) => (prev.includes(step) ? prev : [...prev, step]));
    setStep((s) => Math.min(s + 1, 4));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 1));

  const handleDownloadPDF = () => {
    generateAttendancePDF(subjectResults, overallResult, config);
    toast({ title: "PDF downloaded!" });
  };

  return (
    <main className="min-h-screen bg-background">
      <div className="container max-w-4xl py-6 px-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-2">
          <h1 className="text-2xl sm:text-3xl font-display font-bold">
            <span className="text-pop-cyan">Smart</span> Attendance Calculator
          </h1>
          <p className="text-sm text-muted-foreground mt-1">Upload → Edit → Calculate → Download</p>
        </motion.div>

        <AttendanceStepIndicator currentStep={step} completedSteps={completedSteps} />

        <AnimatePresence mode="wait">
          <motion.div
            key={step}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className="space-y-4"
          >
            {step === 1 && (
              <>
                <ImageUploader
                  label="Upload Timetable"
                  description="Drag & drop or click to upload your weekly timetable (image or .txt file)"
                  onFileSelected={extractTimetable}
                  isLoading={ttLoading}
                  preview={ttImage}
                  previewText={ttText}
                  onClear={() => { setTtImage(null); setTtText(null); setTimetable({}); }}
                />
                <p className="text-xs text-muted-foreground text-center">
                  💡 .txt format: <code className="bg-muted px-1 rounded">Monday: CS101, MA101, PH101</code> — one line per day. You can also edit manually below.
                </p>
                <TimetableEditor schedule={timetable} onChange={setTimetable} />
              </>
            )}

            {step === 2 && (
              <>
                <ImageUploader
                  label="Upload Attendance"
                  description="Drag & drop or click to upload your attendance summary (image or .txt file)"
                  onFileSelected={extractAttendance}
                  isLoading={attLoading}
                  preview={attImage}
                  previewText={attText}
                  onClear={() => { setAttImage(null); setAttText(null); setAttendance([]); }}
                />
                <p className="text-xs text-muted-foreground text-center">
                  💡 .txt format: <code className="bg-muted px-1 rounded">CS101  Computer Science  45  60  75</code> — one subject per line. You can also edit manually below.
                </p>
                <AttendanceEditor subjects={attendance} onChange={setAttendance} />
              </>
            )}

            {step === 3 && <DateRangeConfig config={config} onChange={setConfig} />}

            {step === 4 && subjectResults.length > 0 && (
              <>
                <ResultsDashboard
                  subjectResults={subjectResults}
                  overallResult={overallResult}
                  targetPercentage={config.targetPercentage}
                />
                <WhatIfSimulator subjectResults={subjectResults} targetPercentage={config.targetPercentage} />
                <div className="flex justify-center pt-2">
                  <Button onClick={handleDownloadPDF} size="lg" className="pop-shadow">
                    <Download className="w-4 h-4 mr-2" /> Download PDF Report
                  </Button>
                </div>
              </>
            )}
          </motion.div>
        </AnimatePresence>

        <div className="flex justify-between mt-6 pb-8">
          <Button variant="outline" onClick={goBack} disabled={step === 1}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          {step < 4 ? (
            <Button onClick={goNext}>
              Next <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button variant="outline" onClick={() => { setStep(1); setCompletedSteps([]); }}>
              Start Over
            </Button>
          )}
        </div>
      </div>
    </main>
  );
}
