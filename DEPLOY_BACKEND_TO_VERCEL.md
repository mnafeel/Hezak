# 🚀 Deploy Backend to Vercel (Alternative to Firebase Functions)

## ✅ Why Vercel?

- ✅ **FREE** - No billing account needed
- ✅ **Easy deployment** - Just connect GitHub
- ✅ **Serverless functions** - Auto-scales
- ✅ **Same codebase** - Works with your existing backend
- ✅ **Fast** - Global CDN

---

## 📋 Step-by-Step Guide

### Step 1: Prepare Backend for Vercel

Your backend is already set up! Just need to create the Vercel serverless function entry point.

**File created**: `backend/api/index.ts` ✅

---

### Step 2: Update vercel.json

The `backend/vercel.json` should look like this:

```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/index.ts",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "api/index.ts"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

---

### Step 3: Install Vercel CLI (Optional)

```bash
npm install -g vercel
```

Or use `npx vercel` (no install needed).

---

### Step 4: Deploy to Vercel

#### Option A: Using Vercel CLI

```bash
cd backend
npx vercel
```

**Follow prompts**:
1. **Set up and deploy?** → Yes
2. **Which scope?** → Your account
3. **Link to existing project?** → No (first time)
4. **Project name?** → `hezak-backend` (or any name)
5. **Directory?** → `./` (current directory)
6. **Override settings?** → No

**After deployment**, you'll get a URL like:
```
https://hezak-backend.vercel.app
```

---

#### Option B: Using Vercel Dashboard (Recommended)

1. **Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
2. **Click**: "Add New Project"
3. **Import**: Your GitHub repository
4. **Root Directory**: Select `backend` folder
5. **Framework Preset**: Other
6. **Build Command**: `npm run build`
7. **Output Directory**: Leave empty (or `dist`)
8. **Install Command**: `npm install`
9. **Click**: "Deploy"

---

### Step 5: Set Environment Variables

In Vercel Dashboard → Your Project → Settings → Environment Variables:

**Add these**:
```
NODE_ENV=production
USE_FIRESTORE=true
FIREBASE_SERVICE_ACCOUNT=<your-service-account-json>
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
USE_FIREBASE_STORAGE=true
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=your-secret-key-min-16-chars
```

**For FIREBASE_SERVICE_ACCOUNT**:
- Get from Firebase Console → Project Settings → Service Accounts
- Download JSON key
- Copy entire JSON content
- Paste as environment variable (Vercel handles multi-line)

---

### Step 6: Update Frontend API URL

In Vercel Dashboard → Frontend Project → Settings → Environment Variables:

**Add/Update**:
```
VITE_API_URL=https://hezak-backend.vercel.app/api
```

*(Use your actual backend URL from Step 4)*

---

## 🎯 Quick Commands

```bash
# Deploy backend to Vercel
cd backend
npx vercel

# Or deploy with production alias
npx vercel --prod
```

---

## ⚠️ Important Notes

### 1. File Uploads

Vercel serverless functions have **10MB request limit**. For larger uploads:
- ✅ Use Firebase Storage (recommended)
- ✅ Or use external storage (S3, Cloudinary)

### 2. Function Timeout

- **Free tier**: 10 seconds
- **Pro tier**: 60 seconds

**Your API should be fast enough** - most requests complete in <1 second.

### 3. Cold Starts

- First request after inactivity may be slow (1-2 seconds)
- Subsequent requests are fast
- Normal for serverless

### 4. Database

- ✅ Use Firestore (already configured)
- ✅ No SQLite (not persistent on Vercel)
- ✅ Firebase Storage for files

---

## 📊 Vercel Free Tier

**You get FREE**:
- ✅ **100 GB bandwidth/month**
- ✅ **100 serverless function executions/day**
- ✅ **Unlimited** function invocations (with limits)
- ✅ **10 seconds** function timeout

**For most apps, this is FREE!** 🎉

---

## 🔍 Troubleshooting

### Error: "Function timeout"

**Fix**: Optimize slow endpoints or upgrade to Pro ($20/month)

### Error: "Request too large"

**Fix**: Use Firebase Storage for file uploads (already configured)

### Error: "Module not found"

**Fix**: 
- Check `package.json` has all dependencies
- Run `npm install` in `backend/` directory
- Check build command in Vercel settings

### Error: "Environment variable not found"

**Fix**: 
- Check Vercel Dashboard → Environment Variables
- Make sure variables are set for **Production**
- Redeploy after adding variables

---

## ✅ After Deployment

1. ✅ Backend URL: `https://hezak-backend.vercel.app`
2. ✅ API endpoint: `https://hezak-backend.vercel.app/api`
3. ✅ Health check: `https://hezak-backend.vercel.app/health`
4. ✅ Update frontend `VITE_API_URL`
5. ✅ Test your site!

---

## 🎉 Benefits of Vercel

- ✅ **No billing account needed** (unlike Firebase Functions)
- ✅ **Easy deployment** (just connect GitHub)
- ✅ **Automatic HTTPS**
- ✅ **Global CDN**
- ✅ **Free tier is generous**

---

## 📋 Comparison: Vercel vs Firebase Functions

| Feature | Vercel | Firebase Functions |
|---------|--------|-------------------|
| **Billing Required** | ❌ No | ✅ Yes (Blaze plan) |
| **Free Tier** | ✅ Yes | ✅ Yes |
| **Setup** | ⚡ Easy | 🔧 Medium |
| **File Uploads** | ⚠️ 10MB limit | ✅ 500MB+ |
| **Timeout** | ⚠️ 10s (free) | ✅ 60s+ |
| **Best For** | Small/Medium apps | Large scale |

---

## 🚀 Next Steps

1. **Deploy backend** to Vercel (follow steps above)
2. **Get backend URL** from deployment
3. **Update frontend** `VITE_API_URL`
4. **Test your site!**

---

**Vercel is a great alternative - no billing account needed!** 🎉

