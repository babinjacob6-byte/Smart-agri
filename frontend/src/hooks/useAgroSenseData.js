import { useState, useCallback } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

export default function useAgroSenseData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useCallback(async () => {
    try {
      setDashboardData(await fetchJSON(`${API}/dashboard`));
    } catch (err) {
      setError((prev) => prev || err.message);
    }
  }, []);

  const fetchInsights = useCallback(async () => {
    try {
      setInsightsData(await fetchJSON(`${API}/insights`));
    } catch (err) {
      setError((prev) => prev || err.message);
    }
  }, []);

  const fetchTrends = useCallback(async () => {
    try {
      setTrendsData(await fetchJSON(`${API}/trends`));
    } catch (err) {
      setError((prev) => prev || err.message);
    }
  }, []);

  const fetchAlerts = useCallback(async (filter = "all") => {
    try {
      setAlertsData(await fetchJSON(`${API}/alerts?filter=${filter}`));
    } catch (err) {
      setError((prev) => prev || err.message);
    }
  }, []);

  const fetchAll = useCallback(async () => {
    setLoading(true);
    setError(null);
    await Promise.all([fetchDashboard(), fetchInsights(), fetchTrends(), fetchAlerts()]);
    setLoading(false);
  }, [fetchDashboard, fetchInsights, fetchTrends, fetchAlerts]);

  const handleSimulate = useCallback(async () => {
    try {
      await fetchJSON(`${API}/simulate-alert`, { method: "POST" });
      setIsSimulated(true);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (err) {
      setError(err.message);
    }
  }, [fetchDashboard, fetchInsights, fetchAlerts]);

  const handleReset = useCallback(async () => {
    try {
      await fetchJSON(`${API}/reset-simulation`, { method: "POST" });
      setIsSimulated(false);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (err) {
      setError(err.message);
    }
  }, [fetchDashboard, fetchInsights, fetchAlerts]);

  return {
    dashboardData,
    insightsData,
    trendsData,
    alertsData,
    isSimulated,
    loading,
    error,
    fetchAll,
    fetchAlerts,
    handleSimulate,
    handleReset,
  };
}
