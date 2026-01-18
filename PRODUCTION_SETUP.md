# 🚀 AutoUpload Production Setup Guide

This guide explains how to deploy and configure the **complete AutoUpload system** with all features working.

## Overview

AutoUpload is a fully automated social media management platform with:
- **AI-Powered Content Generation** - Automatically creates posts based on your business profile
- **Smart Asset Management** - Intelligently selects and enhances uploaded images/videos
- **Automated Daily Posting** - Generates and posts content for 30 days automatically
- **Multi-Platform Support** - Facebook, Instagram, LinkedIn, Google Business, YouTube
- **Logo Embedding** - Automatically adds branded logos to all generated content

---

## Architecture

```
Frontend (Next.js 14) ──► Backend API (Node.js/Express) ──► Database (PostgreSQL)
                                    │
                                    ├──► Redis (Job Queue)
                                    ├──► OpenAI API (Content Generation)
                                    ├──► FFmpeg (Video Processing)
                                    └──► Social Media APIs (Posting)
```

---

## Part 1: Backend Deployment

### Prerequisites

- Node.js 18+ installed
- PostgreSQL 14+ installed
- Redis 6+ installed
- OpenAI API key
- AWS S3 bucket (for asset storage)
- OAuth apps created for each social platform

### Step 1: Install Dependencies

```bash
cd backend
npm install
```

### Step 2: Configure Environment Variables

Create `backend/.env`:

```env
# Server
PORT=3001
NODE_ENV=production
FRONTEND_URL=https://your-frontend-domain.com

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/autoupload
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoupload
DB_USER=your_db_user
DB_PASSWORD=your_db_password

# Redis (Job Queue)
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-change-this

# OpenAI (Content Generation)
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4

# AWS S3 (Asset Storage)
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=autoupload-assets

# Facebook/Instagram OAuth
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
FACEBOOK_REDIRECT_URI=https://your-backend.com/api/auth/facebook/callback

# LinkedIn OAuth
LINKEDIN_CLIENT_ID=your-linkedin-client-id
LINKEDIN_CLIENT_SECRET=your-linkedin-client-secret
LINKEDIN_REDIRECT_URI=https://your-backend.com/api/auth/linkedin/callback

# Google (GMB + YouTube) OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GOOGLE_REDIRECT_URI=https://your-backend.com/api/auth/google/callback

# FFmpeg (Video Processing)
FFMPEG_PATH=/usr/bin/ffmpeg
```

### Step 3: Initialize Database

```bash
cd backend
npm run db:migrate
npm run db:seed  # Optional: adds sample data
```

### Step 4: Start Backend Services

```bash
# Start API server
npm run start:api

# Start job processor (in separate terminal)
npm run start:worker
```

### Step 5: Verify Backend is Running

```bash
curl http://localhost:3001/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

---

## Part 2: OAuth Setup

### Facebook & Instagram

1. Go to [Facebook Developers](https://developers.facebook.com)
2. Create new app → Business → Social Media Management
3. Add **Facebook Login** and **Instagram Basic Display** products
4. Configure OAuth settings:
   - **Valid OAuth Redirect URIs**: `https://your-backend.com/api/auth/facebook/callback`
   - **Permissions needed**: `pages_manage_posts`, `pages_read_engagement`, `instagram_basic`, `instagram_content_publish`
5. Copy **App ID** and **App Secret** to `.env`

### LinkedIn

