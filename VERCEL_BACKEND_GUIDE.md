# 🚀 Deploy Backend to Vercel

## ✅ Yes! Backend Works on Vercel!

Vercel can host your Express.js backend using **serverless functions**. Here's how:

---

## 🎯 Two Options:

### Option 1: Separate Vercel Project (Recommended)

Deploy backend as a **separate Vercel project** from your frontend.

### Option 2: Monorepo (Both in One)

Deploy both frontend and backend from the same repository.

---

## 🚀 Option 1: Separate Backend Project (Easiest)

### Step 1: Create New Vercel Project for Backend

1. **Go to**: https://vercel.com
2. **Add New Project**
3. **Import** your `Hezak` repository
4. **Configure**:
   - **Root Directory**: `backend`
   - **Framework Preset**: Other
   - **Build Command**: `npm install && npm run build`
   - **Output Directory**: `dist`
   - **Install Command**: `npm install`

### Step 2: Add Environment Variables

In Vercel project settings → **Environment Variables**:

```
NODE_ENV=production
PORT=4000
JWT_SECRET=your-secret-key-here
DATABASE_URL=file:./dev.db
```

**Or use Vercel Postgres** (Recommended):
1. **Storage** → **Create Database** → **Postgres**
2. Vercel auto-creates `POSTGRES_URL`
3. Update `DATABASE_URL` to use `POSTGRES_URL`

### Step 3: Update vercel.json

The `backend/vercel.json` is already configured! ✅

### Step 4: Deploy!

Click **Deploy** - Your backend will be live at:
`https://your-backend-project.vercel.app`

### Step 5: Connect Frontend

In your **frontend Vercel project**:
1. **Settings** → **Environment Variables**
2. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-project.vercel.app/api`
3. **Redeploy** frontend

---

## 🏗️ Option 2: Monorepo (Both Together)

### Step 1: Update Root vercel.json

Create/update `vercel.json` in root:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "frontend/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    },
    {
      "src": "backend/dist/server.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "backend/dist/server.js"
    },
    {
      "src": "/(.*)",
      "dest": "frontend/dist/$1"
    }
  ]
}
```

### Step 2: Update Frontend Build

In `frontend/package.json`, add:

```json
{
  "scripts": {
    "vercel-build": "npm run build"
  }
}
```

### Step 3: Deploy

1. **Import** repository to Vercel
2. **Root Directory**: Leave empty (root)
3. **Build Command**: 
   ```bash
   cd backend && npm install && npm run build && cd ../frontend && npm install && npm run build
   ```
4. **Output Directory**: `frontend/dist`
5. **Deploy** ✅

---

## ⚠️ Important Considerations

### Limitations:

1. **Serverless Functions** - Each API call is a separate function invocation
2. **Cold Starts** - First request may be slower (~1-2 seconds)
3. **File Uploads** - Use Vercel Blob Storage or external storage
4. **Database** - Use Vercel Postgres (free tier available)
5. **10-second timeout** - Free tier has 10s timeout (Pro: 60s)

### Solutions:

1. **Use Vercel Postgres** instead of SQLite
2. **Use Vercel Blob** for file uploads
3. **Optimize** for serverless (stateless design)

---

## 🗄️ Setup Vercel Postgres

### Step 1: Create Database

1. In Vercel project → **Storage** tab
2. **Create** → **Postgres**
3. **Create Database** ✅

### Step 2: Update Prisma

1. **Update** `backend/prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("POSTGRES_URL")
   }
   ```

2. **Run migrations**:
   ```bash
   cd backend
   npx prisma migrate deploy
   ```

### Step 3: Environment Variable

Vercel automatically adds `POSTGRES_URL` - no manual setup needed!

---

## 📦 Setup File Uploads (Vercel Blob)

### Step 1: Create Blob Store

1. Vercel project → **Storage** → **Create** → **Blob**
2. **Create Store** ✅

### Step 2: Update Backend

Install Vercel Blob:
```bash
npm install @vercel/blob
```

Update upload controller to use Blob instead of local storage.

---

## 🔄 Auto-Deploy

Both frontend and backend auto-deploy on every push to GitHub! ✅

---

## 📊 Vercel Backend vs Other Options

| Feature | Vercel | Railway | Oracle Cloud |
|---------|--------|---------|--------------|
| **Setup Time** | 2 min | 2 min | 15 min |
| **Free Tier** | ✅ Yes | ✅ $5 credit | ✅ Forever |
| **Serverless** | ✅ Yes | ❌ No | ❌ No |
| **Cold Starts** | ⚠️ Yes | ❌ No | ❌ No |
| **Database** | ✅ Postgres | ✅ Postgres | ✅ Postgres |
| **File Storage** | ✅ Blob | ⚠️ Limited | ✅ 10TB |
| **Best For** | Quick deploy | Always-on | Free forever |

---

## ✅ Quick Start (2 Minutes)

### Separate Projects (Recommended):

1. **Frontend Project**:
   - Root: `frontend`
   - Build: `npm run build`
   - Output: `dist`

2. **Backend Project**:
   - Root: `backend`
   - Build: `npm install && npm run build`
   - Output: `dist`
   - Runtime: Node.js

3. **Connect**:
   - Frontend env: `VITE_API_URL=https://backend-project.vercel.app/api`

---

## 🎯 Recommendation

**For Vercel Backend:**
- ✅ **Fastest setup** (2 minutes)
- ✅ **Auto-deploy** from GitHub
- ✅ **Free tier** available
- ⚠️ **Cold starts** on free tier
- ⚠️ **10s timeout** on free tier

**Best for:** Quick deployment, small to medium apps

**For Production:**
- Consider **Railway** or **Oracle Cloud** for always-on, no cold starts
- Or upgrade to **Vercel Pro** ($20/month) for 60s timeout

---

## 🚀 Deploy Now!

1. **Go to**: https://vercel.com
2. **New Project** → Import `Hezak`
3. **Root Directory**: `backend`
4. **Deploy** ✅

**Your backend will be live in 30 seconds!**

---

**See `VERCEL_BACKEND_QUICK.md` for step-by-step!** 🚀

