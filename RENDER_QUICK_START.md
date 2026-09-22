# Render Deployment - Quick Start (5 Minutes)

## What I've Done For You

✅ Created PostgreSQL-compatible database layer (`backend/db.js`)
✅ Updated Express server for async/await (`backend/server.js`)
✅ Created migration script for data transfer (`backend/db-migrate.js`)
✅ Added `pg` package to dependencies
✅ Created deployment configuration (`render.yaml`)
✅ Pushed everything to GitHub

---

## Your Quick Deployment Steps

### 1️⃣ Create Render Account (1 min)
- Go to https://render.com
- Sign up with GitHub or email
- Connect your GitHub account

### 2️⃣ Create PostgreSQL Database (1 min)
1. Dashboard → **New +** → **PostgreSQL**
2. Name: `drplant-db`
3. Region: Ohio (or yours)
4. Plan: Free
5. **Click Create** → Wait 2 minutes
6. **Copy the Internal Database URL** (save it!)

### 3️⃣ Create Web Service (2 min)
1. Dashboard → **New +** → **Web Service**
2. Select your `drplant-ai` GitHub repo
3. Fill in:
   - **Name**: `drplant-ai-backend`
   - **Environment**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm run start:prod`
4. Click **Next**

### 4️⃣ Add Environment Variables (1 min)
Add these in the "Environment" section:

```
NODE_ENV = production
JWT_SECRET = your-random-secret-key-12345
FRONTEND_URL = https://drplant-ai.vercel.app
DATABASE_URL = (paste the PostgreSQL URL from Step 2)
```

### 5️⃣ Deploy
Click **Deploy** - Done! 🎉

---

## Test It Works

After deployment completes (2-3 minutes):

```bash
# Test backend health
curl https://drplant-ai-backend.onrender.com/health

# Should return:
# {"status":"OK","timestamp":"...","environment":"production"}
```

Then:
1. Visit https://drplant-ai.vercel.app
2. Try registering a new account
3. Upload a plant image
4. Verify it saves (check your database!)

---

## Optional: Migrate Existing Data

If you have existing SQLite data to keep:

```bash
# Set DATABASE_URL locally
# DATABASE_URL=postgresql://... npm run migrate

# Then the script will transfer all data
```

---

## Environment Variables Explained

| Variable | What It Does | Example |
|----------|-------------|---------|
| `NODE_ENV` | Production mode | `production` |
| `JWT_SECRET` | Auth token signing key | `your-secret-123` |
| `FRONTEND_URL` | CORS whitelist | `https://drplant-ai.vercel.app` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://user:pass@host:5432/db` |
| `PORT` | Server port (auto-set) | 5000 |

---

## Common Issues

### "Database Connection Failed"
→ Check `DATABASE_URL` is correct and PostgreSQL is running

### "CORS Error"
→ Make sure `FRONTEND_URL` matches your Vercel domain

### "Service not starting"
→ Check Render logs tab for error messages

---

## Your Backend URL

After deployment:
```
https://drplant-ai-backend.onrender.com
```

Use this in your frontend API calls.

---

## That's It! 🚀

Your app is now:
- **Frontend**: https://drplant-ai.vercel.app (Vercel)
- **Backend**: https://drplant-ai-backend.onrender.com (Render)
- **Database**: PostgreSQL on Render
- **Auth**: Secure JWT tokens
- **Auto-deploy**: Push to GitHub → Auto-deploys

Questions? Check `RENDER_DEPLOYMENT_GUIDE.md` for details!
