"""
AgroSense AI Backend API Tests
Tests for: Dashboard, Insights, Trends, Alerts, Simulation endpoints
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndRoot:
    """Basic API health checks"""
    
    def test_api_root(self):
        """Test API root endpoint returns message"""
        response = requests.get(f"{BASE_URL}/api/")
        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert data["message"] == "AgroSense AI API"


class TestDashboardAPI:
    """Dashboard endpoint tests - GET /api/dashboard"""
    
    def test_dashboard_returns_200(self):
        """Test dashboard endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        assert response.status_code == 200
    
    def test_dashboard_returns_crop_data(self):
        """Test dashboard returns crop and location"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        data = response.json()
        assert "crop" in data
        assert data["crop"] == "Turmeric"
        assert "location" in data
        assert "Erode Godown" in data["location"]
    
    def test_dashboard_returns_risk_score(self):
        """Test dashboard returns risk_score=67 and risk_level=WARNING"""
        # First reset simulation to ensure clean state
        requests.post(f"{BASE_URL}/api/reset-simulation")
        
        response = requests.get(f"{BASE_URL}/api/dashboard")
        data = response.json()
        assert "risk_score" in data
        assert data["risk_score"] == 67
        assert "risk_level" in data
        assert data["risk_level"] == "WARNING"
    
    def test_dashboard_returns_sensors(self):
        """Test dashboard returns sensor data"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
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
    
    def test_dashboard_returns_confidence(self):
        """Test dashboard returns confidence and primary_driver"""
        response = requests.get(f"{BASE_URL}/api/dashboard")
        data = response.json()
        assert "confidence" in data
        assert isinstance(data["confidence"], int)
        assert "primary_driver" in data


class TestInsightsAPI:
    """Insights endpoint tests - GET /api/insights"""
    
    def test_insights_returns_200(self):
        """Test insights endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/insights")
        assert response.status_code == 200
    
    def test_insights_returns_advisory(self):
        """Test insights returns AI advisory"""
        response = requests.get(f"{BASE_URL}/api/insights")
        data = response.json()
        assert "advisory" in data
        assert len(data["advisory"]) > 0
    
    def test_insights_returns_primary_driver(self):
        """Test insights returns primary_driver"""
        response = requests.get(f"{BASE_URL}/api/insights")
        data = response.json()
        assert "primary_driver" in data
        assert "driver_contributions" in data
        
        # Check driver contributions structure
        contributions = data["driver_contributions"]
        assert "Temperature" in contributions
        assert "Humidity" in contributions
        assert "NH3" in contributions
    
    def test_insights_returns_crop_options(self):
        """Test insights returns crop_options list"""
        response = requests.get(f"{BASE_URL}/api/insights")
        data = response.json()
        assert "crop_options" in data
        assert isinstance(data["crop_options"], list)
        assert len(data["crop_options"]) >= 5
        assert "Turmeric" in data["crop_options"]
        assert "Paddy" in data["crop_options"]
    
    def test_insights_returns_safe_ranges(self):
        """Test insights returns safe_ranges"""
        response = requests.get(f"{BASE_URL}/api/insights")
        data = response.json()
        assert "safe_ranges" in data
        safe_ranges = data["safe_ranges"]
        assert "Temperature" in safe_ranges
        assert "Humidity" in safe_ranges
        assert "NH3" in safe_ranges
    
    def test_insights_returns_recommended_actions(self):
        """Test insights returns recommended_actions list"""
        response = requests.get(f"{BASE_URL}/api/insights")
        data = response.json()
        assert "recommended_actions" in data
        assert isinstance(data["recommended_actions"], list)
        assert len(data["recommended_actions"]) >= 1


class TestTrendsAPI:
    """Trends endpoint tests - GET /api/trends"""
    
    def test_trends_returns_200(self):
        """Test trends endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/trends")
        assert response.status_code == 200
    
    def test_trends_returns_7_history_entries(self):
        """Test trends returns 7 history entries"""
        response = requests.get(f"{BASE_URL}/api/trends")
        data = response.json()
        assert "history" in data
        assert isinstance(data["history"], list)
        assert len(data["history"]) == 7
    
    def test_trends_history_structure(self):
        """Test each history entry has required fields"""
        response = requests.get(f"{BASE_URL}/api/trends")
        data = response.json()
        
        for entry in data["history"]:
            assert "time" in entry
            assert "temp" in entry
            assert "humidity" in entry
            assert "nh3" in entry
            assert "risk" in entry


