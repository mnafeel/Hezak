# 🔥 Firebase Environment Variables - Complete List

## 📋 All Environment Variables Needed for Firebase

---

## ✅ Required Variables (6 for Backend + 1 for Firebase)

### Backend Variables (Keep These):

1. **`NODE_ENV`** = `production`

   - **Purpose**: Production mode
   - **Required**: ✅ Yes

2. **`PORT`** = `4000`

   - **Purpose**: Server port
   - **Required**: ✅ Yes

3. **`DATABASE_URL`** = `file:./dev.db`

   - **Purpose**: SQLite database (keep if using SQLite)
   - **Required**: ✅ Yes (if using SQLite)

4. **`ADMIN_EMAIL`** = `admin@hezak.com`

   - **Purpose**: Admin login email
   - **Required**: ✅ Yes

5. **`ADMIN_PASSWORD_HASH`** = `$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2`

   - **Purpose**: Admin password hash
   - **Required**: ✅ Yes

6. **`JWT_SECRET`** = `a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34`
   - **Purpose**: JWT token signing
   - **Required**: ✅ Yes

### Firebase Variable (Add This):

7. **`FIREBASE_SERVICE_ACCOUNT`** = `{"type":"service_account","project_id":"hezak-f6fb3",...}`
   - **Purpose**: Firebase Admin SDK credentials
   - **Required**: ✅ Yes (for Firebase)
   - **Format**: Single-line JSON (minified)

---

## 📝 Complete Environment Variables List

### For Render Backend:

```
NODE_ENV=production
PORT=4000
DATABASE_URL=file:./dev.db
ADMIN_EMAIL=admin@hezak.com
ADMIN_PASSWORD_HASH=$2b$10$6.qPgfLkKkBYtFNMD/rCNuOBl6Xrqi2NctYZspTtjRpL8MYpwU6y2
JWT_SECRET=a159c9fbdf6cde8450a1da73ef9c96f34010d50aa08575ee42b5630141bb5d34
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"hezak-f6fb3","private_key_id":"...","private_key":"-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n","client_email":"firebase-adminsdk-xxxxx@hezak-f6fb3.iam.gserviceaccount.com","client_id":"...","auth_uri":"https://accounts.google.com/o/oauth2/auth","token_uri":"https://oauth2.googleapis.com/token","auth_provider_x509_cert_url":"https://www.googleapis.com/oauth2/v1/certs","client_x509_cert_url":"https://www.googleapis.com/robot/v1/metadata/x509/..."}
```

---

## 🔥 How to Get Firebase Service Account JSON

### Step 1: Get from Firebase Console

1. **Go to**: https://console.firebase.google.com
2. **Select**: `hezak-f6fb3` project
3. **Settings** (gear) → **Project settings**
4. **Service accounts** tab
5. **Generate new private key**
6. **Download** JSON file

### Step 2: Format as Single Line

**Use online tool**:

1. **Go to**: https://jsonformatter.org/minify
2. **Paste** your JSON
3. **Click**: "Minify"
4. **Copy** result

**Or manually**: Remove all line breaks, keep all quotes

---

## ✅ Add to Render

### Step 1: Go to Render

1. **Render Dashboard** → Backend service
2. **Settings** → **Environment**

### Step 2: Add Firebase Variable

1. **Click**: "Add Environment Variable"
2. **Name**: `FIREBASE_SERVICE_ACCOUNT`
3. **Value**: _(Paste minified JSON)_
4. **Environment**: **All** (Production, Preview, Development)
5. **Save**

---

## 📋 Final Checklist

### Required Variables (7 total):

- [x] `NODE_ENV` = `production`
- [x] `PORT` = `4000`
- [x] `DATABASE_URL` = `file:./dev.db`
- [x] `ADMIN_EMAIL` = `admin@hezak.com`
- [x] `ADMIN_PASSWORD_HASH` = `$2b$10$...`
- [x] `JWT_SECRET` = `a159c9fb...`
- [ ] `FIREBASE_SERVICE_ACCOUNT` = `{...}` ← **Add this!**

---

## 🎯 Summary

**To connect Firebase, you need**:

1. **Keep** all 6 existing variables
2. **Add** `FIREBASE_SERVICE_ACCOUNT` variable
3. **Get** service account JSON from Firebase Console
4. **Format** as single line
5. **Add** to Render
6. **Redeploy** backend

---

## ⚠️ Important Notes

- **Don't remove** existing variables
- **Add** `FIREBASE_SERVICE_ACCOUNT` only
- **Format** JSON as single line
- **Keep** all 6 backend variables

---

**Add `FIREBASE_SERVICE_ACCOUNT` to your existing 6 variables!** 🔥
