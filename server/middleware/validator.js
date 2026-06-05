// middleware/validator.js

export const validateWeatherParams = (req, res, next) => {
    const { lat, lon } = req.query;
    
    if (!lat || !lon) {
        return res.status(400).json({ error: 'Missing required parameters: lat and lon' });
    }

    const latitude = parseFloat(lat);
    const longitude = parseFloat(lon);

    if (isNaN(latitude) || latitude < -90 || latitude > 90) {
        return res.status(400).json({ error: 'Invalid latitude. Must be a number between -90 and 90' });
    }

    if (isNaN(longitude) || longitude < -180 || longitude > 180) {
        return res.status(400).json({ error: 'Invalid longitude. Must be a number between -180 and 180' });
    }

    next();
};

export const validateGeocodeParams = (req, res, next) => {
    const { city } = req.query;
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
        return res.status(400).json({ error: 'Missing or invalid required parameter: city' });
    }
    next();
};

export const validateTravelAdviceParams = (req, res, next) => {
    const { lat, lon, city } = req.query;

    if (city) {
        if (typeof city !== 'string' || city.trim().length === 0) {
            return res.status(400).json({ error: 'Invalid city parameter' });
        }
        return next();
    }

    if (lat && lon) {
        const latitude = parseFloat(lat);
        const longitude = parseFloat(lon);
        if (isNaN(latitude) || latitude < -90 || latitude > 90 || isNaN(longitude) || longitude < -180 || longitude > 180) {
            return res.status(400).json({ error: 'Invalid lat/lon coordinates' });
        }
        return next();
    }

    return res.status(400).json({ error: 'Either city or lat/lon parameters are required' });
};
