
export interface WeatherData {
  temp: number | string;
  condition: string;
  humidity: number | string;
}

export interface TravelAdviceResponse {
  location: {
    lat: number;
    lon: number;
  };
  weather: WeatherData;
  advice: string;
  source: 'api' | 'cache' | 'fallback';
  cache_info: {
    weather_current: string;
    weather_forecast: string;
  };
}

export interface GeocodeResponse {
  lat: number;
  lon: number;
  name: string;
}

export interface HistoryItem {
  city: string;
  timestamp: number;
}