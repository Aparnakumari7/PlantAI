# Render Deployment Checklist

Your code is ready! Here's what YOU need to do manually on Render:

---

## 🎯 Quick Timeline: ~10 minutes total

### Step 1: Create Account (2 min)
- [ ] Go to https://render.com
- [ ] Sign up with GitHub
- [ ] Authorize Render
- [ ] Verify email

### Step 2: Create Database (2 min)
- [ ] In Render dashboard, click **New +** → **PostgreSQL**
- [ ] Fill in:
  - Name: `drplant-db`
  - Database: `drplant`
  - User: `drplant_user`
  - Region: Ohio
  - Plan: Free
- [ ] Click **Create Database**
- [ ] **WAIT 2-3 minutes** until status = "Available"
- [ ] Copy **Internal Database URL**
- [ ] Save it somewhere

### Step 3: Create Web Service (2 min)
- [ ] In Render, click **New +** → **Web Service**
- [ ] Select your **PlantAI** GitHub repository
- [ ] Fill in:
  - **Name**: `drplant-ai-backend`
  - **Region**: Ohio
  - **Branch**: main
  - **Runtime**: Node
  - **Build Command**: `npm install`
  - **Start Command**: `npm run start:prod`
  - **Plan**: Free
- [ ] Click **Create Web Service**

### Step 4: Add Environment Variables (2 min)
In the service, go to **Environment** tab and add:

```
NODE_ENV = production

JWT_SECRET = (generate a random secret: https://generate-secret.vercel.app/)

FRONTEND_URL = https://drplant-ai.vercel.app

DATABASE_URL = (paste the PostgreSQL URL from Step 2)
```

### Step 5: Wait for Deployment (2-3 min)
- [ ] Watch the **Logs** tab
- [ ] Should see "Server is running on port 10000"
- [ ] Deployment is complete when status shows "Live"

---

## ✅ Verification

Once deployed:

### Test Backend Health
```bash
curl https://drplant-ai-backend.onrender.com/health
```

Should return:
```json
{"status":"OK","timestamp":"...","uptime":...,"environment":"production"}
```

### Then Tell Me
Once your backend is deployed, come back and tell me:
1. Your backend URL (usually `https://drplant-ai-backend.onrender.com`)
2. Confirmation that `/health` endpoint works

---

## 📝 What I've Prepared For You

✅ Backend code ready for PostgreSQL
✅ Database migrations included
✅ Environment variables documented
✅ Auto-deploy from GitHub configured
✅ CORS settings configured for Vercel frontend
✅ All dependencies installed

---

## 🚀 After Backend is Live

Once you tell me your backend URL is working:

I will:
1. Update your frontend `.env` with backend URL
2. Update `src/services/apiService.js`
3. Build and test locally
4. Push to GitHub
5. Vercel auto-deploys
6. Everything works together!

---

## 🆘 Common Issues & Fixes

### "Build failed" 
→ Check Logs tab. Usually missing env var. Add all 4 variables!

### "Connection refused"
→ DATABASE_URL is wrong. Copy it exactly from Render PostgreSQL page

### "Cannot GET /"
→ Backend is running but frontend isn't. Normal - we haven't updated frontend URL yet

### Port already in use
→ Not your problem - Render assigns PORT automatically

---

## 📞 Need Help?

- Can't find PostgreSQL page? → https://render.com/docs/databases
- Lost DATABASE_URL? → Go back to PostgreSQL instance in Render dashboard, it's there
- JWT_SECRET generator: → https://generate-secret.vercel.app/
- Render support: → https://render.com/docs

---

## Next Steps

1. **Do Steps 1-5 above** on Render's website
2. **Tell me your backend URL** when it's deployed
3. **I'll update your frontend** and deploy it
4. **Done!** Your app will be fully live

---

Good luck! 🎉
