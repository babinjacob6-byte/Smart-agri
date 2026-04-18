import RiskGauge from "@/components/RiskGauge";
import SensorCard from "@/components/SensorCard";
import { Badge } from "@/components/ui/badge";
import { Activity } from "lucide-react";

const sensorOrder = ["temperature", "humidity", "nh3", "co", "pressure", "motion"];
const sensorLabels = {
  temperature: "Temperature",
  humidity: "Humidity",
  nh3: "NH\u2083",
  co: "CO",
  pressure: "Pressure",
  motion: "Motion",
};

const RISK_AMBER_THRESHOLD = 40;
const RISK_RED_THRESHOLD = 70;

const LEVEL_COLORS = {
  WARNING: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30",
  ALERT: "bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/30",
  DEFAULT: "bg-[#DCFCE7] text-[#166534] border-[#22C55E]/30",
};

function LoadingSpinner() {
  return (
    <div className="flex items-center justify-center min-h-[60vh]" data-testid="dashboard-loading">
      <div className="w-8 h-8 border-2 border-[#1A7A3C] border-t-transparent rounded-full animate-spin" />
    </div>
  );
}

export default function Dashboard({ data, loading }) {
  if (loading || !data) return <LoadingSpinner />;

  const levelColor = LEVEL_COLORS[data.risk_level] || LEVEL_COLORS.DEFAULT;

  return (
    <div className="space-y-8" data-testid="dashboard-page">
      {/* Desktop header */}
      <div className="hidden md:flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
            Dashboard
          </h1>
          <p className="text-sm text-[#4B5563] mt-1">
            {data.crop} · {data.location}
          </p>
        </div>
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
            <span className="text-xs font-semibold text-[#1A7A3C] uppercase tracking-wider">Live</span>
          </span>
          <span className="text-xs text-[#4B5563]">Updated {data.last_updated}</span>
        </div>
      </div>

      {/* Risk Score Gauge */}
      <div className="flex flex-col items-center" data-testid="risk-gauge-section">
        <RiskGauge score={data.risk_score} />
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#111827]/60 mt-3">
          Spoilage Risk Score
        </p>
        <div className="flex items-center gap-3 mt-3">
          <Badge
            data-testid="risk-level-badge"
            className={`text-xs font-semibold px-3 py-1 border ${levelColor}`}
          >
            {data.risk_level}
          </Badge>
          <span className="text-sm text-[#4B5563]">
            {data.confidence}% confidence
          </span>
        </div>
      </div>

      {/* Sensor Cards Grid */}
      <div
        className="grid grid-cols-2 md:grid-cols-3 gap-4"
        data-testid="sensor-grid"
      >
        {sensorOrder.map((key) => {
          const sensor = data.sensors[key];
          if (!sensor) return null;
          return (
            <SensorCard
              key={key}
              name={sensorLabels[key]}
              value={sensor.value}
              unit={sensor.unit}
              status={sensor.status}
              safeRange={sensor.safe}
            />
          );
        })}
      </div>

      {/* Primary driver + last updated */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pt-2 border-t border-[#1A7A3C]/10">
        <div className="flex items-center gap-2" data-testid="primary-driver">
          <Activity size={16} className="text-[#F59E0B]" />
          <span className="text-sm text-[#111827]">
            <span className="font-medium">Primary driver:</span>{" "}
            {data.primary_driver}
          </span>
        </div>
        <span className="text-xs text-[#4B5563]" data-testid="last-updated">
          Updated {data.last_updated}
        </span>
      </div>
    </div>
  );
}
