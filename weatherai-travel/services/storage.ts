import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelAdviceResponse, HistoryItem } from '../types';

const KEYS = {
  RECENT_CITIES: '@recent_cities',
  UNITS: '@units',
  LAST_WEATHER_PREFIX: '@last_weather_',
};

export const saveRecentCity = async (city: string): Promise<void> => {
  if (!city || typeof city !== 'string') return;
  const existing = await getRecentCities();
  const newItem: HistoryItem = { city, timestamp: Date.now() };
  
  // Remove existing entry for same city to move it to top
  const filtered = existing.filter(item => 
    item && item.city && item.city.toLowerCase() !== city.toLowerCase()
  );
  const updated = [newItem, ...filtered].slice(0, 50); // Keep last 50
  
  await AsyncStorage.setItem(KEYS.RECENT_CITIES, JSON.stringify(updated));
};

export const getRecentCities = async (): Promise<HistoryItem[]> => {
  const data = await AsyncStorage.getItem(KEYS.RECENT_CITIES);
  if (!data) return [];
  try {
    const parsed = JSON.parse(data);
    if (!Array.isArray(parsed)) return [];

    // Handle migration from old string[] format to new HistoryItem[] format
    if (parsed.length > 0 && typeof parsed[0] === 'string') {
      return parsed.map((city: string) => ({ city, timestamp: Date.now() }));
    }

    // Filter out invalid items and ensure they have the required properties
    return parsed.filter((item: any) => 
      item && typeof item === 'object' && typeof item.city === 'string'
    );
  } catch {
    return [];
  }
};

export const saveUnits = async (units: 'metric' | 'imperial'): Promise<void> => {
  await AsyncStorage.setItem(KEYS.UNITS, units);
};

export const getUnits = async (): Promise<'metric' | 'imperial'> => {
  const units = await AsyncStorage.getItem(KEYS.UNITS);
  return units === 'imperial' ? 'imperial' : 'metric';
};

export const saveLastWeather = async (city: string, data: TravelAdviceResponse): Promise<void> => {
  await AsyncStorage.setItem(`${KEYS.LAST_WEATHER_PREFIX}${city}`, JSON.stringify(data));
};

export const getLastWeather = async (city: string): Promise<TravelAdviceResponse | null> => {
  const data = await AsyncStorage.getItem(`${KEYS.LAST_WEATHER_PREFIX}${city}`);
  return data ? JSON.parse(data) : null;
};

export const clearWeatherCache = async (): Promise<void> => {
  const keys = await AsyncStorage.getAllKeys();
  const weatherKeys = keys.filter(k => k.startsWith(KEYS.LAST_WEATHER_PREFIX));
  await AsyncStorage.multiRemove(weatherKeys);
};