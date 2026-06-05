import AsyncStorage from '@react-native-async-storage/async-storage';
import { TravelAdviceResponse } from '../types';

const KEYS = {
  RECENT_CITIES: '@recent_cities',
  UNITS: '@units',
  LAST_WEATHER_PREFIX: '@last_weather_',
};

export const saveRecentCity = async (city: string): Promise<void> => {
  const existing = await getRecentCities();
  const updated = [city, ...existing.filter(c => c !== city)].slice(0, 5);
  await AsyncStorage.setItem(KEYS.RECENT_CITIES, JSON.stringify(updated));
};

export const getRecentCities = async (): Promise<string[]> => {
  const data = await AsyncStorage.getItem(KEYS.RECENT_CITIES);
  return data ? JSON.parse(data) : [];
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