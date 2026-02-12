import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TrendingUp } from "lucide-react";

interface WeekEntry {
  weekLabel: string;
  percentage: number;
}

interface YearlyChartProps {
  data: WeekEntry[];
}

const chartConfig = {
  percentage: {
    label: "Weekly %",
    color: "hsl(var(--accent))",
  },
};

export default function YearlyChart({ data }: YearlyChartProps) {
  if (data.length === 0) {
    return (
      <Card className="animate-fade-in border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-lg">
            <TrendingUp className="h-5 w-5 text-accent" />
            Yearly Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            No weekly data yet. Complete a week to see your yearly progress!
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="animate-fade-in overflow-hidden">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <TrendingUp className="h-5 w-5 text-accent" />
          Yearly Progress
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" />
            <XAxis
              dataKey="weekLabel"
              fontSize={10}
              interval={data.length > 20 ? Math.floor(data.length / 12) : 0}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <YAxis
              domain={[0, 100]}
              tickFormatter={(v) => `${v}%`}
              tick={{ fill: "hsl(var(--muted-foreground))" }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="percentage"
              fill="hsl(var(--accent))"
              radius={[4, 4, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
