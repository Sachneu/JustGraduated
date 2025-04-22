"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useEffect, useState } from "react";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";
import { AlertCircle } from "lucide-react";
import { useTheme } from "next-themes";

export default function PerformanceChart({ assessments, isLoading = false, error = null }) {
  const { resolvedTheme } = useTheme();
  const [chartData, setChartData] = useState([]);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (assessments && !isLoading && !error) {
      const formattedData = assessments.map((assessment, index) => ({
        date: format(new Date(assessment.createdAt), "MMM dd"),
        score: assessment.quizScore,
        trend:
          index > 0
            ? assessment.quizScore > assessments[index - 1].quizScore
              ? "up"
              : assessment.quizScore < assessments[index - 1].quizScore
              ? "down"
              : "neutral"
            : "neutral",
      }));
      setChartData(formattedData);
    } else {
      setChartData([]);
    }
  }, [assessments, isLoading, error]);

  // Calculate average score for reference line
  const averageScore =
    chartData.length > 0
      ? chartData.reduce((sum, data) => sum + data.score, 0) / chartData.length
      : 0;

  // Determine colors based on theme
  const textColor = resolvedTheme === "dark" ? "#e5e7eb" : "#1f2937"; // Light gray for dark mode, dark gray for light mode
  const mutedColor = resolvedTheme === "dark" ? "#6b7280" : "#9ca3af"; // Muted colors for secondary text
  const gridColor = resolvedTheme === "dark" ? "#4b5563" : "#e5e7eb"; // Grid lines
  const lineColor = () => {
    if (chartData.length < 2) return resolvedTheme === "dark" ? "#3b82f6" : "hsl(var(--primary))";
    const firstScore = chartData[0].score;
    const lastScore = chartData[chartData.length - 1].score;
    if (lastScore > firstScore) return resolvedTheme === "dark" ? "#22c55e" : "hsl(var(--success))"; // Green for upward trend
    if (lastScore < firstScore) return resolvedTheme === "dark" ? "#ef4444" : "hsl(var(--destructive))"; // Red for downward trend
    return resolvedTheme === "dark" ? "#3b82f6" : "hsl(var(--primary))"; // Default color for neutral trend
  };

  // Custom tooltip component
  const CustomTooltip = ({ active, payload }) => {
    if (active && payload?.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-background border rounded-lg p-3 shadow-md">
          <p className="text-sm font-medium" style={{ color: textColor }}>
            Score: {data.score}%
          </p>
          <p className="text-xs" style={{ color: mutedColor }}>
            {data.date}
          </p>
          <p className="text-xs" style={{ color: mutedColor }}>
            Trend: {data.trend === "up" ? "↑ Improving" : data.trend === "down" ? "↓ Declining" : "→ Stable"}
          </p>
        </div>
      );
    }
    return null;
  };

  // Render loading state
  if (isLoading || !mounted) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Performance Trend
          </CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <Skeleton className="h-[300px] w-full" />
        </CardContent>
      </Card>
    );
  }

  // Render error state
  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Performance Trend
          </CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px] text-red-600">
            <AlertCircle className="h-6 w-6 mr-2" />
            <p>{error || "Failed to load performance data."}</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Render empty state
  if (!chartData.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="gradient-title text-3xl md:text-4xl">
            Performance Trend
          </CardTitle>
          <CardDescription>Your quiz scores over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center h-[300px]" style={{ color: mutedColor }}>
            <p>No assessments available to display.</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="gradient-title text-3xl md:text-4xl">
          Performance Trend
        </CardTitle>
        <CardDescription style={{ color: mutedColor }}>
          Your quiz scores over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]" role="img" aria-label="Line chart showing performance trend over time">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
              <XAxis
                dataKey="date"
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
              />
              <YAxis
                domain={[0, 100]}
                stroke={textColor}
                fontSize={12}
                tickLine={false}
                axisLine={false}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              <ReferenceLine
                y={averageScore}
                stroke={mutedColor}
                strokeDasharray="3 3"
                label={{
                  position: "insideTopLeft",
                  value: `Avg: ${averageScore.toFixed(1)}%`,
                  fill: mutedColor,
                  fontSize: 12,
                }}
              />
              <Line
                type="monotone"
                dataKey="score"
                stroke={lineColor()}
                strokeWidth={2}
                dot={{ r: 4, strokeWidth: 2, fill: lineColor() }}
                activeDot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}