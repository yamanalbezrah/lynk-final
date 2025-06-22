from fastapi import FastAPI, HTTPException, Depends, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional, List
import uvicorn
import uuid
import requests
from datetime import datetime, timedelta
import asyncio
import json
from sqlalchemy.orm import Session
from database import get_db, WeatherRecord, engine
from sqlalchemy import func

app = FastAPI(title="Real-time Weather Dashboard", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# WeatherStack API configuration
WEATHERSTACK_API_KEY = "f35fb8ccfbe65bd6e5f22f4728c0d328"

# WebSocket connection manager
class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        await websocket.send_text(message)

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

# Pydantic models
class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str
    date: str
    location: str
    notes: str
    temperature: float
    description: str
    humidity: float
    wind_speed: float
    created_at: datetime

class DashboardStats(BaseModel):
    total_records: int
    unique_locations: int
    average_temperature: float
    most_common_location: str

# Helper function to get weather data from API
async def get_weather_data(location: str) -> Dict[str, Any]:
    try:
        response = requests.get(
            "http://api.weatherstack.com/current",
            params={
                "access_key": WEATHERSTACK_API_KEY,
                "query": location
            },
            timeout=10
        )
        data = response.json()
        
        if "error" in data:
            raise HTTPException(status_code=400, detail=f"Weather API error: {data['error']['info']}")
        
        return {
            "temperature": data["current"]["temperature"],
            "description": data["current"]["weather_descriptions"][0],
            "humidity": data["current"]["humidity"],
            "wind_speed": data["current"]["wind_speed"]
        }
    except requests.exceptions.Timeout:
        raise HTTPException(status_code=408, detail="Weather API timeout")
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Failed to fetch weather data: {str(e)}")

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest, db: Session = Depends(get_db)):
    # Get weather data from API
    weather_data = await get_weather_data(request.location)
    
    # Generate unique ID
    weather_id = str(uuid.uuid4())
    
    # Create database record
    db_record = WeatherRecord(
        id=weather_id,
        date=request.date,
        location=request.location,
        notes=request.notes,
        temperature=weather_data["temperature"],
        description=weather_data["description"],
        humidity=weather_data["humidity"],
        wind_speed=weather_data["wind_speed"]
    )
    
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    
    # Broadcast to WebSocket clients
    await manager.broadcast(json.dumps({
        "type": "new_weather_record",
        "data": {
            "id": weather_id,
            "location": request.location,
            "temperature": weather_data["temperature"],
            "description": weather_data["description"]
        }
    }))
    
    return WeatherResponse(
        id=weather_id,
        date=request.date,
        location=request.location,
        notes=request.notes,
        temperature=weather_data["temperature"],
        description=weather_data["description"],
        humidity=weather_data["humidity"],
        wind_speed=weather_data["wind_speed"],
        created_at=db_record.created_at
    )

@app.get("/weather/{weather_id}", response_model=WeatherResponse)
async def get_weather_data_by_id(weather_id: str, db: Session = Depends(get_db)):
    record = db.query(WeatherRecord).filter(WeatherRecord.id == weather_id).first()
    if not record:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return WeatherResponse(
        id=record.id,
        date=record.date,
        location=record.location,
        notes=record.notes,
        temperature=record.temperature,
        description=record.description,
        humidity=record.humidity,
        wind_speed=record.wind_speed,
        created_at=record.created_at
    )

@app.get("/weather", response_model=List[WeatherResponse])
async def get_all_weather_data(db: Session = Depends(get_db), limit: int = 50):
    records = db.query(WeatherRecord).order_by(WeatherRecord.created_at.desc()).limit(limit).all()
    return [
        WeatherResponse(
            id=record.id,
            date=record.date,
            location=record.location,
            notes=record.notes,
            temperature=record.temperature,
            description=record.description,
            humidity=record.humidity,
            wind_speed=record.wind_speed,
            created_at=record.created_at
        ) for record in records
    ]

@app.get("/dashboard/stats", response_model=DashboardStats)
async def get_dashboard_stats(db: Session = Depends(get_db)):
    total_records = db.query(func.count(WeatherRecord.id)).scalar()
    unique_locations = db.query(func.count(func.distinct(WeatherRecord.location))).scalar()
    avg_temp = db.query(func.avg(WeatherRecord.temperature)).scalar()
    
    # Get most common location
    most_common = db.query(
        WeatherRecord.location,
        func.count(WeatherRecord.location).label('count')
    ).group_by(WeatherRecord.location).order_by(func.count(WeatherRecord.location).desc()).first()
    
    return DashboardStats(
        total_records=total_records or 0,
        unique_locations=unique_locations or 0,
        average_temperature=round(avg_temp, 1) if avg_temp else 0.0,
        most_common_location=most_common.location if most_common else "None"
    )

@app.get("/weather/location/{location}")
async def get_weather_by_location(location: str, db: Session = Depends(get_db)):
    records = db.query(WeatherRecord).filter(
        WeatherRecord.location.ilike(f"%{location}%")
    ).order_by(WeatherRecord.created_at.desc()).limit(10).all()
    
    return [
        WeatherResponse(
            id=record.id,
            date=record.date,
            location=record.location,
            notes=record.notes,
            temperature=record.temperature,
            description=record.description,
            humidity=record.humidity,
            wind_speed=record.wind_speed,
            created_at=record.created_at
        ) for record in records
    ]

@app.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await manager.connect(websocket)
    try:
        while True:
            # Keep connection alive
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)

@app.get("/")
async def root():
    return {
        "message": "Real-time Weather Dashboard API",
        "version": "2.0.0",
        "endpoints": {
            "POST /weather": "Create weather record",
            "GET /weather/{id}": "Get weather by ID",
            "GET /weather": "Get all weather records",
            "GET /dashboard/stats": "Get dashboard statistics",
            "GET /weather/location/{location}": "Get weather by location",
            "WS /ws": "WebSocket for real-time updates"
        }
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
