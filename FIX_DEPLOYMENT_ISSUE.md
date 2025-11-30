# 🔧 Fix Backend Deployment Issues

## ⚠️ Common Problems

### Problem 1: Build Fails - Prisma Not Generated

**Error**: `Cannot find module '@prisma/client'` or similar

**Fix**: Update build command to include Prisma generation

**In Vercel**:
1. **Settings** → **General** → **Build & Development Settings**
2. **Override** build command:
   ```
   npm install && npm run prisma:generate && npm run build
   ```

---

### Problem 2: Environment Variables Missing

**Error**: `Invalid environment configuration`

**Fix**: Make sure ALL 6 variables are set:
- `NODE_ENV=production`
- `PORT=4000`
- `DATABASE_URL=file:./dev.db`
- `ADMIN_EMAIL=admin@hezak.com`
- `ADMIN_PASSWORD_HASH=...`
- `JWT_SECRET=...`

---

### Problem 3: Root Directory Not Set

**Error**: Build can't find files

**Fix**: Set root directory in Vercel:
1. **Settings** → **General**
2. **Root Directory**: `backend`
3. **Save**

---

### Problem 4: TypeScript Build Errors

**Error**: TypeScript compilation fails

**Fix**: Check `tsconfig.json` is correct and all dependencies are installed

---

## ✅ Step-by-Step Fix

### Step 1: Update Build Command

1. **Go to**: Vercel → Backend Project → **Settings** → **General**
2. **Build & Development Settings**:
   - **Override** build command:
     ```
     npm install && npm run prisma:generate && npm run build
     ```
   - **Override** install command:
     ```
     npm install
     ```
   - **Root Directory**: `backend`
3. **Save**

### Step 2: Verify Environment Variables

1. **Settings** → **Environment Variables**
2. **Verify** all 6 variables are set:
   - `NODE_ENV`
   - `PORT`
   - `DATABASE_URL`
   - `ADMIN_EMAIL`
   - `ADMIN_PASSWORD_HASH`
   - `JWT_SECRET`
3. **All** should be set to **"All"** environments

### Step 3: Check Deployment Logs

1. **Deployments** → **Latest**
2. **View** build logs
3. **Look for**:
   - Build errors
   - Missing dependencies
   - Environment variable errors

### Step 4: Redeploy

1. **Make** a new commit (empty commit works)
2. **Push** to GitHub
3. **Vercel** will auto-deploy
4. **Wait** for build to complete

---

## 🚀 Alternative: Use Railway (Easier!)

If Vercel keeps having issues, **Railway is much easier**:

1. **Go to**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select**: `Hezak` repository
4. **Root Directory**: `backend`
5. **Add** environment variables
6. **Deploy** ✅

**Railway advantages:**
- ✅ No build configuration needed
- ✅ Always-on (no cold starts)
- ✅ Better for Express.js
- ✅ Easier setup

---

## 🔍 Check What's Wrong

### View Build Logs

1. **Vercel** → **Deployments** → **Latest**
2. **Click** on deployment
3. **View** build logs
4. **Look for** red errors

### Common Errors:

1. **"Cannot find module"** → Missing dependency or Prisma not generated
2. **"Invalid environment configuration"** → Missing env variables
3. **"Build failed"** → TypeScript errors or build command issue
4. **"Function timeout"** → Serverless function timeout (upgrade or use Railway)

---

## ✅ Quick Checklist

- [ ] Root directory set to `backend`
- [ ] Build command includes `prisma:generate`
- [ ] All 6 environment variables set
- [ ] No TypeScript errors
- [ ] Build logs show success
- [ ] Deployment completes without errors

---

**Follow these steps to fix deployment issues!** 🚀

