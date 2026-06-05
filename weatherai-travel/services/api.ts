// services/api.ts
import Constants from 'expo-constants';
import { TravelAdviceResponse, GeocodeResponse } from '../types';
export interface ForecastResponse {
  source: 'api' | 'cache';
  data: {
    location: any;
    current: any;
    hourly: any[];
    daily: Array<{
      date: string;
      temp_min: number;
      temp_max: number;
      condition_code: string;
      icon: string;
    }>;
  };
}

const API_BASE = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.100.34:4000';
async function fetchJSON<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(url, options);
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`HTTP ${response.status}: ${errorText}`);
  }
  return response.json();
}

export const getTravelAdvice = async (city: string): Promise<TravelAdviceResponse> => {
  const url = `${API_BASE}/api/travel/advice?city=${encodeURIComponent(city)}`;
  return fetchJSON<TravelAdviceResponse>(url);
};

export const geocodeCity = async (city: string): Promise<GeocodeResponse> => {
  const url = `${API_BASE}/api/geocode?city=${encodeURIComponent(city)}`;
  return fetchJSON<GeocodeResponse>(url);
};



export const getForecast = async (lat: number, lon: number): Promise<ForecastResponse> => {
  const url = `${API_BASE}/api/weather/forecast?lat=${lat}&lon=${lon}`;
  return fetchJSON<ForecastResponse>(url);
};