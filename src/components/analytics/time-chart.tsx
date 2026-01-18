"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

interface HoursPerDay {
  date: string;
  hours: number;
}

interface TimeChartProps {
  data: HoursPerDay[];
}

export function TimeChart({ data }: TimeChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any) => {
    const numValue = typeof value === "number" ? value : 0;
    return [`${numValue.toFixed(2)}h`, "Heures"];
  };

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
        >
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgba(139, 92, 246, 0.1)"
            vertical={false}
          />
          <XAxis
            dataKey="date"
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
          />
          <YAxis
            axisLine={false}
            tickLine={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            tickFormatter={(value) => `${value}h`}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(26, 18, 37, 0.95)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
            labelStyle={{ color: "#e2e8f0", fontWeight: 500 }}
            itemStyle={{ color: "#8b5cf6" }}
            formatter={formatTooltip}
            cursor={{ fill: "rgba(139, 92, 246, 0.1)" }}
          />
          <Bar
            dataKey="hours"
            fill="#8b5cf6"
            radius={[4, 4, 0, 0]}
            maxBarSize={50}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
