# 🎯 Next Steps for Firestore Migration

## ✅ What's Done

1. ✅ **Firestore code pushed to GitHub** (commit `390c9ea`)
2. ✅ **Render will auto-deploy** the new code
3. ✅ **Firestore infrastructure ready**

---

## 📋 Step-by-Step: Complete Migration

### Step 1: Wait for Render Deployment (2-3 minutes)

Render should automatically detect the new commit and start deploying.

**Check**: Render Dashboard → Backend service → Events tab

- Look for: "Deploying commit 390c9ea..."

---

### Step 2: Add Firebase Service Account

1. **Go to**: Render Dashboard → Backend service → Settings → Environment
2. **Add Variable**:
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: _(Your Firebase JSON - get from Firebase Console)_
   - **Environment**: All
3. **Save**

**How to get Firebase JSON**:

1. Go to: https://console.firebase.google.com
2. Select: `hezak-f6fb3` project
3. Settings → Project settings → Service accounts
4. Generate new private key
5. Download JSON
6. Format as single line (use https://jsonformatter.org/minify)

---

### Step 3: Verify Firebase Connection

After adding `FIREBASE_SERVICE_ACCOUNT` and redeploying:

1. **Check Logs**: Render Dashboard → Logs tab
2. **Look for**: `✅ Firebase Admin initialized successfully`
3. **Test**: `curl https://hezak-backend.onrender.com/health`

---

### Step 4: Run Migration Script

**Option A: Run Locally** (Recommended for testing):

```bash
cd backend
npm run migrate:firestore
```

**Option B: Run on Render**:

- SSH into Render (if available)
- Or add to build command temporarily

---

### Step 5: Enable Firestore

After migration is complete:

1. **Go to**: Render Dashboard → Backend service → Settings → Environment
2. **Add Variable**:
   - **Key**: `USE_FIRESTORE`
   - **Value**: `true`
   - **Environment**: All
3. **Save** → **Redeploy**

---

### Step 6: Verify Migration

**Test Products API**:

```bash
curl https://hezak-backend.onrender.com/api/products
```

**Check Firestore Console**:

1. Go to: https://console.firebase.google.com
2. Select: `hezak-f6fb3` project
3. **Firestore Database** → Check collections:
   - `products` ✅
   - `categories` ✅
   - `users` ✅
   - `orders` ✅
   - `banners` ✅

---

## 📊 Current Status

- ✅ **Code**: Deployed to GitHub
- ⏳ **Render**: Auto-deploying (wait 2-3 minutes)
- ⏳ **Firebase**: Need to add `FIREBASE_SERVICE_ACCOUNT`
- ⏳ **Migration**: Need to run script
- ⏳ **Firestore**: Need to enable with `USE_FIRESTORE=true`

---

## ⚠️ Important Notes

1. **Both systems work**: SQLite (Prisma) and Firestore can coexist
2. **Test first**: Run migration locally before production
3. **Backup**: Your SQLite data is safe during migration
4. **Switch**: Use `USE_FIRESTORE=true` to switch to Firestore

---

## 🚀 Quick Checklist

- [ ] Wait for Render deployment (commit 390c9ea)
- [ ] Add `FIREBASE_SERVICE_ACCOUNT` to Render
- [ ] Redeploy backend
- [ ] Verify Firebase connection in logs
- [ ] Run migration script
- [ ] Verify data in Firestore console
- [ ] Add `USE_FIRESTORE=true` to Render
- [ ] Redeploy backend
- [ ] Test all API endpoints
- [ ] Test frontend

---

**Your Firestore migration code is now live!** 🔥

Follow the steps above to complete the migration.
