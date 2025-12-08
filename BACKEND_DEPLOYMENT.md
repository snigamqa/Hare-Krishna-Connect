# Deploy Backend to Railway.app (Free Tier)

## Step 1: Create Railway Account
1. Go to https://railway.app
2. Sign up with GitHub
3. Connect your GitHub account

## Step 2: Create New Backend Service
1. Click "New Project"
2. Select "Deploy from GitHub repo"
3. Select `snigamqa/Hare-Krishna-Connect`
4. Confirm

## Step 3: Configure Environment
1. In Railway dashboard, click "Variables"
2. Add variable: `GEMINI_API_KEY`
3. Paste your **NEW** Gemini API key (from https://aistudio.google.com/app/apikey)
4. Add variable: `PORT` = `3000`

## Step 4: Set Root Directory
1. In Railway settings, set "Root Directory" to `backend`
2. Set "Start Command" to `npm start`

## Step 5: Deploy
1. Railway will automatically deploy
2. Copy the generated URL (e.g., `https://hare-krishna-api-production-xxxx.railway.app`)
3. Wait 2-3 minutes for deployment

## Step 6: Update GitHub Actions
1. Go to https://github.com/snigamqa/Hare-Krishna-Connect/settings/secrets/actions
2. Update secret: `BACKEND_API_URL` = your Railway URL
3. Or manually update `.github/workflows/deploy.yml` line 31

## Step 7: Test Backend Health
```bash
curl https://your-railway-url/health
```

Should return: `{"status":"ok","timestamp":"2025-12-08T..."}`

---

## Alternative: Deploy to Render.com

1. Go to https://render.com
2. Click "New +" → "Web Service"
3. Connect GitHub repo `Hare-Krishna-Connect`
4. Configure:
   - **Name**: `hare-krishna-api`
   - **Region**: Choose closest
   - **Branch**: `main`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Add Environment Variable:
   - `GEMINI_API_KEY` = your API key
6. Click "Deploy"
7. Get your service URL from dashboard

---

## Alternative: Deploy to Vercel

Vercel handles Node.js serverless functions better:

1. Push code to GitHub
2. Go to https://vercel.com
3. Click "New Project"
4. Select GitHub repo
5. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
6. Add Environment: `GEMINI_API_KEY`
7. Deploy

---

## Getting a NEW Gemini API Key

1. Go to https://aistudio.google.com/app/apikey
2. Delete the old (leaked) key
3. Click "Create API Key"
4. Select project (or create new)
5. Copy the new key
6. Add to backend `.env` or Railway/Render environment

---

## Local Testing

```bash
# In backend directory
cd backend

# Install dependencies
npm install

# Create .env file
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key_here

# Run server
npm run dev
```

Test endpoints:
```bash
# Health check
curl http://localhost:3000/health

# Get Gita verse
curl -X POST http://localhost:3000/api/gita/verse \
  -H "Content-Type: application/json" \
  -d '{"chapter": 2, "verse": 47, "language": "en"}'
```

---

## Architecture

```
Frontend (React) [GitHub Pages]
        ↓
        → Calls: https://hare-krishna-api.railway.app
        ↓
Backend API (Node.js) [Railway]
        ↓
        → Calls: Google Gemini API (with secret key)
```

✅ **Your API key is now SAFE** - Only backend sees it!
