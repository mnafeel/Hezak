# 🔧 Fix Products Disappearing on Server Restart

## ❌ Problem

**Products disappear when server restarts** because:
- Products are stored in **SQLite** (ephemeral file system)
- Render deletes local files on server restart
- Products need to be in **Firestore** (cloud database) to persist

---

## ✅ Solution

**Use Firestore instead of SQLite** for all data storage.

---

## 🎯 Step 1: Set Environment Variable

### On Render Dashboard:

1. Go to: https://dashboard.render.com
2. Select your **backend service** (`hezak-backend`)
3. Go to **Environment** tab
4. Add/Update environment variable:
   - **Key**: `USE_FIRESTORE`
   - **Value**: `true`
5. **Save Changes**
6. **Manual Deploy** → **Deploy latest commit**

---

## 🎯 Step 2: Migrate Existing Data

If you have products in SQLite, migrate them to Firestore:

### Option A: Run Migration Script (Recommended)

**On your local machine** (with access to SQLite database):

```bash
cd backend
npm run migrate:firestore
```

This will:
- ✅ Copy all products from SQLite → Firestore
- ✅ Copy all categories → Firestore
- ✅ Copy all users → Firestore
- ✅ Copy all orders → Firestore
- ✅ Copy all banners → Firestore

### Option B: Re-add Products Manually

If migration isn't possible:
1. Products will be lost (already happened)
2. Re-add products through admin panel
3. They will now be saved to Firestore (persistent)

---

## 🎯 Step 3: Verify Firestore is Active

After deployment, check server logs:

**Should see:**
```
🔥 Using Firebase Firestore
✅ Firebase Admin initialized successfully
```

**If you see:**
```
💾 Using SQLite (Prisma)
```
→ `USE_FIRESTORE` is not set correctly

---

## 🎯 Step 4: Test Persistence

1. **Add a product** through admin panel
2. **Check Firestore**: https://console.firebase.google.com
   - Go to: `hezak-f6fb3` project
   - **Firestore Database** → `products` collection
   - Verify product exists
3. **Restart server** (or wait for Render auto-restart)
4. **Check again**: Product should still be there ✅

---

## 📋 Environment Variables Checklist

Make sure these are set in Render:

- ✅ `USE_FIRESTORE=true` (most important!)
- ✅ `FIREBASE_SERVICE_ACCOUNT={...}` (your service account JSON)
- ✅ `ADMIN_EMAIL=...`
- ✅ `ADMIN_PASSWORD_HASH=...`
- ✅ `JWT_SECRET=...`
- ✅ `DATABASE_URL=file:./dev.db` (still needed for Prisma, but won't be used if Firestore is enabled)

---

## 🔍 Troubleshooting

### Products Still Disappearing?

1. **Check environment variable**:
   ```bash
   # In Render logs, should see:
   🔥 Using Firebase Firestore
   ```

2. **Check Firestore console**:
   - Products should appear in `products` collection
   - If empty, products are still going to SQLite

3. **Check product creation**:
   - Add a product in admin
   - Immediately check Firestore console
   - If not there, `USE_FIRESTORE` is not set

### Migration Failed?

1. **Check Firebase credentials**:
   - `FIREBASE_SERVICE_ACCOUNT` must be valid JSON
   - No extra quotes or escaping

2. **Check network**:
   - Migration needs internet connection
   - Firestore API must be accessible

---

## ✅ Expected Result

After setting `USE_FIRESTORE=true`:

- ✅ Products persist across server restarts
- ✅ Categories persist
- ✅ All data in Firestore (cloud)
- ✅ No data loss on deployment

---

## 🚨 Important Notes

1. **SQLite is temporary**: Never use SQLite on Render for production
2. **Firestore is permanent**: All data persists in cloud
3. **Migration is one-time**: Run once to copy existing data
4. **New products**: Automatically go to Firestore if `USE_FIRESTORE=true`

---

**Set `USE_FIRESTORE=true` in Render and redeploy!** ✅

