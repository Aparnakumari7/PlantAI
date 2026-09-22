# Complete Guide: Deploying Backend + Database to Render

## Overview
Your app is now configured to run locally with SQLite and on Render with PostgreSQL. This guide walks through the deployment process.

---

## STEP 1: Prepare Your Code (✅ DONE)

The following files have been created/updated:
- `backend/db.js` - Switches between SQLite (local) and PostgreSQL (production)
- `backend/server.js` - Updated with async/await for PostgreSQL
- `backend/db-migrate.js` - Script to migrate SQLite data to PostgreSQL
- `.env.example` - Environment variable template
- `render.yaml` - Render deployment configuration

---

## STEP 2: Create Render Account & PostgreSQL Database

### 2.1 Create Render Account
1. Go to https://render.com
2. Sign up with GitHub, Google, or email
3. Connect your GitHub account (for auto-deploys)

### 2.2 Create PostgreSQL Database
1. In Render dashboard, click **New +** → **PostgreSQL**
2. Fill in:
   - **Name**: `drplant-db`
   - **Database**: `drplant`
   - **User**: `drplant_user`
   - **Region**: Ohio (or closest to you)
   - **Plan**: Free
3. Click **Create Database**
4. **Wait 2-3 minutes** for initialization
5. Copy the **Internal Database URL** (looks like: `postgresql://user:password@...`)
   - Save this somewhere safe!

---

## STEP 3: Install Dependencies Locally

```bash
npm install
```

This adds the `pg` (PostgreSQL) package needed for production.

---

## STEP 4: Create Web Service on Render

### 4.1 Create New Web Service
1. Go to https://render.com/dashboard
2. Click **New +** → **Web Service**
3. Select your GitHub repository (drplant-ai)
4. Configure:
   - **Name**: `drplant-ai-backend`
   - **Environment**: `Node`
   - **Plan**: Free (or paid if needed)
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
   - **Region**: Ohio (or your region)

### 4.2 Add Environment Variables
Click **Environment** and add:

```
NODE_ENV = production
JWT_SECRET = your-super-secret-key-here
FRONTEND_URL = https://drplant-ai.vercel.app
DATABASE_URL = postgresql://user:password@host:5432/drplant
```

**Get DATABASE_URL from your PostgreSQL instance created in STEP 2**

### 4.3 Connect to PostgreSQL Database
1. Click **Database** tab
2. Select your `drplant-db` PostgreSQL instance
3. Click **Connect**

### 4.4 Deploy
Click **Deploy** - Render will:
1. Clone your repo
2. Install dependencies
3. Build your frontend (`npm run build`)
4. Start your backend server

---

## STEP 5: Migrate Data from SQLite to PostgreSQL (Optional)

If you have existing SQLite data and want to keep it:

### 5.1 Set Up Local Migration
1. Create a `.env` file locally:
   ```
   DATABASE_URL=postgresql://user:password@host:5432/drplant
   NODE_ENV=production
   ```

2. Run migration:
   ```bash
   npm run migrate
   ```

This script:
- Reads all data from `backend/database.sqlite`
- Creates PostgreSQL tables
- Inserts all users and predictions
- Preserves IDs and timestamps

---

## STEP 6: Connect Frontend to Backend

Update your frontend to use the Render backend URL. In `src/services/apiService.js` or similar:

```javascript
const API_BASE_URL = process.env.VITE_API_URL || 'http://localhost:5000';
// Or for production:
const API_BASE_URL = 'https://drplant-ai-backend.onrender.com';
```

Then add to Vercel environment:
- **Key**: `VITE_API_URL`
- **Value**: `https://drplant-ai-backend.onrender.com`

---

## STEP 7: Update CORS Settings (If Needed)

Your backend CORS is configured in `backend/server.js`:

```javascript
const corsOptions = {
  origin: process.env.FRONTEND_URL
    ? [process.env.FRONTEND_URL]
    : function(origin, callback) { callback(null, true); },
  credentials: true,
};
```

This allows requests from `https://drplant-ai.vercel.app` by default.

---

## STEP 8: Test Your Deployment

### 8.1 Test Backend Health
```bash
curl https://drplant-ai-backend.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-09-22T...",
  "environment": "production"
}
```

### 8.2 Test Frontend
1. Visit https://drplant-ai.vercel.app
2. Try to register/login
3. Upload a plant image
4. Check that data saves to PostgreSQL

### 8.3 View Render Logs
In Render dashboard → Your service → **Logs** tab
Look for any error messages

---

## STEP 9: Troubleshooting

### "Database Connection Failed"
- Check `DATABASE_URL` is correct in Render environment
- Verify PostgreSQL instance is running
- Check firewall: Render allows all connections by default

### "Port Already in Use"
- Render automatically assigns PORT via `process.env.PORT`
- Your backend listens on this port - no changes needed

### "CORS Error in Browser"
- Add your Vercel frontend URL to `FRONTEND_URL` environment variable
- Restart the backend service

### "Migration Failed"
- Ensure `DATABASE_URL` is set locally
- Check you have the sqlite database file at `backend/database.sqlite`
- Run: `node backend/db-migrate.js` locally with verbose output

---

## STEP 10: Local Development (After Deployment)

To develop locally and still use Render's PostgreSQL:

1. Add `.env` file (not committed):
   ```
   DATABASE_URL=postgresql://user:password@host:5432/drplant
   NODE_ENV=development
   ```

2. Run both frontend and backend:
   ```bash
   npm run dev:full
   ```

Your local frontend will connect to Render's database.

---

## Useful Commands

```bash
# Install dependencies
npm install

# Run locally (SQLite)
npm run dev:full

# Run backend only (port 5000)
node backend/server.js

# Build for production
npm run build

# Migrate SQLite to PostgreSQL
npm run migrate

# Start production server
npm run start:prod
```

---

## Files Reference

| File | Purpose |
|------|---------|
| `backend/db.js` | Database abstraction layer (SQLite ↔ PostgreSQL) |
| `backend/server.js` | Express server (async/await compatible) |
| `backend/db-migrate.js` | Migration script (SQLite → PostgreSQL) |
| `backend/database.js` | Old SQLite setup (kept for reference) |
| `render.yaml` | Render deployment config (optional) |
| `.env.example` | Environment variables template |

---

## Success Checklist

- [ ] Render account created
- [ ] PostgreSQL database created on Render
- [ ] Web service created on Render
- [ ] Environment variables set
- [ ] npm install completed locally
- [ ] Backend health endpoint works
- [ ] Frontend connects to backend
- [ ] Registration/Login works
- [ ] Plant predictions save to database
- [ ] Admin dashboard shows statistics

---

## Support

If you face issues:
1. Check Render logs for error messages
2. Verify `DATABASE_URL` format
3. Test database connection locally
4. Review CORS settings
5. Check environment variables match exactly

Good luck! 🚀
