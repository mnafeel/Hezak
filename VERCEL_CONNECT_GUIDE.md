# 🔗 Connect Vercel Backend & Frontend - Step-by-Step

## 📋 Prerequisites

- ✅ Backend deployed on Vercel (Project ID: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`)
- ✅ Frontend deployed on Vercel (or GitHub Pages)
- ✅ Environment variables generated

---

## 🎯 Step 1: Set Backend Environment Variables

### 1.1 Go to Backend Project

1. **Open**: https://vercel.com
2. **Find** your backend project (ID: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`)
3. **Click** on the project name

### 1.2 Add Environment Variables

1. **Click**: **Settings** (top menu)
2. **Click**: **Environment Variables** (left sidebar)
3. **Add** these 6 variables one by one:

#### Variable 1: NODE_ENV
- **Name**: `NODE_ENV`
- **Value**: `production`
- **Environment**: Select **All** (Production, Preview, Development)
- **Click**: "Save"

#### Variable 2: PORT
- **Name**: `PORT`
- **Value**: `4000`
- **Environment**: Select **All**
- **Click**: "Save"

#### Variable 3: DATABASE_URL
- **Name**: `DATABASE_URL`
- **Value**: `file:./dev.db`
- **Environment**: Select **All**
- **Click**: "Save"

#### Variable 4: ADMIN_EMAIL
- **Name**: `ADMIN_EMAIL`
- **Value**: `admin@hezak.com`
- **Environment**: Select **All**
- **Click**: "Save"

#### Variable 5: ADMIN_PASSWORD_HASH
- **Name**: `ADMIN_PASSWORD_HASH`
- **Value**: `$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2`
- **Environment**: Select **All**
- **Click**: "Save"

#### Variable 6: JWT_SECRET
- **Name**: `JWT_SECRET`
- **Value**: `a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34`
- **Environment**: Select **All**
- **Click**: "Save"

### 1.3 Redeploy Backend

1. **Go to**: **Deployments** tab
2. **Find** the latest deployment
3. **Click**: **"..."** (three dots) → **"Redeploy"**
4. **Wait** for deployment to complete (2-3 minutes)

---

## 🔍 Step 2: Get Backend URL

### 2.1 Find Your Backend URL

1. **In** your backend Vercel project
2. **Go to**: **Deployments** tab
3. **Click** on the latest deployment
4. **Copy** the **URL** (e.g., `https://hezak-backend-xxxxx.vercel.app`)

**Your backend URL will look like:**
```
https://hezak-backend-xxxxx.vercel.app
```

### 2.2 Test Backend

**Open in browser:**
```
https://your-backend-url.vercel.app/health
```

**Should return:**
```json
{"status":"ok","timestamp":"2024-01-01T00:00:00.000Z"}
```

✅ **If this works, backend is ready!**

---

## 🎨 Step 3: Set Frontend Environment Variables

### 3.1 Go to Frontend Project

1. **Open**: https://vercel.com
2. **Find** your frontend project
3. **Click** on the project name

### 3.2 Add API URL

1. **Click**: **Settings** (top menu)
2. **Click**: **Environment Variables** (left sidebar)
3. **Add** this variable:

#### Variable: VITE_API_URL
- **Name**: `VITE_API_URL`
- **Value**: `https://your-backend-url.vercel.app/api`
  - *(Replace `your-backend-url` with your actual backend URL)*
  - *(Make sure to include `/api` at the end)*
- **Environment**: Select **All** (Production, Preview, Development)
- **Click**: "Save"

**Example:**
```
VITE_API_URL=https://hezak-backend-xxxxx.vercel.app/api
```

### 3.3 Redeploy Frontend

1. **Go to**: **Deployments** tab
2. **Find** the latest deployment
3. **Click**: **"..."** (three dots) → **"Redeploy"**
4. **Wait** for deployment to complete (2-3 minutes)

---

## ✅ Step 4: Test Connection

### 4.1 Open Frontend

1. **Go to** your frontend URL
2. **Open** browser console (F12)
3. **Check** Network tab

### 4.2 Verify API Calls

**Look for:**
- API calls going to: `https://your-backend-url.vercel.app/api/...`
- Status codes: `200` (success) or `401` (auth required)

### 4.3 Test Features

1. **Browse products** - Should load from backend
2. **Login** - Should connect to backend
3. **Admin login** - Should work with credentials:
   - Email: `admin@hezak.com`
   - Password: `admin123`

---

## 🔧 Step 5: Troubleshooting

### Problem: Frontend shows "Network Error"

**Solution:**
1. **Check** `VITE_API_URL` is correct in frontend
2. **Verify** backend URL is accessible (`/health` endpoint)
3. **Check** CORS settings (should allow all origins in production)

### Problem: Backend returns 404

**Solution:**
1. **Check** backend routes are correct
2. **Verify** `api/index.js` exists
3. **Check** `vercel.json` routes configuration

### Problem: Backend returns 500

**Solution:**
1. **Check** all environment variables are set
2. **View** function logs in Vercel
3. **Verify** database connection

### Problem: CORS errors

**Solution:**
- Backend CORS is already configured to allow all origins in production
- If still having issues, check backend `app.ts` CORS settings

---

## 📝 Quick Checklist

### Backend Setup
- [ ] All 6 environment variables added
- [ ] Backend redeployed
- [ ] `/health` endpoint works
- [ ] Backend URL copied

### Frontend Setup
- [ ] `VITE_API_URL` set to backend URL + `/api`
- [ ] Frontend redeployed
- [ ] Frontend loads without errors
- [ ] API calls visible in Network tab

### Testing
- [ ] Products load from backend
- [ ] Login works
- [ ] Admin login works
- [ ] No console errors

---

## 🎯 Summary

**Backend URL**: `https://your-backend-url.vercel.app`  
**Frontend API URL**: `https://your-backend-url.vercel.app/api`

**That's it! Your frontend and backend are now connected!** 🚀

---

## 💡 Pro Tips

1. **Always redeploy** after changing environment variables
2. **Check deployment logs** if something doesn't work
3. **Test `/health` endpoint** first to verify backend is up
4. **Use browser console** to debug API calls
5. **Check Network tab** to see actual API requests

---

**Follow these steps and your frontend and backend will be connected!** ✅

