# Render Deployment - Manual Steps Required

## ⚠️ Important: You Must Create Render Account First

Since Render doesn't have a public API for creating accounts/services, you need to do these steps manually on their website. I'll automate everything else.

---

## STEP 1: Create Render Account & Connect GitHub (YOU DO THIS)

### 1.1 Create Account
- Go to **https://render.com**
- Click **Sign up with GitHub**
- Authorize Render to access your GitHub repositories
- Verify your email

### 1.2 Verify GitHub Connection
- In Render dashboard, go to **Account Settings** → **GitHub**
- You should see your `PlantAI` repository listed

---

## STEP 2: Create PostgreSQL Database (YOU DO THIS - 2 minutes)

### 2.1 Create Database
1. In Render dashboard, click **New +** button
2. Select **PostgreSQL**
3. Fill in:
   ```
   Name: drplant-db
   Database: drplant
   User: drplant_user
   Region: Ohio (or closest to you)
   Plan: Free
   ```
4. Click **Create Database**
5. **WAIT 2-3 MINUTES** for initialization

### 2.2 Get Connection String
1. Once database shows "Available", click on it
2. Copy the **Internal Database URL** (it looks like):
   ```
   postgresql://drplant_user:PASSWORD@dpg-xxx.aws-us-east-1.postgres.render.com:5432/drplant
   ```
3. **Save this somewhere safe** - you'll need it!

---

## STEP 3: Create Web Service (YOU DO THIS - 2 minutes)

### 3.1 Create New Service
1. Click **New +** → **Web Service**
2. Select your **PlantAI** GitHub repository
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
4. Click **Create Web Service**

### 3.2 Add Environment Variables
1. Go to the **Environment** tab
2. Click **Add Environment Variable**
3. Add these variables:

   ```
   NODE_ENV = production
   JWT_SECRET = your-super-secret-jwt-key-12345
   FRONTEND_URL = https://drplant-ai.vercel.app
   DATABASE_URL = (paste the PostgreSQL URL from Step 2)
   ```

### 3.3 Auto-Deploy from GitHub
- Render will automatically:
  - Watch your `main` branch
  - Deploy whenever you push
  - No manual action needed after this!

---

## STEP 4: Wait for Deployment (Automatic)

Render will now:
1. Clone your repository
2. Install dependencies (`npm install`)
3. Build your frontend (`npm run build`)
4. Start your backend (`npm run start:prod`)

**Watch the Logs tab** - Should see:
```
Building...
> npm install
...
✓ Build successful
Server is running on port 10000
```

This takes **3-5 minutes**. Once you see "Server is running", it's live!

---

## STEP 5: Your Backend URL

After deployment completes, your backend will be at:
```
https://drplant-ai-backend.onrender.com
```

Test it:
```bash
curl https://drplant-ai-backend.onrender.com/health
```

Should return:
```json
{
  "status": "OK",
  "timestamp": "2024-09-22T...",
  "uptime": ...,
  "environment": "production"
}
```

---

## STEP 6: Update Frontend (I Can Do This)

Once your backend is running, tell me and I'll:
1. Update your frontend to point to the new backend URL
2. Deploy to Vercel automatically

---

## Quick Checklist

- [ ] Created Render account
- [ ] Connected GitHub to Render
- [ ] Created PostgreSQL database
- [ ] Got DATABASE_URL
- [ ] Created Web Service
- [ ] Set environment variables
- [ ] Backend deployed and running
- [ ] Backend health endpoint works
- [ ] Frontend updated to use new URL

---

## Need Help?

- **Render Docs**: https://render.com/docs
- **PostgreSQL Connection Issues**: Check if `DATABASE_URL` matches exactly
- **Deploy Failed**: Check the Logs tab in Render dashboard
- **CORS Errors**: Make sure `FRONTEND_URL` is set correctly

---

## When You're Done

Once your backend is deployed:
1. Tell me the backend URL (usually `https://drplant-ai-backend.onrender.com`)
2. I'll update your frontend to use it
3. I'll redeploy everything
4. Your app will be fully live!
