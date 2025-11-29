# 🔧 Fix API Errors - Backend Connection Issues

## ⚠️ Problem: API Errors

You're seeing `API Error` messages because the frontend can't connect to the backend.

## 🔍 Common Causes

1. **Backend not deployed** - Backend is not hosted yet
2. **Wrong API URL** - Frontend doesn't know where backend is
3. **CORS issues** - Backend not allowing frontend domain
4. **Backend down** - Backend server is not running

---

## ✅ Quick Fixes

### Fix 1: Check Backend is Deployed

**Is your backend deployed?**
- ✅ If yes → Go to Fix 2
- ❌ If no → Deploy backend first (see below)

### Fix 2: Set API URL in Frontend

#### For Vercel Frontend:

1. **Go to**: Your Vercel frontend project
2. **Settings** → **Environment Variables**
3. **Add**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
   - **Environment**: Production, Preview, Development (all)
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

## 🚀 Deploy Backend First (If Not Done)

### Option 1: Deploy to Vercel (Easiest)

1. **Go to**: https://vercel.com
2. **New Project** → Import `Hezak`
3. **Root Directory**: `backend`
4. **Framework**: Other
5. **Build Command**: `npm install && npm run build`
6. **Output Directory**: `dist`
7. **Install Command**: `npm install`
8. **Deploy** ✅

**You'll get**: `https://your-backend.vercel.app`

### Option 2: Deploy to Railway

1. **Go to**: https://railway.app
2. **New Project** → Deploy from GitHub
3. **Select**: `Hezak` repository
4. **Root Directory**: `backend`
5. **Deploy** ✅

**You'll get**: `https://your-backend.railway.app`

---

## 🔍 Debug API Errors

### Check Browser Console

Open browser console (F12) and look for:

1. **Network tab**:
   - See what URL is being called
   - Check if it's the correct backend URL
   - See error status code (404, 405, 500, etc.)

2. **Console tab**:
   - Look for detailed error messages
   - Check the actual API URL being used

### Check API URL

The frontend uses:
```javascript
const API_BASE_URL = import.meta.env.VITE_API_URL || '/api';
```

**If `VITE_API_URL` is not set:**
- Development: Uses `/api` (Vite proxy to localhost:4000)
- Production: Uses `/api` (tries to call same domain - won't work!)

**Solution**: Set `VITE_API_URL` to your backend URL!

---

## 📋 Step-by-Step Fix

### Step 1: Get Backend URL

**If backend is on Vercel:**
- Backend URL: `https://your-backend-project.vercel.app`
- API URL: `https://your-backend-project.vercel.app/api`

**If backend is on Railway:**
- Backend URL: `https://your-backend.railway.app`
- API URL: `https://your-backend.railway.app/api`

**If backend is on Oracle Cloud:**
- Backend URL: `http://your-ip:4000`
- API URL: `http://your-ip:4000/api`

### Step 2: Set Environment Variable

In your **frontend hosting** (Vercel/Netlify/GitHub):

**Name**: `VITE_API_URL`
**Value**: `https://your-backend-url.com/api`

### Step 3: Redeploy Frontend

After setting the environment variable, **redeploy** your frontend.

### Step 4: Test

1. **Open** your deployed frontend
2. **Open** browser console (F12)
3. **Check** Network tab
4. **Try** to login or load products
5. **Verify** API calls go to correct backend URL

---

## 🐛 Common Error Codes

| Code | Meaning | Fix |
|------|---------|-----|
| **404** | Backend not found | Check backend URL is correct |
| **405** | Method not allowed | Backend not deployed or wrong URL |
| **500** | Backend error | Check backend logs |
| **CORS** | Cross-origin blocked | Backend needs to allow frontend domain |
| **Network** | Can't connect | Backend not running or wrong URL |

---

## ✅ Quick Checklist

- [ ] Backend is deployed and running
- [ ] Backend URL is accessible (test in browser)
- [ ] `VITE_API_URL` is set in frontend environment variables
- [ ] Frontend is redeployed after setting `VITE_API_URL`
- [ ] Backend CORS allows frontend domain

---

## 🎯 Most Likely Issue

**Missing `VITE_API_URL` environment variable!**

**Fix:**
1. Get your backend URL
2. Add `VITE_API_URL=https://your-backend-url.com/api` to frontend hosting
3. Redeploy frontend

---

**See detailed guides:**
- `VERCEL_BACKEND_QUICK.md` - Deploy backend to Vercel
- `RAILWAY_QUICK_START.md` - Deploy backend to Railway
- `ORACLE_CLOUD_QUICK.md` - Deploy backend to Oracle Cloud

---

**Set `VITE_API_URL` and redeploy frontend to fix API errors!** 🔧

