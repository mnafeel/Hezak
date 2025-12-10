# Firebase Storage Setup Guide

## Why Firebase Storage?

Images and videos uploaded to the server are currently stored in the local `uploads` directory. On Render (and most cloud platforms), this directory is **ephemeral** - meaning all files are deleted when the server restarts or redeploys.

Firebase Storage provides **persistent cloud storage** that survives server restarts.

## Setup Steps

### 1. Enable Firebase Storage

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project (`hezak-f6fb3`)
3. Click **Storage** in the left menu
4. Click **Get Started**
5. Choose **Start in production mode** (or test mode if you want public access)
6. Select a location (choose the same region as your Firestore)
7. Click **Done**

### 2. Configure Storage Rules

1. In Firebase Console, go to **Storage** > **Rules**
2. Update the rules to allow public read access (for product images):

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{allPaths=**} {
      allow read: if true; // Public read access
      allow write: if request.auth != null; // Only authenticated users can write
    }
  }
}
```

3. Click **Publish**

### 3. Enable Firebase Storage in Backend

Add this environment variable to your Render backend:

**Variable Name:** `USE_FIREBASE_STORAGE`  
**Value:** `true`

The same `FIREBASE_SERVICE_ACCOUNT` environment variable used for Firestore will also work for Storage (no additional setup needed).

### 4. Test the Setup

1. Restart your backend server on Render
2. Upload an image through the admin panel
3. Check the console logs - you should see: `✅ Image uploaded to Firebase Storage: https://storage.googleapis.com/...`
4. The image URL should be a Firebase Storage URL, not a local server URL

## How It Works

- **When `USE_FIREBASE_STORAGE=true`**: Images are uploaded to Firebase Storage and get a permanent URL
- **When `USE_FIREBASE_STORAGE=false` or not set**: Images are stored locally (will be lost on restart)

## Benefits

✅ **Persistent Storage**: Images survive server restarts  
✅ **CDN**: Fast global delivery via Google Cloud CDN  
✅ **Scalable**: No storage limits (within Firebase quotas)  
✅ **Secure**: Access control via Firebase Security Rules  

## Migration

Existing products with local image URLs will continue to work, but new uploads will use Firebase Storage. To migrate existing images:

1. Download images from your current server
2. Re-upload them through the admin panel (they'll be stored in Firebase Storage)
3. Or write a migration script to upload existing images to Firebase Storage

## Troubleshooting

**Error: "Firebase Storage not initialized"**
- Make sure `FIREBASE_SERVICE_ACCOUNT` is set correctly
- Check that Firebase Storage is enabled in your Firebase project

**Error: "Permission denied"**
- Check Firebase Storage security rules
- Make sure the service account has Storage Admin permissions

**Images not showing after upload**
- Check the returned URL - it should be a `storage.googleapis.com` URL
- Verify the file was uploaded in Firebase Console > Storage
- Check browser console for CORS errors (shouldn't happen with Firebase Storage)

