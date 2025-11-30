# 🔧 Fix Vercel Backend - Environment Variables

## ⚠️ Problem

Your backend is failing because **required environment variables are missing**!

---

## ✅ Required Environment Variables

Your backend needs these **5 variables** in Vercel:

### 1. `DATABASE_URL`
```
DATABASE_URL=file:./dev.db
```

### 2. `ADMIN_EMAIL`
```
ADMIN_EMAIL=admin@hezak.com
```
*(Change to your email)*

### 3. `ADMIN_PASSWORD_HASH`
**Generate this** (see below)

### 4. `JWT_SECRET`
**Generate this** (see below)

### 5. `NODE_ENV`
```
NODE_ENV=production
```

---

## 🔑 Generate Password Hash & JWT Secret

### Option 1: Use Script (Easiest)

```bash
cd backend
node scripts/setup-env.js
```

This will:
- Generate `JWT_SECRET`
- Hash your admin password
- Show all variables to copy

### Option 2: Manual (If script doesn't work)

**Generate JWT Secret:**
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Generate Password Hash:**
```bash
node -e "const bcrypt=require('bcrypt');bcrypt.hash('YOUR_PASSWORD',10).then(h=>console.log(h))"
```
*(Replace `YOUR_PASSWORD` with your actual password)*

---

## 📝 Set in Vercel

### Step 1: Go to Vercel Project

1. **Open**: https://vercel.com
2. **Find** your backend project (ID: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`)
3. **Click**: Settings → Environment Variables

### Step 2: Add Variables

Add these **5 variables**:

| Name | Value | Environment |
|------|-------|-------------|
| `NODE_ENV` | `production` | All |
| `PORT` | `4000` | All |
| `DATABASE_URL` | `file:./dev.db` | All |
| `ADMIN_EMAIL` | `admin@hezak.com` | All |
| `ADMIN_PASSWORD_HASH` | *(from script)* | All |
| `JWT_SECRET` | *(from script)* | All |

**Important**: Select **"All"** for Environment (Production, Preview, Development)

### Step 3: Redeploy

1. **Deployments** tab
2. **Click** "Redeploy" on latest deployment
3. **Wait** for build to complete

---

## ✅ Test

After redeploy, test:

1. **Health**: `https://your-backend.vercel.app/health`
2. **Products**: `https://your-backend.vercel.app/api/products`

Should work now! ✅

---

## 🚀 Better Option: Use Railway

**If Vercel keeps having issues, Railway is MUCH easier:**

1. **Go to**: https://railway.app
2. **New Project** → **Deploy from GitHub**
3. **Select**: `Hezak` repo
4. **Root**: `backend`
5. **Add** same environment variables
6. **Deploy** ✅

**Railway advantages:**
- ✅ No cold starts
- ✅ No timeout issues
- ✅ Easier setup
- ✅ Better for Express.js

**See**: `SWITCH_TO_RAILWAY.md` for full guide

---

## 🔍 Check Deployment Logs

If still not working:

1. **Vercel** → **Deployments** → **Latest**
2. **View** build logs
3. **Look for**:
   - "Invalid environment configuration"
   - Missing variable errors
   - Build failures

---

**Set these 5 variables and redeploy!** 🚀

