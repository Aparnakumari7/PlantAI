# Plant Disease Detector - Deployment Guide

This guide covers multiple deployment options for your Plant Disease Detector application, from simple hosting to production-ready deployments.

## 🏗️ Project Architecture

Your app consists of:
- **Frontend**: React + Vite (Static files)
- **Backend**: Node.js + Express API
- **Database**: SQLite (file-based)
- **AI Service**: Google Gemini API (external)

## 📋 Pre-Deployment Checklist

### 1. Environment Variables
Ensure your `.env` file contains:
```env
VITE_GEMINI_API_KEY=your_actual_api_key_here
NODE_ENV=production
JWT_SECRET=your_super_secure_jwt_secret_here
```

### 2. Build the Frontend
```bash
npm run build
```
This creates a `dist/` folder with optimized static files.

### 3. Test Production Build Locally
```bash
npm run preview
```

---

## 🚀 Deployment Options

## Option 1: Vercel (Recommended for Beginners)

Vercel is perfect for full-stack apps and handles both frontend and serverless functions.

### Step 1: Prepare for Vercel
Create `vercel.json` in your root directory:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "backend/server.js",
      "use": "@vercel/node"
    },
    {
      "src": "package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/backend/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "/dist/$1"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

### Step 2: Update Backend for Vercel
Create `backend/vercel-server.js`:

```javascript
import express from 'express';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import path from 'path';
import { fileURLToPath } from 'url';
import db from './database.js';

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'super-secret-key';

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Your existing routes here...
// (Copy all routes from server.js)

export default app;
```

### Step 3: Deploy to Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Login to Vercel
vercel login

# Deploy
vercel

# Set environment variables
vercel env add VITE_GEMINI_API_KEY
vercel env add JWT_SECRET
```

---

## Option 2: Netlify + Railway/Render

### Frontend on Netlify
1. Build your frontend: `npm run build`
2. Drag and drop the `dist/` folder to Netlify
3. Set environment variables in Netlify dashboard

### Backend on Railway
1. Create account at railway.app
2. Connect your GitHub repo
3. Set environment variables
4. Deploy automatically

---

## Option 3: Traditional VPS (DigitalOcean, AWS EC2, etc.)

### Step 1: Server Setup
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Node.js
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2 for process management
sudo npm install -g pm2

# Install Nginx for reverse proxy
sudo apt install nginx -y
```

### Step 2: Deploy Your App
```bash
# Clone your repository
git clone your-repo-url
cd your-project

# Install dependencies
npm install

# Build frontend
npm run build

# Create production environment file
echo "VITE_GEMINI_API_KEY=your_key" > .env
echo "NODE_ENV=production" >> .env
echo "JWT_SECRET=your_jwt_secret" >> .env
```

### Step 3: Configure PM2
Create `ecosystem.config.js`:

```javascript
module.exports = {
  apps: [{
    name: 'plant-detector-api',
    script: 'backend/server.js',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'development'
    },
    env_production: {
      NODE_ENV: 'production',
      PORT: 5000
    }
  }]
};
```

Start with PM2:
```bash
pm2 start ecosystem.config.js --env production
pm2 save
pm2 startup
```

### Step 4: Configure Nginx
Create `/etc/nginx/sites-available/plant-detector`:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Serve static files
    location / {
        root /path/to/your/project/dist;
        try_files $uri $uri/ /index.html;
    }

    # Proxy API requests
    location /api {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Enable the site:
```bash
sudo ln -s /etc/nginx/sites-available/plant-detector /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

---

## Option 4: Docker Deployment

### Step 1: Create Dockerfile
Create `Dockerfile` in root:

```dockerfile
# Multi-stage build
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

COPY . .
RUN npm run build

# Production stage
FROM node:18-alpine AS production

WORKDIR /app

# Copy backend files
COPY backend/ ./backend/
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy built frontend
COPY --from=builder /app/dist ./dist

# Create non-root user
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Change ownership
RUN chown -R nodejs:nodejs /app
USER nodejs

EXPOSE 5000

CMD ["node", "backend/server.js"]
```

### Step 2: Create docker-compose.yml
```yaml
version: '3.8'

services:
  plant-detector:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
      - VITE_GEMINI_API_KEY=${VITE_GEMINI_API_KEY}
      - JWT_SECRET=${JWT_SECRET}
    volumes:
      - ./backend/database.sqlite:/app/backend/database.sqlite
    restart: unless-stopped

  nginx:
    image: nginx:alpine
    ports:
      - "80:80"
    volumes:
      - ./nginx.conf:/etc/nginx/nginx.conf
    depends_on:
      - plant-detector
    restart: unless-stopped
```

### Step 3: Deploy with Docker
```bash
# Build and run
docker-compose up -d

# View logs
docker-compose logs -f
```

---

## 🔧 Production Optimizations

### 1. Update Backend for Production
Add to `backend/server.js`:

```javascript
// Serve static files in production
if (process.env.NODE_ENV === 'production') {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}
```

### 2. Add Production Scripts
Update `package.json`:

```json
{
  "scripts": {
    "dev": "vite",
    "dev:full": "concurrently \"vite\" \"node backend/server.js\"",
    "build": "vite build",
    "preview": "vite preview",
    "start": "node backend/server.js",
    "start:prod": "NODE_ENV=production node backend/server.js"
  }
}
```

### 3. Environment Variables Security
Never commit `.env` files. Instead:

1. Use your hosting platform's environment variable settings
2. For VPS, create `.env` manually on the server
3. Use secrets management for sensitive data

### 4. Database Considerations
For production, consider:
- **SQLite**: Fine for small to medium apps
- **PostgreSQL**: Better for high-traffic apps
- **Database backups**: Set up automated backups

---

## 🔒 Security Checklist

- [ ] Use HTTPS (Let's Encrypt for free SSL)
- [ ] Set strong JWT_SECRET
- [ ] Enable CORS only for your domain
- [ ] Use environment variables for secrets
- [ ] Set up database backups
- [ ] Monitor API usage and rate limiting
- [ ] Keep dependencies updated

---

## 📊 Monitoring & Maintenance

### Health Check Endpoint
Add to your backend:

```javascript
app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    uptime: process.uptime()
  });
});
```

### Log Management
For production, use proper logging:

```bash
# PM2 logs
pm2 logs

# Docker logs
docker-compose logs -f
```

---

## 🚨 Troubleshooting

### Common Issues:

1. **Build Fails**: Check Node.js version compatibility
2. **API Not Working**: Verify CORS settings and environment variables
3. **Database Issues**: Ensure SQLite file permissions
4. **Gemini API Errors**: Check API key and quotas

### Quick Fixes:
```bash
# Clear npm cache
npm cache clean --force

# Rebuild node_modules
rm -rf node_modules package-lock.json
npm install

# Check environment variables
printenv | grep VITE
```

---

## 📞 Support

If you encounter issues:
1. Check the logs first
2. Verify environment variables
3. Test locally before deploying
4. Check your hosting platform's documentation

---

## 🎯 Recommended Deployment Path

For your first deployment, I recommend:

1. **Start with Vercel** (easiest, free tier available)
2. **Move to VPS** when you need more control
3. **Use Docker** for complex deployments

Would you like me to help you with any specific deployment option?