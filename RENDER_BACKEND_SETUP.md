# 🚀 Complete Render Backend Setup Guide

## 📋 Step-by-Step Instructions

---

## ✅ Step 1: Go to Render Dashboard

1. **Visit**: [Render Dashboard](https://dashboard.render.com/)
2. **Sign in** with your GitHub account (or create account)

---

## ✅ Step 2: Create New Web Service

1. **Click**: **"New +"** button (top right)
2. **Select**: **"Web Service"**
3. **Connect**: Your GitHub account (if not connected)
4. **Select Repository**: `Hezak` (or your repo name)
5. **Click**: **"Connect"**

---

## ✅ Step 3: Configure Service Settings

### Basic Settings

Fill in these fields:

- **Name**: `hezak-backend` (or any name you prefer)
- **Region**: Choose closest to you (e.g., `Oregon (US West)`)
- **Branch**: `main` (or your main branch name)
- **Root Directory**: `backend` ⚠️ **IMPORTANT!**
- **Runtime**: `Node`
- **Build Command**: `npm install && npm run build`
- **Start Command**: `node dist/server.js`

---

## ✅ Step 4: Add Environment Variables

Scroll down to **"Environment Variables"** section and click **"Add Environment Variable"** for each:

### Required Variables:

1. **NODE_ENV**
   - Key: `NODE_ENV`
   - Value: `production`

2. **USE_FIRESTORE**
   - Key: `USE_FIRESTORE`
   - Value: `true`

3. **FIREBASE_SERVICE_ACCOUNT** ⚠️ (Most Important)
   - Key: `FIREBASE_SERVICE_ACCOUNT`
   - Value: (Get from Firebase Console - see below)

4. **FIREBASE_STORAGE_BUCKET**
   - Key: `FIREBASE_STORAGE_BUCKET`
   - Value: `hezak-f6fb3.appspot.com`

5. **USE_FIREBASE_STORAGE**
   - Key: `USE_FIREBASE_STORAGE`
   - Value: `true`

6. **ADMIN_EMAIL**
   - Key: `ADMIN_EMAIL`
   - Value: `admin@hezak.com` (or your email)

7. **ADMIN_PASSWORD_HASH**
   - Key: `ADMIN_PASSWORD_HASH`
   - Value: `$2b$10$6kGkM4ufaWVsCTTvhwjA8ekqkpKuvtjiV6Y6tM8IvPDNqZaFXHKZ.`

8. **JWT_SECRET**
   - Key: `JWT_SECRET`
   - Value: `8bdef047453d82df8714bb640112a15e43e0913eb76f075a307cc31c3f3e7443`

9. **PORT** (Optional - Render auto-sets)
   - Key: `PORT`
   - Value: `10000`

---

## 🔑 How to Get FIREBASE_SERVICE_ACCOUNT

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: Project `hezak-f6fb3`
3. **Click**: ⚙️ Settings (gear icon) → **Project Settings**
4. **Go to**: **Service Accounts** tab
5. **Click**: **Generate New Private Key**
6. **Click**: **Generate Key** (confirms download)
7. **Download**: JSON file opens
8. **Copy**: **ENTIRE JSON content** (everything, including `{` and `}`)
9. **Paste**: Into Render's `FIREBASE_SERVICE_ACCOUNT` variable

**Example JSON** (your actual one will be different):
```json
{
  "type": "service_account",
  "project_id": "hezak-f6fb3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**⚠️ Important**: Paste the **entire JSON** as one value in Render.

---

## ✅ Step 5: Deploy

1. **Scroll down** to bottom of page
2. **Click**: **"Create Web Service"**
3. **Wait**: First deployment takes 5-10 minutes
4. **Watch**: Build logs for any errors

---

## ✅ Step 6: Get Your Backend URL

After deployment completes:

- **Your URL**: `https://hezak-backend.onrender.com` (or similar)
- **API Endpoint**: `https://hezak-backend.onrender.com/api`
- **Health Check**: `https://hezak-backend.onrender.com/health`

**Copy this URL!** You'll need it for the frontend.

---

## ✅ Step 7: Update Frontend

### If Frontend is on Vercel:

1. **Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select**: Your Frontend Project
3. **Settings** → **Environment Variables**
4. **Add/Update**:
   ```
   VITE_API_URL=https://hezak-backend.onrender.com/api
   ```
   *(Use your actual Render URL)*
5. **Redeploy** frontend

---

## ✅ Step 8: Verify Deployment

### Test Health Endpoint

Open in browser or use curl:
```
https://hezak-backend.onrender.com/health
```

**Expected Response**:
```json
{"status":"ok","timestamp":"2024-12-14T..."}
```

### Test Products Endpoint

```
https://hezak-backend.onrender.com/api/products
```

**Expected Response**: Array of products (may be empty `[]` if no products yet)

---

## ⚠️ Important Notes

### 1. Free Tier Limitations

- **Spins down** after 15 minutes of inactivity
- **First request** after spin-down takes 30-60 seconds (cold start)
- **Auto-spins up** when request comes in

### 2. Persistent Storage

- **Files in `/uploads`** will be **lost on restart**
- **Use Firebase Storage** instead (already configured)
- Set `USE_FIREBASE_STORAGE=true`

### 3. Database

- **Use Firestore** (already configured)
- Set `USE_FIRESTORE=true`
- **Don't use SQLite** (not persistent on Render)

### 4. Environment Variables

- **Add all variables** before first deployment
- **Can add/update later** and redeploy
- **Sensitive data** (like service account) is encrypted

---

## 🔧 Troubleshooting

### Error: "Build failed"

**Check**:
- Root Directory is `backend` (not root)
- Build Command: `npm install && npm run build`
- All dependencies in `package.json`

**Fix**: Check build logs in Render dashboard for specific errors.

---

### Error: "Cannot connect to database"

**Check**:
- `USE_FIRESTORE=true` is set
- `FIREBASE_SERVICE_ACCOUNT` is correct (entire JSON)
- Firebase project is active

**Fix**: Verify Firebase service account JSON is complete and correct.

---

### Error: "Environment variable not found"

**Check**:
- All required variables are added
- Variable names are correct (case-sensitive)
- Variables are saved

**Fix**: Add missing variables and redeploy.

---

### Error: "Function timeout" or "Request timeout"

**This is normal** for free tier:
- First request after spin-down is slow (30-60 seconds)
- Subsequent requests are fast
- Consider upgrading to paid plan for always-on

---

## 📋 Complete Environment Variables Checklist

Copy this list and check off as you add:

- [ ] `NODE_ENV=production`
- [ ] `USE_FIRESTORE=true`
- [ ] `FIREBASE_SERVICE_ACCOUNT=<your-json>`
- [ ] `FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com`
- [ ] `USE_FIREBASE_STORAGE=true`
- [ ] `ADMIN_EMAIL=admin@hezak.com`
- [ ] `ADMIN_PASSWORD_HASH=$2b$10$6kGkM4ufaWVsCTTvhwjA8ekqkpKuvtjiV6Y6tM8IvPDNqZaFXHKZ.`
- [ ] `JWT_SECRET=8bdef047453d82df8714bb640112a15e43e0913eb76f075a307cc31c3f3e7443`
- [ ] `PORT=10000` (optional)

---

## 🎯 Quick Summary

1. ✅ Create Web Service on Render
2. ✅ Set Root Directory: `backend`
3. ✅ Add all environment variables
4. ✅ Deploy
5. ✅ Get URL: `https://hezak-backend.onrender.com`
6. ✅ Update frontend `VITE_API_URL`
7. ✅ Test!

---

## 🚀 After Successful Deployment

You should have:
- ✅ Backend running on Render
- ✅ URL: `https://hezak-backend.onrender.com`
- ✅ API working: `/api/products`, `/api/categories`, etc.
- ✅ Frontend connected to backend
- ✅ Everything working! 🎉

---

**Follow these steps and your backend will be live on Render!** 🔥

