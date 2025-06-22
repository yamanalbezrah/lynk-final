"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Cloud, 
  Thermometer, 
  Droplets, 
  Wind, 
  MapPin, 
  Calendar,
  RefreshCw,
  TrendingUp,
  Users,
  Database
} from "lucide-react";

interface WeatherData {
  id: string;
  date: string;
  location: string;
  notes: string;
  temperature: number;
  description: string;
  humidity: number;
  wind_speed: number;
  created_at: string;
}

interface DashboardStats {
  total_records: number;
  unique_locations: number;
  average_temperature: number;
  most_common_location: string;
}

export function Dashboard() {
  const [weatherData, setWeatherData] = useState<WeatherData[]>([]);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [lastUpdate, setLastUpdate] = useState<Date>(new Date());

  const fetchWeatherData = async () => {
    try {
      const response = await fetch('http://localhost:8000/weather?limit=10');
      if (response.ok) {
        const data = await response.json();
        setWeatherData(data);
      }
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/dashboard/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const refreshData = async () => {
    setLoading(true);
    await Promise.all([fetchWeatherData(), fetchStats()]);
    setLastUpdate(new Date());
    setLoading(false);
  };

  useEffect(() => {
    refreshData();
    
    // Set up WebSocket connection for real-time updates
    const ws = new WebSocket('ws://localhost:8000/ws');
    
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === 'new_weather_record') {
        // Refresh data when new weather record is added
        refreshData();
      }
    };

    // Auto-refresh every 5 minutes
    const interval = setInterval(refreshData, 5 * 60 * 1000);

    return () => {
      ws.close();
      clearInterval(interval);
    };
  }, []);

  const getWeatherIcon = (description: string) => {
    const desc = description.toLowerCase();
    if (desc.includes('rain')) return <Droplets className="h-6 w-6 text-blue-500" />;
    if (desc.includes('cloud')) return <Cloud className="h-6 w-6 text-gray-500" />;
    if (desc.includes('sun') || desc.includes('clear')) return <Thermometer className="h-6 w-6 text-yellow-500" />;
    return <Cloud className="h-6 w-6 text-gray-400" />;
  };

  const getTemperatureColor = (temp: number) => {
    if (temp >= 25) return "text-red-600";
    if (temp >= 15) return "text-orange-600";
    if (temp >= 5) return "text-yellow-600";
    return "text-blue-600";
  };

  if (loading && !weatherData.length) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Weather Dashboard</h1>
          <p className="text-gray-600">Real-time weather data and analytics</p>
        </div>
        <Button onClick={refreshData} disabled={loading} className="flex items-center gap-2">
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Records</CardTitle>
              <Database className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_records}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Locations</CardTitle>
              <MapPin className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.unique_locations}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg Temperature</CardTitle>
              <Thermometer className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.average_temperature}°C</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Most Popular</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{stats.most_common_location}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Recent Weather Data */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Cloud className="h-5 w-5" />
            Recent Weather Records
          </CardTitle>
          <p className="text-sm text-gray-600">
            Last updated: {lastUpdate.toLocaleTimeString()}
          </p>
        </CardHeader>
        <CardContent>
          {weatherData.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              No weather data available. Submit a weather request to get started!
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {weatherData.map((weather) => (
                <Card key={weather.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        {getWeatherIcon(weather.description)}
                        <div>
                          <h3 className="font-semibold text-gray-900">{weather.location}</h3>
                          <p className="text-sm text-gray-600">{weather.description}</p>
                        </div>
                      </div>
                      <Badge variant="secondary" className="text-xs">
                        {weather.id.slice(0, 8)}...
                      </Badge>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Temperature</span>
                        <span className={`font-semibold ${getTemperatureColor(weather.temperature)}`}>
                          {weather.temperature}°C
                        </span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Humidity</span>
                        <span className="font-semibold text-blue-600">{weather.humidity}%</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Wind Speed</span>
                        <span className="font-semibold text-green-600">{weather.wind_speed} km/h</span>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">Date</span>
                        <span className="font-semibold text-gray-900">{weather.date}</span>
                      </div>
                    </div>
                    
                    {weather.notes && (
                      <div className="mt-3 pt-3 border-t">
                        <p className="text-sm text-gray-600 italic">"{weather.notes}"</p>
                      </div>
                    )}
                    
                    <div className="mt-3 pt-2 border-t">
                      <p className="text-xs text-gray-500">
                        Created: {new Date(weather.created_at).toLocaleString()}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 