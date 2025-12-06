# 🔧 Fix Database Issue on Render

## ⚠️ Problem

Error: `The table main.Product does not exist in the current database.`

This means the database hasn't been initialized on Render.

---

## ✅ Solution: Run Prisma Migrations

### Option 1: Update Build Command (Recommended)

**In Render Dashboard**:
1. **Go to**: Your service → **Settings**
2. **Build Command**: Update to:
   ```
   npm install && npm run prisma:generate && npx prisma migrate deploy && npm run build
   ```

**OR** if using `render.yaml`, it's already updated.

---

### Option 2: Manual Migration

**In Render Dashboard**:
1. **Go to**: Your service → **Shell**
2. **Run**:
   ```bash
   npx prisma migrate deploy
   ```

---

### Option 3: Use Prisma DB Push (For Development)

**In Render Shell**:
```bash
npx prisma db push
```

This will create the database schema without migrations.

---

## 🚀 Quick Fix

**Update build command in Render**:

1. **Render Dashboard** → Your service → **Settings**
2. **Build Command**:
   ```
   npm install && npm run prisma:generate && npx prisma db push && npm run build
   ```
3. **Save** and **Redeploy**

---

## ✅ After Fix

**Test**:
```
https://hezak-backend.onrender.com/api/products
```

**Should return**: Array of products (or empty array `[]`)

---

**The database needs to be initialized on Render!** 🚀

