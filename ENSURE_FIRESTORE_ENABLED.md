# ⚠️ CRITICAL: Enable Firestore to Prevent Data Loss

## 🚨 Current Issue

**Products disappear on server restart** because they're stored in SQLite (ephemeral).

---

## ✅ Quick Fix

### Set This Environment Variable in Render:

```
USE_FIRESTORE=true
```

**Location**: Render Dashboard → Your Backend Service → Environment Tab

---

## 📋 Complete Environment Variables

Make sure ALL these are set in Render:

```bash
# Database (REQUIRED)
USE_FIRESTORE=true

# Firebase (REQUIRED)
FIREBASE_SERVICE_ACCOUNT={"type":"service_account",...}

# Admin (REQUIRED)
ADMIN_EMAIL=your-admin@email.com
ADMIN_PASSWORD_HASH=$2b$10$...

# JWT (REQUIRED)
JWT_SECRET=your-secret-key-here

# Database URL (still needed for Prisma, but won't be used)
DATABASE_URL=file:./dev.db
```

---

## 🔍 How to Verify

### 1. Check Server Logs

After deployment, logs should show:
```
🔥 Using Firebase Firestore
✅ Firebase Admin initialized successfully
```

**NOT:**
```
💾 Using SQLite (Prisma)
```

### 2. Check Firestore Console

1. Go to: https://console.firebase.google.com
2. Select: `hezak-f6fb3` project
3. **Firestore Database** → Check collections:
   - `products` ✅
   - `categories` ✅
   - `users` ✅
   - `orders` ✅
   - `banners` ✅

### 3. Test Persistence

1. Add a product in admin
2. Check Firestore → Product should appear
3. Restart server (or wait for auto-restart)
4. Check again → Product should still be there ✅

---

## 🎯 After Setting USE_FIRESTORE=true

1. **Redeploy** (or wait for auto-deploy)
2. **Migrate existing data** (if any):
   ```bash
   cd backend
   npm run migrate:firestore
   ```
3. **Test**: Add product → Check Firestore → Restart → Verify persistence

---

**This is the ONLY way to prevent data loss on server restarts!** ✅

