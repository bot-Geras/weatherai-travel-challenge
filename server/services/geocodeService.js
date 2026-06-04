import {geocode} from './cacheService.js';
import 'dotenv/config';

async function geocodeCity(city) {
    const cacheKey = city.toLowerCase().trim();
    const cachedData = geocode.get(cacheKey);
    if(cachedData) return cachedData;

    const response = await fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(city)}&format=json&limit=1`);
    if (!response.ok) {
        throw new Error(`Error geocoding city: ${response.status}`);
    }
    const data = await response.json();
    if (!data.length) {
        throw new Error(`City not found: ${city}`);
    }
    const { lat, lon, display_name } = data[0];
    const result = { lat: parseFloat(lat), lon: parseFloat(lon), name: display_name };
    geocode.set(cacheKey, result);
    return result

}

export{
    geocodeCity
}