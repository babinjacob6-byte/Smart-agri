"""
AgroSense AI Backend API Tests
Tests for: Dashboard, Insights, Trends, Alerts, Simulation endpoints
"""
import pytest
import requests
from requests import Response
import os

BASE_URL: str = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


def _get(path: str, **kwargs) -> Response:
    """Convenience wrapper for GET requests to the API."""
    return requests.get(f"{BASE_URL}{path}", **kwargs)


def _post(path: str, **kwargs) -> Response:
    """Convenience wrapper for POST requests to the API."""
    return requests.post(f"{BASE_URL}{path}", **kwargs)

class TestHealthAndRoot:
    """Basic API health checks"""
    
    def test_api_root(self) -> None:
        """Test API root endpoint returns message"""
        response: Response = _get("/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "AgroSense AI API"


class TestDashboardAPI:
    """Dashboard endpoint tests - GET /api/dashboard"""
    
    def test_dashboard_returns_200(self) -> None:
        """Test dashboard endpoint returns 200"""
        response: Response = _get("/api/dashboard")
        assert response.status_code == 200
    
    def test_dashboard_returns_crop_data(self) -> None:
        """Test dashboard returns crop and location"""
        response: Response = _get("/api/dashboard")
        data = response.json()
        assert "crop" in data
        assert data["crop"] == "Turmeric"
        assert "location" in data
        assert "Erode Godown" in data["location"]
    
    def test_dashboard_returns_risk_score(self) -> None:
        """Test dashboard returns risk_score=67 and risk_level=WARNING"""
        _post("/api/reset-simulation")
        
        response: Response = _get("/api/dashboard")
        data = response.json()
        assert "risk_score" in data
        assert data["risk_score"] == 67
        assert "risk_level" in data
        assert data["risk_level"] == "WARNING"
    
    def test_dashboard_returns_sensors(self) -> None:
        """Test dashboard returns sensor data"""
        response: Response = _get("/api/dashboard")
        data = response.json()
        assert "sensors" in data
        sensors = data["sensors"]
        
        # Check all expected sensors exist
        expected_sensors = ["temperature", "humidity", "nh3", "co", "pressure", "motion"]
        for sensor in expected_sensors:
            assert sensor in sensors, f"Missing sensor: {sensor}"
            assert "value" in sensors[sensor]
            assert "unit" in sensors[sensor]
            assert "status" in sensors[sensor]
            assert "safe" in sensors[sensor]
    
    def test_dashboard_returns_confidence(self) -> None:
        """Test dashboard returns confidence and primary_driver"""
        response: Response = _get("/api/dashboard")
        data = response.json()
        assert "confidence" in data
        assert isinstance(data["confidence"], int)
        assert "primary_driver" in data


class TestInsightsAPI:
    """Insights endpoint tests - GET /api/insights"""
    
    def test_insights_returns_200(self) -> None:
        """Test insights endpoint returns 200"""
        response: Response = _get("/api/insights")
        assert response.status_code == 200
    
    def test_insights_returns_advisory(self) -> None:
        """Test insights returns AI advisory"""
        response: Response = _get("/api/insights")
        data = response.json()
        assert "advisory" in data
        assert len(data["advisory"]) > 0
    
    def test_insights_returns_primary_driver(self) -> None:
        """Test insights returns primary_driver"""
        response: Response = _get("/api/insights")
        data = response.json()
        assert "primary_driver" in data
        assert "driver_contributions" in data
        
        # Check driver contributions structure
        contributions = data["driver_contributions"]
        assert "Temperature" in contributions
        assert "Humidity" in contributions
        assert "NH3" in contributions
    
    def test_insights_returns_crop_options(self) -> None:
        """Test insights returns crop_options list"""
        response: Response = _get("/api/insights")
        data = response.json()
        assert "crop_options" in data
        assert isinstance(data["crop_options"], list)
        assert len(data["crop_options"]) >= 5
        assert "Turmeric" in data["crop_options"]
        assert "Paddy" in data["crop_options"]
    
    def test_insights_returns_safe_ranges(self) -> None:
        """Test insights returns safe_ranges"""
        response: Response = _get("/api/insights")
        data = response.json()
        assert "safe_ranges" in data
        safe_ranges = data["safe_ranges"]
        assert "Temperature" in safe_ranges
        assert "Humidity" in safe_ranges
        assert "NH3" in safe_ranges
    
    def test_insights_returns_recommended_actions(self) -> None:
        """Test insights returns recommended_actions list"""
        response: Response = _get("/api/insights")
        data = response.json()
        assert "recommended_actions" in data
        assert isinstance(data["recommended_actions"], list)
        assert len(data["recommended_actions"]) >= 1


class TestTrendsAPI:
    """Trends endpoint tests - GET /api/trends"""
    
    def test_trends_returns_200(self) -> None:
        """Test trends endpoint returns 200"""
        response: Response = _get("/api/trends")
        assert response.status_code == 200
    
    def test_trends_returns_7_history_entries(self) -> None:
        """Test trends returns 7 history entries"""
        response: Response = _get("/api/trends")
        data = response.json()
        assert "history" in data
        assert isinstance(data["history"], list)
        assert len(data["history"]) == 7
    
    def test_trends_history_structure(self) -> None:
        """Test each history entry has required fields"""
        response: Response = _get("/api/trends")
        data = response.json()
        
        for entry in data["history"]:
            assert "time" in entry
            assert "temp" in entry
            assert "humidity" in entry
            assert "nh3" in entry
            assert "risk" in entry


class TestAlertsAPI:
    """Alerts endpoint tests - GET /api/alerts"""
    
    def test_alerts_returns_200(self) -> None:
        """Test alerts endpoint returns 200"""
        response: Response = _get("/api/alerts")
        assert response.status_code == 200
    
    def test_alerts_returns_5_alerts(self) -> None:
        """Test alerts returns 5 alerts (after reset)"""
        _post("/api/reset-simulation")
        
        response: Response = _get("/api/alerts")
        data = response.json()
        assert "alerts" in data
        assert isinstance(data["alerts"], list)
        assert len(data["alerts"]) == 5
    
    def test_alerts_returns_active_warning(self) -> None:
        """Test alerts returns active_warning"""
        response: Response = _get("/api/alerts")
        data = response.json()
        assert "active_warning" in data
        if data["active_warning"]:
            assert "level" in data["active_warning"]
            assert "message" in data["active_warning"]
    
    def test_alerts_structure(self) -> None:
        """Test each alert has required fields"""
        response: Response = _get("/api/alerts")
        data = response.json()
        
        for alert in data["alerts"]:
            assert "id" in alert
            assert "time" in alert
            assert "level" in alert
            assert "message" in alert
            assert "sensor" in alert
    
    def test_alerts_filter_warning(self) -> None:
        """Test filter=warning returns only WARNING alerts"""
        response: Response = _get("/api/alerts?filter=warning")
        assert response.status_code == 200
        data = response.json()
        
        for alert in data["alerts"]:
            assert alert["level"] == "WARNING"
    
    def test_alerts_filter_watch(self) -> None:
        """Test filter=watch returns only WATCH alerts"""
        response: Response = _get("/api/alerts?filter=watch")
        assert response.status_code == 200
        data = response.json()
        
        for alert in data["alerts"]:
            assert alert["level"] == "WATCH"
    
    def test_alerts_filter_info(self) -> None:
        """Test filter=info returns only INFO alerts"""
        response: Response = _get("/api/alerts?filter=info")
        assert response.status_code == 200
        data = response.json()
        
        for alert in data["alerts"]:
            assert alert["level"] == "INFO"


class TestSimulationAPI:
    """Simulation endpoint tests - POST /api/simulate-alert and POST /api/reset-simulation"""
    
    def test_simulate_alert_changes_risk(self) -> None:
        """Test POST /api/simulate-alert changes risk_score to 89 and risk_level to ALERT"""
        _post("/api/reset-simulation")
        
        response: Response = _post("/api/simulate-alert")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "simulated"
        assert data["risk_score"] == 89
        assert data["risk_level"] == "ALERT"
        
        # Verify dashboard reflects simulation
        dashboard_response: Response = _get("/api/dashboard")
        dashboard_data = dashboard_response.json()
        assert dashboard_data["risk_score"] == 89
        assert dashboard_data["risk_level"] == "ALERT"
    
    def test_reset_simulation_restores_normal(self) -> None:
        """Test POST /api/reset-simulation resets back to normal state"""
        _post("/api/simulate-alert")
        
        response: Response = _post("/api/reset-simulation")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "reset"
        
        # Verify dashboard is back to normal
        dashboard_response: Response = _get("/api/dashboard")
        dashboard_data = dashboard_response.json()
        assert dashboard_data["risk_score"] == 67
        assert dashboard_data["risk_level"] == "WARNING"
    
    def test_simulation_affects_insights(self) -> None:
        """Test simulation changes insights advisory"""
        _post("/api/reset-simulation")
        
        normal_insights: dict = _get("/api/insights").json()
        normal_advisory: str = normal_insights["advisory"]
        
        _post("/api/simulate-alert")
        
        simulated_insights: dict = _get("/api/insights").json()
        simulated_advisory: str = simulated_insights["advisory"]
        
        assert simulated_advisory != normal_advisory
        assert "Critical" in simulated_advisory or "Ammonia" in simulated_advisory
        
        _post("/api/reset-simulation")


@pytest.fixture(autouse=True, scope="module")
def cleanup_simulation() -> None:
    """Reset simulation after all tests in module"""
    yield
    _post("/api/reset-simulation")
