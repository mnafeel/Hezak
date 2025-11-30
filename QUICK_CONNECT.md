# ⚡ Quick Connect Guide (5 Minutes)

## 🎯 Fast Steps

### 1️⃣ Backend Environment Variables (2 min)

**Go to**: Vercel → Backend Project → Settings → Environment Variables

**Add these 6:**
```
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./dev.db
ADMIN_EMAIL=admin@hezak.com
ADMIN_PASSWORD_HASH=$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2
JWT_SECRET=a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34
```

**Then**: Redeploy backend

---

### 2️⃣ Get Backend URL (30 sec)

**In Vercel backend project:**
- Deployments → Latest → Copy URL

**Example**: `https://hezak-backend-xxxxx.vercel.app`

**Test**: Open `https://your-backend-url.vercel.app/health` in browser

---

### 3️⃣ Frontend Environment Variable (1 min)

**Go to**: Vercel → Frontend Project → Settings → Environment Variables

**Add:**
```
VITE_API_URL=https://your-backend-url.vercel.app/api
```
*(Replace with your actual backend URL)*

**Then**: Redeploy frontend

---

### 4️⃣ Test (1 min)

1. **Open** frontend URL
2. **Check** browser console (F12)
3. **Verify** API calls work

**Done!** ✅

---

## 🔑 Admin Login

- **Email**: `admin@hezak.com`
- **Password**: `admin123`

---

**See `VERCEL_CONNECT_GUIDE.md` for detailed steps!**

