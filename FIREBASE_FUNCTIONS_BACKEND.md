# 🔥 Firebase Functions Backend Setup (Replace Render)

## Overview

This guide will help you:
- ✅ Move backend from **Render** to **Firebase Functions**
- ✅ Use **Firestore** as database
- ✅ Use **Firebase Storage** for files
- ✅ Deploy backend as serverless functions
- ✅ Connect frontend (Vercel) to Firebase Functions

---

## 📋 Architecture

```
Frontend (Vercel) → Firebase Functions → Firebase Services
├── Firestore Database
├── Firebase Storage
└── Firebase Authentication
```

---

## 🔥 Step 1: Install Firebase CLI

```bash
# Install Firebase CLI globally
npm install -g firebase-tools

# Login to Firebase
firebase login

# Verify installation
firebase --version
```

---

## 🚀 Step 2: Initialize Firebase Functions

### 2.1 Navigate to Project Root

```bash
cd "/Users/admin/Ecommerce Web hezak"
```

### 2.2 Initialize Firebase

```bash
firebase init
```

**Select**:
- ✅ Functions
- ✅ Firestore
- ✅ Storage (optional, but recommended)

**Configuration**:
- **Language**: TypeScript
- **ESLint**: Yes
- **Install dependencies**: Yes

This will create:
```
/functions
  /src
    index.ts
  package.json
  tsconfig.json
```

---

## 📦 Step 3: Move Backend Code to Functions

### 3.1 Copy Backend Files

The Firebase CLI creates a `functions/` directory. We need to move your Express.js backend code there.

**Option A: Use Express.js in Functions (Recommended)**

Firebase Functions can run Express.js apps!

### 3.2 Update functions/package.json

```json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
    "shell": "npm run build && firebase functions:shell",
    "start": "npm run shell",
    "deploy": "firebase deploy --only functions",
    "logs": "firebase functions:log"
  },
  "engines": {
    "node": "18"
  },
  "main": "lib/index.js",
  "dependencies": {
    "firebase-admin": "^13.6.0",
    "firebase-functions": "^5.1.1",
    "express": "^5.1.0",
    "cors": "^2.8.5",
    "dotenv": "^17.2.3",
    "bcrypt": "^6.0.0",
    "jsonwebtoken": "^9.0.2",
    "multer": "^2.0.2",
    "zod": "^4.1.12"
  },
  "devDependencies": {
    "typescript": "^5.9.3",
    "@types/express": "^5.0.5",
    "@types/cors": "^2.8.19",
    "@types/bcrypt": "^5.0.2",
    "@types/jsonwebtoken": "^9.0.10",
    "@types/multer": "^2.0.0"
  },
  "private": true
}
```

### 3.3 Create functions/src/index.ts

This will wrap your Express app in a Firebase Function:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';

// Initialize Firebase Admin
admin.initializeApp();

// Import your Express app
import { app } from '../backend/src/app';

// Create Express app wrapper
const api = express();

// Apply CORS
api.use(cors({ origin: true }));

// Mount your Express app
api.use('/', app);

// Export as Firebase Function
export const api = functions.https.onRequest(api);
```

**OR** better approach - copy your entire backend structure:

---

## 🔄 Step 4: Restructure for Firebase Functions

### Option 1: Copy Entire Backend to Functions (Recommended)

```bash
# From project root
cp -r backend/src functions/src/backend
cp backend/package.json functions/package.json
cp backend/tsconfig.json functions/tsconfig.json
```

### Option 2: Create New Structure

Create `functions/src/index.ts`:

```typescript
import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import express from 'express';
import cors from 'cors';
import { router } from './backend/routes';

// Initialize Firebase Admin
admin.initializeApp();

// Create Express app
const app = express();

// Middleware
app.use(cors({ origin: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// API routes
app.use('/api', router);

// Export as Firebase Function
export const api = functions
  .region('us-central1') // Choose your region
  .https.onRequest(app);
```

---

## 📝 Step 5: Update Firebase Admin Initialization

Since Firebase Functions automatically initializes Firebase Admin, update `functions/src/backend/src/utils/firebaseAdmin.ts`:

```typescript
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// In Firebase Functions, admin is already initialized
// Just get the instances
export const db = getFirestore();
export const storage = getStorage().bucket();

// For local development, you can still use service account
if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount as admin.ServiceAccount)
  });
} else {
  // In Firebase Functions, admin is auto-initialized
  // So we can just use it
  if (!admin.apps.length) {
    admin.initializeApp();
  }
}

