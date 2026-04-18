import { useState, useCallback } from "react";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
const API = `${BACKEND_URL}/api`;

async function fetchJSON(url, options) {
  const res = await fetch(url, options);
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`);
  return res.json();
}

/**
 * Creates a memoised fetcher that GETs `path`, stores result via `setter`,
 * and pipes errors into a shared `setError`.
 */
function useFetcher(path, setter, setError) {
  // `path`, `setter`, `setError` are stable (string literal / setState fn).
  // `API` and `fetchJSON` are module-level constants.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(async (query = "") => {
    try {
      setter(await fetchJSON(`${API}${path}${query}`));
    } catch (err) {
      setError((prev) => prev || err.message);
    }
  }, [path, setter, setError]);
}

export default function useAgroSenseData() {
  const [dashboardData, setDashboardData] = useState(null);
  const [insightsData, setInsightsData] = useState(null);
  const [trendsData, setTrendsData] = useState(null);
  const [alertsData, setAlertsData] = useState(null);
  const [isSimulated, setIsSimulated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboard = useFetcher("/dashboard", setDashboardData, setError);
  const fetchInsights  = useFetcher("/insights",  setInsightsData,  setError);
  const fetchTrends    = useFetcher("/trends",    setTrendsData,    setError);

  const fetchAlerts = useCallback(async (filter = "all") => {
    try {
      setAlertsData(await fetchJSON(`${API}/alerts?filter=${filter}`));
    } catch (err) {
      setError((prev) => prev || err.message);
    }
    // API and fetchJSON are module-level constants — stable across renders.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    // API and fetchJSON are module-level constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchDashboard, fetchInsights, fetchAlerts]);

  const handleReset = useCallback(async () => {
    try {
      await fetchJSON(`${API}/reset-simulation`, { method: "POST" });
      setIsSimulated(false);
      await Promise.all([fetchDashboard(), fetchInsights(), fetchAlerts()]);
    } catch (err) {
      setError(err.message);
    }
    // API and fetchJSON are module-level constants.
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
