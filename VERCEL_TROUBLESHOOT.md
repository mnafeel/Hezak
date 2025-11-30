# 🔧 Vercel Backend Troubleshooting

## ⚠️ Common Issues & Quick Fixes

### Issue 1: Build Fails

**Check**:
1. **Vercel** → **Deployments** → **Latest** → **View Build Logs**
2. **Look for**:
   - "Cannot find module" → Missing dependency
   - "Prisma" errors → Prisma not generated
   - TypeScript errors → Build configuration issue

**Fix**:
- Ensure build command: `npm install && npm run prisma:generate && npm run build`
- Check all dependencies in `package.json`

---

### Issue 2: Environment Variables Missing

**Check**:
1. **Settings** → **Environment Variables**
2. **Verify** all 6 are set:
   - `NODE_ENV=production`
   - `PORT=4000`
   - `DATABASE_URL=file:./dev.db`
   - `ADMIN_EMAIL=admin@hezak.com`
   - `ADMIN_PASSWORD_HASH=...`
   - `JWT_SECRET=...`

**Fix**:
- Add missing variables
- Select "All" for Environment
- Redeploy

---

### Issue 3: Routes Return 404

**Check**:
- Backend URL: `https://your-backend.vercel.app/health`
- Should return: `{"status":"ok",...}`

**Fix**:
- Check `vercel.json` routes configuration
- Verify `api/index.js` exists
- Check function logs in Vercel

---

### Issue 4: Function Timeout

**Problem**: Free tier has 10-second timeout

**Fix**:
- Optimize database queries
- Upgrade to Pro ($20/month) for 60s timeout
- **Or switch to Render** (no timeout, always-on)

---

### Issue 5: Cold Starts

**Problem**: First request takes 10-30 seconds

**Fix**:
- This is normal for Vercel serverless
- **Switch to Render** (no cold starts, always-on)

---

## 🔍 Diagnostic Steps

### Step 1: Check Deployment Status

1. **Go to**: Vercel → Backend Project
2. **Deployments** tab
3. **Check** latest deployment:
   - ✅ Green = Success
   - ❌ Red = Failed (check logs)
   - 🟡 Yellow = Building

### Step 2: View Build Logs

1. **Click** on latest deployment
2. **View** build logs
3. **Look for** errors (red text)

### Step 3: View Function Logs

1. **Deployments** → **Latest** → **Function Logs**
2. **Look for**:
   - Runtime errors
   - Database connection errors
   - Route matching errors

### Step 4: Test Endpoints

**Health Check**:
```
https://your-backend.vercel.app/health
```

**Products API**:
```
https://your-backend.vercel.app/api/products
```

**If both fail** → Backend is not working

---

## ✅ Quick Fix Checklist

- [ ] All 6 environment variables set
- [ ] Root directory set to `backend`
- [ ] Build command includes `prisma:generate`
- [ ] Build completes successfully
- [ ] No errors in build logs
- [ ] `/health` endpoint works
- [ ] Function logs show no errors

---

## 🚀 Better Solution: Switch to Render

**Vercel is complex for Express.js backends. Render is MUCH easier!**

### Why Switch?

| Feature | Vercel | Render |
|---------|--------|--------|
| **Setup** | ⚠️ Complex | ✅ Simple |
| **Cold Starts** | ⚠️ Yes (slow) | ✅ No (always-on) |
| **Timeout** | ⚠️ 10s free | ✅ No timeout |
| **Express.js** | ⚠️ Serverless (complex) | ✅ Perfect fit |
| **Free Tier** | ✅ Yes | ✅ Yes |

### Switch Now (5 minutes):

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **New** → **Web Service**
4. **Connect** `Hezak` repository
5. **Root**: `backend`
6. **Build**: `npm install && npm run prisma:generate && npm run build`
7. **Start**: `node dist/server.js`
8. **Add** environment variables (same 6 as Vercel)
9. **Deploy** ✅

**See**: `RENDER_QUICK_START.md` for full guide

---

## 📝 What Error Are You Seeing?

**Share the specific error** and I can help fix it:

1. **Build error** → Check build logs
2. **404 error** → Check routes configuration
3. **500 error** → Check environment variables
4. **Timeout** → Switch to Render
5. **Cold start** → Switch to Render

---

## 🎯 Recommendation

**If Vercel keeps having issues, switch to Render:**

- ✅ **Easier** setup
- ✅ **No cold starts**
- ✅ **No timeout** issues
- ✅ **Better** for Express.js
- ✅ **Free tier** available

**See**: `RENDER_QUICK_START.md` for step-by-step guide

---

**Vercel is great for frontends, but Render is better for Express.js backends!** 🚀

