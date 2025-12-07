# 🔧 Fix "Cannot connect to server" Error

## ⚠️ Problem

Frontend shows: "Cannot connect to server. Please ensure the backend server is running."

This means the frontend can't reach the backend.

---

## ✅ Step 1: Verify Backend is Running

**Test backend directly**:
```
https://hezak-backend.onrender.com/health
```

**Should return**: `{"status":"ok","timestamp":"..."}`

**If this doesn't work** → Backend is down (check Render dashboard)

**If this works** → Backend is fine, issue is frontend configuration

---

## ✅ Step 2: Check Frontend API URL

The frontend needs to know where the backend is.

### Check Current Configuration:

**In browser console** (F12):
```javascript
console.log(import.meta.env.VITE_API_URL)
```

**Should show**: `https://hezak-backend.onrender.com/api`

**If it shows**:
- `undefined` → Environment variable not set
- `/api` → Using local proxy (won't work in production)
- Wrong URL → Needs to be updated

---

## 🔧 Step 3: Set Frontend API URL

### If Frontend is on Vercel:

1. **Go to**: Vercel → Frontend Project
2. **Settings** → **Environment Variables**
3. **Add/Edit**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://hezak-backend.onrender.com/api`
   - **Environment**: **All** (Production, Preview, Development)
4. **Save**
5. **Redeploy** frontend

### If Frontend is on GitHub Pages:

1. **GitHub** → Repository → **Settings** → **Secrets and variables** → **Actions**
2. **Add**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://hezak-backend.onrender.com/api`
3. **Update** `.github/workflows/deploy.yml` to use this secret
4. **Redeploy**

### If Frontend is Local:

1. **Create/Edit** `frontend/.env`:
   ```
   VITE_API_URL=https://hezak-backend.onrender.com/api
   ```
2. **Restart** dev server

---

## 🔍 Step 4: Check Browser Console

1. **Open** your frontend
2. **Press** F12 (Developer Tools)
3. **Console** tab
4. **Look for**:
   - Network errors
   - CORS errors
   - "Failed to fetch"
   - Actual API URL being called

---

## 🚨 Common Issues

### Issue 1: Environment Variable Not Set

**Problem**: `VITE_API_URL` is not set in frontend

**Fix**: Set it in Vercel/GitHub Pages (see Step 3)

---

### Issue 2: Backend is Sleeping (Free Tier)

**Problem**: Render free tier sleeps after 15 min inactivity

**Symptoms**:
- First request takes 30+ seconds
- "Network Error" or timeout

**Fix**:
- Wait 30 seconds for first request
- Or upgrade to paid plan (always-on)

---

### Issue 3: CORS Error

**Problem**: Browser blocks request due to CORS

**Check**: Browser console for:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix**: Backend CORS is already configured, but verify it's set to `*` in production

---

### Issue 4: Wrong URL Format

**Correct**:
```
https://hezak-backend.onrender.com/api
```

**Wrong**:
```
https://hezak-backend.onrender.com/api/
```
(No trailing slash)

---

## ✅ Quick Test

**Test backend from browser**:
1. **Open**: `https://hezak-backend.onrender.com/health`
2. **Should see**: `{"status":"ok",...}`

**Test API from browser**:
1. **Open**: `https://hezak-backend.onrender.com/api/products`
2. **Should see**: `[]` (empty array)

**If both work** → Backend is fine, fix frontend configuration

---

## 📝 Checklist

- [ ] Backend is accessible (`/health` works)
- [ ] `VITE_API_URL` is set in frontend
- [ ] `VITE_API_URL` = `https://hezak-backend.onrender.com/api`
- [ ] Frontend redeployed after setting env var
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console

---

## 🚀 Quick Fix

**Most likely issue**: `VITE_API_URL` is not set in frontend.

**Fix**:
1. **Vercel** → Frontend → **Settings** → **Environment Variables**
2. **Add**: `VITE_API_URL` = `https://hezak-backend.onrender.com/api`
3. **Redeploy** frontend

**That's it!** ✅

---

**Set the environment variable and redeploy your frontend!** 🚀

