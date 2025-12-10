# 🧹 Clean Up Environment Variables

## 📋 Current Required Environment Variables

### ✅ Keep These (Required):

1. **`NODE_ENV`** = `production`
   - **Why**: Tells Node.js it's production
   - **Keep**: ✅ Yes

2. **`PORT`** = `4000`
   - **Why**: Server port (Render auto-sets this, but good to have)
   - **Keep**: ✅ Yes

3. **`DATABASE_URL`** = `file:./dev.db`
   - **Why**: SQLite database location
   - **Keep**: ✅ Yes (if using SQLite)

4. **`ADMIN_EMAIL`** = `admin@hezak.com`
   - **Why**: Admin login email
   - **Keep**: ✅ Yes

5. **`ADMIN_PASSWORD_HASH`** = `$2b$10$...`
   - **Why**: Admin password hash
   - **Keep**: ✅ Yes

6. **`JWT_SECRET`** = `a159c9fb...`
   - **Why**: JWT token signing
   - **Keep**: ✅ Yes

### 🔥 Optional (If Using Firebase):

7. **`FIREBASE_SERVICE_ACCOUNT`** = `{...}`
   - **Why**: Firebase Admin SDK credentials
   - **Keep**: ✅ Only if using Firebase

8. **`GOOGLE_APPLICATION_CREDENTIALS`** = `path/to/file.json`
   - **Why**: Alternative Firebase credentials
   - **Keep**: ⚠️ Only if using this method (not recommended)

---

## 🗑️ Remove These (If Present):

### Old/Unused Variables:

- ❌ Any old database URLs
- ❌ Duplicate JWT secrets
- ❌ Old admin credentials
- ❌ Test/development variables
- ❌ Unused API keys

---

## 🧹 How to Clean Up in Render

### Step 1: Go to Environment Variables

1. **Render Dashboard** → Backend service
2. **Settings** → **Environment**

### Step 2: Review Each Variable

**Check each variable**:
- ✅ **Keep**: Required for app to work
- ❌ **Remove**: Not used, duplicate, or old

### Step 3: Remove Unused Variables

1. **Find** unused/old variables
2. **Click**: **"..."** (three dots) → **"Delete"**
3. **Confirm** deletion

---

## ✅ Required Variables Checklist

**These MUST stay**:

- [x] `NODE_ENV` = `production`
- [x] `PORT` = `4000`
- [x] `DATABASE_URL` = `file:./dev.db`
- [x] `ADMIN_EMAIL` = `admin@hezak.com`
- [x] `ADMIN_PASSWORD_HASH` = `$2b$10$...`
- [x] `JWT_SECRET` = `a159c9fb...`

**Optional** (only if using Firebase):

- [ ] `FIREBASE_SERVICE_ACCOUNT` = `{...}`

---

## 🔍 Check What's Currently Set

**In Render**:
1. **Settings** → **Environment**
2. **Review** all variables
3. **Remove** any that are:
   - Duplicates
   - Old/unused
   - Test variables
   - Development-only

---

## ⚠️ Important: Don't Remove These!

**NEVER remove**:
- ❌ `NODE_ENV`
- ❌ `DATABASE_URL`
- ❌ `ADMIN_EMAIL`
- ❌ `ADMIN_PASSWORD_HASH`
- ❌ `JWT_SECRET`

**Removing these will break your backend!**

---

## 🎯 Quick Cleanup Steps

1. **Go to**: Render → Backend → Settings → Environment
2. **Review** all variables
3. **Remove** only:
   - Duplicates
   - Old test variables
   - Unused variables
4. **Keep** all required variables
5. **Save** changes
6. **Redeploy** (if needed)

---

## 📝 Current Required Variables

**Your backend needs these 6 variables**:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./dev.db
ADMIN_EMAIL=admin@hezak.com
ADMIN_PASSWORD_HASH=$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2
JWT_SECRET=a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34
```

**Keep these!** ✅

---

**Remove only unused/duplicate variables, keep all required ones!** 🧹

