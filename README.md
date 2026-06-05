# 🌤️ WeatherAI Travel Assistant

A full‑stack mobile application that helps travellers get AI‑powered weather insights before and during their trips. The backend proxies the [WeatherAI API](https://weather-ai.co/docs), adds intelligent caching, and generates travel‑friendly advice using DeepSeek AI. The frontend is built with React Native (Expo) and provides a clean, offline‑capable interface.

## 🚀 Live Demo

- **Backend API:** https://weatherai-travel-server-production.up.railway.app
- **Frontend:** Follow the setup instructions below to run locally via Expo Go

Test the backend directly:
```bash
curl "https://weatherai-travel-server-production.up.railway.app/api/travel/advice?city=Tokyo"
```

📦 Tech Stack

Backend

Technology Purpose
Node.js + Express API server
WeatherAI API Weather data source
DeepSeek AI Travel advice generation
node-cache In‑memory caching (5min/30min/60min TTL)
express-rate-limit Rate limiting per IP

Frontend

Technology Purpose
React Native (Expo) Cross‑platform mobile app
Expo Router File‑based navigation
TanStack Query Data fetching & caching
NativeWind (Tailwind) Styling
AsyncStorage Offline storage & recent cities

🏗️ Architecture Overview

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  React      │────►│  Express    │────►│  Cache      │────►│  WeatherAI  │
│  Native     │     │  Backend    │     │  Layer      │     │  API        │
│  (Expo)     │◄────│  (Railway)  │◄────│  (node-cache)│     │             │
└─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                            │
                            ▼
                    ┌─────────────┐
                    │  DeepSeek   │
                    │  AI         │
                    └─────────────┘
```

Data flow:

1. User searches for a city → frontend calls backend /api/travel/advice?city=Tokyo
2. Backend geocodes city → coordinates
3. Backend checks cache → if fresh, returns cached response
4. If cache miss → calls WeatherAI API (Bearer token auth)
5. Extracts temperature, condition, humidity, forecast
6. Passes weather data to DeepSeek AI with travel‑friendly prompt
7. Caches the response (1 hour for AI, 5 min for current weather)
8. Returns JSON to frontend

🔧 API Endpoints

Method Endpoint Description Cache TTL
GET /api/travel/advice?city=Tokyo Main endpoint – weather + AI travel advice 1 hour
GET /api/weather/current?lat=&lon= Current weather only 5 min
GET /api/weather/forecast?lat=&lon= Full forecast (daily + hourly) 30 min
GET /api/geocode?city=Tokyo City → coordinates (lat/lon) 24 hours

📁 Project Structure

```
weatherai-travel-challenge/
├── server/                   # Backend (Node.js + Express)
│   ├── services/
│   │   ├── weatherService.js    # WeatherAPI calls with caching
│   │   ├── deepseekService.js   # AI travel advice
│   │   ├── geocodeService.js    # OpenStreetMap geocoding
│   │   └── cacheService.js      # In‑memory cache wrapper
│   ├── routes/
│   │   ├── travel.js
│   │   ├── weather.js
│   │   └── geocode.js
│   ├── middleware/
│   │   ├── rateLimiter.js
│   │   └── errorHandler.js
│   ├── .env.example
│   └── app.js
│
├── mobile/                   # Frontend (React Native + Expo)
│   ├── app/
│   │   ├── (tabs)/           # Home + Settings screens
│   │   ├── weather/[city].tsx   # Weather detail screen
│   │   └── _layout.tsx
│   ├── components/
│   │   ├── WeatherCard.tsx
│   │   ├── AISummaryCard.tsx
│   │   ├── ForecastRow.tsx
│   │   └── LoadingSpinner.tsx
│   ├── services/
│   │   ├── api.ts
│   │   └── storage.ts
│   ├── types.ts
│   └── app.config.js
│
└── README.md
```

🚀 Local Setup

Prerequisites

· Node.js (v18+)
· npm or yarn
· Expo Go app (iOS/Android) for mobile testing
· WeatherAI API key (Get one here)

1. Clone the Repository

```bash
git clone https://github.com/bot-Geras/weatherai-travel-challenge.git
cd weatherai-travel-challenge
```

2. Backend Setup

```bash
cd server
cp .env.example .env
```

Edit .env with your keys:

```env
PORT=4000
WEATHER_API_BASE=https://api.weather-ai.co/v1
WEATHER_API_KEY=wai_your_key_here
DEEPSEEK_API_KEY=sk_your_key_here   # Optional – falls back to rule‑based advice
```

Install dependencies and start:

```bash
npm install
npm run dev
```

Backend runs at http://localhost:4000

3. Frontend Setup

```bash
cd mobile
npm install
```

Update app.config.js with your backend URL (use local IP for testing on same WiFi):

```javascript
extra: {
  API_URL: 'http://192.168.1.100:4000',  // Replace with your computer's IP
}
```

Start Expo:

```bash
npx expo start
```

Scan the QR code with Expo Go app (iOS/Android).

🧪 Testing the API

Once the backend is running, test these endpoints:

```bash
# Get travel advice for a city
curl "http://localhost:4000/api/travel/advice?city=Tokyo"

# Current weather by coordinates
curl "http://localhost:4000/api/weather/current?lat=35.6895&lon=139.6917"

# 5‑day forecast
curl "http://localhost:4000/api/weather/forecast?lat=35.6895&lon=139.6917"

# Geocode city to coordinates
curl "http://localhost:4000/api/geocode?city=Tokyo"
```

📈 Scaling Considerations

The current implementation uses in‑memory caching suitable for demo and low traffic (<100 concurrent users). To scale to 10,000+ daily active users:

Component Current Production Scale
Cache node-cache (single instance) Redis cluster (shared across instances)
AI generation On‑demand Pre‑generate for top 1,000 cities via cron job
Rate limiting In‑memory Redis‑backed distributed rate limiting
Geocoding OpenStreetMap (free) Google Maps API with caching
Backend instances 1 Auto‑scaling (Kubernetes HPA)
CDN None CloudFront for Expo web build

Estimated monthly cost at scale (100k requests/day): ~$100 (Redis $45 + PostgreSQL $25 + CDN $10 + API calls $20)

🤝 Error Handling

The backend gracefully handles all WeatherAI API error codes:

Error Response Client Action
401 Unauthorized { error: "Invalid API key" } Check environment variables
429 Too Many Requests Retries with exponential backoff, reads X-RateLimit-Reset Shows "Try again later"
500 / 503 Retries 3 times, then returns error Falls back to cached data
Network failure Returns 503 Frontend shows cached weather

🧠 AI Prompt Engineering

The backend uses a custom prompt to generate travel‑friendly advice from raw weather data:

```
You are a concise travel assistant. Based on the weather data, provide:
1. A one‑sentence weather summary
2. A specific packing tip
3. A recommended outdoor (or indoor) activity
4. A safety note if conditions are extreme

Keep response under 100 words. No markdown.
```

📝 Environment Variables

Backend (.env)

Variable Required Default Description
PORT No 4000 Server port
WEATHER_API_KEY Yes - WeatherAI API key (starts with wai_)
WEATHER_API_BASE No https://api.weather-ai.co/v1 WeatherAI base URL
DEEPSEEK_API_KEY No - DeepSeek API key (falls back to rule‑based advice)
RATE_LIMIT_WINDOW_MS No 60000 Rate limit window (ms)
RATE_LIMIT_MAX No 30 Max requests per window

Frontend (app.config.js)

Variable Description
API_URL Backend URL (use local IP for testing on same WiFi)

🔒 Security

· API keys are stored in environment variables, never in client‑side code
· Backend acts as a proxy – frontend never calls WeatherAI directly
· Rate limiting prevents abuse (30 req/min per IP)
· CORS configured (restrict to frontend domains in production)

🐛 Troubleshooting

Issue Solution
ECONNREFUSED Backend not running or wrong port. Run npm run dev in /server
401 Unauthorized Invalid WeatherAI API key. Check .env
City not found Geocoding failed. Try a larger city name or coordinates directly
App can't connect to backend Same WiFi? Use computer's local IP (not localhost) in API_URL
DeepSeek fails Falls back to rule‑based advice – not critical

📄 License

This project is for submission purposes only.

🙏 Acknowledgements

· WeatherAI for weather data + API
· DeepSeek for AI travel advice
· OpenStreetMap Nominatim for free geocoding

---

📬 Contact

Brian David
GitHub
+254718375939

---

Built for the WeatherAI engineering challenge – 48 hours
