# Hare Krishna Connect - Backend API

Secure Node.js/Express backend for the Hare Krishna Connect application.

**Last Updated**: December 8, 2025 - CORS configuration updated for GitHub Pages

## Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Create .env File
```bash
cp .env.example .env
```

### 3. Set Environment Variables
Edit `.env` and add:
```
GEMINI_API_KEY=your_actual_api_key_here
PORT=3000
```

### 4. Run Locally
```bash
npm run dev
```

Server will run on `http://localhost:3000`

## API Endpoints

All endpoints require `POST` requests with JSON body.

### Health Check
```
GET /health
```

### Bhagavad Gita

**Get Verse:**
```
POST /api/gita/verse
Body: { chapter: 2, verse: 47, language: "en" }
```

**Get Chapter Summary:**
```
POST /api/gita/chapter
Body: { chapter: 2, language: "en" }
```

### Krishna Leelas

**Get Story:**
```
POST /api/leelas/story
Body: { title: "Stealing Butter", language: "en" }
```

**Get Leelas List:**
```
POST /api/leelas/list
Body: { language: "en" }
```

### News & Calendar

**Get ISKCON News:**
```
POST /api/news
Body: { language: "en", coords: { lat: 40.7128, lng: -74.0060 } }
```

**Get Calendar Events:**
```
POST /api/calendar/events
Body: { language: "en" }
```

### Other Features

**Get Affirmation:**
```
POST /api/affirmation
Body: { language: "en" }
```

## Deployment

### Option 1: Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel
```

### Option 2: Render.com
1. Push code to GitHub
2. Go to https://render.com
3. Create new "Web Service"
4. Connect GitHub repo
5. Set environment variable `GEMINI_API_KEY`
6. Deploy

### Option 3: Railway.app
1. Push code to GitHub
2. Go to https://railway.app
3. Create new project
4. Connect GitHub repo
5. Add `GEMINI_API_KEY` variable
6. Deploy

## Environment Variables

Required:
- `GEMINI_API_KEY` - Your Google Gemini API key

Optional:
- `PORT` - Server port (default: 3000)
- `CORS_ORIGIN` - CORS allowed origin

## Error Handling

All endpoints return errors in format:
```json
{ "error": "Error message here" }
```

Status codes:
- `200` - Success
- `400` - Bad request (missing parameters)
- `500` - Server error

## Security

- API key never exposed to client
- CORS enabled for frontend
- Input validation on all endpoints
- Retry logic with exponential backoff
