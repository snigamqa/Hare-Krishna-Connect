# DEPLOYMENT CHECKLIST ✅

## ✅ Frontend Status
- [x] Code builds successfully (`npm run build`)
- [x] Backend integration complete (calls /api/gita, /api/leelas, /api/news, /api/calendar)
- [x] No API key exposed in browser
- [x] All frontend code pushed to GitHub
- [x] GitHub Pages will auto-deploy on next push

## 📋 Next Steps - Deploy Backend (REQUIRED)

### Choose Your Platform:

#### Option 1: Railway.app (⭐ RECOMMENDED - Easiest)
```
1. Go to https://railway.app
2. Sign up with GitHub
3. New Project → Deploy from GitHub repo
4. Select: snigamqa/Hare-Krishna-Connect
5. Set root directory: backend
6. Add environment variable:
   - GEMINI_API_KEY = your_new_api_key
7. Deploy!
8. Copy your backend URL (e.g., https://hare-krishna-api-production-xxxx.railway.app)
```

#### Option 2: Render.com
```
1. Go to https://render.com
2. New → Web Service
3. Connect GitHub repo
4. Root directory: backend
5. Start command: npm start
6. Add GEMINI_API_KEY environment variable
7. Deploy
```

#### Option 3: Vercel
```
1. Go to https://vercel.com
2. Import GitHub repo
3. Root directory: backend
4. Add GEMINI_API_KEY
5. Deploy
```

---

## 🔑 Get New Gemini API Key

**IMPORTANT: Your old key is leaked and blocked!**

1. Go to https://aistudio.google.com/app/apikey
2. DELETE the old key
3. Click "Create API Key"  
4. Select project (or create new)
5. COPY the new key
6. Add to your backend's environment variables

---

## 🚀 After Backend Deployment

1. **Get your backend URL** from Railway/Render/Vercel dashboard
2. **Update frontend** `.github/workflows/deploy.yml` line 31:
   ```yaml
   VITE_API_URL: https://your-backend-url-here
   ```
3. **Push to GitHub** - frontend will auto-rebuild and deploy
4. **Test** all features at: https://snigamqa.github.io/Hare-Krishna-Connect/

---

## ✨ Final Architecture

```
Your Website (GitHub Pages)
     ↓ HTTPS
Backend Server (Railway/Render/Vercel)
     ↓ Secure (key never in browser)
Google Gemini API
```

### API Endpoints Working:
- ✅ POST /api/gita/verse - Get Gita verses
- ✅ POST /api/gita/chapter - Get chapter summaries
- ✅ POST /api/leelas/list - Get Krishna stories list
- ✅ POST /api/leelas/story - Get detailed leela story
- ✅ POST /api/news - Get ISKCON news
- ✅ POST /api/calendar/events - Get Vaishnava calendar
- ✅ POST /api/affirmation - Get daily affirmations

---

## 🧪 Test Backend Locally (Optional)

```bash
cd backend
npm install
cp .env.example .env
# Edit .env and add: GEMINI_API_KEY=your_key
npm run dev

# Test endpoint:
curl -X POST http://localhost:3000/api/gita/chapter \
  -H "Content-Type: application/json" \
  -d '{"chapter": 2, "language": "en"}'
```

---

## 📊 Status Summary

| Component | Status | Notes |
|-----------|--------|-------|
| Frontend Build | ✅ WORKING | Builds successfully, no errors |
| Backend Server | 🟡 NOT DEPLOYED | Ready to deploy, waiting for your action |
| API Key | 🔴 LEAKED | Need to create NEW key and add to backend |
| Deployment | ⏳ PENDING | Will auto-deploy once backend is set up |

---

**ACTION REQUIRED**: Deploy backend to Railway/Render/Vercel with your NEW Gemini API key!

Once done, reply here and everything will be live! 🙏
