# 🔥 Connect Backend Server to Firebase - Complete Guide

## Overview

Your backend can connect to Firebase for:
- **Firestore Database** - Store products, categories, orders, users, banners
- **Firebase Storage** - Store images and videos persistently
- **Firebase Authentication** - Google login support

---

## 📋 Prerequisites

1. ✅ Firebase project created
2. ✅ Backend deployed on Render (or your hosting platform)
3. ✅ Access to Render dashboard

---

## 🔑 Step 1: Get Firebase Service Account JSON

### Option A: From Firebase Console (Recommended)

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: Your project (e.g., `hezak-f6fb3`)
3. **Click**: ⚙️ **Project Settings** (gear icon)
4. **Go to**: **Service Accounts** tab
5. **Click**: **Generate new private key**
6. **Download**: The JSON file (e.g., `hezak-f6fb3-firebase-adminsdk-xxxxx.json`)

### Option B: If you already have the JSON

- Use your existing service account JSON file

---

## 📝 Step 2: Format JSON for Environment Variable

The JSON needs to be on a **single line** for the environment variable.

### Method 1: Online Formatter (Easiest)

1. **Open**: https://jsonformatter.org/minify
2. **Paste**: Your Firebase JSON
3. **Click**: **Minify**
4. **Copy**: The single-line JSON

### Method 2: Command Line

```bash
# If you have the JSON file locally
cat your-firebase-key.json | jq -c .
```

---

## 🌐 Step 3: Add to Render (Backend Hosting)

### 3.1 Go to Render Dashboard

1. **Open**: https://dashboard.render.com
2. **Click**: Your backend service (e.g., `hezak-backend`)
3. **Click**: **Settings** (left sidebar)
4. **Click**: **Environment** (under Settings)

### 3.2 Add Environment Variables

Add **ALL** of these variables:

#### Required Variables:

1. **`FIREBASE_SERVICE_ACCOUNT`**
   - **Key**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: *(Paste your minified JSON from Step 2)*
   - **Example**: `{"type":"service_account","project_id":"hezak-f6fb3",...}`
   - **Important**: Must be on a single line!

2. **`USE_FIRESTORE`** (To use Firestore instead of SQLite)
   - **Key**: `USE_FIRESTORE`
   - **Value**: `true`
   - **Note**: Set to `true` to use Firestore, `false` (or omit) to use SQLite

3. **`USE_FIREBASE_STORAGE`** (To use Firebase Storage for images/videos)
   - **Key**: `USE_FIREBASE_STORAGE`
   - **Value**: `true`
   - **Note**: Set to `true` to store files in Firebase Storage

4. **`FIREBASE_STORAGE_BUCKET`** (If using Firebase Storage)
   - **Key**: `FIREBASE_STORAGE_BUCKET`
   - **Value**: `hezak-f6fb3.appspot.com` *(Your project ID + .appspot.com)*
   - **How to find**: Firebase Console → Storage → Files tab → Look at bucket name

#### Optional Variables:

5. **`FIREBASE_DATABASE_URL`** (Only if using Realtime Database)
   - **Key**: `FIREBASE_DATABASE_URL`
   - **Value**: `https://hezak-f6fb3-default-rtdb.firebaseio.com`
   - **Note**: Usually not needed if using Firestore

### 3.3 Save and Redeploy

1. **Click**: **Save Changes**
2. **Go to**: **Events** tab
3. **Click**: **Manual Deploy** → **Deploy latest commit**
4. **Wait**: 2-3 minutes for deployment

---

## ✅ Step 4: Verify Connection

### 4.1 Check Backend Logs

1. **Go to**: Render Dashboard → Your backend service
2. **Click**: **Logs** tab
3. **Look for**:
   - ✅ `✅ Firebase Admin initialized successfully`
   - ✅ `🔥 Using Firebase Firestore` (if `USE_FIRESTORE=true`)
   - ❌ **No errors** about `FIREBASE_SERVICE_ACCOUNT`

### 4.2 Test API Endpoints

```bash
# Test health endpoint
curl https://hezak-backend.onrender.com/health

# Test products endpoint (should return products from Firestore if enabled)
curl https://hezak-backend.onrender.com/api/products
```

### 4.3 Check Firebase Console

