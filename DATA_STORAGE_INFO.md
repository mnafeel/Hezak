# 📊 Where Your Data is Stored

## 🗄️ Current Database Configuration

### **Database Type**: SQLite
### **Location**: `backend/prisma/dev.db` (local) or Render server (production)

---

## 📍 Local Development

**Database File**: `backend/prisma/dev.db`

**Location**: 
```
/Users/admin/Ecommerce Web hezak/backend/prisma/dev.db
```

**This file contains**:
- All products
- All categories
- All orders
- All users
- All banners
- All settings

---

## ☁️ Production (Render)

**Database**: SQLite file on Render server

**Location**: 
- Stored on Render's filesystem
- Path: `backend/prisma/dev.db` (on Render server)
- **Persists** between deployments
- **Backed up** automatically by Render

**Environment Variable**:
```
DATABASE_URL=file:./dev.db
```

---

## ⚠️ Important Notes

### SQLite Limitations:
- ✅ **Works** for small to medium apps
- ⚠️ **Not ideal** for high traffic
- ⚠️ **File-based** (not distributed)
- ⚠️ **Single server** only

### Data Persistence:
- ✅ **Data persists** on Render (file system)
- ✅ **Survives** deployments
- ⚠️ **Lost** if service is deleted
- ⚠️ **No automatic backups** (manual backup needed)

---

## 🔄 Upgrade to PostgreSQL (Recommended)

### Why Upgrade?
- ✅ **Better** for production
- ✅ **Scalable** (handles more traffic)
- ✅ **Automatic backups**
- ✅ **Multiple connections**
- ✅ **Better performance**

### How to Upgrade on Render:

1. **Create PostgreSQL Database**:
   - Render Dashboard → **New +** → **PostgreSQL**
   - Name: `hezak-db`
   - Plan: **Free** (or paid)

2. **Get Connection String**:
   - Copy **Internal Database URL**
   - Format: `postgresql://user:pass@host:port/dbname`

3. **Update Environment Variable**:
   - Render → Backend Service → **Environment**
   - Update `DATABASE_URL` to PostgreSQL URL

4. **Update Prisma Schema**:
   ```prisma
   datasource db {
     provider = "postgresql"  // Change from "sqlite"
     url      = env("DATABASE_URL")
   }
   ```

5. **Run Migrations**:
   ```bash
   npx prisma migrate deploy
   ```

6. **Redeploy** backend

---

## 📦 Current Data Location

### Local:
```
backend/prisma/dev.db
```

### Production (Render):
```
Render Server → backend/prisma/dev.db
```

---

## 🔍 Check Your Data

### Local:
```bash
cd backend
npx prisma studio
```
Opens Prisma Studio at `http://localhost:5555`

### Production:
- **Render Dashboard** → Your service → **Logs**
- **Or** use admin panel to view data

---

## 💾 Backup Your Data

### Option 1: Download from Render

1. **Render Dashboard** → Your service
2. **Shell** → Download `dev.db` file

### Option 2: Export via API

Use admin panel to export data

### Option 3: Use Prisma Studio

Connect to production database and export

---

## 📝 Summary

**Current Storage**:
- **Type**: SQLite
- **Local**: `backend/prisma/dev.db`
- **Production**: Render server filesystem
- **Persists**: Yes (survives deployments)

**Recommendation**: Upgrade to PostgreSQL for production

---

**Your data is stored in SQLite database files!** 📊

