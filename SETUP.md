# AutoUpload - Setup Guide

Complete guide to set up and deploy AutoUpload locally and in production.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Development Setup](#local-development-setup)
3. [Configuration](#configuration)
4. [Running the Application](#running-the-application)
5. [Production Deployment](#production-deployment)
6. [Social Media API Setup](#social-media-api-setup)
7. [Troubleshooting](#troubleshooting)

## Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** 18+ and npm 9+
- **PostgreSQL** 14+
- **Redis** 6+
- **Docker** and Docker Compose (optional, for containerized deployment)
- **FFmpeg** (for video processing)

### API Keys Required

You'll need API keys from:

1. **OpenAI** - For AI content generation (GPT-4, DALL-E)
2. **Meta/Facebook** - For Facebook + Instagram posting
3. **LinkedIn** - For LinkedIn posting
4. **Google Cloud** - For GMB and YouTube
5. **AWS S3** or **Cloudinary** - For file storage

## Local Development Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd autoupload
```

### 2. Install Dependencies

**Backend:**
```bash
cd backend
npm install
```

**Frontend:**
```bash
cd ../frontend
npm install
```

### 3. Set Up Database

**Using Docker (Recommended):**
```bash
# From project root
docker-compose up -d db redis
```

**Manual PostgreSQL Setup:**
```bash
# Create database
createdb autoupload

# Or using psql
psql -U postgres
CREATE DATABASE autoupload;
CREATE USER autoupload WITH PASSWORD 'autoupload';
GRANT ALL PRIVILEGES ON DATABASE autoupload TO autoupload;
\q
```

**Manual Redis Setup:**
```bash
# Start Redis
redis-server

# Or install via package manager
# macOS
brew install redis
brew services start redis

# Ubuntu/Debian
sudo apt-get install redis-server
sudo systemctl start redis
```

### 4. Configure Environment Variables

**Backend (.env):**
```bash
cd backend
cp .env.example .env
# Edit .env with your actual API keys and configuration
```

**Frontend (.env.local):**
```bash
cd frontend
cp .env.example .env.local
# Edit .env.local
```

See [Configuration](#configuration) section for detailed environment variables.

### 5. Install FFmpeg

**macOS:**
```bash
brew install ffmpeg
```

**Ubuntu/Debian:**
```bash
sudo apt-get update
sudo apt-get install ffmpeg
```

**Windows:**
Download from https://ffmpeg.org/download.html

## Configuration

### Backend Environment Variables

Edit `backend/.env`:

```env
# Server
NODE_ENV=development
PORT=3001
FRONTEND_URL=http://localhost:3000

# Database
DATABASE_URL=postgresql://autoupload:autoupload@localhost:5432/autoupload
DB_HOST=localhost
DB_PORT=5432
DB_NAME=autoupload
DB_USER=autoupload
DB_PASSWORD=autoupload

# Redis
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production

# AWS S3
AWS_ACCESS_KEY_ID=your_aws_access_key
AWS_SECRET_ACCESS_KEY=your_aws_secret_key
AWS_S3_BUCKET=autoupload-assets
AWS_REGION=us-east-1

# OpenAI
OPENAI_API_KEY=sk-your-openai-api-key
OPENAI_MODEL=gpt-4-turbo-preview

# Meta/Facebook
META_APP_ID=your_facebook_app_id
META_APP_SECRET=your_facebook_app_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Google (GMB + YouTube)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret

# Feature Flags
ENABLE_VIDEO_GENERATION=true
ENABLE_AI_CAPTIONS=true
```

### Frontend Environment Variables

Edit `frontend/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
API_URL=http://localhost:3001
```

## Running the Application

### Option 1: Docker Compose (Recommended)

```bash
# From project root
docker-compose up -d

# View logs
docker-compose logs -f

# Stop all services
docker-compose down
```

Access:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health**: http://localhost:3001/health

### Option 2: Manual Start

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

**Terminal 3 - Database & Redis:**
```bash
# If not using Docker
# Start PostgreSQL and Redis manually
```

## Production Deployment

### Option 1: Docker Deployment

```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Start services
docker-compose -f docker-compose.prod.yml up -d

# Check status
docker-compose -f docker-compose.prod.yml ps
```

### Option 2: Manual Deployment

#### Backend Deployment

```bash
cd backend
npm ci --production
npm run build
npm start

# Or use PM2
npm install -g pm2
pm2 start dist/index.js --name autoupload-api
pm2 save
pm2 startup
```

#### Frontend Deployment

```bash
cd frontend
npm ci --production
npm run build
npm start

# Or use PM2
pm2 start npm --name autoupload-frontend -- start
```

### Cloud Deployment Options

**AWS:**
- Deploy backend on **AWS ECS** or **AWS Lambda**
- Deploy frontend on **AWS Amplify** or **Vercel**
- Use **AWS RDS** for PostgreSQL
- Use **AWS ElastiCache** for Redis

**Google Cloud:**
- Deploy on **Cloud Run**
- Use **Cloud SQL** for PostgreSQL
- Use **Memorystore** for Redis

**Vercel + Railway:**
- Deploy frontend on **Vercel**
- Deploy backend on **Railway**
- Use Railway's PostgreSQL and Redis

## Social Media API Setup

### Facebook & Instagram Setup

1. Go to https://developers.facebook.com/
2. Create a new app
3. Add **Facebook Login** and **Instagram Graph API**
4. Get your **App ID** and **App Secret**
5. Configure OAuth redirect: `http://your-domain/api/auth/facebook/callback`
6. Request permissions:
   - `pages_show_list`
   - `pages_read_engagement`
   - `pages_manage_posts`
   - `instagram_basic`
   - `instagram_content_publish`

### LinkedIn Setup

1. Go to https://www.linkedin.com/developers/
2. Create a new app
3. Add **Sign In with LinkedIn** product
4. Get your **Client ID** and **Client Secret**
5. Configure OAuth redirect: `http://your-domain/api/auth/linkedin/callback`
6. Request permissions:
   - `r_liteprofile`
   - `r_emailaddress`
   - `w_member_social`
   - `w_organization_social`

### Google My Business Setup

1. Go to https://console.cloud.google.com/
2. Create a new project
3. Enable **Google My Business API**
4. Create OAuth 2.0 credentials
5. Configure OAuth redirect: `http://your-domain/api/auth/google/callback`
6. Request scopes:
   - `https://www.googleapis.com/auth/business.manage`

### YouTube Setup

1. In Google Cloud Console (same project as GMB)
2. Enable **YouTube Data API v3**
3. Use the same OAuth credentials
4. Request additional scope:
   - `https://www.googleapis.com/auth/youtube.upload`

## Database Migration

Run database migrations:

```bash
cd backend
npm run migrate
```

Seed initial data (optional):

```bash
npm run seed
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -h localhost -U autoupload -d autoupload

# Check if PostgreSQL is running
sudo systemctl status postgresql  # Linux
brew services list                # macOS
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check if Redis is running
sudo systemctl status redis  # Linux
brew services list           # macOS
```

### Port Already in Use

```bash
# Find process using port 3000 or 3001
lsof -i :3000
lsof -i :3001

# Kill the process
kill -9 <PID>
```

### FFmpeg Not Found

```bash
# Check FFmpeg installation
which ffmpeg
ffmpeg -version

# If not found, install:
# macOS
brew install ffmpeg

# Ubuntu/Debian
sudo apt-get install ffmpeg
```

### OpenAI API Errors

- Check API key is valid: https://platform.openai.com/api-keys
- Ensure you have credits: https://platform.openai.com/account/billing
- Check rate limits: https://platform.openai.com/account/limits

### S3 Upload Errors

- Verify AWS credentials are correct
- Check bucket name and region
- Ensure bucket has public-read ACL enabled
- Verify IAM permissions for S3 operations

## Next Steps

1. **Create your first client**
   - Go to http://localhost:3000/clients
   - Add client with logo and branding

2. **Upload assets**
   - Add images, videos for the client

3. **Create content calendar**
   - Schedule posts for next 30 days
   - Add captions, hashtags, visual instructions

4. **Connect social media accounts**
   - Link Facebook, Instagram, LinkedIn, GMB, YouTube
   - Complete OAuth flows

5. **Let AI generate and post**
   - Content will be auto-generated and posted per schedule

## Support

For issues or questions:
- Check logs: `docker-compose logs -f`
- Backend logs: `backend/logs/`
- GitHub Issues: [repository-url]/issues

## License

Proprietary - All rights reserved
