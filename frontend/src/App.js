import { useState, useEffect, useCallback } from "react";
import "@/App.css";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Layout from "@/components/Layout";
import Dashboard from "@/components/Dashboard";
import Insights from "@/components/Insights";
import Trends from "@/components/Trends";
import Alerts from "@/components/Alerts";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

function App() {
  const [dashboardData, setDashboardData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/dashboard`);
      const data = await res.json();
      setDashboardData(data);
    } catch (e) {
      console.error("Failed to fetch dashboard:", e);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch(`${API}/insights`);
      const data = await res.json();
      setInsightsData(data);
    } catch (e) {
      console.error("Failed to fetch insights:", e);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch(`${API}/trends`);
      const data = await res.json();
      setTrendsData(data);
    } catch (e) {
      console.error("Failed to fetch trends:", e);
    }
  }, []);

  const fetchAlerts = useCallback(async (filter = "all") => {
    try {
      const res = await fetch(`${API}/alerts?filter=${filter}`);
      const data = await res.json();
      setAlertsData(data);
    } catch (e) {
      console.error("Failed to fetch alerts:", e);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDashboard(), fetchInsights(), fetchTrends(), fetchAlerts()]);
    setLoading(false);
  }, [fetchDashboard, fetchInsights, fetchTrends, fetchAlerts]);

  useEffect(() => {
    fetchAll();
  }, [fetchAll]);

  const handleSimulate = async () => {
    try {
      await fetch(`${API}/simulate-alert`, { method: "POST" });
      setIsSimulated(true);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (e) {
      console.error("Failed to simulate:", e);
    }
  };

  const handleReset = async () => {
    try {
      await fetch(`${API}/reset-simulation`, { method: "POST" });
      setIsSimulated(false);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (e) {
      console.error("Failed to reset:", e);
    }
  };

  return (
    <BrowserRouter>
      <Layout
        isSimulated={isSimulated}
        onSimulate={handleSimulate}
        onReset={handleReset}
        dashboardData={dashboardData}
      >
        <Routes>
          <Route
            path="/"
            element={
              <Dashboard data={dashboardData} loading={loading} />
            }
          />
          <Route
            path="/insights"
            element={
              <Insights data={insightsData} loading={loading} />
            }
          />
          <Route
            path="/trends"
            element={
              <Trends data={trendsData} loading={loading} />
            }
          />
          <Route
            path="/alerts"
            element={
              <Alerts
                data={alertsData}
                loading={loading}
                onFilterChange={fetchAlerts}
              />
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
