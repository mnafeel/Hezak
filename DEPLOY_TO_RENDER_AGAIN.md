# 🚀 Deploy Backend to Render Again

## ✅ Quick Setup Guide

Since you deleted Render before, let's set it up again!

---

## 📋 Step 1: Create New Web Service on Render

1. **Go to**: [Render Dashboard](https://dashboard.render.com/)
2. **Click**: **"New +"** → **"Web Service"**
3. **Connect**: Your GitHub repository
4. **Select**: Repository `Hezak` (or your repo name)

---

## ⚙️ Step 2: Configure Service

### Basic Settings

- **Name**: `hezak-backend` (or any name)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your main branch)
- **Root Directory**: `backend`
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/server.js`

---

## 🔧 Step 3: Environment Variables

In Render Dashboard → Your Service → Environment:

**Add these variables**:

```
NODE_ENV=production
USE_FIRESTORE=true
FIREBASE_SERVICE_ACCOUNT=<your-json>
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
USE_FIREBASE_STORAGE=true
ADMIN_EMAIL=admin@hezak.com
ADMIN_PASSWORD_HASH=$2b$10$6kGkM4ufaWVsCTTvhwjA8ekqkpKuvtjiV6Y6tM8IvPDNqZaFXHKZ.
JWT_SECRET=8bdef047453d82df8714bb640112a15e43e0913eb76f075a307cc31c3f3e7443
PORT=10000
```

**For FIREBASE_SERVICE_ACCOUNT**:
- Get from Firebase Console → Service Accounts → Generate Key
- Copy entire JSON content
- Paste in Render (multi-line is OK)

---

## 📦 Step 4: Deploy

1. **Click**: **"Create Web Service"**
2. **Wait**: First deployment takes 5-10 minutes
3. **Check**: Build logs for errors

---

## ✅ Step 5: Get Your URL

After deployment, Render gives you:
- **URL**: `https://hezak-backend.onrender.com` (or similar)

**Copy this URL!**

---

## 🌐 Step 6: Update Frontend

### Option A: Vercel Frontend

1. **Go to**: Vercel Dashboard → Your Frontend Project
2. **Settings** → **Environment Variables**
3. **Add/Update**:
   ```
   VITE_API_URL=https://hezak-backend.onrender.com/api
   ```
4. **Redeploy** frontend

### Option B: Other Frontend

Update your frontend's API URL to point to Render backend.

---

## 🔍 Verify Deployment

### Test Health Endpoint

```bash
curl https://hezak-backend.onrender.com/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`

### Test Products Endpoint

```bash
curl https://hezak-backend.onrender.com/api/products
```

**Expected**: Array of products (may be empty if no products)

---

## ⚠️ Important Notes

### 1. Free Tier Limitations

- **Spins down after 15 minutes** of inactivity
- **First request** after spin-down takes 30-60 seconds (cold start)
- **Auto-spins up** when request comes in

### 2. Persistent Storage

- **Files uploaded to `/uploads`** will be **lost on restart**
- **Use Firebase Storage** instead (already configured)
- Set `USE_FIREBASE_STORAGE=true`

### 3. Database

- **Use Firestore** (already configured)
- Set `USE_FIRESTORE=true`
- **Don't use SQLite** (not persistent on Render)

---

## 🎯 Quick Summary

1. ✅ Create Web Service on Render
2. ✅ Set Root Directory: `backend`
3. ✅ Add environment variables
4. ✅ Deploy
5. ✅ Get URL: `https://hezak-backend.onrender.com`
6. ✅ Update frontend `VITE_API_URL`
7. ✅ Test!

---

## 🔧 Troubleshooting

### Error: "Build failed"

**Fix**: Check build logs, make sure:
- Root Directory is `backend`
- Build Command: `npm install && npm run build`
- All dependencies in `package.json`

### Error: "Cannot connect to database"

**Fix**: 
- Make sure `USE_FIRESTORE=true`
- Check `FIREBASE_SERVICE_ACCOUNT` is set correctly
- Verify Firebase project is active

### Error: "Environment variable not found"

**Fix**: 
- Add all required environment variables
- Make sure they're set for **Production**
- Redeploy after adding variables

---

## 📋 Environment Variables Checklist

- [ ] `NODE_ENV=production`
- [ ] `USE_FIRESTORE=true`
- [ ] `FIREBASE_SERVICE_ACCOUNT=<json>`
- [ ] `FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com`
- [ ] `USE_FIREBASE_STORAGE=true`
- [ ] `ADMIN_EMAIL=<your-email>`
- [ ] `ADMIN_PASSWORD_HASH=$2b$10$6kGkM4ufaWVsCTTvhwjA8ekqkpKuvtjiV6Y6tM8IvPDNqZaFXHKZ.`
- [ ] `JWT_SECRET=8bdef047453d82df8714bb640112a15e43e0913eb76f075a307cc31c3f3e7443`
- [ ] `PORT=10000` (Render auto-sets, but good to have)

---

## 🚀 After Deployment

1. ✅ Backend URL: `https://hezak-backend.onrender.com`
2. ✅ API endpoint: `https://hezak-backend.onrender.com/api`
3. ✅ Health check: `https://hezak-backend.onrender.com/health`
4. ✅ Update frontend `VITE_API_URL`
5. ✅ Test your site!

---

**Render is free and easy to set up!** 🎉

