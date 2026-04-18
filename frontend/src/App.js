import { useEffect } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import Insights from "@/components/Insights";
import Trends from "@/components/Trends";
import Alerts from "@/components/Alerts";
import useAgroSenseData from "@/hooks/useAgroSenseData";

function App() {
  const {
    dashboardData,
    insightsData,
    trendsData,
    alertsData,
    isSimulated,
    loading,
    fetchAll,
    fetchAlerts,
    handleSimulate,
    handleReset,
  } = useAgroSenseData();

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  return (
    <BrowserRouter>
      <Layout
        isSimulated={isSimulated}
        onSimulate={handleSimulate}
        onReset={handleReset}
        dashboardData={dashboardData}
      >
        <Routes>
          <Route path="/" element={<Dashboard data={dashboardData} loading={loading} />} />
          <Route path="/insights" element={<Insights data={insightsData} loading={loading} />} />
          <Route path="/trends" element={<Trends data={trendsData} loading={loading} />} />
          <Route
            path="/alerts"
            element={<Alerts data={alertsData} loading={loading} onFilterChange={fetchAlerts} />}
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
