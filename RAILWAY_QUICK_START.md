# ⚡ Railway Quick Start (2 Minutes!)

## 🚀 Deploy Your Backend to Railway

### Step 1: Sign Up (30 seconds)
1. Go to: **https://railway.app**
2. Click **"Start a New Project"**
3. **Sign in with GitHub** (one click!)

### Step 2: Deploy (1 minute)
1. Click **"Deploy from GitHub repo"**
2. Find and select **"Hezak"** repository
3. Railway will auto-detect Node.js ✅

### Step 3: Configure (30 seconds)
1. Click on your new service
2. Go to **Settings** tab
3. Set:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`

### Step 4: Add Environment Variables (30 seconds)
In **Variables** tab, add:
```
PORT=4000
JWT_SECRET=your-super-secret-key-change-this-to-random-string
DATABASE_URL=file:./dev.db
```

**Or use PostgreSQL (Recommended):**
1. Click **"New"** → **"Database"** → **"PostgreSQL"**
2. Railway auto-creates `DATABASE_URL` ✅
3. Update Prisma: `npx prisma migrate deploy`

### Step 5: Get Your URL
Railway gives you a URL like:
`https://hezak-production.up.railway.app`

### Step 6: Connect Frontend
In **Vercel/Netlify**:
1. Go to **Environment Variables**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-railway-url.railway.app/api`
3. **Redeploy** frontend

---

## ✅ Done!

Your backend is now live! 🎉

**Total time: ~2 minutes**

---

## 🔄 Auto-Deploy

Every push to GitHub automatically deploys your backend!

---

## 💡 Pro Tips

1. **Use PostgreSQL** instead of SQLite for production
2. **Set strong JWT_SECRET** (random 32+ characters)
3. **Enable monitoring** in Railway dashboard
4. **Check logs** if something breaks

---

**Railway is the easiest and best option!** 🚀

