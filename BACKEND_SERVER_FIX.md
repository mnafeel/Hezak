# 🔧 Fix Backend Server Problems

## ⚠️ Common Backend Issues on Vercel

### Issue 1: Missing Environment Variables

**Check**: Vercel project → Settings → Environment Variables

**Required Variables**:
```
JWT_SECRET=your-secret-key-here-make-it-long-and-random
NODE_ENV=production
DATABASE_URL=file:./dev.db
```

**Or use Vercel Postgres** (Recommended):
1. **Storage** tab → **Create** → **Postgres**
2. Vercel auto-creates `POSTGRES_URL`
3. Update Prisma to use PostgreSQL

---

### Issue 2: Build Errors

**Check**: Vercel deployment logs

**Common fixes**:
- Make sure `npm install` completes
- Make sure `npm run build` completes
- Check for TypeScript errors
- Verify all dependencies are in `package.json`

---

### Issue 3: Database Not Working

**Problem**: SQLite (`file:./dev.db`) doesn't work well on Vercel serverless

**Solution**: Use Vercel Postgres

1. **Storage** tab → **Create** → **Postgres**
2. **Get** `POSTGRES_URL` from environment variables
3. **Update** Prisma schema to use PostgreSQL
4. **Run** migrations: `npx prisma migrate deploy`

---

### Issue 4: Serverless Function Timeout

**Problem**: Free tier has 10-second timeout

**Solutions**:
- Optimize database queries
- Use connection pooling
- Upgrade to Vercel Pro ($20/month) for 60s timeout
- Or use Railway/Oracle Cloud (no timeout)

---

### Issue 5: Routes Not Working

**Check**: 
- `api/index.js` exists
- `vercel.json` routes are correct
- Build completed successfully

---

## 🚀 Alternative: Use Railway (Easier!)

If Vercel keeps having issues, **Railway is much easier** for backends:

### Deploy to Railway (2 minutes):

1. **Go to**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select**: `Hezak` repository
4. **Root Directory**: `backend`
5. **Environment Variables**:
   ```
   PORT=4000
   JWT_SECRET=your-secret-key
   DATABASE_URL=file:./dev.db
   ```
6. **Deploy** ✅

**Railway advantages**:
- ✅ Always-on (no cold starts)
- ✅ No timeout limits
- ✅ Easier setup
- ✅ Better for Express.js
- ✅ Free tier available

---

## 🔍 Debug Your Vercel Backend

### Step 1: Check Deployment Logs

1. **Go to**: Vercel project
2. **Deployments** → **Latest deployment**
3. **View** build logs and function logs
4. **Look for** errors

### Step 2: Check Function Logs

1. **Deployments** → **Function Logs**
2. **Look for**:
   - Runtime errors
   - Database connection errors
   - Route matching errors

### Step 3: Test Endpoints

Try these in browser:

1. **Health**: `https://your-backend.vercel.app/health`
2. **Products**: `https://your-backend.vercel.app/api/products`

---

## ✅ Quick Fix Checklist

- [ ] Environment variables set in Vercel
- [ ] Build completes successfully
- [ ] No errors in deployment logs
- [ ] `/health` endpoint works
- [ ] Database configured (Postgres recommended)
- [ ] Function logs show no errors

---

## 🎯 Recommendation

**If Vercel keeps having issues, switch to Railway:**

1. **Railway** is better for Express.js backends
2. **No cold starts** - always running
3. **No timeout** issues
4. **Easier** configuration
5. **Free tier** available

**See**: `RAILWAY_QUICK_START.md` for Railway setup

---

## 🚀 Railway Quick Deploy

1. **Go to**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select**: `Hezak`
4. **Root**: `backend`
5. **Deploy** ✅

**Much easier than Vercel for backends!**

---

**Try Railway if Vercel keeps having problems!** 🚀

