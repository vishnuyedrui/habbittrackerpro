import { useState, useRef, useMemo, useCallback } from "react";
import { Plus, Trash2, Download, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { generateExcel } from "@/lib/excel-generator";
import { toast } from "@/hooks/use-toast";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const chartConfig = {
  percentage: {
    label: "Completion %",
    color: "hsl(var(--primary))",
  },
};

const Index = () => {
  const [habits, setHabits] = useState<string[]>([]);
  const [newHabit, setNewHabit] = useState("");
  // checkData[habitIndex][dayIndex] = boolean
  const [checkData, setCheckData] = useState<boolean[][]>([]);
  const statsRef = useRef<HTMLDivElement>(null);

  const addHabit = useCallback(() => {
    const trimmed = newHabit.trim();
    if (!trimmed) return;
    if (habits.includes(trimmed)) {
      toast({ title: "Duplicate habit", description: "This habit already exists.", variant: "destructive" });
      return;
    }
    setHabits((prev) => [...prev, trimmed]);
    setCheckData((prev) => [...prev, Array(7).fill(false)]);
    setNewHabit("");
  }, [newHabit, habits]);

  const removeHabit = useCallback((index: number) => {
    setHabits((prev) => prev.filter((_, i) => i !== index));
    setCheckData((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const toggleCheck = useCallback((hIdx: number, dIdx: number) => {
    setCheckData((prev) => {
      const next = prev.map((row) => [...row]);
      next[hIdx][dIdx] = !next[hIdx][dIdx];
      return next;
    });
  }, []);

  const dailyPcts = useMemo(() => {
    if (habits.length === 0) return DAYS.map(() => 0);
    return DAYS.map((_, dIdx) => {
      const completed = checkData.filter((row) => row[dIdx]).length;
      return Math.round((completed / habits.length) * 100);
    });
  }, [checkData, habits.length]);

  const weeklyPct = useMemo(() => {
    if (habits.length === 0) return 0;
    return Math.round(dailyPcts.reduce((a, b) => a + b, 0) / 7);
  }, [dailyPcts, habits.length]);

  const chartData = useMemo(
    () => DAYS.map((day, i) => ({ day, percentage: dailyPcts[i] })),
    [dailyPcts]
  );

  const handlePreview = () => {
    statsRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleDownload = async () => {
    if (habits.length === 0) {
      toast({ title: "No habits", description: "Add at least one habit before downloading.", variant: "destructive" });
      return;
    }
    try {
      await generateExcel(habits, checkData);
      toast({ title: "Downloaded!", description: "Your Excel file has been saved." });
    } catch {
      toast({ title: "Error", description: "Failed to generate Excel file.", variant: "destructive" });
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card py-6">
        <div className="mx-auto max-w-5xl px-4">
          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Weekly Habit Tracker
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Track your habits, visualize progress, and download a professional Excel report.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl space-y-8 px-4 py-8">
        {/* Add Habit */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Add Habits</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder="e.g. Exercise, Read, Meditate..."
                value={newHabit}
                onChange={(e) => setNewHabit(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addHabit()}
                className="max-w-md"
              />
              <Button onClick={addHabit}>
                <Plus className="mr-1 h-4 w-4" /> Add
              </Button>
            </div>

            {habits.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-2">
                {habits.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1 rounded-full border bg-secondary px-3 py-1 text-sm text-secondary-foreground"
                  >
                    {h}
                    <button
                      onClick={() => removeHabit(i)}
                      className="ml-1 rounded-full p-0.5 hover:bg-destructive/20"
                      aria-label={`Remove ${h}`}
                    >
                      <Trash2 className="h-3 w-3 text-destructive" />
                    </button>
                  </span>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tracking Table */}
        {habits.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Weekly Tracking</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[180px]">Habit</TableHead>
                    {DAYS.map((d) => (
                      <TableHead key={d} className="text-center w-[80px]">
                        {d}
                      </TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {habits.map((habit, hIdx) => (
                    <TableRow key={hIdx}>
                      <TableCell className="font-medium">{habit}</TableCell>
                      {DAYS.map((_, dIdx) => (
                        <TableCell key={dIdx} className="text-center">
                          <Checkbox
                            checked={checkData[hIdx]?.[dIdx] ?? false}
                            onCheckedChange={() => toggleCheck(hIdx, dIdx)}
                          />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        )}

        {/* Stats Dashboard */}
        <div ref={statsRef} className="space-y-6">
          {habits.length > 0 && (
            <>
              {/* Daily percentages */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Daily Completion</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-7 gap-2 text-center">
                    {DAYS.map((day, i) => (
                      <div
                        key={day}
                        className="rounded-lg border bg-secondary p-3"
                      >
                        <div className="text-xs font-medium text-muted-foreground">
                          {day}
                        </div>
                        <div className="mt-1 text-xl font-bold text-foreground">
                          {dailyPcts[i]}%
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 flex items-center justify-center rounded-lg border bg-accent p-4">
                    <div className="text-center">
                      <div className="text-sm font-medium text-muted-foreground">
                        Weekly Average
                      </div>
                      <div className="text-3xl font-bold text-foreground">
                        {weeklyPct}%
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Chart */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Progress Chart</CardTitle>
                </CardHeader>
                <CardContent>
                  <ChartContainer config={chartConfig} className="h-[300px] w-full">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} />
                      <XAxis dataKey="day" />
                      <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                      <ChartTooltip content={<ChartTooltipContent />} />
                      <Bar
                        dataKey="percentage"
                        fill="hsl(var(--primary))"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ChartContainer>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 pb-12">
          <Button variant="outline" onClick={handlePreview} disabled={habits.length === 0}>
            <Eye className="mr-1 h-4 w-4" /> Preview
          </Button>
          <Button onClick={handleDownload} disabled={habits.length === 0}>
            <Download className="mr-1 h-4 w-4" /> Download Excel
          </Button>
        </div>
      </main>
    </div>
  );
};

export default Index;
