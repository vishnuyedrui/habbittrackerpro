import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Target, Save, Share2, RotateCcw, GraduationCap, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

const STORAGE_KEY = "whatif_calculator_v2";

interface SemesterEntry {
  cgpa: string;
  credits: string;
}

interface SavedState {
  completedCount: number;
  semesters: SemesterEntry[];
  targetCGPA: string;
  remainingSemesters: string;
  remainingCredits: string;
  savedAt: string;
}

function getCGPATier(cgpa: number) {
  if (cgpa >= 9.0) return { label: "Outstanding", emoji: "🏆", colorClass: "text-warning", bgClass: "bg-warning/10 border-warning/30" };
  if (cgpa >= 8.0) return { label: "Distinction", emoji: "🥇", colorClass: "text-success", bgClass: "bg-success/10 border-success/30" };
  if (cgpa >= 7.0) return { label: "Good", emoji: "🥈", colorClass: "text-primary", bgClass: "bg-primary/10 border-primary/30" };
  if (cgpa >= 6.0) return { label: "Average", emoji: "🥉", colorClass: "text-warning", bgClass: "bg-warning/10 border-warning/30" };
  return { label: "Needs Improvement", emoji: "🔴", colorClass: "text-destructive", bgClass: "bg-destructive/10 border-destructive/30" };
}

