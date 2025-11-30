# ✅ Vercel Backend Project Info

## 📋 Your Backend Project

**Project ID**: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`

---

## 🔗 Get Your Backend URL

1. **Go to**: https://vercel.com
2. **Find** your backend project (Project ID: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`)
3. **Copy** the deployment URL

**Your backend URL will be like**:
- `https://hezak-backend-xxxxx.vercel.app`
- Or your custom domain if set

---

## ✅ Test Your Backend

### Test Health Endpoint:
```
https://your-backend-url.vercel.app/health
```

**Should return**: `{"status":"ok","timestamp":"..."}`

### Test API Endpoint:
```
https://your-backend-url.vercel.app/api/products
```

**Should return**: Products array or proper error (not 404)

---

## 🔗 Connect Frontend

### Step 1: Get Backend URL

From your Vercel backend project, copy the deployment URL.

### Step 2: Set in Frontend

**In your Vercel frontend project**:

1. **Settings** → **Environment Variables**
2. **Add**:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.vercel.app/api`
   - **Environment**: Select **ALL** (Production, Preview, Development)
3. **Save**
4. **Redeploy** frontend

---

## 🎯 Quick Checklist

- [ ] Backend deployed (Project ID: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`)
- [ ] Backend URL copied
- [ ] `/health` endpoint works
- [ ] `VITE_API_URL` set in frontend
- [ ] Frontend redeployed
- [ ] Test in browser - errors should be gone!

---

## 🔍 Check Deployment Status

1. **Go to**: https://vercel.com
2. **Find** project with ID: `prj_JwFrVKPX0ktgQJAClJXobFt3FkBG`
3. **Check**:
   - Deployment status (should be "Ready")
   - Function logs (for any errors)
   - Deployment URL

---

**Your backend is deployed! Now connect the frontend to it!** 🚀

