import nodeCache from 'node-cache';

const currentWeatherCache = new nodeCache({ stdTTL: 300, checkperiod: 60 }); // Cache for 5 minutes
const forecastCache = new nodeCache({ stdTTL: 1800, checkperiod: 300 }); // Cache for 30 minutes
const aiAdviceCache = new nodeCache({ stdTTL: 3600, checkperiod: 600 }); // Cache for 1 hour
const geocodeCache = new nodeCache({ stdTTL: 86400, checkperiod: 3600 }); // Cache for 24 hours

function getCache(store) {
    return {
        get: (key) => store.get(key),
        set: (key, value, ttl = undefined) => store.set(key, value, ttl),
        del: (key) => store.del(key),
        flush: () => store.flushAll(),
    };
}
export const currentWeather = getCache(currentWeatherCache)
   export const forecast = getCache(forecastCache)
    export const aiAdvice =  getCache(aiAdviceCache)
    export const geocode = getCache(geocodeCache)


    
