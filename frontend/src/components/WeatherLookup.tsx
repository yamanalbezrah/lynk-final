"use client";

import { useState } from "react" ;

export function WeatherLookup() {
  const [id, setId] = useState("");
  const [weatherData, setWeatherData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

const handleLookup = async () => {
  try {
    setError(null);
    if (!id.trim()) {
      throw new Error("Please enter a weather ID");
    }
    const response = await fetch(`http://localhost:8000/weather/${id}`);
    if (!response.ok) {
      throw new Error("Weather data not found.")
    }
    const data = await response.json();
    setWeatherData(data);
  } catch (err: any) {
      setWeatherData(null);
      setError(err.message);
  }
};

  return (
    <div className="w-full">
      <input
        className="border p-2 rounded w-full mb-2"
        placeholder="Enter weather ID"
        value={id}
        onChange={(e) => setId(e.target.value)}
      />
      <button
        className="bg-blue-600 text-white py-2 px-4 rounded w-full"
        onClick={handleLookup}
      >
        Lookup
      </button>

      {error && <p className="text-red-500 mt-2">{error}</p>}

      {weatherData && (
        <div className="mt-4 border p-4 rounded bg-gray-50 w-full text-gray-900">
          <p><strong>Date:</strong> {weatherData.date}</p>
          <p><strong>Location:</strong> {weatherData.location}</p>
          <p><strong>Notes:</strong> {weatherData.notes}</p>
          <p><strong>Temperature:</strong> {weatherData.weather_data.temperature}°C</p>
          <p><strong>Description:</strong> {weatherData.weather_data.description}</p>
          <p><strong>Humidity:</strong> {weatherData.weather_data.humidity}%</p>
          <p><strong>Wind Speed:</strong> {weatherData.weather_data.wind_speed} km/h</p>
          <p className="text-xs text-gray-500 mt-2">
            Retrieved at: {new Date(weatherData.created_at).toLocaleString()}
          </p>
        </div>
      )}
    </div>
  );
}
    
