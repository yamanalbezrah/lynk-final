from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Dict, Any, Optional
import uvicorn
import uuid
import requests
from datetime import datetime

app = FastAPI(title="Weather Data System", version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# In-memory storage for weather data
weather_storage: Dict[str, Dict[str, Any]] = {}
WEATHERSTACK_API_KEY = "f35fb8ccfbe65bd6e5f22f4728c0d328"

class WeatherRequest(BaseModel):
    date: str
    location: str
    notes: Optional[str] = ""

class WeatherResponse(BaseModel):
    id: str

@app.post("/weather", response_model=WeatherResponse)
async def create_weather_request(request: WeatherRequest):
    # Step 1: Call WeatherStack API
    response = requests.get(
        "http://api.weatherstack.com/current",
        params={
            "access_key": WEATHERSTACK_API_KEY,
            "query": request.location
        }
    )
    
    data = response.json()

    # Step 2: Error Handling
    if "error" in data:
        raise HTTPException(status_code=400, detail="Weather API request failed")

    # Step 3: Generate unique ID
    weather_id = str(uuid.uuid4())

    # Step 4: Store the weather data in memory
    weather_storage[weather_id] = {
        "id": weather_id,
        "date": request.date,
        "location": request.location,
        "notes": request.notes,
        "weather_data": {
            "temperature": data["current"]["temperature"],
            "description": data["current"]["weather_descriptions"][0],
            "humidity": data["current"]["humidity"],
            "wind_speed": data["current"]["wind_speed"]
        },
        "created_at": datetime.utcnow().isoformat()
    }

    # Step 5: Return the ID
    return {"id": weather_id}

@app.get("/weather/{weather_id}")
async def get_weather_data(weather_id: str):
    """
    Retrieve stored weather data by ID.
    This endpoint is already implemented for the assessment.
    """
    if weather_id not in weather_storage:
        raise HTTPException(status_code=404, detail="Weather data not found")
    
    return weather_storage[weather_id]

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