1. **Go to**: Firebase Console → Firestore Database
2. **Check**: Collections appear (products, categories, etc.)
3. **Verify**: Data is being stored

---

## 🔧 Step 5: Enable Firebase Storage (Optional)

If you want to store images/videos in Firebase Storage:

### 5.1 Enable Storage in Firebase Console

1. **Go to**: Firebase Console → **Storage**
2. **Click**: **Get Started**
3. **Choose**: Security rules (Start in production mode)
4. **Select**: Location for storage bucket
5. **Click**: **Done**

### 5.2 Update Storage Rules

1. **Go to**: Firebase Console → Storage → **Rules** tab
2. **Replace** with:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      // Allow public read access
      allow read: if true;
      // Allow write for authenticated users (admin)
      allow write: if request.auth != null;
    }
  }
}
```

3. **Click**: **Publish**

### 5.3 Add Environment Variables

Add to Render:
- `USE_FIREBASE_STORAGE=true`
- `FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com` *(Your bucket name)*

---

## 📊 Step 6: Migrate Data to Firestore (If Needed)

If you have existing data in SQLite and want to migrate to Firestore:

### 6.1 Run Migration Script

```bash
# On your local machine
cd backend
npm run migrate:firestore
```

This will:
- Copy all products from SQLite to Firestore
- Copy all categories to Firestore
- Copy all users, orders, banners to Firestore

### 6.2 Verify Migration

1. **Check**: Firebase Console → Firestore Database
2. **Verify**: Collections have data
3. **Test**: API endpoints return data

---

## 🎯 Quick Checklist

- [ ] Firebase project created
- [ ] Service account JSON downloaded
- [ ] JSON minified to single line
- [ ] `FIREBASE_SERVICE_ACCOUNT` added to Render
- [ ] `USE_FIRESTORE=true` added (if using Firestore)
- [ ] `USE_FIREBASE_STORAGE=true` added (if using Storage)
- [ ] `FIREBASE_STORAGE_BUCKET` added (if using Storage)
- [ ] Backend redeployed
- [ ] Logs show "Firebase Admin initialized successfully"
- [ ] API endpoints working
- [ ] Data visible in Firebase Console

---

## ⚠️ Troubleshooting

### Issue: "Firebase Admin not initialized"

**Solutions**:
1. Check `FIREBASE_SERVICE_ACCOUNT` is set in Render
2. Verify JSON is correctly formatted (single line, no line breaks)
3. Check JSON is valid (use JSON validator)
4. Restart backend service

### Issue: "Firestore database not initialized"

**Solutions**:
1. Verify `FIREBASE_SERVICE_ACCOUNT` is correct
2. Check Firebase project ID matches
3. Ensure service account has Firestore permissions

### Issue: "Cannot access Firebase Storage"

**Solutions**:
1. Verify Storage is enabled in Firebase Console
2. Check `FIREBASE_STORAGE_BUCKET` is correct
3. Verify Storage security rules allow access
4. Check service account has Storage permissions

### Issue: Data not showing in Firestore

**Solutions**:
1. Check `USE_FIRESTORE=true` is set
2. Verify migration script ran successfully
3. Check Firestore indexes (if using complex queries)
4. Verify data exists in SQLite (if migrating)

---

## 🔍 Verify Current Setup

### Check Environment Variables

In Render dashboard, verify you have:

```bash
FIREBASE_SERVICE_ACCOUNT={your-json-here}
USE_FIRESTORE=true
USE_FIREBASE_STORAGE=true
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
```

### Check Backend Logs

Look for these messages on startup:

```
✅ Firebase Admin initialized successfully
🔥 Using Firebase Firestore
✅ Image uploaded to Firebase Storage
```

---

## 📚 Additional Resources

- [Firebase Admin SDK Docs](https://firebase.google.com/docs/admin/setup)
- [Firestore Setup Guide](https://firebase.google.com/docs/firestore/quickstart)
- [Firebase Storage Setup](https://firebase.google.com/docs/storage/web/start)

---

## 🎉 Success!

Once you see `✅ Firebase Admin initialized successfully` in your logs, your backend is connected to Firebase!

**Next Steps**:
1. Test creating a product (should save to Firestore)
2. Test uploading an image (should save to Firebase Storage)
3. Verify data appears in Firebase Console

---

**Need Help?** Check the logs in Render dashboard for specific error messages.

