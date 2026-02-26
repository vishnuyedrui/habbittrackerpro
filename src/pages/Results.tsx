import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Loader2, GraduationCap, BookOpen, Award } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { GradeBadge } from "@/components/calculator/GradeBadge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

const SEMESTERS = [1, 2, 3, 4, 5, 6, 7, 8];

const gradePointMap: Record<string, number> = {
  O: 10, "A+": 9, A: 8, "B+": 7, B: 6, C: 5, P: 4, F: 0,
};

const categoryColors: Record<string, string> = {
  FC: "bg-accent/15 text-accent border-accent/30",
  UC: "bg-primary/15 text-primary border-primary/30",
  PC: "bg-pop-cyan/15 text-pop-cyan border-pop-cyan/30",
  PE: "bg-warning/15 text-warning border-warning/30",
  OE: "bg-destructive/15 text-destructive border-destructive/30",
  SEC: "bg-pop-purple/15 text-pop-purple border-pop-purple/30",
  AEC: "bg-pop-orange/15 text-pop-orange border-pop-orange/30",
  VAC: "bg-success/15 text-success border-success/30",
};

interface SubjectResult {
  course_name: string;
  course_code: string;
  category: string;
  credits: string;
  subject_type: string;
  grade: string;
  grade_points: number | null;
  month: string;
  year: string;
}

interface InternalMark {
  subject_name: string;
  subject_code: string;
  internal_marks: number | null;
  mid1: number | null;
  mid2: number | null;
}

interface ResultsData {
  student_name: string;
  regid: string;
  semid: string;
  sgpa: string;
  cgpa: string;
  sem_credits: string;
  cum_credits: string;
  result_type: string;
  sem_table: SubjectResult[];
  internal_marks: InternalMark[];
  error?: string;
  _cached?: boolean;
}

