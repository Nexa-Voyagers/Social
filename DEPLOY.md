# 🚀 Complete Deployment Guide

Deploy AutoUpload backend in under 10 minutes using Railway (easiest) or Render.

## Quick Deploy Options

### Option 1: Railway (Recommended - Easiest)

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template)

**Steps:**
1. Click "Deploy on Railway" button above
2. Connect your GitHub account
3. Railway auto-detects the configuration from `railway.json`
4. Add required environment variables (see below)
5. Deploy! ✅

**Cost:** Free tier includes $5/month credit

---

### Option 2: Render

[![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)

**Steps:**
1. Click "Deploy to Render" button above
2. Connect your GitHub repository
3. Render reads `render.yaml` configuration
4. Add environment variables
5. Deploy! ✅

**Cost:** Free tier available

---

### Option 3: Docker (Self-Hosted)

```bash
# 1. Clone repository
git clone <your-repo>
cd Social

# 2. Create .env file
cp backend/.env.example .env
# Edit .env with your values

# 3. Start services
docker-compose up -d

# 4. Check health
curl http://localhost:3001/api/health
```

---

## Required Environment Variables

Add these in Railway/Render dashboard or `.env` file:

### Essential (Required to Start)

```env
# Database (Auto-provided by Railway/Render)
DATABASE_URL=postgresql://...

# Redis (Auto-provided by Railway/Render)
REDIS_URL=redis://...

# JWT Secret (auto-generated on Railway/Render)
JWT_SECRET=your-super-secret-key

# OpenAI API - Get from https://platform.openai.com/api-keys
OPENAI_API_KEY=sk-...
OPENAI_MODEL=gpt-4  # or gpt-3.5-turbo for lower cost

# AWS S3 - Get from AWS Console
AWS_ACCESS_KEY_ID=AKIA...
AWS_SECRET_ACCESS_KEY=...
AWS_REGION=us-east-1
AWS_S3_BUCKET=autoupload-assets

# Frontend URL
FRONTEND_URL=https://your-app.vercel.app
```

### OAuth (Add Later)

```env
# Facebook/Instagram
FACEBOOK_APP_ID=...
FACEBOOK_APP_SECRET=...

# LinkedIn
LINKEDIN_CLIENT_ID=...
LINKEDIN_CLIENT_SECRET=...

# Google (GMB + YouTube)
GOOGLE_CLIENT_ID=...
GOOGLE_CLIENT_SECRET=...
```

---

## Step-by-Step: Railway Deployment

### 1. Create Railway Account
- Go to [railway.app](https://railway.app)
- Sign up with GitHub

### 2. Create New Project
```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Initialize project
railway init

# Link to this repository
railway link
```

### 3. Add Services

**A. PostgreSQL Database**
```bash
railway add postgres
```

**B. Redis**
```bash
railway add redis
```

**C. Backend API**
```bash
# Railway auto-detects from railway.json
railway up
```

### 4. Configure Environment Variables

```bash
# OpenAI API Key
railway variables set OPENAI_API_KEY=sk-...

# AWS S3
railway variables set AWS_ACCESS_KEY_ID=AKIA...
railway variables set AWS_SECRET_ACCESS_KEY=...
railway variables set AWS_S3_BUCKET=autoupload-assets

# Frontend URL (your Vercel URL)
railway variables set FRONTEND_URL=https://your-app.vercel.app
```

### 5. Deploy

```bash
railway up
```

Railway will:
- ✅ Build your backend
- ✅ Run database migrations
- ✅ Start the API server
- ✅ Provide a public URL

### 6. Get Your Backend URL

```bash
railway domain
```

Copy the URL (e.g., `https://autoupload-production.up.railway.app`)

### 7. Update Frontend

Add to Vercel environment variables:
```env
NEXT_PUBLIC_API_URL=https://autoupload-production.up.railway.app
```

Redeploy frontend:
```bash
vercel --prod
```

---

## Step-by-Step: Render Deployment

### 1. Create Render Account
- Go to [render.com](https://render.com)
- Sign up with GitHub

### 2. New Web Service
- Click "New +" → "Web Service"
- Connect your repository
- Render detects `render.yaml`

### 3. Configure

**Build Command:**
```bash
cd backend && npm ci && npm run build
```

**Start Command:**
```bash
cd backend && npm start
```

**Environment:**
- Add all required environment variables from section above

### 4. Add Database & Redis

Render automatically provisions:
- PostgreSQL database
- Redis instance

Both are linked via `DATABASE_URL` and `REDIS_URL`

### 5. Deploy

Click "Create Web Service"

Render will:
- ✅ Build backend
- ✅ Start services
- ✅ Provide public URL

---

## Post-Deployment Setup

### 1. Verify Backend is Running

```bash
curl https://your-backend-url.com/api/health

# Should return:
# {"status":"ok","timestamp":"2024-..."}
```

### 2. Update Frontend

**In Vercel Dashboard:**
1. Go to Settings → Environment Variables
2. Add: `NEXT_PUBLIC_API_URL` = `https://your-backend-url.com`
3. Redeploy

**Or via CLI:**
```bash
vercel env add NEXT_PUBLIC_API_URL
# Enter: https://your-backend-url.com

vercel --prod
```

### 3. Test Connection

1. Open your frontend URL
2. Backend status banner should show "🔍 Checking..." then disappear (meaning connected!)
3. Try creating a client

---

## Getting API Keys

### OpenAI API Key

1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up / Log in
3. Go to API Keys → Create new secret key
4. Copy: `sk-...`
5. Add billing method (pay-as-you-go)

**Cost Estimate:**
- GPT-4: ~$0.03 per post (30 posts/month = $0.90/month)
- GPT-3.5-Turbo: ~$0.002 per post (30 posts/month = $0.06/month)

### AWS S3 Bucket

1. Go to [AWS Console](https://console.aws.amazon.com)
2. Create account
3. Go to S3 → Create bucket
   - Name: `autoupload-assets-<random>`
   - Region: `us-east-1`
   - Uncheck "Block all public access" (for social media images)
4. Go to IAM → Create user
   - Name: `autoupload-s3`
   - Attach policy: `AmazonS3FullAccess`
5. Create access key
6. Copy: `Access Key ID` and `Secret Access Key`

**Cost:** Free tier: 5GB storage, 20,000 GET requests/month

---

## OAuth Setup (Do This After Backend is Deployed)

### Facebook & Instagram

1. [developers.facebook.com](https://developers.facebook.com)
2. Create App → Business → Social Media
3. Add Products: Facebook Login + Instagram Basic Display
4. Settings → Basic:
   - App ID → Copy to `FACEBOOK_APP_ID`
   - App Secret → Copy to `FACEBOOK_APP_SECRET`
5. Facebook Login → Settings:
   - Valid OAuth Redirect URIs: `https://your-backend.com/api/auth/facebook/callback`
6. App Mode → Switch to "Live"

### LinkedIn

1. [linkedin.com/developers](https://www.linkedin.com/developers)
2. Create App
3. Products → Request "Sign In with LinkedIn"
4. Auth:
   - Redirect URLs: `https://your-backend.com/api/auth/linkedin/callback`
5. Copy: Client ID and Client Secret

### Google (GMB + YouTube)

1. [console.cloud.google.com](https://console.cloud.google.com)
2. Create Project
3. Enable APIs:
   - Google My Business API
   - YouTube Data API v3
4. Credentials → Create OAuth Client ID:
   - Application type: Web application
   - Authorized redirect URIs: `https://your-backend.com/api/auth/google/callback`
5. Copy: Client ID and Client Secret

---

## Troubleshooting

### Backend Won't Start

**Check Logs:**
```bash
# Railway
railway logs

# Render
# View in dashboard → Logs tab
```

**Common Issues:**
- Missing `OPENAI_API_KEY` → Add it
- Missing `DATABASE_URL` → Railway/Render should auto-add
- Build fails → Check Node version (needs 18+)

### Database Connection Error

**Railway:**
```bash
railway variables get DATABASE_URL
```

**Render:**
- Check "Environment" tab
- Verify DATABASE_URL exists

### Frontend Can't Connect

1. Check backend URL is correct
2. Verify backend health endpoint: `curl https://your-backend.com/api/health`
3. Check CORS is allowing your frontend domain
4. Verify `FRONTEND_URL` env var is set on backend

### OAuth Not Working

1. Verify redirect URIs match **exactly** (http vs https)
2. Check app is in "Live" mode (not Development)
3. Verify environment variables are set
4. Check OAuth app has required permissions

---

## Monitoring

### Health Checks

```bash
# API Health
curl https://your-backend.com/api/health

# Database Health
curl https://your-backend.com/api/health/db

# Redis Health
curl https://your-backend.com/api/health/redis
```

### View Logs

**Railway:**
```bash
railway logs --follow
```

**Render:**
- Dashboard → Logs tab

**Docker:**
```bash
docker-compose logs -f backend
```

---

## Scaling

### When to Scale

- More than 10 clients
- Generating 100+ posts/day
- High traffic

### How to Scale

**Railway:**
- Settings → Plan → Select higher tier
- Add more workers: duplicate backend service, change start command to worker

**Render:**
- Settings → Instance Type → Select Standard or above
- Add worker instance separately

---

## Cost Breakdown

### Free Tier (Perfect for Testing)

| Service | Provider | Free Tier |
|---------|----------|-----------|
| Backend Hosting | Railway | $5/month credit |
| Database | Railway | 500MB |
| Redis | Railway | 100MB |
| Frontend | Vercel | Unlimited |
| **Total** | **$0/month** | ✅ |

### Production (1-5 Clients)

| Service | Provider | Cost |
|---------|----------|------|
| Backend | Railway Starter | $5/month |
| Database | Railway | $5/month |
| Redis | Railway | $5/month |
| OpenAI GPT-4 | OpenAI | ~$1/month |
| AWS S3 | AWS | ~$1/month |
| Frontend | Vercel | $0 |
| **Total** | **~$17/month** | |

### Production (10+ Clients)

| Service | Provider | Cost |
|---------|----------|------|
| Backend | Railway Pro | $20/month |
| Database | Railway | $10/month |
| Redis | Railway | $10/month |
| OpenAI GPT-3.5 | OpenAI | ~$2/month |
| AWS S3 | AWS | ~$5/month |
| Frontend | Vercel | $0 |
| **Total** | **~$47/month** | |

---

## Next Steps

1. ✅ Deploy backend to Railway/Render
2. ✅ Get backend URL
3. ✅ Update frontend env vars
4. ✅ Redeploy frontend
5. ✅ Create first client
6. ✅ Upload assets
7. ✅ Set up OAuth (optional, can do later)
8. ✅ Fill in Business Intelligence
9. ✅ Watch AI generate content!

---

## Support

**Issues?**
- Check logs first
- Verify all environment variables
- Test health endpoints
- Review this guide

**Still stuck?**
- Railway Discord: [discord.gg/railway](https://discord.gg/railway)
- Render Docs: [render.com/docs](https://render.com/docs)

---

**Your AutoUpload backend is production-ready!** 🎉
