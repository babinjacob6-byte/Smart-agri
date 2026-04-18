import { useState, useCallback } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

export default function useAgroSenseData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchDashboard = useCallback(async () => {
    try {
      const res = await fetch(`${API}/dashboard`);
      setDashboardData(await res.json());
    } catch (_) { /* network error – silently ignored */ }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      const res = await fetch(`${API}/insights`);
      setInsightsData(await res.json());
    } catch (_) { /* network error */ }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      const res = await fetch(`${API}/trends`);
      setTrendsData(await res.json());
    } catch (_) { /* network error */ }
  }, []);

  const fetchAlerts = useCallback(async (filter = "all") => {
    try {
      const res = await fetch(`${API}/alerts?filter=${filter}`);
      setAlertsData(await res.json());
    } catch (_) { /* network error */ }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    await Promise.all([fetchDashboard(), fetchInsights(), fetchTrends(), fetchAlerts()]);
    setLoading(false);
  }, [fetchDashboard, fetchInsights, fetchTrends, fetchAlerts]);

  const handleSimulate = useCallback(async () => {
    try {
      await fetch(`${API}/simulate-alert`, { method: "POST" });
      setIsSimulated(true);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (_) { /* network error */ }
  }, [fetchDashboard, fetchInsights, fetchAlerts]);

  const handleReset = useCallback(async () => {
    try {
      await fetch(`${API}/reset-simulation`, { method: "POST" });
      setIsSimulated(false);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (_) { /* network error */ }
  }, [fetchDashboard, fetchInsights, fetchAlerts]);

  return {
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
  };
}
