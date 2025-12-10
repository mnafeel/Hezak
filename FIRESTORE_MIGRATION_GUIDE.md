# 🔥 Complete Firestore Migration Guide

## 📋 Overview

This guide will help you migrate all data from SQLite to Firebase Firestore.

---

## ✅ Step 1: Add Firebase Service Account

1. **Go to**: Render Dashboard → Backend service → Settings → Environment
2. **Add**: `FIREBASE_SERVICE_ACCOUNT` (your Firebase JSON)
3. **Save** → **Redeploy**

---

## 🔄 Step 2: Run Migration Script

### Option A: Run Locally (Recommended for Testing)

```bash
cd backend
npm run migrate:firestore
```

This will:
- ✅ Migrate all categories
- ✅ Migrate all products
- ✅ Migrate all users
- ✅ Migrate all orders
- ✅ Migrate all banners

### Option B: Run on Render

1. **SSH into Render** (if available)
2. **Or**: Add migration to build command temporarily

---

## 🎯 Step 3: Enable Firestore

After migration, enable Firestore:

1. **Go to**: Render Dashboard → Backend service → Settings → Environment
2. **Add**: `USE_FIRESTORE=true`
3. **Save** → **Redeploy**

---

## ✅ Step 4: Verify Migration

### Test Products API:
```bash
curl https://hezak-backend.onrender.com/api/products
```

### Check Firestore Console:
1. Go to: https://console.firebase.google.com
2. Select: `hezak-f6fb3` project
3. **Firestore Database** → Check collections

---

## 📝 Current Status

### ✅ Completed:
- Firestore utilities (`backend/src/utils/firestore.ts`)
- Product service (Firestore) (`backend/src/services/firestore/productService.ts`)
- Database config (`backend/src/config/database.ts`)
- Product controller (supports both Prisma and Firestore)
- Migration script (`backend/scripts/migrate-to-firestore.ts`)

### ⏳ In Progress:
- Category service (Firestore)
- User service (Firestore)
- Order service (Firestore)
- Banner service (Firestore)

---

## 🔧 How It Works

### Database Switching:

The system uses `USE_FIRESTORE` environment variable:

- **`USE_FIRESTORE=false`** (default): Uses SQLite (Prisma)
- **`USE_FIRESTORE=true`**: Uses Firebase Firestore

### Service Layer:

Each service has two versions:
- `backend/src/services/productService.ts` (Prisma)
- `backend/src/services/firestore/productService.ts` (Firestore)

The controller automatically selects the correct service based on `USE_FIRESTORE`.

---

## ⚠️ Important Notes

1. **Both systems can coexist** during migration
2. **Test thoroughly** before switching
3. **Backup data** before migration
4. **Migration is one-way** (SQLite → Firestore)

---

## 🚀 Quick Start

1. **Add** `FIREBASE_SERVICE_ACCOUNT` to Render
2. **Redeploy** backend
3. **Run** migration script: `npm run migrate:firestore`
4. **Add** `USE_FIRESTORE=true` to Render
5. **Redeploy** backend
6. **Test** all endpoints

---

## 📊 Migration Checklist

- [ ] Firebase service account added
- [ ] Backend redeployed
- [ ] Migration script run
- [ ] Data verified in Firestore console
- [ ] `USE_FIRESTORE=true` added
- [ ] Backend redeployed with Firestore
- [ ] All endpoints tested
- [ ] Frontend tested

---

**Ready to migrate? Follow the steps above!** 🔥

