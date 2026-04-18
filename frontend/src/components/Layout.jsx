import { useLocation, useNavigate } from "react-router-dom";
import { LayoutDashboard, Lightbulb, TrendingUp, Bell, Leaf, Zap, RotateCcw } from "lucide-react";

const navItems = [
  { path: "/", label: "Dashboard", icon: LayoutDashboard },
  { path: "/insights", label: "Insights", icon: Lightbulb },
  { path: "/trends", label: "Trends", icon: TrendingUp },
  { path: "/alerts", label: "Alerts", icon: Bell },
];

export default function Layout({ children, isSimulated, onSimulate, onReset, dashboardData }) {
  const location = useLocation();
  const navigate = useNavigate();
  const currentPath = location.pathname;

  return (
    <div className="min-h-screen bg-white" data-testid="app-layout">
      {/* Desktop sidebar */}
      <aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 w-64 lg:w-64 md:w-16 flex-col bg-white border-r border-[#1A7A3C]/10 z-40"
        data-testid="desktop-sidebar"
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1A7A3C]/10">
          <div className="w-8 h-8 rounded-lg bg-[#1A7A3C] flex items-center justify-center flex-shrink-0">
            <Leaf className="w-4.5 h-4.5 text-white" size={18} />
          </div>
          <span className="text-lg font-bold text-[#111827] md:hidden lg:block font-['Cabinet_Grotesk',sans-serif]">
            AgroSense AI
          </span>
        </div>

        {/* Nav items */}
        <nav className="flex-1 py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                data-testid={`nav-${item.label.toLowerCase()}`}
                onClick={() => navigate(item.path)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                  isActive
                    ? "bg-[#1A7A3C]/10 text-[#1A7A3C]"
                    : "text-[#4B5563] hover:bg-[#F0FDF4] hover:text-[#111827]"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.8} />
                <span className="md:hidden lg:block">{item.label}</span>
              </button>
            );
          })}
        </nav>

        {/* Crop info */}
        {dashboardData && (
          <div className="px-4 py-4 border-t border-[#1A7A3C]/10 md:hidden lg:block">
            <div className="flex items-center gap-2 mb-1">
              <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
              <span className="text-xs font-semibold text-[#1A7A3C] uppercase tracking-wider">Live</span>
            </div>
            <p className="text-sm font-medium text-[#111827]">{dashboardData.crop}</p>
            <p className="text-xs text-[#4B5563]">{dashboardData.location}</p>
          </div>
        )}
      </aside>

      {/* Mobile top bar */}
      <header
        className="md:hidden fixed top-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#1A7A3C]/10"
        data-testid="mobile-top-bar"
      >
        <div className="flex items-center justify-between px-4 py-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#1A7A3C] flex items-center justify-center">
              <Leaf className="w-4 h-4 text-white" />
            </div>
            <span className="text-base font-bold text-[#111827] font-['Cabinet_Grotesk',sans-serif]">
              AgroSense AI
            </span>
          </div>
          {dashboardData && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-[#4B5563]">
                {dashboardData.crop} · {dashboardData.location?.split(",")[0]}
              </span>
              <span className="flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-[#22C55E] animate-pulse" />
                <span className="text-xs font-semibold text-[#1A7A3C]">Live</span>
              </span>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main
        className="md:ml-16 lg:ml-64 pt-[60px] md:pt-0 pb-20 md:pb-6 min-h-screen"
        data-testid="main-content"
      >
        <div className="max-w-6xl mx-auto px-4 md:px-6 lg:px-8 py-6">
          {children}
        </div>
      </main>

      {/* Mobile bottom nav */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/80 backdrop-blur-md border-t border-[#1A7A3C]/10"
        data-testid="mobile-bottom-nav"
      >
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const isActive = currentPath === item.path;
            const Icon = item.icon;
            return (
              <button
                key={item.path}
                data-testid={`mobile-nav-${item.label.toLowerCase()}`}
                onClick={() => navigate(item.path)}
                className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-all duration-150 ${
                  isActive
                    ? "text-[#1A7A3C]"
                    : "text-[#9CA3AF]"
                }`}
              >
                <Icon size={20} strokeWidth={isActive ? 2.2 : 1.5} />
                <span className={`text-[10px] font-medium ${isActive ? "font-semibold" : ""}`}>
                  {item.label}
                </span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* Simulate Alert FAB */}
      <button
        data-testid="simulate-alert-fab"
        onClick={isSimulated ? onReset : onSimulate}
        className={`fixed z-50 right-4 md:right-8 flex items-center gap-2 px-4 py-3 rounded-full shadow-lg transition-all duration-200 hover:-translate-y-0.5 ${
          isSimulated
            ? "bg-[#EF4444] hover:bg-[#DC2626] text-white bottom-20 md:bottom-8"
            : "bg-[#1A7A3C] hover:bg-[#145C2D] text-white bottom-20 md:bottom-8"
        }`}
      >
        {isSimulated ? (
          <>
            <RotateCcw size={16} />
            <span className="text-sm font-medium">Reset</span>
          </>
        ) : (
          <>
            <Zap size={16} />
            <span className="text-sm font-medium">Simulate Alert</span>
          </>
        )}
      </button>
    </div>
  );
}
