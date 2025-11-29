# ⚠️ Backend Not Connected - Quick Fix

## 🔴 Error: "Cannot connect to server"

This means your **backend is not deployed** or the **frontend doesn't know where it is**.

---

## ✅ Solution: Deploy Backend + Set API URL

### Step 1: Deploy Backend (Choose One)

#### Option A: Vercel (2 minutes - Easiest!)

1. **Go to**: https://vercel.com
2. **New Project** → Import `Hezak`
3. **Root Directory**: `backend`
4. **Framework**: Other
5. **Build Command**: `npm install && npm run build`
6. **Output Directory**: `dist`
7. **Install Command**: `npm install`
8. **Deploy** ✅

**You'll get**: `https://your-backend.vercel.app`

#### Option B: Railway (2 minutes)

1. **Go to**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Select**: `Hezak` repository
4. **Root Directory**: `backend`
5. **Deploy** ✅

**You'll get**: `https://your-backend.railway.app`

#### Option C: Oracle Cloud (15 minutes - Free Forever)

See `ORACLE_CLOUD_QUICK.md` for instructions.

---

### Step 2: Set API URL in Frontend

After backend is deployed, you'll get a URL like:
- `https://your-backend.vercel.app` (Vercel)
- `https://your-backend.railway.app` (Railway)

#### For Vercel Frontend:

1. **Go to**: Your Vercel frontend project
2. **Settings** → **Environment Variables**
3. **Add**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
   - **Environment**: Select all (Production, Preview, Development)
4. **Save**
5. **Redeploy** frontend

#### For Netlify Frontend:

1. **Go to**: Your Netlify project
2. **Site settings** → **Environment variables**
3. **Add**:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
4. **Save**
5. **Trigger new deploy**

#### For GitHub Pages:

1. **Repository** → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
3. **Push a commit** to trigger rebuild

---

## 🔍 Verify Backend is Working

### Test Backend URL:

Open in browser:
```
https://your-backend-url.vercel.app/health
```

**Should return**: `{"status":"ok","timestamp":"..."}`

If you get an error, backend is not deployed correctly.

---

## 📋 Quick Checklist

- [ ] Backend is deployed (Vercel/Railway/Oracle Cloud)
- [ ] Backend URL is accessible (test `/health` endpoint)
- [ ] `VITE_API_URL` is set in frontend environment variables
- [ ] Frontend is redeployed after setting `VITE_API_URL`
- [ ] Check browser console for actual API URL being used

---

## 🎯 Recommended: Use Vercel for Both

**Easiest setup:**

1. **Deploy Backend to Vercel** (2 min)
   - Root: `backend`
   - Get URL: `https://backend-project.vercel.app`

2. **Deploy Frontend to Vercel** (2 min)
   - Root: `frontend`
   - Set env: `VITE_API_URL=https://backend-project.vercel.app/api`

3. **Done!** ✅

**Both on same platform = Easy management!**

---

## 🐛 Still Not Working?

### Check Browser Console:

1. **Open** browser console (F12)
2. **Look for**:
   - What API URL is being used
   - Network errors
   - CORS errors

### Common Issues:

1. **Backend not deployed** → Deploy backend first
2. **Wrong API URL** → Check `VITE_API_URL` is correct
3. **Frontend not redeployed** → Redeploy after setting env var
4. **CORS error** → Backend needs to allow frontend domain

---

## 🚀 Fastest Fix (5 Minutes)

1. **Deploy backend to Vercel**: https://vercel.com
2. **Copy backend URL**: `https://your-backend.vercel.app`
3. **Set in frontend**: `VITE_API_URL=https://your-backend.vercel.app/api`
4. **Redeploy frontend**
5. **Done!** ✅

---

**Deploy backend first, then set `VITE_API_URL` in frontend!** 🚀

