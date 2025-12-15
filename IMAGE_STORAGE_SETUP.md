# 🖼️ Image Storage Setup for Render

## ⚠️ Important: Use Firebase Storage!

**On Render, local file storage (`/uploads` folder) is NOT persistent!**

- Files will be **lost on server restart**
- Files will be **lost on redeployment**
- **Solution**: Use **Firebase Storage** ✅

---

## ✅ What You Need to Do

### Step 1: Enable Firebase Storage (If Not Already Done)

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: Project `hezak-f6fb3`
3. **Click**: **Storage** (in left menu)
4. **Click**: **Get Started** (if not enabled)
5. **Choose**: Security rules (start with production mode)
6. **Select**: Location (closest to you)
7. **Click**: **Done**

---

### Step 2: Get Storage Bucket Name

After enabling Storage:

1. **In Firebase Console** → **Storage**
2. **Look at top**: Bucket name (e.g., `hezak-f6fb3.appspot.com`)
3. **Copy this name**

**Your bucket**: `hezak-f6fb3.appspot.com` ✅

---

### Step 3: Configure Storage Security Rules

1. **Firebase Console** → **Storage** → **Rules** tab
2. **Replace** with these rules:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      // Allow public read access for all files
      allow read: if true;
      // Allow write access for authenticated users (admin)
      allow write: if request.auth != null;
    }
  }
}
```

3. **Click**: **Publish**

**This allows**:

- ✅ **Public read** - Anyone can view images (needed for frontend)
- ✅ **Authenticated write** - Only logged-in admins can upload

---

### Step 4: Set Environment Variables on Render

In Render Dashboard → Your Service → Environment:

**Add/Update**:

```
USE_FIREBASE_STORAGE=true
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
FIREBASE_SERVICE_ACCOUNT=<your-json>
```

**Important**:

- `USE_FIREBASE_STORAGE=true` enables Firebase Storage
- `FIREBASE_STORAGE_BUCKET` is your bucket name
- `FIREBASE_SERVICE_ACCOUNT` is needed for uploads

---

## ✅ How It Works

### When You Upload an Image:

1. **Admin uploads** image via admin panel
2. **Backend receives** image file
3. **Backend uploads** to Firebase Storage
4. **Firebase returns** public URL
5. **Backend saves** URL to database
6. **Frontend displays** image from Firebase URL

### Image URLs Look Like:

```
https://storage.googleapis.com/hezak-f6fb3.appspot.com/uploads/1234567890-abc123.jpg
```

**These URLs are permanent** and work from anywhere! ✅

---

## 🔧 Current Configuration

Your backend is already configured to use Firebase Storage when:

- `USE_FIREBASE_STORAGE=true` is set
- `FIREBASE_STORAGE_BUCKET` is set
- `FIREBASE_SERVICE_ACCOUNT` is set

**The code automatically**:

- ✅ Uses Firebase Storage if enabled
- ✅ Falls back to local storage if not enabled (not recommended on Render)

---

## 📋 Checklist for Render

Make sure these are set in Render environment variables:

- [ ] `USE_FIREBASE_STORAGE=true`
- [ ] `FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com`
- [ ] `FIREBASE_SERVICE_ACCOUNT=<your-json>`
- [ ] Firebase Storage enabled in Firebase Console
- [ ] Storage security rules published

---

## 🎯 Quick Setup Summary

1. ✅ **Enable Firebase Storage** in Firebase Console
2. ✅ **Get bucket name**: `hezak-f6fb3.appspot.com`
3. ✅ **Set security rules** (allow public read)
4. ✅ **Add to Render**: `USE_FIREBASE_STORAGE=true`
5. ✅ **Add to Render**: `FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com`
6. ✅ **Redeploy** Render service

---

## ⚠️ Important Notes

### Don't Use Local Storage on Render

❌ **Don't do this**:

- Storing files in `/uploads` folder
- Using local file system
- Files will be lost!

✅ **Do this**:

- Use Firebase Storage
- Set `USE_FIREBASE_STORAGE=true`
- Images stored permanently in Firebase

---

## 🔍 Verify It's Working

After setup, test image upload:

1. **Go to**: Admin panel → Add Product
2. **Upload**: An image
3. **Check**: Image URL should start with:
   ```
   https://storage.googleapis.com/hezak-f6fb3.appspot.com/...
   ```
4. **Verify**: Image displays on frontend

---

## 💰 Firebase Storage Free Tier

**You get FREE**:

- ✅ **5 GB storage**
- ✅ **1 GB downloads/day**
- ✅ **20,000 uploads/day**

**For most apps, this is FREE!** 🎉

You only pay if you exceed these limits.

---

## 🚀 After Setup

Once configured:

- ✅ Images upload to Firebase Storage
- ✅ Images are permanent (won't be lost)
- ✅ Images load fast from CDN
- ✅ Works on Render (no local storage needed)

---

**Your backend is already configured for Firebase Storage!** Just enable it in Firebase Console and set the environment variables on Render! 🖼️
