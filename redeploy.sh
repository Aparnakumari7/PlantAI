#!/bin/bash

# Plant Disease Detector - Quick Redeploy Script
# Use this script to update your deployed website

set -e

echo "🌱 Plant Disease Detector - Redeployment Script"
echo "==============================================="

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_status "Building the application..."
npm run build

if [ ! -d "dist" ]; then
    echo "Build failed! dist directory not found."
    exit 1
fi

print_status "Build completed successfully!"

echo ""
echo "Choose your deployment platform:"
echo "1) Vercel"
echo "2) Netlify (manual upload)"
echo "3) VPS with PM2"
echo "4) Docker"
echo "5) Just built - I'll deploy manually"

read -p "Enter your choice (1-5): " choice

case $choice in
    1)
        print_status "Deploying to Vercel..."
        if command -v vercel &> /dev/null; then
            vercel --prod
            print_status "Deployed to Vercel! ✅"
        else
            print_warning "Vercel CLI not found. Install with: npm i -g vercel"
        fi
        ;;
    2)
        print_status "Build ready for Netlify!"
        print_status "📁 Upload the 'dist' folder to your Netlify site dashboard"
        print_status "🌐 Or commit and push if using Git deployment"
        ;;
    3)
        print_status "Restarting PM2 processes..."
        if command -v pm2 &> /dev/null; then
            pm2 restart all
            print_status "PM2 processes restarted! ✅"
        else
            print_warning "PM2 not found. Start manually with: node backend/server.js"
        fi
        ;;
    4)
        print_status "Rebuilding Docker containers..."
        docker-compose down
        docker-compose build --no-cache
        docker-compose up -d
        print_status "Docker containers rebuilt and started! ✅"
        ;;
    5)
        print_status "Build completed! Deploy the 'dist' folder to your hosting platform."
        ;;
    *)
        print_warning "Invalid choice. Build completed - deploy manually."
        ;;
esac

echo ""
print_status "🎉 Redeployment process completed!"
print_status ""
print_status "Next steps:"
print_status "1. Visit your deployed website"
print_status "2. Hard refresh (Ctrl+F5) to see changes"
print_status "3. Check the browser tab title"
print_status "4. Test the updated functionality"
print_status ""
print_status "Your website title should now show:"
print_status "'Plant Disease Detector - AI Diagnosis for Farmers'"