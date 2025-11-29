# ⚡ Vercel Backend Quick Deploy (2 Minutes!)

## ✅ Yes! Backend Works on Vercel!

Vercel can host your Express.js backend as **serverless functions**.

---

## 🚀 Quick Setup

### Step 1: Create Backend Project (1 min)

1. **Go to**: https://vercel.com
2. **Add New Project**
3. **Import** `Hezak` repository
4. **Configure**:
   - **Root Directory**: `backend` ⚠️ IMPORTANT!
   - **Framework**: Other
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
5. **Deploy** ✅

### Step 2: Add Environment Variables (30 sec)

In **Settings** → **Environment Variables**:

```
JWT_SECRET=your-secret-key-here
NODE_ENV=production
```

**Or use Vercel Postgres** (Recommended):
1. **Storage** tab → **Create** → **Postgres**
2. Vercel auto-adds `POSTGRES_URL` ✅

### Step 3: Connect Frontend (30 sec)

In your **frontend Vercel project**:
1. **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-project.vercel.app/api`
3. **Redeploy** frontend

---

## ✅ Done!

Your backend is live on Vercel! 🎉

**Backend URL**: `https://your-backend-project.vercel.app`
**Frontend connects automatically!**

---

## ⚠️ Important Notes

1. **Cold Starts**: First request may take 1-2 seconds (free tier)
2. **Timeout**: 10 seconds on free tier (60s on Pro)
3. **Database**: Use Vercel Postgres (not SQLite)
4. **File Uploads**: Use Vercel Blob Storage

---

## 🎯 That's It!

**Both frontend and backend on Vercel = Easy!** 🚀

**See `VERCEL_BACKEND_GUIDE.md` for detailed setup!**

