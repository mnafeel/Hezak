# 🔧 Backend API Hosting Guide

## ⚠️ Problem: 405 Error

Your frontend is deployed, but the backend API is not accessible. The 405 error means the API endpoint doesn't exist or isn't reachable.

## ✅ Solution: Host Your Backend

You need to host your backend separately and configure the frontend to use it.

## 🚀 Fastest Options to Host Backend:

### Option 1: Railway (Recommended - 2 minutes!)

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select** your `Hezak` repository
5. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Add Environment Variables**:
   - `PORT=4000` (or Railway will auto-assign)
   - `JWT_SECRET=your-secret-key`
   - `DATABASE_URL=file:./dev.db` (or use Railway's PostgreSQL)
7. **Deploy** ✅

**Your backend will be at**: `https://your-app.railway.app`

---

### Option 2: Render (Free tier available)

1. **Go to**: https://render.com
2. **Sign in** with GitHub
3. **New** → **Web Service**
4. **Connect** your `Hezak` repository
5. **Configure**:
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
6. **Add Environment Variables** (same as Railway)
7. **Deploy** ✅

**Your backend will be at**: `https://your-app.onrender.com`

---

### Option 3: Fly.io (Free tier)

1. **Install Fly CLI**: `curl -L https://fly.io/install.sh | sh`
2. **Login**: `fly auth login`
3. **In backend folder**: `fly launch`
4. **Follow prompts** ✅

---

## 🔗 Connect Frontend to Backend

### For Vercel:

1. Go to your Vercel project
2. **Settings** → **Environment Variables**
3. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api` (or your backend URL)
4. **Redeploy** your frontend

### For Netlify:

1. Go to your Netlify project
2. **Site settings** → **Environment variables**
3. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
4. **Trigger new deploy**

### For GitHub Pages:

Add to your GitHub repository:
1. **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`

---

## 📝 Quick Setup Checklist

- [ ] Host backend on Railway/Render/Fly.io
- [ ] Get backend URL (e.g., `https://hezak-backend.railway.app`)
- [ ] Add `VITE_API_URL` environment variable to frontend hosting
- [ ] Set value to: `https://your-backend-url.railway.app/api`
- [ ] Redeploy frontend
- [ ] Test admin login

---

## 🎯 Recommended: Railway

**Why Railway?**
- ✅ Free tier available
- ✅ Auto-deploys from GitHub
- ✅ Easy environment variables
- ✅ PostgreSQL database included
- ✅ Fast setup (2 minutes)

**Steps:**
1. https://railway.app → Sign in with GitHub
2. New Project → Deploy from GitHub
3. Select `Hezak` repo
4. Set root directory to `backend`
5. Add environment variables
6. Deploy!

---

**After hosting backend, your 405 error will be fixed!** 🚀

