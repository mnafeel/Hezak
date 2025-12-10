# 🔥 Firebase Firestore Setup - Step by Step

## 🚀 Complete Setup Guide

---

## ✅ Step 1: Enable Firestore in Firebase Console

### 1.1 Go to Firebase Console

1. **Open**: https://console.firebase.google.com
2. **Select** your project: `hezak-f6fb3`
3. **Click**: **Firestore Database** (left sidebar)

### 1.2 Create Database

1. **Click**: **"Create database"** button
2. **Choose**: **"Start in production mode"** (or test mode for development)
3. **Select location**: Choose closest to you (e.g., `us-central`, `asia-south1`)
4. **Click**: **"Enable"**
5. **Wait** for database to be created (1-2 minutes)

---

## ✅ Step 2: Get Service Account JSON

### 2.1 Go to Project Settings

1. **Firebase Console** → **Settings** (gear icon) → **Project settings**
2. **Go to**: **Service accounts** tab
3. **Click**: **"Generate new private key"** button
4. **Click**: **"Generate key"** in popup
5. **Download** the JSON file

### 2.2 Format JSON for Render

**The JSON file will be multi-line. You need to make it single-line:**

**Option A: Use Online Tool** (Easiest)
1. **Go to**: https://jsonformatter.org/minify
2. **Paste** your JSON
3. **Click**: "Minify"
4. **Copy** the result

**Option B: Manual**
- Remove all line breaks
- Keep all quotes
- Should be one long line

**Example format**:
```
{"type":"service_account","project_id":"hezak-f6fb3","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}
```

---

## ✅ Step 3: Add to Render

### 3.1 Go to Render Dashboard

1. **Open**: https://render.com
2. **Find** your `hezak-backend` service
3. **Click**: **Settings** → **Environment**

### 3.2 Add Environment Variable

1. **Click**: **"Add Environment Variable"**
2. **Name**: `FIREBASE_SERVICE_ACCOUNT`
3. **Value**: *(Paste the single-line JSON from Step 2)*
4. **Environment**: Select **All** (Production, Preview, Development)
5. **Click**: **"Save Changes"**

---

## ✅ Step 4: Update Backend Code (Optional)

**The backend already has Firestore support!** ✅

**You can now use Firestore in your services**:

```typescript
import { db } from '../utils/firebaseAdmin';

// Example: Get products from Firestore
const productsRef = db.collection('products');
const snapshot = await productsRef.get();
const products = snapshot.docs.map(doc => ({
  id: doc.id,
  ...doc.data()
}));
```

---

## ✅ Step 5: Redeploy Backend

1. **Render** will auto-detect the new environment variable
2. **Or** manually trigger deploy:
   - **Render Dashboard** → Backend service
   - **Manual Deploy** → **Deploy latest commit**

---

## ✅ Step 6: Verify Firestore is Working

### Check Render Logs

1. **Render Dashboard** → Backend service → **Logs**
2. **Look for**:
   - ✅ "Firebase Admin initialized" = Success
   - ❌ "Firebase Admin not initialized" = Check JSON format

### Test Firestore Connection

**You can test by creating a simple endpoint**:

```typescript
// In a controller
import { db } from '../utils/firebaseAdmin';

app.get('/test-firestore', async (req, res) => {
  if (!db) {
    return res.json({ error: 'Firestore not initialized' });
  }
  
  try {
    const testRef = db.collection('test');
    await testRef.doc('test1').set({ message: 'Hello Firestore!' });
    res.json({ success: true, message: 'Firestore is working!' });
  } catch (error) {
    res.json({ error: error.message });
  }
});
```

---

## 📝 Firestore Collections Structure

**Recommended collections**:

```
products/
  {productId}/
    name: string
    description: string
    price: number
    imageUrl: string
    ...

categories/
  {categoryId}/
    name: string
    slug: string
    ...

orders/
  {orderId}/
    customer: {...}
    items: [...]
    ...

users/
  {userId}/
    name: string
    email: string
    ...

banners/
  {bannerId}/
    title: string
    imageUrl: string
    ...
```

---

## 🔄 Migrate from SQLite to Firestore

### Option 1: Keep Both (Hybrid)

- **SQLite**: Main database (current)
- **Firestore**: Real-time features, analytics, caching

### Option 2: Full Migration

1. **Export** data from SQLite
2. **Import** to Firestore
3. **Update** all services to use Firestore
4. **Remove** SQLite dependency

---

## ⚠️ Important Notes

### Firestore vs SQLite:

| Feature | SQLite | Firestore |
|---------|--------|-----------|
| **Cost** | Free | Free tier: 50K reads/day |
| **Real-time** | No | Yes ✅ |
| **Scalability** | Limited | High ✅ |
| **Queries** | SQL | Limited |
| **Offline** | Yes | Yes |

### Cost:
- **Free tier**: 50K reads/day, 20K writes/day
- **Paid**: $0.06 per 100K reads

---

## ✅ Quick Checklist

- [ ] Firestore enabled in Firebase Console
- [ ] Service account JSON downloaded
- [ ] JSON formatted as single line
- [ ] `FIREBASE_SERVICE_ACCOUNT` added to Render
- [ ] Backend redeployed
- [ ] Firestore connection verified in logs

---

## 🚀 Next Steps

1. **Enable Firestore** in Firebase Console
2. **Get service account** JSON
3. **Add to Render** as environment variable
4. **Redeploy** backend
5. **Test** Firestore connection

---

**Follow these steps to connect Firebase Firestore!** 🔥

