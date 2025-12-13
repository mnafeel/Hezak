# 🚀 Quick Start: Move Backend to Firebase Functions

## Step-by-Step Migration

### 1. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 2. Initialize Firebase in Your Project

```bash
cd "/Users/admin/Ecommerce Web hezak"
firebase init
```

**Select**:
- ✅ Functions
- ✅ Firestore
- ✅ Storage

**Choose**:
- TypeScript
- Yes to ESLint
- Yes to install dependencies

### 3. Copy Backend Code

```bash
# Copy backend source to functions
cp -r backend/src functions/src/backend

# Copy package.json dependencies
# (We'll update functions/package.json manually)
```

### 4. Update functions/package.json

Add all your backend dependencies to `functions/package.json`:

```json
{
  "name": "functions",
  "scripts": {
    "build": "tsc",
    "serve": "npm run build && firebase emulators:start --only functions",
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

### 5. Create functions/src/index.ts

I've already created this file - it wraps your Express app in a Firebase Function.

### 6. Update Firebase Admin Init

In `functions/src/backend/src/utils/firebaseAdmin.ts`, change to:

```typescript
import * as admin from 'firebase-admin';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';

// In Firebase Functions, admin is auto-initialized
if (!admin.apps.length) {
  admin.initializeApp();
}

export const db = getFirestore();
export const storage = getStorage().bucket();

export const verifyIdToken = async (idToken: string) => {
  try {
    return await admin.auth().verifyIdToken(idToken);
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
};

export default admin;
```

### 7. Update Database Config

In `functions/src/backend/src/config/database.ts`:

```typescript
// Always use Firestore in Firebase Functions
export const USE_FIRESTORE = true;
console.log('🔥 Using Firebase Firestore (Firebase Functions)');
```

### 8. Create firebase.json

```json
{
  "functions": {
    "source": "functions",
    "predeploy": ["npm --prefix \"$RESOURCE_DIR\" run build"]
  },
  "firestore": {
    "rules": "firestore.rules",
    "indexes": "firestore.indexes.json"
  }
}
```

### 9. Create .firebaserc

```json
{
  "projects": {
    "default": "hezak-f6fb3"
  }
}
```

### 10. Set Environment Variables

```bash
firebase functions:config:set \
  admin.email="admin@example.com" \
  admin.password_hash="$2b$10$..." \
  jwt.secret="your-secret-key"
```

### 11. Deploy

```bash
cd functions
npm install
npm run build
cd ..
firebase deploy --only functions
```

### 12. Update Frontend

In Vercel, set:
```
VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api
```

---

## That's It! 🎉

Your backend is now on Firebase Functions instead of Render!

