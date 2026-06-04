import { GoogleGenAI } from '@google/genai';
import {aiAdvice} from './aiAdvice.js';
import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY

const ai = new GoogleGenAI({apiKey: API_KEY});

const model = ai.getGenerativeModel('gemini-2.5-flash');

const TravelPrompt = (weatherData) => `
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

async function getTravelAdvice(lat, lon,weatherData) {
    const cacheKey = `${lat},${lon}`;
    const cachedAdvice = aiAdvice.get(cacheKey);
    if(cachedAdvice) {
        return { source: 'cache', data: cachedAdvice };
    }

    const prompt = TRAVEL_PROMPT(weatherData);
    const response = await model.generateContent(prompt);

    const advice = response.text.trim();
    aiAdvice.set(cacheKey, advice);
    return { source: 'api', data: advice };
}

function getFallbackAdvice(weatherData) {
    const temp = weatherData.current.temp || 20; // Default to 20°C if temp is missing
    const condition = weatherData.current?.condition?.toLowerCase() || 'clear';

    let advice = `Current temperature is ${temp}°C. `;
  if (temp > 30) advice += 'Very hot! Pack sunscreen, hat, and light clothing. Stay hydrated. ';
  else if (temp < 10) advice += 'Chilly! Pack a warm jacket, gloves, and a hat. ';
  else advice += 'Pleasant weather. ';
  
  if (condition.includes('rain')) advice += 'Expect rain – bring an umbrella. Consider indoor activities like museums. ';
  else advice += 'Great for outdoor sightseeing. ';
  
  advice += 'No weather warnings.';
  return advice;
}

exports = {
    getTravelAdvice,
    getFallbackAdvice
}