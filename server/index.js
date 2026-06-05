import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'

import {apiLimiter} from './middleware/rateLimiter.js'
import weatherRouter from './routes/weather.js'
import travelRouter from './routes/travel.js'
import geocodeRouter from './routes/geocode.js'
import {errorHandler} from './middleware/errorHandler.js'
import  'dotenv/config' 

const app = express()
// Middleware
app.use(cors({ origin: '*',
  credentials: true}))
app.use(helmet())
app.use(express.json())

app.use('/api/', apiLimiter) // Apply rate limiting to all API routes

// Routes
app.use('/api/weather', weatherRouter)
app.use('/api/travel', travelRouter)
app.use('/api/geocode', geocodeRouter)


// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Root with simple instructions
app.get('/', (req, res) => {
  res.json({
    name: 'WeatherAI Travel Assistant Backend',
    version: '1.0.0',
    endpoints: {
      geocode: '/api/geocode?city=Tokyo',
      weather_current: '/api/weather/current?lat=35.6895&lon=139.6917',
      weather_forecast: '/api/weather/forecast?lat=35.6895&lon=139.6917&days=3',
      travel_advice: '/api/travel/advice?city=Tokyo  or  /api/travel/advice?lat=35.6895&lon=139.6917'
    }
  });
});

// Error handling (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port http://localhost:${PORT}`);
});