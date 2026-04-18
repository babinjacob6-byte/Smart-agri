import { useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import { Badge } from "@/components/ui/badge";

const metrics = [
  { key: "temp", label: "Temp", color: "#2563EB", unit: "°C" },
  { key: "humidity", label: "Humidity", color: "#F59E0B", unit: "%" },
  { key: "nh3", label: "NH₃", color: "#8B5CF6", unit: "ppm" },
  { key: "risk", label: "Risk Score", color: "#EF4444", unit: "" },
];

function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-[#111827] text-white px-4 py-3 rounded-lg shadow-lg text-sm">
      <p className="font-semibold mb-1.5 text-xs text-white/70">{label}</p>
      {payload.map((entry) => (
        <div key={entry.dataKey} className="flex items-center gap-2 py-0.5">
          <span
            className="w-2.5 h-2.5 rounded-full flex-shrink-0"
            style={{ backgroundColor: entry.color }}
          />
          <span className="text-white/80">{entry.name}:</span>
          <span className="font-semibold">{entry.value}</span>
        </div>
      ))}
    </div>
  );
}

export default function Trends({ data, loading }) {
  const [activeLines, setActiveLines] = useState(
    Object.fromEntries(metrics.map((m) => [m.key, true]))
  );

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="trends-loading">
        <div className="w-8 h-8 border-2 border-[#1A7A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const history = data.history || [];

  const toggleLine = (key) => {
    setActiveLines((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compute min/max/current for each metric
  const stats = metrics.map((m) => {
    const values = history.map((h) => h[m.key]).filter((v) => v !== undefined);
    return {
      ...m,
      min: values.length ? Math.min(...values) : "—",
      max: values.length ? Math.max(...values) : "—",
      current: values.length ? values[values.length - 1] : "—",
    };
  });

  return (
    <div className="space-y-6" data-testid="trends-page">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
          Trends
        </h1>
        <p className="text-sm text-[#4B5563] mt-1">Sensor data over the last 12 hours</p>
      </div>

      {/* Toggle buttons */}
      <div className="flex flex-wrap gap-2" data-testid="trend-toggles">
        {metrics.map((m) => (
          <button
            key={m.key}
            data-testid={`toggle-${m.key}`}
            onClick={() => toggleLine(m.key)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
              activeLines[m.key]
                ? "border-[#1A7A3C]/20 bg-white shadow-sm"
                : "border-transparent bg-[#F0FDF4] text-[#9CA3AF]"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{
                backgroundColor: activeLines[m.key] ? m.color : "#D1D5DB",
              }}
            />
            {m.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div
        className="bg-[#F0FDF4] border border-[#1A7A3C]/10 rounded-lg p-4 md:p-6"
        data-testid="trends-chart"
      >
        <ResponsiveContainer width="100%" height={340}>
          <LineChart data={history} margin={{ top: 5, right: 10, left: -10, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A7A3C10" />
            <XAxis
              dataKey="time"
              tick={{ fontSize: 12, fill: "#4B5563" }}
              tickLine={false}
              axisLine={{ stroke: "#1A7A3C20" }}
            />
            <YAxis
              tick={{ fontSize: 12, fill: "#4B5563" }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            {metrics.map(
              (m) =>
                activeLines[m.key] && (
                  <Line
                    key={m.key}
                    type="monotone"
                    dataKey={m.key}
                    name={m.label}
                    stroke={m.color}
                    strokeWidth={2.5}
                    dot={{ r: 4, fill: m.color, strokeWidth: 0 }}
                    activeDot={{ r: 6, strokeWidth: 2, stroke: "#fff" }}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="trend-stats">
        {stats.map((s) => (
          <div
            key={s.key}
            className="rounded-lg border border-[#1A7A3C]/10 bg-[#F0FDF4] p-4"
            data-testid={`stat-card-${s.key}`}
          >
            <div className="flex items-center gap-2 mb-2">
              <span
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: s.color }}
              />
              <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
                {s.label}
              </span>
            </div>
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-[#9CA3AF]">Min</span>
                <span className="font-medium text-[#111827]">{s.min}{s.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#9CA3AF]">Max</span>
                <span className="font-medium text-[#111827]">{s.max}{s.unit}</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-[#9CA3AF]">Current</span>
                <span className="font-bold text-[#111827]">{s.current}{s.unit}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
