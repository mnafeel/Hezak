# 🔧 Fix 405 Error - Backend Not Connected

## ⚠️ The Problem

You're getting `405 Method Not Allowed` because:
- ✅ Frontend is deployed (Vercel/Netlify/GitHub Pages)
- ❌ Backend API is NOT deployed
- The frontend is trying to call `/api/admin/login` but there's no backend server

## ✅ Quick Fix (5 Minutes)

### Step 1: Host Your Backend (Railway - Easiest)

1. **Go to**: https://railway.app
2. **Sign in** with GitHub
3. **New Project** → **Deploy from GitHub repo**
4. **Select**: `Hezak` repository
5. **Settings**:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
6. **Environment Variables**:
   ```
   PORT=4000
   JWT_SECRET=your-secret-key-here
   DATABASE_URL=file:./dev.db
   ```
7. **Deploy** ✅

**You'll get a URL like**: `https://hezak-production.up.railway.app`

---

### Step 2: Connect Frontend to Backend

#### If using Vercel:
1. Go to Vercel project → **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
3. **Redeploy**

#### If using Netlify:
1. Go to Netlify project → **Site settings** → **Environment variables**
2. Add:
   - **Key**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
3. **Trigger new deploy**

#### If using GitHub Pages:
1. Repository → **Settings** → **Secrets and variables** → **Actions**
2. **New repository secret**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.railway.app/api`
3. Push a commit to trigger rebuild

---

## 🎯 That's It!

After these steps:
1. ✅ Backend is hosted and running
2. ✅ Frontend knows where to find the backend
3. ✅ Admin login will work!

---

## 📋 Alternative Backend Hosting

**Render.com** (Free tier):
- https://render.com
- Similar setup to Railway

**Fly.io** (Free tier):
- https://fly.io
- More technical setup

**Heroku** (Paid):
- https://heroku.com
- Classic option

---

**See `BACKEND_HOSTING_GUIDE.md` for detailed instructions!** 🚀

