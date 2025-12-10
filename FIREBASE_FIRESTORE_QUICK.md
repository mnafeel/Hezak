# ⚡ Quick Setup: Firebase Firestore

## 🚀 Fast Steps (5 Minutes)

### Step 1: Enable Firestore

1. **Go to**: https://console.firebase.google.com
2. **Select**: `hezak-f6fb3` project
3. **Firestore Database** → **Create Database**
4. **Start in production mode**
5. **Choose location** (closest to you)
6. **Enable**

---

### Step 2: Get Service Account Key

1. **Firebase Console** → **Settings** (gear) → **Project settings**
2. **Service accounts** tab
3. **Generate new private key**
4. **Download** JSON file
5. **Copy** entire JSON content

---

### Step 3: Add to Render

1. **Render Dashboard** → Backend service → **Environment**
2. **Add**:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: *(Paste entire JSON as single line)*
3. **Save**

---

### Step 4: Update Backend Code

**Update**: `backend/src/utils/firebaseAdmin.ts`

```typescript
import admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | undefined;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Export Firestore
export const db = firebaseAdmin?.firestore();

export const verifyIdToken = async (idToken: string) => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized');
  }
  return await firebaseAdmin.auth().verifyIdToken(idToken);
};

export default firebaseAdmin;
```

---

### Step 5: Use Firestore in Services

**Example** (Products):

```typescript
import { db } from '../utils/firebaseAdmin';

export const listProducts = async (categorySlug?: string) => {
  if (!db) throw new Error('Firestore not initialized');
  
  let query = db.collection('products');
  
  if (categorySlug) {
    query = query.where('categorySlug', '==', categorySlug);
  }
  
  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));
};
```

---

## ✅ That's It!

**Firestore is now connected!** 🔥

**See**: `FIREBASE_DATABASE_SETUP.md` for detailed guide

---

**Note**: You'll need to migrate your SQLite data to Firestore or use both databases together.

