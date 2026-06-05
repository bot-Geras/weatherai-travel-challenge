import express from 'express';
import { fetchCurrentWeather, fetchWeatherForecast, getFullWeather } from '../services/weatherService.js';

const router = express.Router();

// GET /api/weather/current?lat=35.6895&lon=139.6917
router.get('/current', async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon are required' });
        }
        const result = await fetchCurrentWeather(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/weather/forecast?lat=35.6895&lon=139.6917&days=3
router.get('/forecast', async (req, res, next) => {
    try {
        const { lat, lon, days = 3 } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon are required' });
        }
        const result = await fetchWeatherForecast(parseFloat(lat), parseFloat(lon), parseInt(days));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/weather/full?lat=35.6895&lon=139.6917
router.get('/full', async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        if (!lat || !lon) {
            return res.status(400).json({ error: 'lat and lon are required' });
        }
        const result = await getFullWeather(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;