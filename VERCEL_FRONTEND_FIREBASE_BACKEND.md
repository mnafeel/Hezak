# 🚀 Vercel Frontend + Firebase Backend Setup Guide

## Overview

This guide will help you:
- ✅ Deploy frontend to **Vercel**
- ✅ Use **Firebase** for backend (Firestore, Storage, Functions)
- ✅ Connect frontend to Firebase services

---

## 📋 Architecture

```
Frontend (Vercel) → Firebase Services
├── Firestore Database (Products, Categories, Orders, Users, Banners)
├── Firebase Storage (Images, Videos)
├── Firebase Authentication (Google Login)
└── Firebase Functions (Optional - for serverless API)
```

---

## 🔥 Part 1: Firebase Backend Setup

### Step 1: Initialize Firebase Admin SDK

Your backend already has Firebase Admin setup. Here's how to configure it:

#### Option A: Using Environment Variable (Recommended for Vercel/Render)

```typescript
// backend/src/utils/firebaseAdmin.ts
import * as admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | null = null;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    // Parse JSON from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
      storageBucket: process.env.FIREBASE_STORAGE_BUCKET // e.g., 'hezak-f6fb3.appspot.com'
    });
    console.log('✅ Firebase Admin initialized successfully');
  } else {
    console.warn('⚠️ Firebase Admin not initialized. Set FIREBASE_SERVICE_ACCOUNT environment variable.');
  }
} catch (error) {
  console.error('❌ Firebase Admin initialization error:', error);
}

export const db = firebaseAdmin ? admin.firestore() : null;
export const storage = firebaseAdmin ? admin.storage() : null;
export default firebaseAdmin;
```

#### Option B: Using Service Account File (Local Development)

```typescript
// For local development only
import * as admin from 'firebase-admin';
import * as serviceAccount from './path/to/serviceAccountKey.json';

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
});
```

**⚠️ Important**: Never commit `serviceAccountKey.json` to Git! Use environment variables in production.

---

### Step 2: Get Firebase Service Account JSON

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: Your project
3. **Click**: ⚙️ **Project Settings** → **Service Accounts**
4. **Click**: **Generate new private key**
5. **Download**: The JSON file

### Step 3: Format JSON for Environment Variable

1. **Open**: https://jsonformatter.org/minify
2. **Paste**: Your Firebase JSON
3. **Click**: **Minify**
4. **Copy**: The single-line JSON

---

## 🌐 Part 2: Deploy Backend to Render (or Firebase Functions)

### Option A: Render (Current Setup)

1. **Go to**: https://dashboard.render.com
2. **Select**: Your backend service
3. **Settings** → **Environment**
4. **Add Variables**:

```bash
FIREBASE_SERVICE_ACCOUNT={your-minified-json}
USE_FIRESTORE=true
USE_FIREBASE_STORAGE=true
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
```

5. **Redeploy**

### Option B: Firebase Functions (Serverless)

If you want to use Firebase Functions instead:

1. **Install Firebase CLI**:
```bash
npm install -g firebase-tools
firebase login
```

2. **Initialize Functions**:
```bash
cd backend
firebase init functions
```

3. **Deploy**:
```bash
firebase deploy --only functions
```

---

## ⚡ Part 3: Deploy Frontend to Vercel

### Step 1: Prepare Frontend

1. **Make sure** `frontend/` directory has:
   - `package.json`
   - `vite.config.ts`
   - All source files

### Step 2: Connect to Vercel

1. **Go to**: https://vercel.com
2. **Click**: **Add New Project**
3. **Import**: Your GitHub repository
4. **Configure**:
   - **Framework Preset**: Vite
   - **Root Directory**: `frontend`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 3: Add Environment Variables

In Vercel dashboard → Your project → **Settings** → **Environment Variables**:

