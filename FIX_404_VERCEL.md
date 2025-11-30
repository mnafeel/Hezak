# 🔧 Fix 404 NOT_FOUND on Vercel Backend

## ⚠️ Problem: 404 NOT_FOUND Error

You're getting `404: NOT_FOUND` from Vercel. This means:
- ✅ Backend is deployed
- ❌ Routes aren't matching correctly
- ❌ Serverless function handler issue

---

## ✅ Solution: Fix Serverless Function

The issue is with how Vercel routes requests to the Express app.

---

## 🚀 Quick Fix

### Step 1: Verify Build

Make sure the backend builds successfully:
```bash
cd backend
npm install
npm run build
```

**Check**: `dist/app.js` should exist

### Step 2: Check API Handler

The `backend/api/index.js` should export the Express app correctly.

### Step 3: Redeploy

1. **Push** the latest changes (already done)
2. **Go to** Vercel backend project
3. **Redeploy** (or wait for auto-deploy)
4. **Check** deployment logs for errors

---

## 🔍 Debug Steps

### Check Vercel Function Logs

1. **Go to** Vercel project → **Deployments**
2. **Click** latest deployment
3. **View** Function Logs
4. **Look for**:
   - Build errors
   - Runtime errors
   - Route matching issues

### Test Endpoints

Try these URLs in browser:

1. **Health check**:
   ```
   https://your-backend.vercel.app/health
   ```
   Should return: `{"status":"ok"}`

2. **API endpoint**:
   ```
   https://your-backend.vercel.app/api/products
   ```
   Should return products or error (not 404)

---

## 🐛 Common Issues

### Issue 1: Build Failed

**Check**: Vercel deployment logs
**Fix**: Make sure `npm run build` completes successfully

### Issue 2: Handler Not Found

**Check**: `api/index.js` exists in backend folder
**Fix**: The file should be at `backend/api/index.js`

### Issue 3: Routes Not Matching

**Check**: `vercel.json` routes configuration
**Fix**: Routes should point to `/api/index.js`

### Issue 4: Double API Prefix

**Problem**: Express has `/api` prefix, Vercel also adds `/api`
**Fix**: Handler should pass requests correctly

---

## ✅ Updated Configuration

The `backend/vercel.json` and `backend/api/index.js` have been updated to:
- Use `functions` instead of `builds` (newer Vercel format)
- Properly handle Express routing
- Match all routes correctly

---

## 🚀 After Fix

1. **Redeploy** backend on Vercel
2. **Test** `/health` endpoint
3. **Test** `/api/products` endpoint
4. **Set** `VITE_API_URL` in frontend
5. **Redeploy** frontend

---

## 📋 Checklist

- [ ] Backend builds successfully (`npm run build`)
- [ ] `api/index.js` exists in backend folder
- [ ] `vercel.json` is configured correctly
- [ ] Backend redeployed on Vercel
- [ ] `/health` endpoint works
- [ ] `/api/products` endpoint works (or returns proper error, not 404)

---

**Redeploy backend after the fixes!** 🔧

