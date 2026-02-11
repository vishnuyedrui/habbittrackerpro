import { useMemo } from "react";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    color: "hsl(var(--primary))",
  },
};

export default function YearlyChart({ data }: YearlyChartProps) {
  if (data.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Yearly Progress</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">No weekly data yet. Complete a week to see your yearly progress!</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Yearly Progress</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" vertical={false} />
            <XAxis dataKey="weekLabel" fontSize={10} interval={data.length > 20 ? Math.floor(data.length / 12) : 0} />
            <YAxis domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar
              dataKey="percentage"
              fill="hsl(var(--primary))"
              radius={[2, 2, 0, 0]}
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
