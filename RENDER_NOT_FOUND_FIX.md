# 🔧 Fix "Not Found" Error on Render

## ⚠️ Problem: Getting "Not Found" on Render Backend

If you're seeing "Not Found" when accessing your backend, here's how to fix it:

---

## ✅ Step 1: Check Backend is Running

1. **Go to**: Render Dashboard
2. **Find** your `hezak-backend` service
3. **Check** status:
   - ✅ **Live** = Running
   - ❌ **Failed** = Not running (check logs)
   - 🟡 **Building** = Still deploying

---

## ✅ Step 2: Test Health Endpoint

**Try this URL** (replace with your actual Render URL):

```
https://your-backend-url.onrender.com/health
```

**Should return**:
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

**If this works** → Backend is running, but routes might be wrong

**If this doesn't work** → Backend is not running (check logs)

---

## ✅ Step 3: Check Logs

1. **Render Dashboard** → Your service
2. **Click**: **"Logs"** tab
3. **Look for**:
   - "API server ready at http://localhost:4000" ✅
   - Error messages ❌
   - "Cannot find module" ❌
   - "Port already in use" ❌

---

## ✅ Step 4: Verify Routes

### Test These URLs:

1. **Health**:
   ```
   https://your-backend-url.onrender.com/health
   ```

2. **Products**:
   ```
   https://your-backend-url.onrender.com/api/products
   ```

3. **Categories**:
   ```
   https://your-backend-url.onrender.com/api/categories
   ```

---

## 🔧 Common Fixes

### Fix 1: Wrong Start Command

**In Render** → **Settings** → **Start Command**:

**Should be**:
```
node dist/server.js
```

**NOT**:
```
npm start
```

---

### Fix 2: Build Failed

**Check**:
- Build logs show errors
- TypeScript compilation failed
- Missing dependencies

**Fix**: See previous fixes for TypeScript errors

---

### Fix 3: Port Not Set

**Check** environment variable:
- `PORT=4000`

**Render automatically sets PORT**, but verify it's set.

---

### Fix 4: Routes Not Working

**Your routes are under `/api`**, so:

✅ **Correct**:
```
https://your-backend-url.onrender.com/api/products
```

❌ **Wrong**:
```
https://your-backend-url.onrender.com/products
```

---

## 🚀 Quick Test

**Run this in terminal** (replace with your URL):

```bash
curl https://your-backend-url.onrender.com/health
```

**Should return**:
```json
{"status":"ok","timestamp":"..."}
```

---

## 📝 What URL Are You Using?

**Share**:
1. Your Render backend URL
2. What endpoint you're trying to access
3. The exact error message

**Example**:
- URL: `https://hezak-backend.onrender.com`
- Trying: `/api/products`
- Error: "Not Found"

---

## ✅ Checklist

- [ ] Backend status is "Live" on Render
- [ ] `/health` endpoint works
- [ ] Using `/api/` prefix for routes
- [ ] Start command is `node dist/server.js`
- [ ] No errors in Render logs
- [ ] Environment variables are set

---

**Share your Render URL and I'll help you test it!** 🚀

