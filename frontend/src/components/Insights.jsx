import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sparkles, TrendingUp, Leaf, CheckCircle2 } from "lucide-react";

export default function Insights({ data, loading }) {
  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]" data-testid="insights-loading">
        <div className="w-8 h-8 border-2 border-[#1A7A3C] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const maxContribution = Math.max(...Object.values(data.driver_contributions));

  return (
    <div className="space-y-6" data-testid="insights-page">
      {/* Header */}
      <div className="hidden md:block">
        <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
          Insights
        </h1>
        <p className="text-sm text-[#4B5563] mt-1">AI-powered analysis and recommendations</p>
      </div>

      {/* AI Advisory Card */}
      <div
        className="rounded-lg border border-[#1A7A3C]/20 border-l-4 border-l-[#1A7A3C] bg-[#F0FDF4] p-6"
        data-testid="ai-advisory-card"
      >
        <div className="flex items-center gap-2 mb-3">
          <Sparkles size={18} className="text-[#1A7A3C]" />
          <h3 className="text-lg font-semibold text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
            AI Advisory
          </h3>
        </div>
        <p className="text-sm leading-relaxed text-[#111827]">
          {data.advisory}
        </p>
        <div className="mt-4 pt-3 border-t border-[#1A7A3C]/10 flex items-center gap-2">
          <code className="text-[10px] font-mono bg-[#1A7A3C]/10 text-[#1A7A3C] px-2 py-0.5 rounded">
            AI Generated
          </code>
          <span className="text-xs text-[#9CA3AF]">Updated 12:04</span>
        </div>
      </div>

      {/* Primary Driver Card */}
      <div
        className="rounded-lg border border-[#1A7A3C]/10 bg-[#F0FDF4] p-6"
        data-testid="primary-driver-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <TrendingUp size={18} className="text-[#F59E0B]" />
          <h3 className="text-lg font-semibold text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
            Primary Driver
          </h3>
        </div>
        <p className="text-sm font-medium text-[#111827] mb-4">{data.primary_driver}</p>
        <div className="space-y-3">
          {Object.entries(data.driver_contributions).map(([key, value]) => (
            <div key={key} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-[#4B5563]">{key}</span>
                <span className="text-xs font-bold text-[#111827]">{value}%</span>
              </div>
              <div className="h-2 bg-[#E5E7EB] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-700"
                  style={{
                    width: `${value}%`,
                    backgroundColor:
                      value === maxContribution ? "#1A7A3C" : "#1A7A3C80",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Crop Profile Card */}
      <div
        className="rounded-lg border border-[#1A7A3C]/10 bg-[#F0FDF4] p-6"
        data-testid="crop-profile-card"
      >
        <div className="flex items-center gap-2 mb-4">
          <Leaf size={18} className="text-[#1A7A3C]" />
          <h3 className="text-lg font-semibold text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
            Crop Profile
          </h3>
        </div>

        <div className="mb-4">
          <label className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider block mb-2">
            Current Crop
          </label>
          <Select defaultValue={data.crop} data-testid="crop-select">
            <SelectTrigger
              className="w-full sm:w-64 bg-white border-[#1A7A3C]/20 text-[#111827]"
              data-testid="crop-select-trigger"
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent data-testid="crop-select-content">
              {data.crop_options.map((crop) => (
                <SelectItem key={crop} value={crop} data-testid={`crop-option-${crop.toLowerCase()}`}>
                  {crop}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <h4 className="text-xs font-semibold text-[#4B5563] uppercase tracking-wider mb-2">
            Safe Ranges
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {Object.entries(data.safe_ranges).map(([key, value]) => (
              <div
                key={key}
                className="flex items-center justify-between py-2 px-3 rounded bg-white border border-[#1A7A3C]/10"
              >
                <span className="text-sm text-[#4B5563]">{key}</span>
                <span className="text-sm font-medium text-[#111827]">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recommended Actions */}
      <div
        className="rounded-lg border border-[#1A7A3C]/10 bg-white p-6"
        data-testid="recommended-actions"
      >
        <h3 className="text-lg font-semibold text-[#111827] font-['Cabinet_Grotesk',sans-serif] mb-4">
          Recommended Actions
        </h3>
        <ul className="space-y-3">
          {data.recommended_actions.map((action, i) => (
            <li key={i} className="flex items-start gap-3">
              <CheckCircle2
                size={18}
                className="text-[#1A7A3C] flex-shrink-0 mt-0.5"
              />
              <span className="text-sm text-[#111827] leading-relaxed">{action}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
