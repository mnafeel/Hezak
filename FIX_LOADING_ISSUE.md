# 🔧 Fix "Loading Only" Issue

## ⚠️ Problem: Frontend Shows "Loading" Forever

This usually means the frontend can't connect to the backend.

---

## ✅ Step 1: Check Backend Status on Render

1. **Go to**: Render Dashboard
2. **Find** your `hezak-backend` service
3. **Check** status:
   - ✅ **Live** = Running (good!)
   - ❌ **Failed** = Not running (check logs)
   - 🟡 **Building** = Still deploying (wait)
   - 💤 **Sleeping** = Free tier went to sleep (first request takes 30s)

---

## ✅ Step 2: Test Backend Directly

**Open in browser** (replace with your Render URL):

```
https://your-backend-url.onrender.com/health
```

**What happens?**
- ✅ **Returns JSON** → Backend is working!
- ❌ **"Not Found"** → Backend is running but routes wrong
- ⏳ **Takes 30+ seconds** → Backend was sleeping (free tier)
- ❌ **Error/Timeout** → Backend is not running

---

## ✅ Step 3: Check Frontend API URL

**In your frontend** (Vercel/GitHub Pages):

1. **Check** environment variable:
   - `VITE_API_URL=https://your-backend-url.onrender.com/api`
   
2. **Verify** it's set correctly (no trailing slash issues)

3. **Test** in browser console (F12):
   ```javascript
   console.log(import.meta.env.VITE_API_URL)
   ```
   Should show your backend URL

---

## ✅ Step 4: Check Browser Console

1. **Open** your frontend
2. **Press** F12 (Developer Tools)
3. **Go to** Console tab
4. **Look for** errors:
   - "Network Error"
   - "Failed to fetch"
   - "CORS error"
   - "404 Not Found"

---

## 🔧 Common Fixes

### Fix 1: Backend is Sleeping (Free Tier)

**Problem**: Render free tier sleeps after 15 min inactivity

**Solution**:
- First request takes 30 seconds (waking up)
- Wait for it to respond
- Or upgrade to paid plan (always-on)

---

### Fix 2: Wrong API URL

**Check**:
- Frontend `VITE_API_URL` matches your Render URL
- Includes `/api` at the end
- No typos in URL

**Example**:
```
✅ Correct: https://hezak-backend.onrender.com/api
❌ Wrong: https://hezak-backend.onrender.com
❌ Wrong: https://hezak-backend.onrender.com/api/
```

---

### Fix 3: CORS Error

**Check** browser console for:
```
Access to fetch at '...' from origin '...' has been blocked by CORS policy
```

**Fix**: Backend CORS is already configured, but verify it's set to `*` in production

---

### Fix 4: Backend Not Running

**Check** Render logs:
1. **Render Dashboard** → Your service → **Logs**
2. **Look for**:
   - "API server ready" ✅
   - Error messages ❌
   - "Cannot find module" ❌

---

### Fix 5: Network Timeout

**Problem**: Backend takes too long to respond

**Solution**:
- Check Render service status
- Verify backend is "Live"
- Check if it's sleeping (free tier)

---

## 🚀 Quick Test

**Test backend directly**:

```bash
curl https://your-backend-url.onrender.com/health
```

**Should return**:
```json
{"status":"ok","timestamp":"..."}
```

**If this works** → Backend is fine, issue is frontend connection

**If this doesn't work** → Backend is the problem

---

## 📝 What to Share

1. **Render backend URL**
2. **Frontend URL** (where you see "loading")
3. **Browser console errors** (F12 → Console)
4. **Render service status** (Live/Failed/Sleeping)
5. **What happens** when you visit `/health` directly

---

## ✅ Checklist

- [ ] Backend status is "Live" on Render
- [ ] `/health` endpoint works in browser
- [ ] `VITE_API_URL` is set correctly in frontend
- [ ] No CORS errors in browser console
- [ ] No network errors in browser console
- [ ] Backend is not sleeping (or wait 30s for first request)

---

**Share your Render URL and I'll help you test it!** 🚀

