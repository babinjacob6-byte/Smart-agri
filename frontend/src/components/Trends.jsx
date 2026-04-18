import { useState, useMemo } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const CHART_HEIGHT = 340;

const CHART_MARGIN = { top: 5, right: 10, left: -10, bottom: 5 };
const AXIS_TICK_STYLE = { fontSize: 12, fill: "#4B5563" };
const X_AXIS_LINE_STYLE = { stroke: "#1A7A3C20" };

const metrics = [
  { key: "temp", label: "Temp", color: "#2563EB", unit: "°C" },
  { key: "humidity", label: "Humidity", color: "#F59E0B", unit: "%" },
  { key: "nh3", label: "NH₃", color: "#8B5CF6", unit: "ppm" },
  { key: "risk", label: "Risk Score", color: "#EF4444", unit: "" },
];

const DOT_CONFIGS = Object.fromEntries(
  metrics.map((m) => [m.key, { r: 4, fill: m.color, strokeWidth: 0 }])
);
const ACTIVE_DOT_CONFIG = { r: 6, strokeWidth: 2, stroke: "#fff" };

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

function MetricToggle({ metric, isActive, onToggle }) {
  return (
    <button
      data-testid={`toggle-${metric.key}`}
      onClick={onToggle}
      className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium border transition-all duration-150 ${
        isActive
          ? "border-[#1A7A3C]/20 bg-white shadow-sm"
          : "border-transparent bg-[#F0FDF4] text-[#9CA3AF]"
      }`}
    >
      <span
        className="w-3 h-3 rounded-full flex-shrink-0"
        style={{ backgroundColor: isActive ? metric.color : "#D1D5DB" }}
      />
      {metric.label}
    </button>
  );
}

function StatCard({ stat }) {
  return (
    <div
      className="rounded-lg border border-[#1A7A3C]/10 bg-[#F0FDF4] p-4"
      data-testid={`stat-card-${stat.key}`}
    >
      <div className="flex items-center gap-2 mb-2">
        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: stat.color }} />
        <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
          {stat.label}
        </span>
      </div>
      <div className="space-y-1">
        <div className="flex justify-between text-xs">
          <span className="text-[#9CA3AF]">Min</span>
          <span className="font-medium text-[#111827]">{stat.min}{stat.unit}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#9CA3AF]">Max</span>
          <span className="font-medium text-[#111827]">{stat.max}{stat.unit}</span>
        </div>
        <div className="flex justify-between text-xs">
          <span className="text-[#9CA3AF]">Current</span>
          <span className="font-bold text-[#111827]">{stat.current}{stat.unit}</span>
        </div>
      </div>
    </div>
  );
}

export default function Trends({ data, loading }) {
  const [activeLines, setActiveLines] = useState(
    Object.fromEntries(metrics.map((m) => [m.key, true]))
  );

  const history = data?.history || [];

  const stats = useMemo(() => metrics.map((m) => {
    const values = history.map((h) => h[m.key]).filter((v) => v !== undefined);
    return {
      ...m,
      min: values.length ? Math.min(...values) : "—",
      max: values.length ? Math.max(...values) : "—",
      current: values.length ? values[values.length - 1] : "—",
    };
  }), [history]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="trends-loading">
        <div className="w-8 h-8 border-2 border-[#1A7A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-6" data-testid="trends-page">
      <div className="hidden md:block">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
          Trends
        </h1>
        <p className="text-sm text-[#4B5563] mt-1">Sensor data over the last 12 hours</p>
      </div>

      <div className="flex flex-wrap gap-2" data-testid="trend-toggles">
        {metrics.map((m) => (
          <MetricToggle
            key={m.key}
            metric={m}
            isActive={activeLines[m.key]}
            onToggle={() => setActiveLines((prev) => ({ ...prev, [m.key]: !prev[m.key] }))}
          />
        ))}
      </div>

      <div className="bg-[#F0FDF4] border border-[#1A7A3C]/10 rounded-lg p-4 md:p-6" data-testid="trends-chart">
        <ResponsiveContainer width="100%" height={CHART_HEIGHT}>
          <LineChart data={history} margin={CHART_MARGIN}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1A7A3C10" />
            <XAxis dataKey="time" tick={AXIS_TICK_STYLE} tickLine={false} axisLine={X_AXIS_LINE_STYLE} />
            <YAxis tick={AXIS_TICK_STYLE} tickLine={false} axisLine={false} />
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
                    dot={DOT_CONFIGS[m.key]}
                    activeDot={ACTIVE_DOT_CONFIG}
                  />
                )
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3" data-testid="trend-stats">
        {stats.map((s) => (
          <StatCard key={s.key} stat={s} />
        ))}
      </div>
    </div>
  );
}
