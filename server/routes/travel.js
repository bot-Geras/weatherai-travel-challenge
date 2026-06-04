import express from 'express';
import {getFullWeather} from '../services/weatherService.js';
import {geocodeCity} from '../services/geocodeService.js';
import {getTravelAdvice,getFallbackAdvice} from '../services/geminiService.js';

const router = express.Router();

router.get('/advice', async (req, res, next) => {
    try {
        const {lat, lon, city} = req.query;
        let latitude, longitude;

        if(city) {
            const location = await geocodeCity(city);
            latitude = location.lat;
            longitude = location.lon;
        } else if (lat && lon) {
            latitude = parseFloat(lat);
            longitude = parseFloat(lon);
        } else {
            return res.status(400).json({error: 'Either city or lat/lon parameters are required'});
        }

        const weather = await getFullWeather(latitude, longitude);

        let aiResult

        try {
            aiResult = await getTravelAdvice(latitude, longitude, weather);
        } catch (error) {
            console.error('Error fetching AI travel advice:', error);
            aiResult = {source: 'fallback', advice: getFallbackAdvice(weather)};

        }

        res.json({
            location: {lat: latitude, lon: longitude},
            weather: {
                temp:weather.current.data.current?.temp,
                condition: weather.current.data.current?.condition,
                humidity: weather.current.data.current?.humidity,
            },
            advice: aiResult.advice,
            source: aiResult.source,
            cache_info: {
                weather_current: weather.source.current,
                weather_forecast: weather.source.forecast,
            }

        });
    } catch (error) {
        next(error);
    }
});

export default router;
