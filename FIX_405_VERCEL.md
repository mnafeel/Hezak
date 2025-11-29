# 🔧 Fix 405 Error on Vercel Backend

## ⚠️ Problem: 405 Method Not Allowed

You're getting 405 errors because Vercel serverless functions need special handling for Express routes.

## ✅ Solution: Fixed Serverless Handler

The `backend/api/index.js` has been updated to properly handle Express routes in Vercel.

---

## 🚀 Steps to Fix

### Step 1: Verify Backend is Deployed

1. **Check** your Vercel backend project
2. **Verify** it deployed successfully
3. **Test** the health endpoint:
   ```
   https://your-backend.vercel.app/health
   ```
   Should return: `{"status":"ok"}`

### Step 2: Test API Endpoint

Test the admin login endpoint:
```
https://your-backend.vercel.app/api/admin/login
```

**If you get 405:**
- Backend routes aren't working correctly
- Need to redeploy with fixed handler

**If you get 404:**
- Route path might be wrong
- Check Vercel routes configuration

### Step 3: Redeploy Backend

1. **Go to** your Vercel backend project
2. **Redeploy** (or push a new commit)
3. **Wait** for deployment to complete
4. **Test** again

---

## 🔍 Debug Steps

### Check Vercel Function Logs

1. **Go to** Vercel project → **Deployments**
2. **Click** on latest deployment
3. **View** Function Logs
4. **Look for** errors or route matching issues

### Check Route Configuration

The `backend/vercel.json` should have:
```json
{
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/index.js"
    }
  ]
}
```

### Verify Handler

The `backend/api/index.js` should export:
```javascript
module.exports = (req, res) => {
  return app(req, res);
};
```

---

## 🐛 Common Issues

### Issue 1: Routes Not Matching

**Fix**: Make sure `vercel.json` routes include `/api/(.*)`

### Issue 2: Handler Not Working

**Fix**: The handler should pass `(req, res)` directly to Express app

### Issue 3: Build Not Including Routes

**Fix**: Make sure `npm run build` completes successfully

---

## ✅ Quick Fix Checklist

- [ ] Backend is deployed on Vercel
- [ ] `backend/api/index.js` handler is correct
- [ ] `backend/vercel.json` routes are configured
- [ ] Backend redeployed after fixes
- [ ] Test `/health` endpoint works
- [ ] Test `/api/admin/login` endpoint

---

## 🚀 After Fix

1. **Redeploy** backend to Vercel
2. **Test** health endpoint: `https://your-backend.vercel.app/health`
3. **Set** `VITE_API_URL` in frontend: `https://your-backend.vercel.app/api`
4. **Redeploy** frontend
5. **Test** admin login

---

**The serverless handler has been fixed! Redeploy backend to apply changes.** 🔧

