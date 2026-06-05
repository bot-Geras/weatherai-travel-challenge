import express from 'express';
import { getFullWeather } from '../services/weatherService.js';
import { geocodeCity } from '../services/geocodeService.js';
import { getTravelAdvice, getFallbackAdvice } from '../services/deepseekService.js';

const router = express.Router();

// Map condition codes to readable text
function getConditionText(code) {
    const map = {
        '0': 'Clear sky',
        '1': 'Mainly clear',
        '2': 'Partly cloudy',
        '3': 'Overcast',
        '51': 'Light drizzle',
        '53': 'Moderate drizzle',
        '55': 'Dense drizzle',
        '61': 'Slight rain',
        '63': 'Moderate rain',
        '65': 'Heavy rain'
    };
    return map[String(code)] || 'Unknown';
}

router.get('/advice', async (req, res, next) => {
    try {
        const { lat, lon, city } = req.query;
        let latitude, longitude;

        if (city) {
            const location = await geocodeCity(city);
            latitude = location.lat;
            longitude = location.lon;
        } else if (lat && lon) {
            latitude = parseFloat(lat);
            longitude = parseFloat(lon);
        } else {
            return res.status(400).json({ error: 'Either city or lat/lon parameters are required' });
        }

        // Get raw weather data (full API response)
        const weather = await getFullWeather(latitude, longitude);
        
        // The API response is inside weather.current (because fetchCurrentWeather returns { data: {...} })
        const currentData = weather.current?.current;      // the nested 'current' object
        const hourlyFirst = weather.current?.hourly?.[0]; // first hour for humidity

        // Extract values for the response
        const temperature = currentData?.temperature ?? 'N/A';
        const condition = getConditionText(currentData?.condition_code);
        const humidity = hourlyFirst?.humidity ?? 'N/A';

        // Prepare a simplified weather object for the AI (matches expected shape)
        const aiWeatherData = {
            current: {
                temp: temperature,
                condition: condition,
                humidity: humidity,
                wind_speed: currentData?.wind_speed
            }
        };

        let aiResult;
        try {
            aiResult = await getTravelAdvice(latitude, longitude, aiWeatherData);
        } catch (error) {
            console.error('AI error:', error);
            aiResult = { source: 'fallback', data: getFallbackAdvice(aiWeatherData) };
        }

        res.json({
            location: { lat: latitude, lon: longitude },
            weather: {
                temp: temperature,
                condition: condition,
                humidity: humidity
            },
            advice: aiResult.data,
            source: aiResult.source,
            cache_info: weather.sources
        });
    } catch (error) {
        next(error);
    }
});

export default router;