export default function Results() {
  const [reg, setReg] = useState("");
  const [selectedSem, setSelectedSem] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<ResultsData | null>(null);
  const [error, setError] = useState("");

  const handleSearch = async () => {
    if (!reg.trim() || !selectedSem) return;
    setLoading(true);
    setError("");
    setResults(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke(
        "gitam-results",
        { body: { reg: reg.trim().toUpperCase(), sem: selectedSem } }
      );

      if (fnError) {
        setError(fnError.message || "Failed to fetch results");
        return;
      }

      if (data?.error) {
        setError(data.error);
        return;
      }

      setResults(data);
    } catch (e: any) {
      setError(e.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="container max-w-4xl py-8 px-4 min-h-[80vh]">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-center gap-3 mb-8"
      >
        <div className="w-12 h-12 rounded-2xl bg-accent/20 flex items-center justify-center">
          <GraduationCap className="w-6 h-6 text-accent" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold font-display tracking-tight">
            GITAM <span className="text-accent">Results</span>
          </h1>
          <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest">
            Grade card lookup · no login required
          </p>
        </div>
      </motion.div>

      {/* Search Card */}
      <Card className="mb-8 overflow-hidden relative">
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-primary" />
        <CardContent className="pt-6 space-y-5">
          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Registration Number
            </label>
            <Input
              placeholder="e.g. MU21CSEN0100234"
              value={reg}
              onChange={(e) => setReg(e.target.value.toUpperCase())}
              className="font-mono"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>

          <div>
            <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1.5 block">
              Semester
            </label>
            <div className="flex flex-wrap gap-2">
              {SEMESTERS.map((s) => (
                <button
                  key={s}
                  onClick={() => setSelectedSem(s)}
                  className={`px-3.5 py-2 rounded-lg font-mono text-sm border transition-all duration-150 ${
                    selectedSem === s
                      ? "bg-accent text-accent-foreground border-accent font-bold scale-105"
                      : "bg-background border-border text-muted-foreground hover:border-accent hover:text-accent"
                  }`}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <Button
            onClick={handleSearch}
            disabled={!reg.trim() || !selectedSem || loading}
            className="w-full font-bold text-base gap-2"
          >
            {loading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Search className="w-4 h-4" />
            )}
            Search Results
          </Button>

          {/* Status messages */}
          <AnimatePresence>
            {error && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                className="rounded-lg border border-destructive/50 bg-destructive/10 text-destructive text-sm font-mono p-3"
              >
                {error}
              </motion.div>
            )}
          </AnimatePresence>
        </CardContent>
      </Card>

      {/* Results */}
      <AnimatePresence>
        {results && !results.error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="space-y-6"
          >
            {/* Student Banner */}
            <Card className="overflow-hidden relative">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-accent to-primary" />
              <CardContent className="pt-6">
                <h2 className="text-xl sm:text-2xl font-bold font-display tracking-tight">
                  {results.student_name}
                </h2>
                <p className="text-xs font-mono text-muted-foreground mt-1">
                  {results.regid} · Semester {results.semid}
                  {results._cached && " · cached"}
                </p>
                <div className="flex flex-wrap gap-2 mt-4">
                  <Badge
                    variant="outline"
                    className="font-mono text-sm border-accent/40"
                  >
                    SGPA{" "}
                    <strong className="text-accent ml-1">{results.sgpa}</strong>
                  </Badge>
                  <Badge
                    variant="outline"
                    className="font-mono text-sm border-primary/40"
                  >
                    CGPA{" "}
                    <strong className="text-primary ml-1">{results.cgpa}</strong>
                  </Badge>
                  {results.sem_credits && (
                    <Badge variant="outline" className="font-mono text-sm">
                      Sem Credits{" "}
                      <strong className="ml-1">{results.sem_credits}</strong>
                    </Badge>
                  )}
                  {results.cum_credits && (
                    <Badge variant="outline" className="font-mono text-sm">
                      Total Credits{" "}
                      <strong className="ml-1">{results.cum_credits}</strong>
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Grades Table */}
            {results.sem_table.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <BookOpen className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Semester Grades
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <Card className="overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="font-mono text-xs">
                          Subject
                        </TableHead>
                        <TableHead className="font-mono text-xs">Cat</TableHead>
                        <TableHead className="font-mono text-xs text-center">
                          Credits
                        </TableHead>
                        <TableHead className="font-mono text-xs text-center">
                          Grade
                        </TableHead>
                        <TableHead className="font-mono text-xs hidden sm:table-cell">
                          Type
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {results.sem_table.map((sub, i) => (
                        <TableRow key={i}>
                          <TableCell>
                            <div className="font-semibold text-sm">
                              {sub.course_name}
                            </div>
                            <span className="text-xs font-mono text-muted-foreground">
                              {sub.course_code}
                            </span>
                          </TableCell>
                          <TableCell>
                            {sub.category && (
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-xs font-bold font-mono border ${
                                  categoryColors[sub.category] ||
                                  "bg-muted text-muted-foreground border-border"
                                }`}
                              >
                                {sub.category}
                              </span>
                            )}
                          </TableCell>
                          <TableCell className="text-center font-mono">
                            {sub.credits}
                          </TableCell>
                          <TableCell className="text-center">
                            {sub.grade ? (
                              <GradeBadge
                                letter={sub.grade}
                                point={
                                  gradePointMap[sub.grade] ??
                                  sub.grade_points ??
                                  0
                                }
                                size="sm"
                              />
                            ) : (
                              <span className="text-muted-foreground">—</span>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell font-mono text-xs text-muted-foreground">
                            {sub.subject_type}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </div>
            )}

            {/* Internal Marks */}
            {results.internal_marks.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <Award className="w-4 h-4 text-muted-foreground" />
                  <span className="text-xs font-mono uppercase tracking-widest text-muted-foreground">
                    Internal Marks
                  </span>
                  <div className="flex-1 h-px bg-border" />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {results.internal_marks.map((m, i) => (
                    <Card key={i} className="p-4">
                      <div className="flex justify-between items-center gap-3">
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-sm truncate">
                            {m.subject_name}
                          </div>
                          <div className="text-xs font-mono text-muted-foreground">
                            {m.subject_code}
                          </div>
                        </div>
                        <div className="text-lg font-bold font-mono text-accent shrink-0">
                          {m.internal_marks ?? "—"}
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* Empty state */}
            {results.sem_table.length === 0 &&
              results.internal_marks.length === 0 && (
                <div className="text-center py-12 text-muted-foreground font-mono text-sm">
                  <GraduationCap className="w-10 h-10 mx-auto mb-3 opacity-30" />
                  No grade data available for this semester.
                </div>
              )}
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
}
