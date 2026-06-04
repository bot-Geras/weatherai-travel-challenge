import express from 'express';
import {fetchWeatherForecast,getFullWeather,fetchCurrentWeather } from '../services/weatherService.js';

const router = express.Router();

router.get('/current', async (req, res, next) => {
    try {
        const {lat, lon} = req.query;
        if (!lat || !lon) {
            return res.status(400).json({error: 'Latitude and longitude parameters are required'});
        }
        const result = await fetchCurrentWeather(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/forecast', async (req, res, next) => {
    try {
        const {lat, lon, days = 3} = req.query;
        if (!lat || !lon) {
            return res.status(400).json({error: 'Latitude and longitude parameters are required'});
        }
        const result = await fetchWeatherForecast(parseFloat(lat), parseFloat(lon), parseInt(days));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

router.get('/full', async (req, res, next) => {
    try {
        const {lat, lon} = req.query;
        if (!lat || !lon) {
            return res.status(400).json({error: 'Latitude and longitude parameters are required'});
        }
        const result = await getFullWeather(parseFloat(lat), parseFloat(lon));
        res.json(result);
    } catch (error) {
        next(error);
    }
});

export default router;