import express from 'express';
import {geocodeCity} from '../services/geocodeService.js';

const router = express.Router();

router.get('/', async (req, res, next) => {
    try {
        const {city} = req.query;
        if (!city) {
            return res.status(400).json({error: 'City parameter is required'});
        }
        const result = await geocodeCity(city);
        res.json(result);
    } catch (error) {
        next(error);
    }   
});

export default router;