export default function WhatIfCalculator() {
  const [completedCount, setCompletedCount] = useState<string>("");
  const [semesters, setSemesters] = useState<SemesterEntry[]>([]);
  const [targetCGPA, setTargetCGPA] = useState("");
  const [remainingSemesters, setRemainingSemesters] = useState("");
  const [remainingCredits, setRemainingCredits] = useState("");
  const [loaded, setLoaded] = useState(false);

  // Load saved state
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const state: SavedState = JSON.parse(saved);
        setCompletedCount(String(state.completedCount));
        setSemesters(state.semesters);
        setTargetCGPA(state.targetCGPA);
        setRemainingSemesters(state.remainingSemesters);
        setRemainingCredits(state.remainingCredits);
        toast.success("Welcome back! Your last session is loaded ✅");
      } catch { /* ignore */ }
    }
    setLoaded(true);
  }, []);

  // Update semester entries when count changes
  const handleCountChange = (val: string) => {
    setCompletedCount(val);
    const num = parseInt(val);
    if (isNaN(num) || num <= 0) {
      setSemesters([]);
      return;
    }
    const count = Math.min(num, 12);
    setSemesters(prev => {
      const next: SemesterEntry[] = [];
      for (let i = 0; i < count; i++) {
        next.push(prev[i] || { cgpa: "", credits: "" });
      }
      return next;
    });
  };

  const updateSemester = (index: number, field: keyof SemesterEntry, value: string) => {
    setSemesters(prev => prev.map((s, i) => i === index ? { ...s, [field]: value } : s));
  };

  // Calculate current cumulative CGPA
  const currentStats = useMemo(() => {
    let totalPoints = 0;
    let totalCredits = 0;
    let validCount = 0;

    for (const sem of semesters) {
      const cgpa = parseFloat(sem.cgpa);
      const credits = parseFloat(sem.credits);
      if (!isNaN(cgpa) && cgpa > 0 && !isNaN(credits) && credits > 0) {
        totalPoints += cgpa * credits;
        totalCredits += credits;
        validCount++;
      }
    }

    return {
      cgpa: totalCredits > 0 ? totalPoints / totalCredits : 0,
      totalCredits,
      totalPoints,
      validCount,
    };
  }, [semesters]);

  // Reverse calculator: required SGPA
  const requiredResult = useMemo(() => {
    const target = parseFloat(targetCGPA);
    const remSems = parseInt(remainingSemesters);
    const remCreds = parseFloat(remainingCredits);

    if (isNaN(target) || target <= 0 || isNaN(remSems) || remSems <= 0 || isNaN(remCreds) || remCreds <= 0) {
      return null;
    }

    const totalRemainingCredits = remCreds * remSems;
    const totalCredits = currentStats.totalCredits + totalRemainingCredits;
    const needed = (target * totalCredits - currentStats.totalPoints) / totalRemainingCredits;

    return {
      requiredSGPA: needed,
      achievable: needed <= 10 && needed >= 0,
      totalCredits,
      totalRemainingCredits,
    };
  }, [targetCGPA, remainingSemesters, remainingCredits, currentStats]);

  const handleSave = () => {
    const state: SavedState = {
      completedCount: parseInt(completedCount) || 0,
      semesters,
      targetCGPA,
      remainingSemesters,
      remainingCredits,
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    toast.success("💾 Saved successfully!");
  };

  const handleReset = () => {
    localStorage.removeItem(STORAGE_KEY);
    setCompletedCount("");
    setSemesters([]);
    setTargetCGPA("");
    setRemainingSemesters("");
    setRemainingCredits("");
    toast.success("🔄 Reset complete!");
  };

  const handleShare = () => {
    const text = currentStats.cgpa > 0
      ? `My current CGPA is ${currentStats.cgpa.toFixed(2)}${requiredResult ? ` and I need ${requiredResult.requiredSGPA.toFixed(2)} SGPA to reach ${targetCGPA}` : ""}! 🎓 Try it at gradegurubyteamdino.vercel.app/what-if`
      : "Check out the What-If CGPA Calculator! 🎓 gradegurubyteamdino.vercel.app/what-if";

    if (navigator.share) {
      navigator.share({ title: "GradeGuru What-If Calculator", text }).catch(() => {});
    } else {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, "_blank");
    }
  };

  const tier = currentStats.cgpa > 0 ? getCGPATier(currentStats.cgpa) : null;
  const count = parseInt(completedCount);
  const hasValidCount = !isNaN(count) && count > 0;

  if (!loaded) return null;

  return (
    <div className="container max-w-2xl py-6 pb-24 space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-2">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
          <Target className="w-4 h-4" />
          What-If Calculator
        </div>
        <h1 className="text-2xl sm:text-3xl font-display font-bold text-foreground">
          SGPA → CGPA What-If Calculator
        </h1>
        <p className="text-muted-foreground text-sm max-w-lg mx-auto">
          Enter your completed semester data and find out what you need to achieve your target CGPA
        </p>
      </motion.div>

      {/* Step 1 — How many semesters completed */}
      <Card className="border-border bg-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-display flex items-center gap-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">1</span>
            How many semesters have you completed?
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            type="number"
            min={1}
            max={12}
            value={completedCount}
            onChange={e => handleCountChange(e.target.value)}
            placeholder="e.g. 5"
            className="h-12 text-lg max-w-[200px]"
          />
        </CardContent>
      </Card>

      {/* Step 2 — Grade Card Entry */}
      <AnimatePresence>
        {hasValidCount && semesters.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">2</span>
                  Enter your semester details
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {semesters.map((sem, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.04 }}
                    className="rounded-xl border border-border bg-secondary/20 p-4"
                  >
                    <p className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
                      <GraduationCap className="w-4 h-4 text-primary" />
                      Semester {i + 1}
                    </p>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">CGPA</Label>
                        <Input
                          type="number"
                          min={0}
                          max={10}
                          step={0.01}
                          value={sem.cgpa}
                          onChange={e => updateSemester(i, "cgpa", e.target.value)}
                          placeholder="0.00"
                          className="h-10"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-muted-foreground">Credits Earned</Label>
                        <Input
                          type="number"
                          min={0}
                          max={100}
                          value={sem.credits}
                          onChange={e => updateSemester(i, "credits", e.target.value)}
                          placeholder="0"
                          className="h-10"
                        />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 3 — Current Cumulative CGPA */}
      <AnimatePresence>
        {currentStats.validCount > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
          >
            <Card className={`border overflow-hidden ${tier?.bgClass || "border-border bg-card"}`}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">3</span>
                  Your Current CGPA
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="text-center py-4">
                  <motion.div
                    key={currentStats.cgpa.toFixed(2)}
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="inline-flex items-center justify-center w-28 h-28 rounded-2xl border-2 border-primary/20 bg-card"
                  >
                    <span className="text-4xl font-bold font-display text-foreground">
                      {currentStats.cgpa.toFixed(2)}
                    </span>
                  </motion.div>
                  {tier && (
                    <div className="flex items-center justify-center gap-2 mt-3">
                      <span className="text-lg">{tier.emoji}</span>
                      <span className={`text-sm font-semibold ${tier.colorClass}`}>{tier.label}</span>
                    </div>
                  )}
                </div>
                <div className="flex items-center justify-between text-sm px-2 py-2 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground">Total Credits Earned</span>
                  <span className="font-semibold text-foreground">{currentStats.totalCredits}</span>
                </div>
                <div className="flex items-center justify-between text-sm px-2 py-2 rounded-lg bg-card border border-border">
                  <span className="text-muted-foreground">Semesters Counted</span>
                  <span className="font-semibold text-foreground">{currentStats.validCount}</span>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Step 4 — What-If Scenario Planner */}
      <AnimatePresence>
        {currentStats.validCount > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Card className="border-border bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base font-display flex items-center gap-2">
                  <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs font-bold">4</span>
                  <TrendingUp className="w-4 h-4 text-primary" />
                  What-If Scenario Planner
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-sm text-muted-foreground">🎯 Target CGPA you want to achieve</Label>
                    <Input
                      type="number"
                      min={0}
                      max={10}
                      step={0.01}
                      value={targetCGPA}
                      onChange={e => setTargetCGPA(e.target.value)}
                      placeholder="e.g. 8.0"
                      className="h-11"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">📅 Remaining Semesters</Label>
                      <Input
                        type="number"
                        min={1}
                        max={12}
                        value={remainingSemesters}
                        onChange={e => setRemainingSemesters(e.target.value)}
                        placeholder="e.g. 3"
                        className="h-11"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-sm text-muted-foreground">📚 Credits per Semester</Label>
                      <Input
                        type="number"
                        min={1}
                        max={50}
                        value={remainingCredits}
                        onChange={e => setRemainingCredits(e.target.value)}
                        placeholder="e.g. 20"
                        className="h-11"
                      />
                    </div>
                  </div>
                </div>

                {/* Result */}
                <AnimatePresence>
                  {requiredResult && (
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      className={`rounded-xl p-5 border ${
                        requiredResult.achievable
                          ? "border-success/30 bg-success/5"
                          : "border-destructive/30 bg-destructive/5"
                      }`}
                    >
                      {requiredResult.achievable ? (
                        <div className="space-y-2 text-center">
                          <p className="text-sm font-semibold text-success">Achievable ✅</p>
                          <p className="text-foreground">
                            You need a minimum of{" "}
                            <span className="text-2xl font-bold font-display text-success">
                              {requiredResult.requiredSGPA.toFixed(2)}
                            </span>{" "}
                            CGPA in each remaining semester to reach your goal.
                          </p>
                          <p className="text-xs text-muted-foreground mt-2">
                            Total credits after: {requiredResult.totalCredits} ({currentStats.totalCredits} completed + {requiredResult.totalRemainingCredits} remaining)
                          </p>
                        </div>
                      ) : (
                        <div className="space-y-2 text-center">
                          <p className="text-sm font-semibold text-destructive">Not possible ❌</p>
                          <p className="text-sm text-foreground">
                            You would need a CGPA of <strong>{requiredResult.requiredSGPA.toFixed(2)}</strong> per semester, which exceeds the 10-point scale.
                          </p>
                          {requiredResult.requiredSGPA > 10 && (
                            <p className="text-xs text-muted-foreground">
                              Try setting a slightly lower target or adding more remaining semesters.
                            </p>
                          )}
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Actions */}
      <div className="flex flex-wrap gap-3 justify-center">
        <Button onClick={handleSave} variant="outline" className="gap-2">
          <Save className="w-4 h-4" /> Save
        </Button>
        <Button onClick={handleShare} variant="outline" className="gap-2">
          <Share2 className="w-4 h-4" /> Share
        </Button>
        <Button onClick={handleReset} variant="ghost" className="gap-2 text-muted-foreground">
          <RotateCcw className="w-4 h-4" /> Reset
        </Button>
      </div>
    </div>
  );
}