class TestAlertsAPI:
    """Alerts endpoint tests - GET /api/alerts"""
    
    def test_alerts_returns_200(self):
        """Test alerts endpoint returns 200"""
        response = requests.get(f"{BASE_URL}/api/alerts")
        assert response.status_code == 200
    
    def test_alerts_returns_5_alerts(self):
        """Test alerts returns 5 alerts (after reset)"""
        # Reset simulation first to ensure clean state
        requests.post(f"{BASE_URL}/api/reset-simulation")
        
        response = requests.get(f"{BASE_URL}/api/alerts")
        data = response.json()
        assert "alerts" in data
        assert isinstance(data["alerts"], list)
        assert len(data["alerts"]) == 5
    
    def test_alerts_returns_active_warning(self):
        """Test alerts returns active_warning"""
        response = requests.get(f"{BASE_URL}/api/alerts")
        data = response.json()
        assert "active_warning" in data
        if data["active_warning"]:
            assert "level" in data["active_warning"]
            assert "message" in data["active_warning"]
    
    def test_alerts_structure(self):
        """Test each alert has required fields"""
        response = requests.get(f"{BASE_URL}/api/alerts")
        data = response.json()
        
        for alert in data["alerts"]:
            assert "id" in alert
            assert "time" in alert
            assert "level" in alert
            assert "message" in alert
            assert "sensor" in alert
    
    def test_alerts_filter_warning(self):
        """Test filter=warning returns only WARNING alerts"""
        response = requests.get(f"{BASE_URL}/api/alerts?filter=warning")
        assert response.status_code == 200
        data = response.json()
        
        for alert in data["alerts"]:
            assert alert["level"] == "WARNING"
    
    def test_alerts_filter_watch(self):
        """Test filter=watch returns only WATCH alerts"""
        response = requests.get(f"{BASE_URL}/api/alerts?filter=watch")
        assert response.status_code == 200
        data = response.json()
        
        for alert in data["alerts"]:
            assert alert["level"] == "WATCH"
    
    def test_alerts_filter_info(self):
        """Test filter=info returns only INFO alerts"""
        response = requests.get(f"{BASE_URL}/api/alerts?filter=info")
        assert response.status_code == 200
        data = response.json()
        
        for alert in data["alerts"]:
            assert alert["level"] == "INFO"


class TestSimulationAPI:
    """Simulation endpoint tests - POST /api/simulate-alert and POST /api/reset-simulation"""
    
    def test_simulate_alert_changes_risk(self):
        """Test POST /api/simulate-alert changes risk_score to 89 and risk_level to ALERT"""
        # First reset to ensure clean state
        requests.post(f"{BASE_URL}/api/reset-simulation")
        
        # Simulate alert
        response = requests.post(f"{BASE_URL}/api/simulate-alert")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "simulated"
        assert data["risk_score"] == 89
        assert data["risk_level"] == "ALERT"
        
        # Verify dashboard reflects simulation
        dashboard_response = requests.get(f"{BASE_URL}/api/dashboard")
        dashboard_data = dashboard_response.json()
        assert dashboard_data["risk_score"] == 89
        assert dashboard_data["risk_level"] == "ALERT"
    
    def test_reset_simulation_restores_normal(self):
        """Test POST /api/reset-simulation resets back to normal state"""
        # First simulate
        requests.post(f"{BASE_URL}/api/simulate-alert")
        
        # Then reset
        response = requests.post(f"{BASE_URL}/api/reset-simulation")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "reset"
        
        # Verify dashboard is back to normal
        dashboard_response = requests.get(f"{BASE_URL}/api/dashboard")
        dashboard_data = dashboard_response.json()
        assert dashboard_data["risk_score"] == 67
        assert dashboard_data["risk_level"] == "WARNING"
    
    def test_simulation_affects_insights(self):
        """Test simulation changes insights advisory"""
        # Reset first
        requests.post(f"{BASE_URL}/api/reset-simulation")
        
        # Get normal insights
        normal_insights = requests.get(f"{BASE_URL}/api/insights").json()
        normal_advisory = normal_insights["advisory"]
        
        # Simulate
        requests.post(f"{BASE_URL}/api/simulate-alert")
        
        # Get simulated insights
        simulated_insights = requests.get(f"{BASE_URL}/api/insights").json()
        simulated_advisory = simulated_insights["advisory"]
        
        # Advisory should be different
        assert simulated_advisory != normal_advisory
        assert "Critical" in simulated_advisory or "Ammonia" in simulated_advisory
        
        # Cleanup
        requests.post(f"{BASE_URL}/api/reset-simulation")


# Cleanup fixture to ensure tests don't leave simulation active
@pytest.fixture(autouse=True, scope="module")
def cleanup_simulation():
    """Reset simulation after all tests in module"""
    yield
    requests.post(f"{BASE_URL}/api/reset-simulation")
