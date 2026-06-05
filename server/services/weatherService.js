import { currentWeather, forecast } from './cacheService.js';
import logger from './loggerService.js';
import 'dotenv/config';

const API_KEY = process.env.WEATHER_API_KEY;
const WEATHER_API_BASE = process.env.WEATHER_API_URL

// Helper to make authenticated fetch
async function authFetch(url) {
    logger.debug(`External API Request: ${url}`);
    const response = await fetch(url, {
        headers: {
            'Authorization': `Bearer ${API_KEY}`
        }
    });
    return response;
}

async function fetchCurrentWeather(lat, lon) {
    const cacheKey = `${lat},${lon}`;
    const cachedData = currentWeather.get(cacheKey);
    if (cachedData) {
        return { source: 'cache', data: cachedData };
    }

    const url = `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&units=metric`;
    const response = await authFetch(url);
    
    if (!response.ok) {
        let errorBody = '';
        try {
            errorBody = await response.text();
        } catch (e) {
            errorBody = 'Could not parse error body';
        }
        logger.error(`Weather API Error [${response.status}] for URL: ${url}. Body: ${errorBody}`);
        throw new Error(`Error fetching current weather: ${response.status}`);
    }

    const data = await response.json();
    currentWeather.set(cacheKey, data);
    return { source: 'api', data };
}

async function fetchWeatherForecast(lat, lon, days = 3) {
    const cacheKey = `${lat},${lon},${days}`;
    const cachedData = forecast.get(cacheKey);
    if (cachedData) {
        return { source: 'cache', data: cachedData };
    }

    
    const url = `${WEATHER_API_BASE}/weather?lat=${lat}&lon=${lon}&units=metric&days=${days}`;
    const response = await authFetch(url);
    
    if (!response.ok) {
        logger.error(`Weather Forecast API Error [${response.status}] for URL: ${url}`);
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