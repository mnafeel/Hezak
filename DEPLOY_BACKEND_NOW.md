# 🚨 URGENT: Deploy Backend Now!

## ⚠️ Current Error: "Cannot connect to server"

Your **backend is NOT deployed yet**. The frontend is trying to connect but there's no backend server.

---

## ✅ Quick Fix (5 Minutes)

### Step 1: Deploy Backend to Vercel (2 minutes)

1. **Go to**: https://vercel.com
2. **Sign in** with GitHub
3. **Add New Project**
4. **Import** `Hezak` repository
5. **Click** "Configure Project"
6. **Set**:
   - **Root Directory**: `backend` ⚠️ IMPORTANT!
   - **Framework Preset**: `Other`
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`
7. **Add Environment Variables**:
   ```
   JWT_SECRET=your-secret-key-here-make-it-long
   NODE_ENV=production
   ```
8. **Click** "Deploy" ✅

**You'll get a URL like**: `https://hezak-backend.vercel.app`

---

### Step 2: Test Backend (30 seconds)

Open in browser:
```
https://your-backend.vercel.app/health
```

**Should return**: `{"status":"ok","timestamp":"..."}`

If it works → Backend is live! ✅
If it doesn't → Check Vercel deployment logs

---

### Step 3: Connect Frontend (2 minutes)

1. **Go to** your **frontend Vercel project**
2. **Settings** → **Environment Variables**
3. **Add**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend.vercel.app/api`
   - **Environment**: Select **ALL** (Production, Preview, Development)
4. **Save**
5. **Redeploy** frontend (or wait for auto-deploy)

---

### Step 4: Verify (30 seconds)

1. **Open** your deployed frontend
2. **Open** browser console (F12)
3. **Check** Network tab
4. **Look for** API calls going to: `https://your-backend.vercel.app/api`
5. **Test** login or browse products

---

## 📋 Complete Checklist

- [ ] Backend deployed to Vercel
- [ ] Backend URL accessible (test `/health`)
- [ ] `VITE_API_URL` set in frontend environment variables
- [ ] Frontend redeployed
- [ ] Test in browser - errors should be gone!

---

## 🎯 Two Vercel Projects Needed

1. **Backend Project**:
   - Root: `backend`
   - URL: `https://backend-project.vercel.app`

2. **Frontend Project**:
   - Root: `frontend`
   - Env: `VITE_API_URL=https://backend-project.vercel.app/api`
   - URL: `https://frontend-project.vercel.app`

---

## 🚀 Deploy Backend Right Now!

**Go to**: https://vercel.com → New Project → Import `Hezak` → Set root to `backend` → Deploy!

**Then set `VITE_API_URL` in frontend and redeploy!**

---

**Your backend MUST be deployed for the frontend to work!** 🚨

