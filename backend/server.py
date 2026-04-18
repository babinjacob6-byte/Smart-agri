from fastapi import FastAPI, APIRouter, Query
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Any, Union
import uuid
from datetime import datetime, timezone

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

mongo_url: str = os.environ['MONGO_URL']
client: AsyncIOMotorClient = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI()
api_router = APIRouter(prefix="/api")

# In-memory simulation state (temporary, resets on restart)
simulation_active: bool = False

# --- Pydantic Models ---
class SensorReading(BaseModel):
    value: Union[float, str]
    unit: str
    status: str
    safe: str

class HistoryPoint(BaseModel):
    time: str
    temp: float
    humidity: float
    nh3: float
    risk: int

class AlertItem(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    time: str
    level: str
    message: str
    sensor: str

class DashboardResponse(BaseModel):
    crop: str
    location: str
    last_updated: str
    risk_score: int
    risk_level: str
    confidence: int
    primary_driver: str
    sensors: dict[str, Any]

class InsightsResponse(BaseModel):
    advisory: str
    primary_driver: str
    driver_contributions: dict[str, int]
    crop: str
    crop_options: List[str]
    safe_ranges: dict[str, str]
    storage_window: str
    recommended_actions: List[str]

class TrendsResponse(BaseModel):
    history: List[HistoryPoint]

class AlertsResponse(BaseModel):
    alerts: List[AlertItem]
    active_warning: Optional[dict[str, str]] = None

# --- Seed Data ---
SEED_MONITORING = {
    "id": "monitor-001",
    "crop": "Turmeric",
    "location": "Erode Godown, Unit 3",
    "last_updated": "2 minutes ago",
    "risk_score": 67,
    "risk_level": "WARNING",
    "confidence": 84,
    "primary_driver": "Humidity trending upward",
    "advisory": "Humidity in your turmeric storage has been rising steadily for the past 2 hours and is now approaching the warning threshold. This could be caused by a vent gap or recent rainfall. Check for any openings on the north wall and ensure the storage is properly sealed.",
    "sensors": {
        "temperature": {"value": 31.4, "unit": "\u00b0C", "status": "warning", "safe": "10\u201328\u00b0C"},
        "humidity": {"value": 72.1, "unit": "%", "status": "warning", "safe": "8\u201311%"},
        "nh3": {"value": 6.8, "unit": "ppm", "status": "safe", "safe": "0\u20132 ppm"},
        "co": {"value": 2.1, "unit": "ppm", "status": "safe", "safe": "0\u20132 ppm"},
        "pressure": {"value": 1012, "unit": "hPa", "status": "safe", "safe": "Normal"},
        "motion": {"value": "None detected", "unit": "", "status": "safe", "safe": ""}
    },
    "crop_options": ["Paddy", "Turmeric", "Ragi", "Urad Dal", "Groundnut", "Chillies", "Jaggery", "Tamarind"],
    "safe_ranges": {
        "Temperature": "10\u201328\u00b0C",
        "Humidity": "8\u201311%",
        "NH3": "0\u20132 ppm",
        "Storage Window": "6\u201312 months"
    },
    "driver_contributions": {
        "Temperature": 20,
        "Humidity": 65,
        "NH3": 15
    },
    "recommended_actions": [
        "Check for vent gaps or openings on the warehouse walls",
        "Monitor humidity every 30 minutes until it stabilizes",
        "If humidity crosses 14% in the next hour, consider relocating stock"
    ]
}

SEED_HISTORY = [
    {"time": "00:00", "temp": 28.1, "humidity": 68.2, "nh3": 3.1, "risk": 32},
    {"time": "02:00", "temp": 28.5, "humidity": 68.8, "nh3": 3.4, "risk": 35},
    {"time": "04:00", "temp": 29.1, "humidity": 69.4, "nh3": 4.0, "risk": 41},
    {"time": "06:00", "temp": 29.8, "humidity": 70.1, "nh3": 4.8, "risk": 48},
    {"time": "08:00", "temp": 30.2, "humidity": 70.9, "nh3": 5.2, "risk": 54},
    {"time": "10:00", "temp": 30.8, "humidity": 71.3, "nh3": 5.8, "risk": 59},
    {"time": "12:00", "temp": 31.4, "humidity": 72.1, "nh3": 6.8, "risk": 67},
]

SEED_ALERTS = [
    {"id": str(uuid.uuid4()), "time": "12:04", "level": "WARNING", "message": "Humidity crossed 70% threshold", "sensor": "BME680"},
    {"id": str(uuid.uuid4()), "time": "10:31", "level": "WARNING", "message": "Temperature above safe range for turmeric", "sensor": "BME680"},
    {"id": str(uuid.uuid4()), "time": "08:15", "level": "WATCH", "message": "Humidity trending upward for 2+ hours", "sensor": "BME680"},
    {"id": str(uuid.uuid4()), "time": "06:00", "level": "INFO", "message": "Device synced successfully", "sensor": "System"},
    {"id": str(uuid.uuid4()), "time": "00:00", "level": "INFO", "message": "Monitoring session started \u2014 Crop: Turmeric", "sensor": "System"},
]

# Simulation overrides
SIMULATED_OVERRIDES = {
    "risk_score": 89,
    "risk_level": "ALERT",
    "confidence": 91,
    "primary_driver": "Ammonia spike detected",
    "advisory": "Critical \u2014 Ammonia levels have spiked significantly. Evacuate stock from this section immediately and ventilate the warehouse.",
    "sensors_override": {
        "nh3": {"value": 18.2, "unit": "ppm", "status": "danger", "safe": "0\u20132 ppm"},
        "temperature": {"value": 33.8, "unit": "\u00b0C", "status": "danger", "safe": "10\u201328\u00b0C"},
        "humidity": {"value": 78.4, "unit": "%", "status": "danger", "safe": "8\u201311%"}
    }
}

# --- Startup: Seed DB ---
@app.on_event("startup")
async def seed_database() -> None:
    count = await db.monitoring.count_documents({})
    if count == 0:
        await db.monitoring.insert_one({**SEED_MONITORING})
        logger.info("Seeded monitoring data")
    
    history_count = await db.history.count_documents({})
    if history_count == 0:
        await db.history.insert_many([{**h} for h in SEED_HISTORY])
        logger.info("Seeded history data")
    
    alerts_count = await db.alerts.count_documents({})
    if alerts_count == 0:
        await db.alerts.insert_many([{**a} for a in SEED_ALERTS])
        logger.info("Seeded alerts data")


# --- API Endpoints ---
@api_router.get("/")
async def root() -> dict[str, str]:
    return {"message": "AgroSense AI API"}


@api_router.get("/dashboard", response_model=DashboardResponse)
async def get_dashboard() -> dict[str, Any]:
    global simulation_active
    doc = await db.monitoring.find_one({"id": "monitor-001"}, {"_id": 0})
    if not doc:
        return {"error": "No monitoring data found"}
    
    if simulation_active:
        doc["risk_score"] = SIMULATED_OVERRIDES["risk_score"]
        doc["risk_level"] = SIMULATED_OVERRIDES["risk_level"]
        doc["confidence"] = SIMULATED_OVERRIDES["confidence"]
        doc["primary_driver"] = SIMULATED_OVERRIDES["primary_driver"]
        for key, val in SIMULATED_OVERRIDES["sensors_override"].items():
            doc["sensors"][key] = val
    
    return {
        "crop": doc["crop"],
        "location": doc["location"],
        "last_updated": doc["last_updated"],
        "risk_score": doc["risk_score"],
        "risk_level": doc["risk_level"],
        "confidence": doc["confidence"],
        "primary_driver": doc["primary_driver"],
        "sensors": doc["sensors"]
    }


@api_router.get("/insights", response_model=InsightsResponse)
async def get_insights() -> dict[str, Any]:
    global simulation_active
    doc = await db.monitoring.find_one({"id": "monitor-001"}, {"_id": 0})
    if not doc:
        return {"error": "No monitoring data found"}
    
    advisory = doc["advisory"]
    primary_driver = doc["primary_driver"]
    
    if simulation_active:
        advisory = SIMULATED_OVERRIDES["advisory"]
        primary_driver = SIMULATED_OVERRIDES["primary_driver"]
    
    return {
        "advisory": advisory,
        "primary_driver": primary_driver,
        "driver_contributions": doc["driver_contributions"],
        "crop": doc["crop"],
        "crop_options": doc["crop_options"],
        "safe_ranges": doc["safe_ranges"],
        "storage_window": "6\u201312 months",
        "recommended_actions": doc["recommended_actions"]
    }


@api_router.get("/trends", response_model=TrendsResponse)
async def get_trends() -> dict[str, list]:
    history = await db.history.find({}, {"_id": 0}).sort("time", 1).to_list(100)
    return {"history": history}


@api_router.get("/alerts", response_model=AlertsResponse)
async def get_alerts(filter: Optional[str] = Query(default="all")) -> dict[str, Any]:
    global simulation_active
    
    query = {}
    if filter and filter.lower() != "all":
        query["level"] = filter.upper()
    
    alerts = await db.alerts.find(query, {"_id": 0}).to_list(100)
    # Sort by time descending
    alerts.sort(key=lambda x: x["time"], reverse=True)
    
    # Active warning banner
    active_warning = None
    doc = await db.monitoring.find_one({"id": "monitor-001"}, {"_id": 0})
    if doc:
        level = SIMULATED_OVERRIDES["risk_level"] if simulation_active else doc["risk_level"]
        driver = SIMULATED_OVERRIDES["primary_driver"] if simulation_active else doc["primary_driver"]
        if level in ("WARNING", "ALERT"):
            active_warning = {"level": level, "message": driver}
    
    return {"alerts": alerts, "active_warning": active_warning}


@api_router.post("/simulate-alert")
async def simulate_alert() -> dict[str, Any]:
    global simulation_active
    simulation_active = True
    
    # Add a critical alert to the DB
    new_alert = {
        "id": str(uuid.uuid4()),
        "time": datetime.now(timezone.utc).strftime("%H:%M"),
        "level": "ALERT",
        "message": "Ammonia levels critical \u2014 Immediate action required",
        "sensor": "MQ-137"
    }
    await db.alerts.insert_one({**new_alert})
    
    return {"status": "simulated", "risk_score": 89, "risk_level": "ALERT"}


@api_router.post("/reset-simulation")
async def reset_simulation() -> dict[str, str]:
    global simulation_active
    simulation_active = False
    # Remove simulated alerts
    await db.alerts.delete_many({"level": "ALERT"})
    return {"status": "reset"}


# Include router
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client() -> None:
    client.close()
