#!/bin/bash

# Plant Disease Detector - Deployment Script
# This script helps deploy your application to a VPS

set -e  # Exit on any error

echo "🌱 Plant Disease Detector - Deployment Script"
echo "=============================================="

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    print_error "Node.js is not installed. Please install Node.js first."
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    print_error "npm is not installed. Please install npm first."
    exit 1
fi

print_status "Node.js version: $(node --version)"
print_status "npm version: $(npm --version)"

# Check if .env file exists
if [ ! -f ".env" ]; then
    print_warning ".env file not found. Creating template..."
    cat > .env << EOF
VITE_GEMINI_API_KEY=your_gemini_api_key_here
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_here
EOF
    print_warning "Please edit .env file with your actual values before continuing."
    exit 1
fi

# Install dependencies
print_status "Installing dependencies..."
npm install

# Build the frontend
print_status "Building frontend..."
npm run build

# Check if build was successful
if [ ! -d "dist" ]; then
    print_error "Build failed. dist directory not found."
    exit 1
fi

print_status "Build completed successfully!"

# Create logs directory
mkdir -p logs

# Check if PM2 is installed
if command -v pm2 &> /dev/null; then
    print_status "PM2 found. Starting application with PM2..."
    pm2 start ecosystem.config.js --env production
    pm2 save
    print_status "Application started with PM2!"
    print_status "Use 'pm2 logs' to view logs"
    print_status "Use 'pm2 status' to check status"
else
    print_warning "PM2 not found. Starting application directly..."
    print_status "Installing PM2 globally..."
    npm install -g pm2
    pm2 start ecosystem.config.js --env production
    pm2 save
    pm2 startup
    print_status "Application started with PM2!"
fi

print_status "Deployment completed successfully! 🎉"
print_status "Your application should be running on port 5000"
print_status ""
print_status "Next steps:"
print_status "1. Configure your web server (Nginx/Apache) to proxy to port 5000"
print_status "2. Set up SSL certificate (Let's Encrypt recommended)"
print_status "3. Configure your domain DNS to point to this server"
print_status ""
print_status "Useful commands:"
print_status "- pm2 status          # Check application status"
print_status "- pm2 logs            # View application logs"
print_status "- pm2 restart all     # Restart application"
print_status "- pm2 stop all        # Stop application"