export const verifyIdToken = async (idToken: string) => {
  try {
    const decodedToken = await admin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
};

export default admin;
```

---

## ⚙️ Step 6: Configure Firebase

### 6.1 Create firebase.json

```json
{
  "functions": {
    "source": "functions",
    "predeploy": [
      "npm --prefix \"$RESOURCE_DIR\" run build"
    ]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  },
  "storage": {
    "rules": "storage.rules"
  }
}
```

### 6.2 Create .firebaserc

```json
{
  "projects": {
    "default": "hezak-f6fb3"
  }
}
```

Replace `hezak-f6fb3` with your Firebase project ID.

---

## 🔧 Step 7: Update Environment Variables

Firebase Functions use `.env` files or Firebase Functions config.

### Option A: Firebase Functions Config (Recommended)

```bash
# Set config
firebase functions:config:set \
  admin.email="admin@example.com" \
  admin.password_hash="$2b$10$..." \
  jwt.secret="your-secret-key"

# Or use environment variables in functions/.env
```

### Option B: Use .env file

Create `functions/.env`:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=your-secret-key
USE_FIRESTORE=true
USE_FIREBASE_STORAGE=true
```

**Note**: Firebase Functions automatically has access to Firestore and Storage, no service account needed!

---

## 🚀 Step 8: Deploy to Firebase

### 8.1 Build Functions

```bash
cd functions
npm install
npm run build
```

### 8.2 Deploy

```bash
# From project root
firebase deploy --only functions
```

This will:
- Build your TypeScript code
- Deploy to Firebase Functions
- Give you a URL like: `https://us-central1-hezak-f6fb3.cloudfunctions.net/api`

---

## 🌐 Step 9: Update Frontend

### 9.1 Update Vercel Environment Variables

In Vercel dashboard → Your project → Settings → Environment Variables:

```bash
# Change from Render URL to Firebase Functions URL
VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api
```

### 9.2 Redeploy Frontend

Vercel will auto-deploy, or manually trigger:
```bash
vercel --prod
```

---

## ✅ Step 10: Verify Setup

### 10.1 Test Firebase Function

```bash
curl https://us-central1-hezak-f6fb3.cloudfunctions.net/api/health
```

**Expected**: `{"status":"ok","timestamp":"..."}`

### 10.2 Test Products Endpoint

```bash
curl https://us-central1-hezak-f6fb3.cloudfunctions.net/api/products
```

**Expected**: Array of products from Firestore

### 10.3 Check Firebase Console

1. **Go to**: Firebase Console → Functions
2. **Verify**: Function is deployed and running
3. **Check**: Logs for any errors

---

## 📊 Step 11: Update Database Config

Since you're using Firebase Functions, Firestore is automatically available. Update `functions/src/backend/src/config/database.ts`:

```typescript
// In Firebase Functions, always use Firestore
export const USE_FIRESTORE = true;

console.log('🔥 Using Firebase Firestore (Firebase Functions)');
```

---

## 🎯 Quick Migration Checklist

- [ ] Firebase CLI installed and logged in
- [ ] `firebase init` completed
- [ ] Backend code copied to `functions/`
- [ ] `functions/package.json` updated with dependencies
- [ ] `functions/src/index.ts` created (wraps Express app)
- [ ] Firebase Admin initialization updated
- [ ] `firebase.json` configured
- [ ] `.firebaserc` created with project ID
- [ ] Environment variables set
- [ ] Functions deployed: `firebase deploy --only functions`
- [ ] Frontend `VITE_API_URL` updated to Functions URL
- [ ] Frontend redeployed
- [ ] Tested API endpoints
- [ ] Verified in Firebase Console

---

## 🔍 Troubleshooting

### Issue: "Function failed to deploy"

**Solutions**:
1. Check `functions/package.json` has all dependencies
2. Verify TypeScript compiles: `cd functions && npm run build`
3. Check Firebase project ID in `.firebaserc`
4. Verify you're logged in: `firebase login`

### Issue: "Cannot find module"

**Solutions**:
1. Run `cd functions && npm install`
2. Check all imports are correct
3. Verify file paths in `functions/src/`

### Issue: "CORS errors"

**Solutions**:
1. Make sure CORS is enabled in Express app
2. Check Firebase Functions CORS settings
3. Verify frontend URL is allowed

### Issue: "Firestore not initialized"

**Solutions**:
1. In Firebase Functions, Firestore is auto-initialized
2. Just use `getFirestore()` without initialization
3. Check you're not trying to initialize admin twice

---

## 💰 Cost Comparison

### Render
- Free tier: Limited hours/month
- Paid: $7+/month

### Firebase Functions
- Free tier: 2 million invocations/month
- Pay-as-you-go: $0.40 per million invocations
- **Much cheaper for low-medium traffic!**

---

## 🎉 Benefits of Firebase Functions

1. ✅ **Serverless** - No server management
2. ✅ **Auto-scaling** - Handles traffic spikes
3. ✅ **Integrated** - Direct access to Firestore/Storage
4. ✅ **Cost-effective** - Pay only for what you use
5. ✅ **Fast deployment** - Deploy in seconds
6. ✅ **No downtime** - Zero-downtime deployments

---

## 📚 Next Steps

1. ✅ Deploy functions
2. ✅ Update frontend URL
3. ✅ Test all endpoints
4. ✅ Monitor Firebase Console
5. ✅ Set up billing alerts (if needed)

---

**Your new architecture**: Frontend (Vercel) → Firebase Functions → Firestore/Storage! 🔥

