import OpenAI from 'openai';
import { aiAdvice } from './cacheService.js';
import logger from './loggerService.js';
import 'dotenv/config';

// Initialize DeepSeek client
const client = new OpenAI({
    apiKey: process.env.DEEPSEEK_API_KEY,
    baseURL: 'https://api.deepseek.com'
});

// Travel assistant prompt
const TRAVEL_PROMPT = (weatherData) => `
You are a concise travel assistant helping a user plan their trip.

Based on the weather data below, generate a short, helpful response (max 100 words) that includes:

1. A one-sentence summary of the weather.
2. A specific packing tip (e.g., umbrella, sunscreen, jacket).
3. A recommended outdoor activity for today if weather permits, or an indoor alternative if not.
4. A safety note if conditions are extreme (heat, storm, heavy rain), otherwise say "No weather warnings."

Weather data (JSON):
${JSON.stringify(weatherData, null, 2)}

Respond in natural English, friendly but brief. Do not include markdown or JSON.
`;

async function getTravelAdvice(lat, lon, weatherData) {
    const cacheKey = `${lat},${lon}`;
    const cachedAdvice = aiAdvice.get(cacheKey);
    if (cachedAdvice) {
        return { source: 'cache', data: cachedAdvice };
    }

    if (!process.env.DEEPSEEK_API_KEY) {
        const advice = getFallbackAdvice(weatherData);
        aiAdvice.set(cacheKey, advice);
        return { source: 'fallback', data: advice };
    }

    try {
        const chatCompletion = await client.chat.completions.create({
            messages: [
                { role: 'system', content: 'You are a concise travel assistant. Keep your response to under 100 words.' },
                { role: 'user', content: TRAVEL_PROMPT(weatherData) }
            ],
            model: 'deepseek-chat',
            temperature: 0.7,
        });

        const advice = chatCompletion.choices[0]?.message?.content || "Could not generate travel advice.";
        aiAdvice.set(cacheKey, advice);
        return { source: 'api', data: advice };
    } catch (error) {
        logger.error(`DeepSeek API error: ${error.message}`);
        const advice = getFallbackAdvice(weatherData);
        aiAdvice.set(cacheKey, advice);
        return { source: 'fallback', data: advice };
    }
}

// Comprehensive rule-based fallback advice
function getFallbackAdvice(weatherData) {
    const tempVal = parseFloat(weatherData?.current?.temp);
    const temp = isNaN(tempVal) ? 20 : tempVal;
    
    const condition = (weatherData?.current?.condition || 'clear').toLowerCase();
    
    const windSpeedVal = parseFloat(weatherData?.current?.wind_speed);
    const windSpeed = isNaN(windSpeedVal) ? 0 : windSpeedVal;
    
    const humidityVal = parseFloat(weatherData?.current?.humidity);
    const humidity = isNaN(humidityVal) ? 50 : humidityVal;

    let summary = isNaN(tempVal) 
        ? `We're having trouble getting precise weather data, but typically for this area: `
        : `The weather is currently ${temp}°C and ${condition}. `;
    let packing = '';
    let activity = '';
    let safety = 'No weather warnings.';

    // Temperature Logic
    if (temp <= 0) {
        packing = 'Wear heavy thermal layers, a down jacket, gloves, and insulated boots. ';
        activity = 'Perfect for indoor heating or winter sports if available. ';
    } else if (temp > 0 && temp <= 10) {
        packing = 'Pack a warm coat, scarf, and layers. ';
        activity = 'Great for a brisk walk, followed by a warm indoor break. ';
    } else if (temp > 10 && temp <= 20) {
        packing = 'A light jacket or sweater should be enough. ';
        activity = 'Ideal for sightseeing and walking tours. ';
    } else if (temp > 20 && temp <= 30) {
        packing = 'Wear light, breathable cotton clothing and sunglasses. ';
        activity = 'Perfect for outdoor cafes, parks, or the beach. ';
    } else {
        packing = 'Wear very light clothing, a hat, and plenty of sunscreen. ';
        activity = 'Avoid direct sun during midday; seek air-conditioned spaces. ';
        safety = 'High heat warning: Stay hydrated and limit physical exertion.';
    }

    // Condition Logic
    if (condition.includes('rain') || condition.includes('drizzle')) {
        packing += 'Don\'t forget a waterproof jacket or umbrella. ';
        activity = 'Consider visiting museums, galleries, or shopping malls to stay dry. ';
    } else if (condition.includes('snow') || condition.includes('ice')) {
        packing += 'Ensure your footwear has good grip. ';
        activity = 'Expect travel delays; enjoy the winter scenery from indoors. ';
        safety = 'Slippery conditions: Watch your step.';
    } else if (condition.includes('thunder') || condition.includes('storm')) {
        activity = 'Stay indoors and away from windows until the storm passes. ';
        safety = 'Severe weather warning: Seek shelter immediately.';
    } else if (condition.includes('fog') || condition.includes('mist')) {
        activity = 'Visibility is low; be cautious if driving or hiking. ';
    }

    // Wind Logic
    if (windSpeed > 15) {
        packing += 'A windbreaker is highly recommended. ';
        safety = windSpeed > 25 ? 'Gale warning: Avoid being near tall trees or structures.' : safety;
    }

    // Humidity Logic
    if (humidity > 80 && temp > 25) {
        summary += 'It feels quite humid. ';
    }

    return `${summary}${packing}${activity}${safety}`;
}

export { getTravelAdvice, getFallbackAdvice };