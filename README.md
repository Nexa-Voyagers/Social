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

## 🏗️ Project Structure

```
autoupload/
├── app/                  # Next.js 14 app directory
│   ├── clients/         # Client management pages
│   ├── calendar/        # Content calendar
│   ├── dashboard/       # Analytics dashboard
│   └── posts/           # Published posts view
├── components/          # React components
│   ├── ui/              # UI components (Button, Card, etc.)
│   └── client/          # Client-specific components
├── lib/                 # Utilities and API client
├── backend/             # Node.js + Express API
│   ├── src/
│   │   ├── controllers/ # Route handlers
│   │   ├── services/    # Business logic
│   │   │   ├── ai/      # AI content generation
│   │   │   ├── social/  # Social media APIs
│   │   │   └── video/   # Video generation
│   │   ├── models/      # Database models
│   │   ├── jobs/        # Background jobs
│   │   └── routes/      # API routes
│   └── package.json
├── database/            # PostgreSQL schemas
├── public/              # Static assets
├── next.config.js       # Next.js configuration
├── package.json         # Frontend dependencies
└── docker-compose.yml   # Local development setup
```

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- PostgreSQL 14+
- Redis 6+
- AWS Account (for S3) or Cloudinary
- API Keys: OpenAI, Meta/Facebook, LinkedIn, Google Cloud

### Installation

```bash
# Clone repository
git clone <repo-url>
cd autoupload

# Install frontend dependencies
npm install

# Install backend dependencies
cd backend
npm install
cp .env.example .env
# Edit .env with your API keys

# Start database and Redis (Docker)
cd ..
docker-compose up -d db redis

# Run migrations
cd backend
npm run migrate

# Start development servers
npm run dev              # Backend (port 3001)
cd ..
npm run dev              # Frontend (port 3000)
```

Visit `http://localhost:3000` to access the dashboard.

## 📝 Usage Workflow

1. **Add Client** - Create client profile with branding
2. **Upload Assets** - Add images, videos, logos
3. **Create Content Calendar** - Schedule 30-day plan
4. **AI Generates Content** - Automated content creation
5. **Auto-Posting** - Posts go live per schedule
6. **Monitor Analytics** - Track performance

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- React 18
- TypeScript
- TailwindCSS + shadcn/ui
- TanStack Query

**Backend:**
- Node.js + Express + TypeScript
- PostgreSQL (Sequelize ORM)
- Redis + Bull (job queue)
- AWS S3 (storage)

**AI & Media:**
- OpenAI GPT-4 (caption generation)
- DALL-E (image generation)
- FFmpeg (video processing)
- Remotion (programmatic videos)

**Integrations:**
- Meta Graph API (Facebook + Instagram)
- LinkedIn API
- Google My Business API
- YouTube Data API v3

## 🚢 Deployment

### Vercel (Frontend)
```bash
# Frontend is at root level - auto-detected by Vercel
# Just connect your repo and deploy!
```

### Backend Options
- **Railway**: Deploy backend separately
- **AWS ECS**: Containerized deployment
- **Heroku**: Quick deployment
- **Docker**: Use included docker-compose.yml

See [DEPLOYMENT.md](./DEPLOYMENT.md) for detailed instructions.

## 📚 Documentation

- **[QUICKSTART.md](./QUICKSTART.md)** - Get started in minutes
- **[SETUP.md](./SETUP.md)** - Detailed setup guide
- **[DEPLOYMENT.md](./DEPLOYMENT.md)** - Deployment instructions

## 🔑 Environment Variables

**Backend (.env):**
```env
DATABASE_URL=postgresql://...
REDIS_URL=redis://...
OPENAI_API_KEY=sk-...
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
META_APP_ID=...
META_APP_SECRET=...
LINKEDIN_CLIENT_ID=...
GOOGLE_CLIENT_ID=...
```

**Frontend (.env.local):**
```env
NEXT_PUBLIC_API_URL=http://localhost:3001
```

## 📊 Features

### Content Generation
- Automatic text overlay with brand fonts
- Logo placement
- Brand color schemes
- Platform-optimized dimensions
- AI-powered image generation
- Video/reel creation with transitions

### Multi-Platform Optimization
- Instagram: 1080x1080 (feed), 1080x1920 (reels/stories)
- Facebook: 1200x630 (feed), 1080x1920 (stories)
- LinkedIn: 1200x627 (posts), 1920x1080 (videos)
- GMB: 720x720 (posts)
- YouTube: 1920x1080 (videos), 1080x1920 (shorts)

## 🔄 Automation Flow

```
Content Calendar Entry → Scheduler → AI Generation →
Multi-Platform Posting → Analytics Tracking → Notifications
```

## 📈 Roadmap

- [x] Multi-client management
- [x] AI content generation
- [x] Multi-platform posting
- [x] Content calendar
- [ ] Advanced analytics
- [ ] Auto-repost top performers
- [ ] AI content suggestions
- [ ] Team collaboration
- [ ] White-label options

## 📄 License

Proprietary - All rights reserved

## 🤝 Support

For questions or issues, see documentation or contact support.

---

**Built for digital marketing agencies who want to scale without sacrificing quality.**
