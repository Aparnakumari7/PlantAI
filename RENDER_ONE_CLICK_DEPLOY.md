# 🚀 Render One-Click Deploy

The easiest way to deploy everything!

---

## Option 1: Use Render Dashboard (Recommended)

### Click This Link:
```
https://render.com/deploy?repo=https://github.com/Aparnakumari7/PlantAI
```

**OR manually:**

1. Go to https://render.com/dashboard
2. Click **New +** → **Blueprint**
3. Paste this repo URL: `https://github.com/Aparnakumari7/PlantAI`
4. Render will auto-detect `render.yaml`
5. Confirm settings
6. Click **Deploy**

---

## Option 2: Manual Steps (If Blueprint doesn't work)

### Step 2.1: Create PostgreSQL Database

1. Go to https://render.com/dashboard
2. Click **New +** → **PostgreSQL**
3. Fill in:
   ```
   Name: drplant-db
   Database: drplant
   User: drplant_user
   Region: Ohio
   Plan: Free
   ```
4. Click **Create Database**
5. Wait 2-3 minutes for "Available" status
6. **Copy the Internal Database URL** (save it!)

### Step 2.2: Create Web Service

1. Click **New +** → **Web Service**
2. Select **PlantAI** repository (GitHub)
3. Fill in:
   ```
   Name: drplant-ai-backend
   Region: Ohio
   Branch: main
   Runtime: Node
   Build Command: npm install
   Start Command: npm run start:prod
   Plan: Free
   ```
4. Click **Next**

### Step 2.3: Add Environment Variables

Click **Environment** and add these 4 variables:

```
NODE_ENV = production

JWT_SECRET = (generate random at https://generate-secret.vercel.app/)

FRONTEND_URL = https://drplant-ai.vercel.app

DATABASE_URL = (paste PostgreSQL URL from Step 2.1)
```

### Step 2.4: Deploy

Click **Deploy** button - Wait 2-3 minutes

---

## ✅ Verification

Once deployment shows "Live":

### Test Health Endpoint
```bash
curl https://drplant-ai-backend.onrender.com/health
```

Should return:
```json
{"status":"OK","timestamp":"...","uptime":...,"environment":"production"}
```

### Test Database Connection
Check Render logs - should see:
```
✓ Database schema initialized
Connected to PostgreSQL
```

---

## 📝 Your URLs After Deploy

- **Backend API**: `https://drplant-ai-backend.onrender.com`
- **Health Check**: `https://drplant-ai-backend.onrender.com/health`
- **Frontend**: `https://drplant-ai.vercel.app`

---

## 🔧 If Something Goes Wrong

### Backend build failed?
→ Check **Logs** tab in Render
→ Usually missing environment variables

### Database connection error?
→ Verify DATABASE_URL in environment variables
→ Make sure PostgreSQL status is "Available"

### Port error?
→ Render auto-assigns PORT - should work automatically

### CORS error from frontend?
→ Make sure FRONTEND_URL is set correctly
→ Might need to wait a few minutes for DNS propagation

---

## 📞 Need Help?

- Render Docs: https://render.com/docs
- Render Support: https://render.com/support
- Check logs in dashboard for error messages

---

## Next Steps After Deploy

Once backend is deployed:

1. **Tell me your backend URL** (it'll be `https://drplant-ai-backend.onrender.com`)
2. **I'll update your frontend** to connect to it
3. **I'll redeploy frontend** on Vercel
4. **Everything works!** 🎉

---

## TL;DR - Quickest Path

1. You have GitHub account? ✅
2. You have Render account? ✅
3. Click: https://render.com/deploy?repo=https://github.com/Aparnakumari7/PlantAI
4. Render auto-deploys everything
5. Done!

---

**Go to Render and deploy! 🚀**
