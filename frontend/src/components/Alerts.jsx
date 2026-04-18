import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Info, Eye } from "lucide-react";

const filterTabs = ["All", "Warning", "Watch", "Info"];

const levelStyles = {
  WARNING: { dot: "bg-[#EF4444]", badge: "bg-[#FEF3C7] text-[#92400E] border-[#F59E0B]/30", border: "border-l-[#EF4444]" },
  WATCH: { dot: "bg-[#F97316]", badge: "bg-[#FFF7ED] text-[#9A3412] border-[#F97316]/30", border: "border-l-[#F97316]" },
  INFO: { dot: "bg-[#9CA3AF]", badge: "bg-[#F3F4F6] text-[#4B5563] border-[#9CA3AF]/30", border: "border-l-[#9CA3AF]" },
  ALERT: { dot: "bg-[#EF4444]", badge: "bg-[#FEE2E2] text-[#991B1B] border-[#EF4444]/30", border: "border-l-[#EF4444]" },
};

function AlertItem({ alert, index }) {
  const styles = levelStyles[alert.level] || levelStyles.INFO;
  return (
    <div
      data-testid={`alert-item-${index}`}
      className={`flex items-start gap-4 p-4 rounded-lg border border-[#1A7A3C]/10 bg-white border-l-4 ${styles.border} transition-all duration-150 hover:bg-[#FAFAFA]`}
    >
      <span className={`w-3 h-3 rounded-full ${styles.dot} flex-shrink-0 mt-1`} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-0.5">
          <span className="text-xs font-mono text-[#9CA3AF]">{alert.time}</span>
        </div>
        <p className="text-sm text-[#111827]">{alert.message}</p>
        <p className="text-xs text-[#9CA3AF] mt-0.5">{alert.sensor}</p>
      </div>
      <Badge className={`text-[10px] font-semibold border flex-shrink-0 ${styles.badge}`}>
        {alert.level}
      </Badge>
    </div>
  );
}

function AlertBanner({ activeWarning, onViewDetails }) {
  if (!activeWarning) return null;
  const bgColor = activeWarning.level === "ALERT" ? "bg-[#EF4444]" : "bg-[#F59E0B]";
  return (
    <div
      data-testid="active-warning-banner"
      className={`fixed bottom-16 md:bottom-0 left-0 md:left-16 lg:left-64 right-0 z-30 px-4 py-3 flex items-center justify-between ${bgColor}`}
    >
      <div className="flex items-center gap-2">
        <AlertTriangle size={16} className="text-white" />
        <span className="text-sm font-medium text-white">
          Active {activeWarning.level.toLowerCase()} — {activeWarning.message}
        </span>
      </div>
      <button
        data-testid="view-details-link"
        onClick={onViewDetails}
        className="flex items-center gap-1 text-sm font-medium text-white/90 hover:text-white transition-colors"
      >
        <Eye size={14} />
        View Details
      </button>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center" data-testid="alerts-empty">
      <Info size={40} className="text-[#D1D5DB] mb-3" />
      <p className="text-sm text-[#9CA3AF]">No alerts in this category</p>
    </div>
  );
}

export default function Alerts({ data, loading, onFilterChange }) {
  const [activeFilter, setActiveFilter] = useState("All");
  const navigate = useNavigate();

  const handleFilterChange = (filter) => {
    setActiveFilter(filter);
    onFilterChange(filter.toLowerCase());
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="alerts-loading">
        <div className="w-8 h-8 border-2 border-[#1A7A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const alerts = data.alerts || [];

  return (
    <div className="space-y-6" data-testid="alerts-page">
      <div className="hidden md:block">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
          Alerts
        </h1>
        <p className="text-sm text-[#4B5563] mt-1">
          {alerts.length} alert{alerts.length !== 1 ? "s" : ""} recorded
        </p>
      </div>

      <div className="flex gap-2" data-testid="alert-filters">
        {filterTabs.map((tab) => (
          <button
            key={tab}
            data-testid={`filter-${tab.toLowerCase()}`}
            onClick={() => handleFilterChange(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
              activeFilter === tab
                ? "bg-[#1A7A3C] text-white"
                : "bg-[#F0FDF4] text-[#4B5563] hover:bg-[#E6FBF0]"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="space-y-2" data-testid="alert-list">
        {alerts.length === 0 ? (
          <EmptyState />
        ) : (
          alerts.map((alert, i) => (
            <AlertItem key={alert.id || i} alert={alert} index={i} />
          ))
        )}
      </div>

      <AlertBanner activeWarning={data.active_warning} onViewDetails={() => navigate("/insights")} />
    </div>
  );
}
