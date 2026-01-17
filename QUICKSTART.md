# AutoUpload - Quick Start Guide

Get started with AutoUpload in minutes! This guide will help you add your 5 clients and start automating their social media.

## 🚀 Starting the Application

### Option 1: Using Docker (Recommended)

```bash
# Start all services
docker-compose up -d

# View logs
docker-compose logs -f backend
```

### Option 2: Local Development

**Terminal 1 - Backend:**
```bash
cd backend
npm install
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm install
npm run dev
```

### Access the Dashboard

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **API Health Check**: http://localhost:3001/health

## 📝 Adding Your 5 Clients

### Step 1: Navigate to Clients Page

1. Open http://localhost:3000/clients
2. Click **"+ Add Client"** button

### Step 2: Fill in Client Information

For each client, enter:

**Basic Information:**
- **Client Name** (required): e.g., "Acme Corp"
- **Industry**: e.g., "Technology", "Healthcare", "Retail"
- **Email**: contact@acmecorp.com
- **Phone**: +1 (555) 123-4567
- **Website**: https://acmecorp.com

**Brand Colors:**
- **Primary Color**: Choose or enter hex code (e.g., #FF5733)
- **Secondary Color**: Choose or enter hex code (e.g., #FFFFFF)

**Example:**

```
Client 1:
Name: Tech Startup Inc
Industry: Technology
Email: hello@techstartup.com
Primary Color: #3B82F6 (blue)
Secondary Color: #F3F4F6 (light gray)

Client 2:
Name: Healthy Foods Co
Industry: Food & Beverage
Email: info@healthyfoods.com
Primary Color: #10B981 (green)
Secondary Color: #FFFFFF (white)

... (add 3 more clients)
```

### Step 3: Upload Assets for Each Client

1. Click on a client card to open their detail page
2. Go to **"Assets"** tab
3. Drag and drop files or click to upload:
   - **Logo**: Primary brand logo (PNG/JPG)
   - **Images**: Product photos, team photos, graphics
   - **Videos**: Promotional videos, testimonials

**What to Upload:**
- At least 1 logo per client
- 5-10 images per client (for variety)
- 2-3 videos if available

## 📅 Scheduling Your First Posts

### Quick Schedule (Per Client)

1. Open a client's detail page
2. Go to **"Content Calendar"** tab
3. Click **"+ Schedule Post"**

### Fill in Post Details:

**Post Title**:
```
"Summer Sale Announcement"
```

**Caption**:
```
🌟 HUGE Summer Sale! Get 50% off all items this weekend only!
Don't miss out on these amazing deals. Shop now and save big!
Limited time offer!
```

**Content Type**:
- Choose: Image Post, Video Post, Reel, or Story

**Hashtags**:
```
sale, summer, deals, shopping, discount
```

**Schedule Date & Time**:
- Date: Tomorrow or future date
- Time: 10:00 AM (peak engagement time)

**Platforms** (check all that apply):
- ☑ Facebook
- ☑ Instagram
- ☑ LinkedIn
- ☐ Google My Business
- ☐ YouTube

**AI Prompt** (optional):
```
Professional image of people shopping happily,
modern retail store, bright summer colors, energetic vibe
```

### Create 30-Day Calendar

For each client, schedule:
- **3-4 posts per week**
- Mix of content types (images, reels, stories)
- Variety of posting times
- Different platforms

## 🌐 Connecting Social Media Accounts

Before posts can go live, connect social media accounts:

1. Go to client detail page
2. Click **"Platforms"** tab
3. Click **"Connect"** for each platform

**Note**: Social media OAuth requires API credentials:
- See `SETUP.md` for detailed API setup instructions
- Each platform has different requirements
- You'll need developer accounts for Meta, LinkedIn, Google

## ⚙️ Backend Setup (Required for Production)

### Environment Variables

Edit `backend/.env`:

```env
# OpenAI (for AI content generation)
OPENAI_API_KEY=sk-your-openai-key-here

# AWS S3 (for asset storage)
AWS_ACCESS_KEY_ID=your_aws_key
AWS_SECRET_ACCESS_KEY=your_aws_secret
AWS_S3_BUCKET=autoupload-assets
AWS_REGION=us-east-1

# Meta/Facebook
META_APP_ID=your_facebook_app_id
META_APP_SECRET=your_facebook_app_secret

# LinkedIn
LINKEDIN_CLIENT_ID=your_linkedin_client_id
LINKEDIN_CLIENT_SECRET=your_linkedin_client_secret

# Google (GMB + YouTube)
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

## 📊 Using the Dashboard

### Dashboard Overview
Navigate to: http://localhost:3000/dashboard

**What You'll See:**
- Total Clients count
- Scheduled Posts count
- Posts Published Today
- Total Posts

**Quick Actions:**
- Add New Client
- Schedule Post
- View Analytics

### Calendar View
Navigate to: http://localhost:3000/calendar

**Features:**
- Visual month view
- See all scheduled posts
- Click dates to view posts
- Filter by client or platform

### Posts & Analytics
Navigate to: http://localhost:3000/posts

**Features:**
- View all published posts
- Filter by platform
- See engagement metrics
- Track performance

## 🤖 How Automation Works

Once you schedule posts:

1. **Content Generation** (automatic):
   - AI refines your captions with GPT-4
   - Generates images with DALL-E (if AI prompt provided)
   - Creates branded reels with FFmpeg
   - Applies client logos and brand colors

2. **Scheduled Posting** (automatic):
   - Posts go live at scheduled time
   - Simultaneously posts to all selected platforms
   - Handles OAuth token refreshing
   - Retries on failures

3. **Analytics Collection** (automatic):
   - Fetches engagement metrics
   - Tracks likes, comments, shares
   - Updates dashboard in real-time

## 📱 Platform-Specific Tips

### Facebook
- Best times: 1-3 PM weekdays
- Mix images and videos
- Use 3-5 hashtags
- Keep captions under 250 characters

### Instagram
- Best times: 11 AM - 1 PM
- Use high-quality visuals
- 8-15 hashtags ideal
- Reels get 2x more engagement

### LinkedIn
- Best times: Tuesday-Thursday 8-10 AM
- Professional tone
- 3-5 hashtags
- Focus on value and insights

### Google My Business
- Post 2-3 times per week
- Include location info
- Use local hashtags
- Add call-to-action

## 🎯 30-Day Schedule Template

Here's a sample 30-day schedule for one client:

**Week 1:**
- Monday: Product showcase (Image) - 10 AM
- Wednesday: Behind-the-scenes (Story) - 2 PM
- Friday: Customer testimonial (Reel) - 11 AM

**Week 2:**
- Monday: Tips/Tutorial (Image) - 10 AM
- Wednesday: Team spotlight (Image) - 2 PM
- Friday: Weekly wrap-up (Video) - 4 PM

**Week 3:**
- Monday: Motivation quote (Image) - 9 AM
- Wednesday: Product demo (Reel) - 1 PM
- Friday: Weekend promo (Story) - 5 PM

**Week 4:**
- Monday: Industry news (Image) - 10 AM
- Wednesday: User-generated content (Image) - 2 PM
- Friday: End-of-month sale (Reel) - 11 AM

Repeat and adjust based on performance!

## ✅ Daily Workflow

**As a User, Your Daily Tasks:**

1. **Monday Morning** (30 minutes):
   - Review last week's analytics
   - Adjust upcoming posts if needed
   - Upload any new assets

2. **Throughout the Week** (5 minutes/day):
   - Check dashboard for scheduled posts
   - Verify posts went live correctly
   - Monitor any errors/failures

3. **End of Month** (1 hour):
   - Schedule next month's content for all clients
   - Analyze performance trends
   - Plan content themes

**Everything else is automatic!**

## 🔧 Troubleshooting

### Posts Not Going Live?

1. Check platform accounts are connected
2. Verify OAuth tokens haven't expired
3. Check backend logs: `docker-compose logs backend`
4. Ensure scheduled time is in the future

### AI Content Not Generating?

1. Verify `OPENAI_API_KEY` is set in backend/.env
2. Check OpenAI credits: https://platform.openai.com/account/billing
3. Review backend logs for errors

### Upload Failing?

1. Verify AWS S3 credentials in backend/.env
2. Check file size (max 50MB)
3. Ensure bucket permissions are correct

### Can't Connect Platforms?

1. Platform OAuth requires proper API setup
2. See SETUP.md for detailed instructions
3. Each platform needs developer app created
4. Redirect URIs must match exactly

## 📞 Next Steps

1. **Add Your 5 Clients** ✅
2. **Upload Assets** ✅
3. **Schedule 30-Day Calendar** ✅
4. **Connect Social Accounts** (requires API setup)
5. **Let AI Do the Work!** 🎉

## 🎓 Advanced Features (Coming Soon)

Future enhancements you can implement:
- Bulk content import (CSV)
- Content templates
- Auto-repost top performers
- AI-suggested posting times
- Competitor analysis
- Team collaboration
- White-label dashboard
- Mobile app

## 💡 Pro Tips

1. **Batch Your Work**: Schedule all posts for the month in one session
2. **Reuse Assets**: Upload diverse assets once, use many times
3. **Mix Content Types**: Images, reels, and stories keep feed interesting
4. **Track What Works**: Use analytics to refine your strategy
5. **Stay Consistent**: Post regularly, AI handles the rest

---

**You're all set! Start adding your clients and watch the magic happen! 🚀**

For detailed technical setup, see `SETUP.md`
For questions or issues, check the logs or contact support.
