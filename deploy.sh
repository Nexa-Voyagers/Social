#!/bin/bash

# AutoUpload - Quick Deploy Script
# This script helps you deploy the backend quickly

set -e

echo "🚀 AutoUpload Deployment Helper"
echo "================================"
echo ""

# Check if Railway CLI is installed
if command -v railway &> /dev/null; then
    DEPLOY_METHOD="railway"
    echo "✅ Railway CLI detected"
elif command -v docker-compose &> /dev/null; then
    DEPLOY_METHOD="docker"
    echo "✅ Docker detected"
else
    echo "❌ No deployment tool found"
    echo ""
    echo "Install one of:"
    echo "  - Railway CLI: npm install -g @railway/cli"
    echo "  - Docker: https://docs.docker.com/get-docker/"
    exit 1
fi

echo ""
echo "Choose deployment method:"
echo "  1) Railway (Recommended - Free $5/month)"
echo "  2) Render (Deploy via GitHub)"
echo "  3) Docker (Local/Self-hosted)"
echo "  4) Exit"
echo ""
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo ""
        echo "🚂 Deploying to Railway..."
        echo ""

        # Check if logged in
        if ! railway whoami &> /dev/null; then
            echo "Please login to Railway first:"
            railway login
        fi

        # Initialize if needed
        if [ ! -f "railway.json" ]; then
            echo "❌ railway.json not found"
            exit 1
        fi

        # Deploy
        echo ""
        echo "Creating Railway project..."
        railway init

        echo ""
        echo "Adding PostgreSQL database..."
        railway add postgres

        echo ""
        echo "Adding Redis..."
        railway add redis

        echo ""
        echo "⚠️  IMPORTANT: Set environment variables"
        echo ""
        echo "Run these commands:"
        echo ""
        echo "  railway variables set OPENAI_API_KEY=sk-..."
        echo "  railway variables set AWS_ACCESS_KEY_ID=AKIA..."
        echo "  railway variables set AWS_SECRET_ACCESS_KEY=..."
        echo "  railway variables set AWS_S3_BUCKET=autoupload-assets"
        echo "  railway variables set FRONTEND_URL=https://your-app.vercel.app"
        echo ""
        read -p "Press Enter after setting variables..."

        echo ""
        echo "Deploying backend..."
        railway up

        echo ""
        echo "✅ Deployed!"
        echo ""
        echo "Get your backend URL:"
        railway domain
        ;;

    2)
        echo ""
        echo "🎨 Deploying to Render..."
        echo ""
        echo "Steps:"
        echo "1. Go to https://render.com"
        echo "2. Click 'New +' → 'Web Service'"
        echo "3. Connect your GitHub repository"
        echo "4. Render will detect render.yaml automatically"
        echo "5. Add environment variables (see DEPLOY.md)"
        echo "6. Click 'Create Web Service'"
        echo ""
        echo "📖 Full guide: See DEPLOY.md"
        ;;

    3)
        echo ""
        echo "🐳 Starting Docker containers..."
        echo ""

        # Check for .env
        if [ ! -f ".env" ]; then
            echo "Creating .env file from template..."
            cp backend/.env.example .env
            echo ""
            echo "⚠️  IMPORTANT: Edit .env file with your values:"
            echo ""
            echo "  nano .env"
            echo ""
            echo "Required variables:"
            echo "  - OPENAI_API_KEY"
            echo "  - AWS_ACCESS_KEY_ID"
            echo "  - AWS_SECRET_ACCESS_KEY"
            echo "  - AWS_S3_BUCKET"
            echo ""
            read -p "Press Enter after editing .env..."
        fi

        echo ""
        echo "Starting services..."
        docker-compose up -d

        echo ""
        echo "✅ Services started!"
        echo ""
        echo "Check status:"
        echo "  docker-compose ps"
        echo ""
        echo "View logs:"
        echo "  docker-compose logs -f backend"
        echo ""
        echo "Test backend:"
        echo "  curl http://localhost:3001/api/health"
        ;;

    4)
        echo "Exiting..."
        exit 0
        ;;

    *)
        echo "Invalid choice"
        exit 1
        ;;
esac

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "Next steps:"
echo "1. Get your backend URL"
echo "2. Update frontend: NEXT_PUBLIC_API_URL=<backend-url>"
echo "3. Redeploy frontend: vercel --prod"
echo "4. Open your app and create a client!"
echo ""
echo "📖 Full documentation: See DEPLOY.md"
