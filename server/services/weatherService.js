import {currentWeather, forecast} from './cacheService.js';
import 'dotenv/config';

const API_KEY = process.env.WEATHER_API_KEY
const WEATHER_API_URL = process.env.WEATHER_API_URL


async function fetchCurrentWeather(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    const cachedData = currentWeather.get(cacheKey);
    if(cachedData) {
        return { source: 'cache', data: cachedData };
    }

    const response = await fetch(`${WEATHER_API_URL}/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`);
    if (!response.ok) {
        throw new Error(`Error fetching current weather: ${response.status}`);
    }

    const data = await response.json();
    currentWeather.set(cacheKey, data);
    return { source: 'api', data };
}

async function fetchWeatherForecast(lat, lon, days = 3) {
    const cacheKey = `${lat},${lon},${days}`;
    const cachedData = forecast.get(cacheKey);
    if(cachedData) {
        return { source: 'cache', data: cachedData };
    }

    const response = await fetch(`${WEATHER_API_URL}/forecast?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric&cnt=${days}`);
    if (!response.ok) {
        throw new Error(`Error fetching weather forecast: ${response.status}`);
    }

    const data = await response.json();
    forecast.set(cacheKey, data);
    return { source: 'api', data };
}

async function getFullWeather(lat, lon) {
    const [current, forecastData] = await Promise.all([
        fetchCurrentWeather(lat, lon),
        fetchWeatherForecast(lat, lon, 3)
    ]);

    return {
        current: current.data,
        forecast: forecastData.data,
        sources: {
            current: current.source,
            forecast: forecastData.source
        }
    };
}


export {
    fetchWeatherForecast,
    getFullWeather,
    fetchCurrentWeather

};