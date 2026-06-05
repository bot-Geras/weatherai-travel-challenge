import OpenAI from 'openai';
import { aiAdvice } from './cacheService.js';
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
        console.error('DeepSeek API error:', error.message);
        const advice = getFallbackAdvice(weatherData);
        aiAdvice.set(cacheKey, advice);
        return { source: 'fallback', data: advice };
    }
}

// Rule-based fallback – expects weatherData with current.temp and current.condition
function getFallbackAdvice(weatherData) {
    const temp = weatherData?.current?.temp ?? 20;
    const condition = weatherData?.current?.condition?.toLowerCase() ?? 'clear';

    let advice = `Current temperature is ${temp}°C. `;
    if (temp > 30) advice += 'Very hot! Pack sunscreen, hat, and light clothing. Stay hydrated. ';
    else if (temp < 10) advice += 'Chilly! Pack a warm jacket, gloves, and a hat. ';
    else advice += 'Pleasant weather. ';

    if (condition.includes('rain')) advice += 'Expect rain – bring an umbrella. Consider indoor activities like museums. ';
    else advice += 'Great for outdoor sightseeing. ';

    advice += 'No weather warnings.';
    return advice;
}

export { getTravelAdvice, getFallbackAdvice };