import { Thermometer, Droplets, Wind, Gauge, Move, FlaskConical } from "lucide-react";

const sensorIcons = {
  "Temperature": Thermometer,
  "Humidity": Droplets,
  "NH\u2083": FlaskConical,
  "CO": Wind,
  "Pressure": Gauge,
  "Motion": Move,
};

const statusColors = {
  safe: { dot: "bg-[#22C55E]", border: "border-l-[#22C55E]", bg: "bg-[#F0FDF4]" },
  warning: { dot: "bg-[#F59E0B]", border: "border-l-[#F59E0B]", bg: "bg-[#FFFBEB]" },
  danger: { dot: "bg-[#EF4444]", border: "border-l-[#EF4444]", bg: "bg-[#FEF2F2]" },
};

export default function SensorCard({ name, value, unit, status, safeRange }) {
  const colors = statusColors[status] || statusColors.safe;
  const Icon = sensorIcons[name] || Gauge;
  const getPulseClass = () => {
    if (status === "danger") return "animate-danger-pulse";
    if (status === "warning") return "animate-warning-pulse";
    return "";
  };

  return (
    <div
      data-testid={`sensor-card-${name.toLowerCase().replace(/[₃\s]/g, "")}`}
      className={`relative rounded-lg border border-[#1A7A3C]/10 ${colors.bg} border-l-4 ${colors.border} p-4 transition-all duration-200 hover:-translate-y-[1px] ${getPulseClass()}`}
    >
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <Icon size={16} className="text-[#4B5563]" strokeWidth={1.8} />
          <span className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider">
            {name}
          </span>
        </div>
        <span className={`w-2.5 h-2.5 rounded-full ${colors.dot} flex-shrink-0`} />
      </div>
      <div className="flex items-baseline gap-1">
        <span className="text-2xl font-bold text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
          {value}
        </span>
        <span className="text-sm text-[#4B5563]">{unit}</span>
      </div>
      {safeRange && (
        <p className="text-xs text-[#9CA3AF] mt-1.5">
          Safe: {safeRange}
        </p>
      )}
    </div>
  );
}
