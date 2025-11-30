# ⚡ Render Quick Start (5 Minutes)

## 🚀 Fast Steps

### 1️⃣ Sign Up (1 min)

1. **Go to**: https://render.com
2. **Sign up** with GitHub
3. **Verify** email

---

### 2️⃣ Create Web Service (2 min)

1. **Click**: **"New +"** → **"Web Service"**
2. **Connect** GitHub → Select `Hezak` repository
3. **Configure**:
   - **Name**: `hezak-backend`
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run prisma:generate && npm run build`
   - **Start Command**: `node dist/server.js`
   - **Instance Type**: **Free**

---

### 3️⃣ Add Environment Variables (1 min)

**Click**: **"Advanced"** → **"Add Environment Variable"**

**Add these 6:**

```
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./dev.db
ADMIN_EMAIL=admin@hezak.com
ADMIN_PASSWORD_HASH=$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2
JWT_SECRET=a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34
```

---

### 4️⃣ Deploy (1 min)

1. **Click**: **"Create Web Service"**
2. **Wait** 5-10 minutes
3. **Copy** your URL (e.g., `https://hezak-backend.onrender.com`)

---

### 5️⃣ Test (30 sec)

**Open in browser:**
```
https://your-backend-url.onrender.com/health
```

**Should return**: `{"status":"ok",...}` ✅

---

## 🔗 Connect Frontend

**In your frontend project** (Vercel/GitHub Pages):

1. **Add** environment variable:
   ```
   VITE_API_URL=https://your-backend-url.onrender.com/api
   ```
2. **Redeploy** frontend

---

## ✅ Done!

**Your backend is now on Render!** 🚀

**See `RENDER_BACKEND_GUIDE.md` for detailed instructions!**

