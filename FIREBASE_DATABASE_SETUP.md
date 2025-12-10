# 🔥 Connect Firebase Database (Firestore) to Your Backend

## 📋 Overview

You can use **Firebase Firestore** (NoSQL database) instead of or alongside SQLite.

---

## ✅ Option 1: Use Firestore for All Data (Replace SQLite)

### Step 1: Install Firebase Admin SDK (Already Installed)

Your backend already has `firebase-admin` installed! ✅

### Step 2: Initialize Firestore in Backend

**Create**: `backend/src/utils/firebaseAdmin.ts` (update existing)

```typescript
import admin from 'firebase-admin';

let firebaseAdmin: admin.app.App | undefined;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT);
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    firebaseAdmin = admin.initializeApp({
      credential: admin.credential.applicationDefault()
    });
  } else {
    console.warn('Firebase Admin not initialized.');
  }
} catch (error) {
  console.error('Firebase Admin initialization error:', error);
}

// Get Firestore instance
export const db = firebaseAdmin?.firestore();

export const verifyIdToken = async (idToken: string) => {
  if (!firebaseAdmin) {
    throw new Error('Firebase Admin not initialized');
  }
  
  try {
    const decodedToken = await firebaseAdmin.auth().verifyIdToken(idToken);
    return decodedToken;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Invalid ID token');
  }
};

export default firebaseAdmin;
```

### Step 3: Get Firebase Service Account

1. **Go to**: https://console.firebase.google.com
2. **Select** your project: `hezak-f6fb3`
3. **Settings** (gear icon) → **Project settings**
4. **Service accounts** tab
5. **Generate new private key**
6. **Download** JSON file

### Step 4: Add to Render Environment Variables

1. **Render Dashboard** → Backend service → **Environment**
2. **Add**:
   - **Name**: `FIREBASE_SERVICE_ACCOUNT`
   - **Value**: *(Paste entire JSON content from downloaded file)*
   - **Format**: Single-line JSON string

**Example**:
```
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"hezak-f6fb3",...}
```

### Step 5: Create Firestore Collections

**Collections needed**:
- `products`
- `categories`
- `orders`
- `users`
- `banners`

### Step 6: Update Services to Use Firestore

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

## ✅ Option 2: Use Firestore for Specific Data (Hybrid)

Keep SQLite for main data, use Firestore for:
- Real-time updates
- Analytics
- User preferences
- Caching

---

## ✅ Option 3: Use Firebase Realtime Database

### Step 1: Enable Realtime Database

1. **Firebase Console** → **Realtime Database**
2. **Create Database**
3. **Choose location**
4. **Start in test mode** (or set rules)

### Step 2: Update Backend

```typescript
import admin from 'firebase-admin';

const firebaseAdmin = admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const realtimeDb = firebaseAdmin.database();
```

---

## 🔧 Quick Setup (Recommended: Firestore)

### Step 1: Enable Firestore

1. **Firebase Console** → **Firestore Database**
2. **Create Database**
3. **Start in production mode** (or test mode for development)
4. **Choose location** (closest to you)

### Step 2: Set Up Service Account

1. **Firebase Console** → **Project Settings** → **Service Accounts**
2. **Generate new private key**
3. **Download** JSON file
4. **Add to Render** as `FIREBASE_SERVICE_ACCOUNT` environment variable

### Step 3: Update Backend Code

**Replace Prisma with Firestore** in services:

```typescript
// Instead of:
const products = await prisma.product.findMany();

// Use:
const snapshot = await db.collection('products').get();
const products = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

---

## 📝 Firestore Security Rules

**Set up in Firebase Console**:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Products - public read, admin write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Categories - public read, admin write
    match /categories/{categoryId} {
      allow read: if true;
      allow write: if request.auth != null && 
        request.auth.token.admin == true;
    }
    
    // Orders - users can read their own, admin can read all
    match /orders/{orderId} {
      allow read: if request.auth != null && 
        (request.auth.uid == resource.data.userId || 
         request.auth.token.admin == true);
      allow create: if request.auth != null;
    }
    
    // Users - users can read their own, admin can read all
    match /users/{userId} {
      allow read: if request.auth != null && 
        (request.auth.uid == userId || 
         request.auth.token.admin == true);
      allow write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

---

## 🔄 Migration from SQLite to Firestore

### Step 1: Export SQLite Data

```bash
cd backend
npx prisma studio
# Export data manually or use script
```

### Step 2: Import to Firestore

**Create migration script**:

```typescript
import { db } from './utils/firebaseAdmin';
import { prisma } from './utils/prisma';

async function migrateToFirestore() {
  // Export from SQLite
  const products = await prisma.product.findMany();
  
  // Import to Firestore
  const batch = db.batch();
  products.forEach(product => {
    const ref = db.collection('products').doc(product.id.toString());
    batch.set(ref, {
      name: product.name,
      description: product.description,
      price: product.priceCents,
      // ... other fields
    });
  });
  
  await batch.commit();
  console.log('Migration complete!');
}
```

---

## ⚠️ Important Considerations

### Firestore vs SQLite:

| Feature | SQLite | Firestore |
|---------|--------|-----------|
| **Cost** | Free | Pay per read/write |
| **Scalability** | Limited | Highly scalable |
| **Real-time** | No | Yes |
| **Offline** | Yes | Yes (with SDK) |
| **Queries** | SQL | Limited queries |
| **Relations** | Easy | Manual (NoSQL) |

### Cost:
- **Free tier**: 50K reads/day, 20K writes/day
- **Paid**: $0.06 per 100K reads, $0.18 per 100K writes

---

## 🚀 Recommended Approach

**For your e-commerce site**:

1. **Keep SQLite** for now (it's working fine)
2. **Add Firestore** for:
   - Real-time inventory updates
   - Analytics
   - User preferences
   - Caching popular products

**OR** migrate fully to Firestore if you need:
- Real-time updates
- High scalability
- Multi-region support

---

## 📚 Resources

- **Firestore Docs**: https://firebase.google.com/docs/firestore
- **Admin SDK**: https://firebase.google.com/docs/admin/setup
- **Security Rules**: https://firebase.google.com/docs/firestore/security/get-started

---

**Firebase Firestore is great for real-time features and scalability!** 🔥

