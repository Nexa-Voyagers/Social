# AutoUpload - Smart Social Media Automation Platform

> Automated content creation and multi-platform posting for digital marketing agencies

## 🎯 Overview

AutoUpload is a comprehensive social media automation platform that goes beyond simple scheduling. It automatically generates branded content (images, reels, stories) and posts them across multiple platforms based on your content calendar.

## ✨ Key Features

- **Multi-Client Management** - Manage unlimited clients with separate branding
- **Asset Library** - Upload logos, images, brand colors per client
- **30-Day Content Calendar** - Feed content plans with hashtags, captions, visual instructions
- **AI Content Generation**:
  - Branded image posts
  - Engaging reels/videos with transitions
  - Instagram stories
  - Platform-optimized formats
- **Multi-Platform Posting**:
  - ✅ Facebook
  - ✅ Instagram (Feed, Reels, Stories)
  - ✅ LinkedIn
  - ✅ Google My Business
  - ✅ YouTube (optional)
- **Automated Scheduling** - Set it and forget it
- **Analytics Dashboard** - Track performance across all platforms

## 🏗️ Architecture

```
autoupload/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── controllers/  # Route handlers
│   │   ├── services/     # Business logic
│   │   │   ├── ai/       # AI content generation
│   │   │   ├── social/   # Social media APIs
│   │   │   └── video/    # Video generation (Remotion)
│   │   ├── models/       # Database models
│   │   ├── jobs/         # Background jobs (Bull queue)
│   │   └── utils/        # Helpers
│   └── package.json
├── frontend/             # Next.js dashboard
│   ├── app/              # Next.js 14 app router
│   │   ├── clients/      # Client management
│   │   ├── calendar/     # Content calendar
│   │   ├── assets/       # Asset library
│   │   └── analytics/    # Performance dashboard
│   └── package.json
├── database/             # PostgreSQL schemas
└── docker-compose.yml    # Local development
```

## 🛠️ Tech Stack

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (data storage)
- Redis + Bull (job queue)
- AWS S3 / Cloudinary (asset storage)

**Frontend:**
- Next.js 14 (React)
- TailwindCSS + shadcn/ui
- TypeScript

**AI & Media:**
- OpenAI GPT-4 (text generation)
- Stability AI (image generation)
- Remotion (video generation)
- FFmpeg (video processing)

**Integrations:**
- Meta Graph API (Facebook + Instagram)
- LinkedIn API
- Google My Business API
- YouTube Data API v3

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- AWS Account (for S3) or Cloudinary
- API Keys:
  - OpenAI API key
  - Meta/Facebook Developer account
  - LinkedIn Developer account
  - Google Cloud Console (GMB + YouTube)

### Installation

```bash
# Clone the repository
git clone <repo-url>
cd autoupload

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys

# Install frontend dependencies
cd ../frontend
npm install
cp .env.example .env.local

# Start PostgreSQL and Redis (Docker)
cd ..
docker-compose up -d db redis

# Run database migrations
cd backend
npm run migrate

# Start development servers
npm run dev              # Backend (port 3001)
cd ../frontend
npm run dev              # Frontend (port 3000)
```

Visit `http://localhost:3000` to access the dashboard.

## 📝 Usage Workflow

1. **Add Client** - Create client profile with branding (logo, colors, fonts)
2. **Upload Assets** - Add all images, videos, graphics for the client
3. **Create Content Calendar** - Define 30-day plan:
   - Date & time for each post
   - Caption/content
   - Hashtags
   - Visual style instructions
   - Target platforms
4. **AI Generates Content** - System creates:
   - Branded image posts
   - Engaging reels with transitions
   - Stories with brand elements
5. **Auto-Posting** - Content posts automatically per schedule
6. **Monitor Analytics** - Track performance across all platforms

## 🔑 Environment Variables

**Backend (.env):**
```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/autoupload
REDIS_URL=redis://localhost:6379

# Storage
AWS_ACCESS_KEY_ID=your_key
AWS_SECRET_ACCESS_KEY=your_secret
AWS_S3_BUCKET=autoupload-assets
AWS_REGION=us-east-1

# AI Services
OPENAI_API_KEY=sk-...
STABILITY_API_KEY=sk-...

# Social Media APIs
META_APP_ID=your_app_id
META_APP_SECRET=your_app_secret
LINKEDIN_CLIENT_ID=your_client_id
LINKEDIN_CLIENT_SECRET=your_client_secret
GOOGLE_CLIENT_ID=your_client_id
GOOGLE_CLIENT_SECRET=your_client_secret

# App
PORT=3001
NODE_ENV=development
JWT_SECRET=your_jwt_secret
```

## 🎨 Content Generation Features

### Image Posts
- Automatic text overlay with brand fonts
- Logo placement
- Brand color schemes
- Platform-optimized dimensions
- Watermarking

### Reels/Videos
- Automated scene creation from images
- Text animations and transitions
- Background music (royalty-free)
- Brand intro/outro
- Platform-specific formats (9:16 for Reels, Stories)

### Multi-Platform Optimization
- **Instagram**: 1080x1080 (feed), 1080x1920 (reels/stories)
- **Facebook**: 1200x630 (feed), 1080x1920 (stories)
- **LinkedIn**: 1200x627 (posts), 1920x1080 (videos)
- **GMB**: 720x720 (posts)
- **YouTube**: 1920x1080 (videos), 1080x1920 (shorts)

## 📊 Database Schema

**Core Tables:**
- `clients` - Client profiles and branding
- `assets` - Uploaded images, videos, logos
- `content_calendar` - Scheduled posts (30-day plans)
- `generated_content` - AI-created media
- `posts` - Posted content tracking
- `platform_accounts` - Connected social media accounts
- `analytics` - Performance metrics

## 🔄 Automation Flow

```
1. Content Calendar Entry Created
   ↓
2. Scheduler Picks Up Job (Bull Queue)
   ↓
3. AI Service Generates Content:
   - GPT-4 refines caption
   - Generate/select image
   - Create reel with Remotion
   ↓
4. Content Review (optional)
   ↓
5. Multi-Platform Posting:
   - Facebook
   - Instagram
   - LinkedIn
   - GMB
   - YouTube
   ↓
6. Track & Store Analytics
   ↓
7. Send Success Notification
```

## 🚢 Deployment

### Docker Production
```bash
# Build and run with Docker Compose
docker-compose -f docker-compose.prod.yml up -d

# Or deploy to cloud (AWS ECS, Google Cloud Run, etc.)
```

### Manual Deployment
- Backend: PM2, Node.js server
- Frontend: Vercel, Netlify, or custom server
- Database: Managed PostgreSQL (AWS RDS, Supabase)
- Redis: AWS ElastiCache or Upstash

## 📈 Roadmap

- [x] Multi-client management
- [x] Asset library
- [x] Content calendar
- [x] AI image generation
- [x] AI reel generation
- [x] Multi-platform posting
- [ ] Analytics dashboard
- [ ] Auto-repost top performers
- [ ] AI-powered content suggestions
- [ ] Bulk content generation
- [ ] Team collaboration features
- [ ] White-label options

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For issues or questions, contact: [your-email@example.com]

---

**Built for digital marketing agencies who want to scale without sacrificing quality.**
