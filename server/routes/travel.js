import express from 'express';
import { getFullWeather } from '../services/weatherService.js';
import { geocodeCity } from '../services/geocodeService.js';
import { getTravelAdvice, getFallbackAdvice } from '../services/deepseekService.js';
import { validateTravelAdviceParams } from '../middleware/validator.js';
import logger from '../services/loggerService.js';

const router = express.Router();

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

router.get('/advice', validateTravelAdviceParams, async (req, res, next) => {
    try {
        const { lat, lon, city } = req.query;
        let latitude, longitude;

        if (city) {
            logger.info(`Generating travel advice for city: ${city}`);
            const location = await geocodeCity(city);
            latitude = location.lat;
            longitude = location.lon;
        } else {
            logger.info(`Generating travel advice for coordinates: ${lat}, ${lon}`);
            latitude = parseFloat(lat);
            longitude = parseFloat(lon);
        }

        let weather;
        try {
            weather = await getFullWeather(latitude, longitude);
        } catch (weatherErr) {
            logger.error(`Weather fetch failed for ${latitude}, ${longitude}: ${weatherErr.message}`);
            // Provide a minimal structure so the rest of the logic doesn't crash
            weather = {
                current: { 
                    current: { temperature: 'N/A', condition_code: 'unknown' },
                    hourly: []
                },
                sources: { current: 'error', forecast: 'error' }
            };
        }

        const apiResponse = weather.current;
        const currentData = apiResponse.current;
        const firstHour = apiResponse.hourly?.[0];
        
        const temperature = currentData?.temperature && currentData.temperature !== 'N/A' 
            ? currentData.temperature 
            : '--';
        const condition = currentData?.condition_code && currentData.condition_code !== 'unknown'
            ? getConditionText(currentData.condition_code)
            : 'Weather Data Unavailable';
        const humidity = firstHour?.humidity && firstHour.humidity !== 'N/A'
            ? firstHour.humidity 
            : '--';
        
        const aiWeatherData = {
            current: {
                temp: temperature === '--' ? 'N/A' : temperature,
                condition: condition === 'Weather Data Unavailable' ? 'unknown' : condition,
                humidity: humidity === '--' ? 'N/A' : humidity,
                wind_speed: currentData?.wind_speed
            }
        };
        
        let aiResult;
        try {
            aiResult = await getTravelAdvice(latitude, longitude, aiWeatherData);
            if (aiResult.source === 'api') {
                logger.success(`Successfully generated AI advice for ${latitude}, ${longitude}`);
            } else {
                logger.warn(`Using ${aiResult.source} advice for ${latitude}, ${longitude}`);
            }
        } catch (err) {
            logger.error(`AI generation failed: ${err.message}`);
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
