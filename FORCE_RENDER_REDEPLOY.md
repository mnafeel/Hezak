# 🔄 Force Render to Redeploy (Get Latest Code)

## ⚠️ Problem

Render is running **old code** from before the fix. The logs show:
```
Order creation error: Error: One or more products not found
    at /opt/render/project/src/backend/dist/services/orderService.js:15:19
```

This is the **old code** that only checks SQLite, not Firestore.

---

## ✅ Solution: Force Redeploy on Render

### Step 1: Go to Render Dashboard

1. **Visit**: [Render Dashboard](https://dashboard.render.com/)
2. **Select**: Your backend service (`hezak-backend`)

---

### Step 2: Manual Deploy

1. **Click**: **"Manual Deploy"** button (top right)
2. **Select**: **"Deploy latest commit"**
3. **Click**: **"Deploy"**

**Or**:

1. **Go to**: **Events** tab
2. **Click**: **"Manual Deploy"**
3. **Select**: **"Clear build cache & deploy"** (recommended)
4. **Click**: **"Deploy"**

---

### Step 3: Wait for Deployment

- **Takes**: 5-10 minutes
- **Watch**: Build logs for any errors
- **Look for**: `✅ Build successful`

---

## 🔍 How to Know It Worked

After redeploy, check the logs for:
```
🔥 Using Firebase Firestore
✅ Firebase Admin initialized successfully
```

Then try checkout again - should work!

---

## ⚠️ If Auto-Deploy Isn't Working

### Enable Auto-Deploy

1. **Render Dashboard** → Your Service → **Settings**
2. **Build & Deploy** section
3. **Auto-Deploy**: Should be **"Yes"**
4. **Branch**: Should be `main`

**Save** if you changed anything.

---

## 🎯 Quick Steps

1. ✅ Render Dashboard → Your Service
2. ✅ Click "Manual Deploy"
3. ✅ Select "Clear build cache & deploy"
4. ✅ Wait 5-10 minutes
5. ✅ Test checkout again

---

## ✅ After Redeploy

Try placing an order again - it should:
- ✅ Find products in Firestore
- ✅ Create order successfully
- ✅ No more "products not found" error

---

**Force a manual deploy to get the latest code!** 🚀