```bash
# Backend API URL (if using Render backend)
VITE_API_URL=https://hezak-backend.onrender.com/api

# OR if using Firebase Functions
VITE_API_URL=https://your-region-hezak-f6fb3.cloudfunctions.net/api

# Firebase Config (for frontend Firebase SDK)
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=hezak-f6fb3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hezak-f6fb3
VITE_FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

**How to get Firebase config**:
1. Firebase Console → Project Settings → General
2. Scroll to "Your apps" → Web app
3. Copy the config values

---

## 🔧 Part 4: Configure Frontend to Use Firebase

### Step 1: Initialize Firebase Client SDK (Frontend)

Create `frontend/src/lib/firebase.ts`:

```typescript
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
```

### Step 2: Update API Client

If using Firebase directly from frontend (without backend API):

```typescript
// frontend/src/lib/api.ts
import { db } from './firebase';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';

export const fetchProducts = async () => {
  const productsRef = collection(db, 'products');
  const snapshot = await getDocs(productsRef);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
```

**OR** if using backend API (current setup):

```typescript
// frontend/src/lib/apiClient.ts
const API_BASE_URL = import.meta.env.VITE_API_URL || 
  (import.meta.env.PROD 
    ? 'https://hezak-backend.onrender.com/api' 
    : '/api');
```

---

## 📝 Part 5: Environment Variables Summary

### Backend (Render)

```bash
# Firebase
FIREBASE_SERVICE_ACCOUNT={minified-json}
USE_FIRESTORE=true
USE_FIREBASE_STORAGE=true
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com

# Server
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./dev.db
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=your-secret-key
```

### Frontend (Vercel)

```bash
# Backend API
VITE_API_URL=https://hezak-backend.onrender.com/api

# Firebase (if using Firebase SDK directly)
VITE_FIREBASE_API_KEY=AIza...
VITE_FIREBASE_AUTH_DOMAIN=hezak-f6fb3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=hezak-f6fb3
VITE_FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef
```

---

## ✅ Part 6: Verify Setup

### Check Backend Logs (Render)

Look for:
```
✅ Firebase Admin initialized successfully
🔥 Using Firebase Firestore
```

### Check Frontend (Vercel)

1. **Visit**: Your Vercel URL
2. **Open**: Browser console
3. **Check**: No Firebase errors
4. **Test**: Create a product (should save to Firestore)

### Check Firebase Console

1. **Go to**: Firebase Console → Firestore Database
2. **Verify**: Collections exist (products, categories, etc.)
3. **Check**: Data is being stored

---

## 🎯 Quick Start Checklist

### Backend Setup
- [ ] Firebase project created
- [ ] Service account JSON downloaded
- [ ] JSON minified to single line
- [ ] Environment variables added to Render
- [ ] Backend redeployed
- [ ] Logs show "Firebase Admin initialized"

### Frontend Setup
- [ ] Frontend deployed to Vercel
- [ ] Environment variables added to Vercel
- [ ] `VITE_API_URL` points to backend
- [ ] Firebase config added (if using Firebase SDK)
- [ ] Frontend redeployed
- [ ] Tested on Vercel URL

---

## 🔄 Current Architecture

```
┌─────────────────┐
│  Frontend       │
│  (Vercel)       │
│                 │
│  React App      │
└────────┬────────┘
         │
         │ HTTP Requests
         │
┌────────▼────────┐
│  Backend API    │
│  (Render)       │
│                 │
│  Express.js     │
└────────┬────────┘
         │
         │ Firebase Admin SDK
         │
┌────────▼────────┐
│  Firebase       │
│                 │
│  • Firestore    │
│  • Storage      │
│  • Auth         │
└─────────────────┘
```

---

## ⚠️ Important Notes

1. **Never commit** `serviceAccountKey.json` to Git
2. **Always use** environment variables in production
3. **Minify JSON** before adding to environment variables
4. **Test locally** before deploying
5. **Check logs** after deployment

---

## 🚀 Deploy Commands

### Backend (Render)
- Auto-deploys on Git push
- Or manual deploy from Render dashboard

### Frontend (Vercel)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
cd frontend
vercel

# Or connect GitHub repo for auto-deploy
```

---

## 📚 Next Steps

1. ✅ Set up Firebase backend
2. ✅ Deploy frontend to Vercel
3. ✅ Configure environment variables
4. ✅ Test end-to-end
5. ✅ Monitor logs for errors

---

**Your setup**: Frontend on Vercel → Backend on Render → Firebase for data storage! 🎉

