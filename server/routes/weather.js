import express from 'express';
import { fetchCurrentWeather, fetchWeatherForecast, getFullWeather } from '../services/weatherService.js';
import { validateWeatherParams } from '../middleware/validator.js';
import logger from '../services/loggerService.js';

const router = express.Router();

// GET /api/weather/current?lat=35.6895&lon=139.6917
router.get('/current', validateWeatherParams, async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        logger.info(`Fetching current weather for ${lat}, ${lon}`);
        const result = await fetchCurrentWeather(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/weather/forecast?lat=35.6895&lon=139.6917&days=3
router.get('/forecast', validateWeatherParams, async (req, res, next) => {
    try {
        const { lat, lon, days = 3 } = req.query;
        logger.info(`Fetching ${days}-day forecast for ${lat}, ${lon}`);
        const result = await fetchWeatherForecast(parseFloat(lat), parseFloat(lon), parseInt(days));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

// GET /api/weather/full?lat=35.6895&lon=139.6917
router.get('/full', validateWeatherParams, async (req, res, next) => {
    try {
        const { lat, lon } = req.query;
        logger.info(`Fetching full weather report for ${lat}, ${lon}`);
        const result = await getFullWeather(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (err) {
        next(err);
    }
});

export default router;