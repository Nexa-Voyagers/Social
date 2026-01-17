# Vercel Deployment Guide

Follow these steps to deploy AutoUpload to Vercel successfully.

## 🚀 Quick Deployment Steps

### Step 1: Configure Vercel Project Settings

1. Go to your Vercel dashboard: https://vercel.com/dashboard
2. Find your AutoUpload project
3. Click on **Settings**

### Step 2: Set Root Directory

**CRITICAL**: Vercel needs to know the frontend is in a subdirectory.

1. In Settings, go to **General**
2. Find **Root Directory**
3. Change it from `./` to `frontend`
4. Click **Save**

### Step 3: Configure Build Settings

1. In Settings, go to **Build & Development Settings**
2. Set the following:
   - **Framework Preset**: Next.js
   - **Build Command**: `npm run build` (default)
   - **Output Directory**: `.next` (default)
   - **Install Command**: `npm install` (default)

### Step 4: Set Environment Variables

1. In Settings, go to **Environment Variables**
2. Add the following variable:

```
Name: NEXT_PUBLIC_API_URL
Value: https://your-backend-url.com
```

Or for testing with local backend:
```
Name: NEXT_PUBLIC_API_URL
Value: http://localhost:3001
```

**Note**: Replace `your-backend-url.com` with your actual backend URL once deployed.

### Step 5: Redeploy

1. Go to **Deployments** tab
2. Click the **"..." menu** on the latest deployment
3. Click **Redeploy**
4. ✅ Check **"Use existing Build Cache"** if available
5. Click **Redeploy**

**OR** trigger a new deployment:
1. Go to your repository
2. Make a small change (add a space to README.md)
3. Commit and push
4. Vercel will auto-deploy

---

## 🔧 Troubleshooting Build Errors

### Error: "Module not found"

**Solution**: Make sure Root Directory is set to `frontend`

### Error: "Cannot find package.json"

**Solution**:
1. Check Root Directory is `frontend`
2. Ensure `frontend/package.json` exists in your repo

### Error: "Build failed"

**Solution**:
1. Check build logs in Vercel deployment
2. Look for specific error messages
3. Common issues:
   - Missing dependencies
   - TypeScript errors
   - Environment variables not set

### Error: "404 Not Found" after deployment

**Solution**:
1. Check if build completed successfully
2. Verify Root Directory is `frontend`
3. Check Framework Preset is `Next.js`

---

## 📊 Verify Deployment

After deployment succeeds:

1. ✅ Open your Vercel URL (e.g., `autoupload.vercel.app`)
2. ✅ You should see the AutoUpload landing page
3. ✅ Navigate to `/clients` - should show Clients page
4. ✅ Navigate to `/dashboard` - should show Dashboard

---

## 🌐 Custom Domain (Optional)

To use your own domain:

1. Go to **Settings** → **Domains**
2. Add your domain (e.g., `autoupload.com`)
3. Follow DNS configuration instructions
4. Wait for DNS propagation (up to 48 hours)

---

## 🔐 Environment Variables for Production

For production deployment, set these in Vercel:

### Required:
```
NEXT_PUBLIC_API_URL=https://your-backend-api.com/api
```

### Optional (if using authentication):
```
NEXT_PUBLIC_AUTH_ENABLED=true
```

---

## 📱 Test Your Deployment

After deployment, test these URLs:

1. **Homepage**: `https://your-app.vercel.app/`
2. **Dashboard**: `https://your-app.vercel.app/dashboard`
3. **Clients**: `https://your-app.vercel.app/clients`
4. **Calendar**: `https://your-app.vercel.app/calendar`
5. **Posts**: `https://your-app.vercel.app/posts`

All should load without 404 errors.

---

## 🐛 Common Issues & Fixes

### Issue: "This page could not be found"

**Fix**: Rebuild and redeploy with correct Root Directory

### Issue: API calls failing

**Fix**: Set `NEXT_PUBLIC_API_URL` environment variable

### Issue: Styles not loading

**Fix**:
1. Check if Tailwind CSS is configured
2. Ensure `globals.css` is imported in layout
3. Redeploy

### Issue: Images not loading

**Fix**:
1. Check `next.config.js` image domains
2. Ensure assets are in `public/` folder or use absolute URLs

---

## 🚀 Alternative: Deploy Backend + Frontend

### Option 1: Vercel (Frontend) + Railway (Backend)

**Frontend (Vercel):**
- Deploy as described above
- Set `NEXT_PUBLIC_API_URL` to Railway URL

**Backend (Railway):**
1. Go to https://railway.app/
2. Create new project from GitHub
3. Select your repository
4. Set Root Directory to `backend`
5. Add all environment variables from `backend/.env.example`
6. Deploy
7. Copy the Railway URL

### Option 2: Full Stack on Railway

1. Create two Railway services in one project:
   - Service 1: Backend (root: `backend`)
   - Service 2: Frontend (root: `frontend`)
2. Link them via internal URLs

### Option 3: Docker Deployment

Use the provided `docker-compose.yml`:
```bash
docker-compose -f docker-compose.prod.yml up -d
```

---

## 📞 Need Help?

If deployment still fails:

1. **Check Vercel Logs**:
   - Go to Deployments → Click on failed deployment → View logs

2. **Check Build Locally**:
   ```bash
   cd frontend
   npm install
   npm run build
   ```
   If this fails, fix errors before deploying

3. **Common Fixes**:
   - Clear Vercel build cache and redeploy
   - Delete `.next` folder locally and rebuild
   - Ensure all dependencies are in `package.json`

---

## ✅ Success Checklist

- [ ] Root Directory set to `frontend`
- [ ] Framework Preset set to `Next.js`
- [ ] Environment variables added
- [ ] Deployment completed without errors
- [ ] Homepage loads correctly
- [ ] All pages accessible (no 404s)
- [ ] Navigation works
- [ ] API connection configured

---

**You're all set! Your AutoUpload dashboard should now be live on Vercel! 🎉**
