"use client";

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

interface HoursPerProject {
  project: string;
  hours: number;
  color: string;
}

interface ProjectPieChartProps {
  data: HoursPerProject[];
}

export function ProjectPieChart({ data }: ProjectPieChartProps) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const formatTooltip = (value: any, name: any) => {
    const numValue = typeof value === "number" ? value : 0;
    return [`${numValue.toFixed(2)}h`, String(name)];
  };

  // Don't render if no data
  if (!data || data.length === 0) {
    return (
      <div className="w-full h-[300px] flex items-center justify-center text-slate-400">
        Aucune donnee disponible
      </div>
    );
  }

  // Transform data to match recharts expected format
  const chartData = data.map((item) => ({
    name: item.project,
    value: item.hours,
    color: item.color,
  }));

  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={chartData}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={2}
            dataKey="value"
            nameKey="name"
          >
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{
              backgroundColor: "rgba(26, 18, 37, 0.95)",
              border: "1px solid rgba(139, 92, 246, 0.2)",
              borderRadius: "8px",
              boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
            }}
            labelStyle={{ color: "#e2e8f0", fontWeight: 500 }}
            formatter={formatTooltip}
          />
          <Legend
            layout="vertical"
            align="right"
            verticalAlign="middle"
            iconType="circle"
            iconSize={10}
            formatter={(value) => (
              <span className="text-slate-300 text-sm">{value}</span>
            )}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
