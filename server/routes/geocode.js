import express from 'express';
import { geocodeCity } from '../services/geocodeService.js';
import { validateGeocodeParams } from '../middleware/validator.js';
import logger from '../services/loggerService.js';

const router = express.Router();

router.get('/', validateGeocodeParams, async (req, res, next) => {
    try {
        const { city } = req.query;
        logger.info(`Geocoding city: ${city}`);
        const result = await geocodeCity(city);
        res.json(result);
    } catch (error) {
        next(error);
    }   
});

export default router;