1. Go to [LinkedIn Developers](https://www.linkedin.com/developers/apps)
2. Create new app
3. Add **Sign In with LinkedIn** product
4. Configure OAuth settings:
   - **Redirect URLs**: `https://your-backend.com/api/auth/linkedin/callback`
   - **Scopes**: `w_member_social`, `r_organization_social`
5. Copy **Client ID** and **Client Secret** to `.env`

### Google (GMB + YouTube)

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Create new project
3. Enable APIs:
   - Google My Business API
   - YouTube Data API v3
4. Create OAuth 2.0 credentials:
   - **Authorized redirect URIs**: `https://your-backend.com/api/auth/google/callback`
   - **Scopes**: `https://www.googleapis.com/auth/business.manage`, `https://www.googleapis.com/auth/youtube.upload`
5. Copy **Client ID** and **Client Secret** to `.env`

---

## Part 3: Frontend Deployment

### Configure Frontend Environment

Create `/.env.local`:

```env
NEXT_PUBLIC_API_URL=https://your-backend-domain.com
```

### Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

In Vercel dashboard:
1. Add environment variable: `NEXT_PUBLIC_API_URL`
2. Set to your backend URL
3. Redeploy

---

## Part 4: How It Works

### 1. Business Intelligence Setup

1. User adds a client in the UI
2. Goes to **Business Intelligence** tab
3. Fills in:
   - Business description
   - Target audience
   - Brand voice
   - Content goals
   - Key messages

4. Sets **Content Strategy**:
   - Posts per day (1-5)
   - Content mix % (educational, promotional, engaging, inspirational)
   - Content themes
   - Hashtag strategy
   - Call-to-actions

5. Clicks **"Save & Start Auto-Generation"**

### 2. Assets Upload

1. User goes to **Assets** tab
2. Uploads:
   - **Logo** with placement settings (top-left, bottom-right, etc.)
   - **Images** for posts
   - **Videos** for reels

3. Assets stored in S3 with metadata

### 3. Platform Connections

1. User goes to **Platforms** tab
2. Clicks **"Connect Facebook"**, **"Connect Instagram"**, etc.
3. OAuth popup opens → User authorizes
4. Platform credentials saved to database

### 4. Automated Content Generation

Backend job processor runs every day:

```typescript
// Simplified logic
async function generateDailyContent(client) {
  // 1. Load business profile & strategy
  const profile = await getBusinessProfile(client.id);
  const strategy = await getContentStrategy(client.id);

  // 2. Determine what to create today
  const postsToday = strategy.postingFrequency;
  const contentTypes = distributeContentMix(strategy.contentMix);

  // 3. For each post
  for (let i = 0; i < postsToday; i++) {
    // 3a. Generate caption with GPT-4
    const caption = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: buildSystemPrompt(profile, strategy) },
        { role: 'user', content: `Generate ${contentTypes[i]} post for ${strategy.contentThemes[random]}` }
      ]
    });

    // 3b. Select best image from uploads
    const assets = await getClientAssets(client.id);
    const selectedImage = selectBestImage(assets, caption, contentTypes[i]);

    // 3c. Enhance image with logo
    const enhancedImage = await applyLogoWatermark(selectedImage, logoSettings);

    // 3d. If video/reel
    if (contentTypes[i] === 'reel') {
      const video = await createReelWithFFmpeg(assets.videos[random], caption, logo);
    }

    // 3e. Add hashtags and CTA
    const finalCaption = caption + '\n\n' + strategy.hashtagStrategy.join(' ') + '\n' + strategy.callToActions[random];

    // 3f. Schedule post
    await schedulePost({
      clientId: client.id,
      caption: finalCaption,
      mediaUrl: enhancedImage or video,
      scheduledTime: optimizePostTime(client.timezone),
      platforms: client.connectedPlatforms
    });
  }
}
```

### 5. Automated Posting

Redis job queue processes scheduled posts:

```typescript
// When post time arrives
async function publishPost(post) {
  const platforms = post.platforms;

  if (platforms.facebook) {
    await facebookAPI.post('/me/feed', {
      message: post.caption,
      link: post.mediaUrl
    });
  }

  if (platforms.instagram) {
    await instagramAPI.createMedia(post.mediaUrl, post.caption);
  }

  if (platforms.linkedin) {
    await linkedinAPI.shareContent(post);
  }

  // ... etc for all platforms
}
```

---

## Part 5: Production Checklist

### Backend
- [ ] PostgreSQL database created and migrated
- [ ] Redis server running
- [ ] All environment variables configured
- [ ] OAuth apps created for all platforms
- [ ] S3 bucket created and configured
- [ ] OpenAI API key added
- [ ] FFmpeg installed on server
- [ ] Backend API accessible via HTTPS
- [ ] Health endpoint returns 200 OK
- [ ] Job worker process running

### Frontend
- [ ] Deployed to Vercel (or hosting of choice)
- [ ] NEXT_PUBLIC_API_URL configured
- [ ] Can access frontend in browser
- [ ] Backend status banner shows "online"

### Verification
- [ ] Can create a client
- [ ] Can fill in Business Intelligence
- [ ] Can upload logo, images, videos
- [ ] Can connect Facebook/Instagram
- [ ] Can connect LinkedIn
- [ ] Can connect Google Business
- [ ] Auto-Generated Posts tab shows upcoming posts
- [ ] Posts are being created daily
- [ ] Posts are publishing to platforms

---

## Part 6: Troubleshooting

### Backend Not Connecting

1. Check backend is running: `curl https://your-backend.com/api/health`
2. Check CORS headers allow frontend domain
3. Check firewall/security groups allow HTTPS traffic
4. Check environment variables are set correctly

### OAuth Not Working

1. Verify redirect URIs match exactly (including http vs https)
2. Check app is in "Live" mode (not Development)
3. Verify required permissions are requested
4. Check OAuth credentials in `.env` are correct

### Posts Not Generating

1. Check job worker is running: `ps aux | grep worker`
2. Check Redis connection: `redis-cli ping`
3. Check OpenAI API key is valid
4. Check logs: `tail -f backend/logs/worker.log`

### Posts Not Publishing

1. Check platform tokens are still valid (refresh if expired)
2. Check platform API quotas/limits
3. Verify account has posting permissions
4. Check platform-specific requirements (e.g., Instagram Business account)

---

## Part 7: Monitoring

### Logs

```bash
# API logs
tail -f backend/logs/api.log

# Worker logs
tail -f backend/logs/worker.log

# Error logs
tail -f backend/logs/error.log
```

### Database Queries

```sql
-- Check scheduled posts
SELECT * FROM content_calendar WHERE status = 'scheduled' ORDER BY scheduled_date;

-- Check connected platforms
SELECT c.name, pa.platform, pa.is_active
FROM platform_accounts pa
JOIN clients c ON c.id = pa.client_id;

-- Check generated posts today
SELECT * FROM posts WHERE created_at >= CURRENT_DATE;
```

### Health Checks

```bash
# API health
curl https://your-backend.com/api/health

# Database health
curl https://your-backend.com/api/health/db

# Redis health
curl https://your-backend.com/api/health/redis

# Worker health
curl https://your-backend.com/api/health/worker
```

---

## Part 8: Scaling

### For High Volume

1. **Multiple Workers**: Run multiple job processor instances
2. **Database Replication**: Set up read replicas
3. **Redis Cluster**: Use Redis cluster for job queue
4. **CDN**: Use CloudFront/Cloudflare for frontend
5. **Load Balancer**: Use ALB for backend API

### Cost Optimization

1. **OpenAI**: Use GPT-3.5 instead of GPT-4 (90% cheaper)
2. **S3**: Enable lifecycle policies to archive old assets
3. **Database**: Use managed PostgreSQL (RDS) with auto-scaling
4. **Caching**: Cache AI responses for similar requests

---

## Support

For issues or questions:
1. Check logs in `backend/logs/`
2. Review environment variables
3. Verify OAuth setup
4. Test each component individually

---

**You now have a complete, production-ready social media automation platform!** 🎉
