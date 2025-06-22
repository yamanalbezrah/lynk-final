import { useState } from "react";

export default function WeatherLookup() {
  const [weatherId, setWeatherId] = useState("");
  const [data, setData] = useState(null);
  const [error, setError] = useState("");

  const fetchWeather = async () => {
    setError("");
    try {
      const res = await fetch(`http://localhost:8000/weather/${weatherId}`);
      if (!res.ok) throw new Error("Data not found");
      const json = await res.json();
      setData(json);
    } catch (err) {
      setData(null);
      setError("Weather data not found for that ID.");
    }
  };

return (
  <div>
    <h2>Look Up Weather Data</h2>
    <input 
      value={weatherId}
      onChange={(e) => setWeatherId(e.target.value)}
      placeholder="Enter weather ID"
    />
    <button onClick={fetchWeather}>Fetch</button>
    {error && <p style={{ color: "red" }}>{error}</p>}

    {data && (
      <div> 
        <h3>Weather Data</h3>
        <p><strong>Date:</strong> {data.date}</p>
        <p><strong>Location:</strong> {data.location}</p>
        <p><strong>Notes:</strong> {data.notes}</p>
        <p><strong>Temperature:</strong> {data.weather_data.temperature}°C</p>
        <p><strong>Description:</strong> {data.weather_data.description}</p>
        <p><strong>Humidity:</strong> {data.weather_data.humidity}%</p>
        <p><strong>Wind Speed:</strong> {data.weather_data.wind_speed} km/h</p>
      </div>
    )}
    </div>
  );
}

        
        

        
