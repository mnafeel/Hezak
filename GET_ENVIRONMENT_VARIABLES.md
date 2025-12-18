# 🔑 How to Get Environment Variables for Vercel

## 📋 Complete Guide - Where to Get Each Value

---

## ✅ 1. NODE_ENV

**Value**: `production`

**Where**: Just set this - it tells Vercel this is production mode.

---

## ✅ 2. USE_FIRESTORE

**Value**: `true`

**Where**: Just set this - enables Firestore database.

---

## ✅ 3. FIREBASE_SERVICE_ACCOUNT ⚠️ (Most Important)

**Value**: JSON object (entire service account key)

**Where to Get**:

1. **Go to**: [Firebase Console](https://console.firebase.google.com/)
2. **Select**: Project `hezak-f6fb3`
3. **Click**: ⚙️ Settings (gear icon) → **Project Settings**
4. **Go to**: **Service Accounts** tab
5. **Click**: **Generate New Private Key**
6. **Click**: **Generate Key** (confirms download)
7. **Download**: JSON file (e.g., `hezak-f6fb3-firebase-adminsdk-xxxxx.json`)

**How to Add to Vercel**:

- Open the downloaded JSON file
- **Copy the ENTIRE content** (all of it, including `{` and `}`)
- In Vercel → Environment Variables → **Paste the entire JSON**
- **Important**: Vercel accepts multi-line JSON, just paste it all

**Example**:

```json
{
  "type": "service_account",
  "project_id": "hezak-f6fb3",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "...",
  "client_id": "...",
  "auth_uri": "...",
  "token_uri": "...",
  "auth_provider_x509_cert_url": "...",
  "client_x509_cert_url": "..."
}
```

**⚠️ Keep this file secure!** Don't commit it to GitHub.

---

## ✅ 4. FIREBASE_STORAGE_BUCKET

**Value**: `hezak-f6fb3.appspot.com`

**Where**: You already have this! It's your Firebase project ID + `.appspot.com`

**If you need to find it**:

1. Firebase Console → **Storage**
2. Look at the bucket name (usually `your-project-id.appspot.com`)

---

## ✅ 5. USE_FIREBASE_STORAGE

**Value**: `true`

**Where**: Just set this - enables Firebase Storage for file uploads.

---

## ✅ 6. ADMIN_EMAIL

**Value**: Your admin email (e.g., `admin@example.com` or `your-email@gmail.com`)

**Where**: Choose any email you want to use for admin login.

**Example**: `admin@hezak.com` or `mnafeel1234@gmail.com`

---

## ✅ 7. ADMIN_PASSWORD_HASH ⚠️ (Need to Generate)

**Value**: Bcrypt hash of your admin password (starts with `$2b$10$...`)

**Where to Generate**:

### Option A: Using Node.js (Terminal)

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD_HERE', 10).then(hash => console.log(hash));"
```

**Replace `YOUR_PASSWORD_HERE`** with your actual admin password.

**Example**:

```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('admin123', 10).then(hash => console.log(hash));"
```

**Output** will be something like:

```
$in
```

**Copy this entire hash** (starts with `$2b$10$`).

---

### Option B: Using Online Tool (Less Secure)

1. Go to: https://bcrypt-generator.com/
2. Enter your password
3. Set rounds: `10`
4. Click "Generate Hash"
5. Copy the hash

**⚠️ Warning**: Only use this for testing, not production passwords!

---

## ✅ 8. JWT_SECRET

**Value**: Random secret string (at least 16 characters)

**Where to Generate**:

### Option A: Using Node.js (Terminal)

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

**Output** will be a long random string like:

```
a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

**Copy this entire string**.

---

### Option B: Using Online Tool

1. Go to: https://randomkeygen.com/
2. Use "CodeIgniter Encryption Keys" (256-bit)
3. Copy one of the keys

---

### Option C: Simple Secret (Less Secure)

Just use a long random string:

```
hezak-secret-key-2024-production-min-16-chars
```

**Make it at least 16 characters long!**

---

## 📋 Quick Summary

| Variable                   | Value                     | Where to Get                                       |
| -------------------------- | ------------------------- | -------------------------------------------------- |
| `NODE_ENV`                 | `production`              | Just set it                                        |
| `USE_FIRESTORE`            | `true`                    | Just set it                                        |
| `FIREBASE_SERVICE_ACCOUNT` | JSON object               | Firebase Console → Service Accounts → Generate Key |
| `FIREBASE_STORAGE_BUCKET`  | `hezak-f6fb3.appspot.com` | You already have it                                |
| `USE_FIREBASE_STORAGE`     | `true`                    | Just set it                                        |
| `ADMIN_EMAIL`              | Your email                | Choose any email                                   |
| `ADMIN_PASSWORD_HASH`      | `$2b$10$...`              | Generate with bcrypt (see above)                   |
| `JWT_SECRET`               | Random string             | Generate with crypto (see above)                   |

---

## 🚀 Step-by-Step: Generate Values

### 1. Generate ADMIN_PASSWORD_HASH

```bash
cd backend
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-admin-password', 10).then(hash => console.log('ADMIN_PASSWORD_HASH=' + hash));"
```

**Replace `your-admin-password`** with your actual password.

**Copy the output** (starts with `ADMIN_PASSWORD_HASH=$2b$10$...`).

---

### 2. Generate JWT_SECRET

```bash
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Copy the output** (starts with `JWT_SECRET=...`).

---

### 3. Get FIREBASE_SERVICE_ACCOUNT

1. Go to: https://console.firebase.google.com/project/hezak-f6fb3/settings/serviceaccounts/adminsdk
2. Click: **Generate New Private Key**
3. Click: **Generate Key**
4. Download JSON file
5. Open JSON file
6. Copy **entire content**

---

## 📝 Example: Complete Environment Variables

Here's what your Vercel environment variables should look like:

```
NODE_ENV=production
USE_FIRESTORE=true
FIREBASE_SERVICE_ACCOUNT={"type":"service_account","project_id":"hezak-f6fb3",...}
FIREBASE_STORAGE_BUCKET=hezak-f6fb3.appspot.com
USE_FIREBASE_STORAGE=true
ADMIN_EMAIL=admin@hezak.com
ADMIN_PASSWORD_HASH=$2b$10$abcdefghijklmnopqrstuvwxyz1234567890ABCDEFGHIJKLMNOPQRSTUV
JWT_SECRET=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6q7r8s9t0u1v2w3x4y5z6
```

---

## ✅ How to Add to Vercel

1. **Go to**: Vercel Dashboard → Your Backend Project
2. **Settings** → **Environment Variables**
3. **Add each variable**:
   - **Key**: `NODE_ENV`
   - **Value**: `production`
   - **Environment**: Production (and Preview if needed)
   - Click **Save**
4. **Repeat for each variable**

**For FIREBASE_SERVICE_ACCOUNT**:

- Paste the **entire JSON** (multi-line is OK in Vercel)

---

## 🎯 Quick Commands to Generate

Run these in your terminal (from `backend/` directory):

```bash
# Generate password hash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('YOUR_PASSWORD', 10).then(hash => console.log('ADMIN_PASSWORD_HASH=' + hash));"

# Generate JWT secret
node -e "console.log('JWT_SECRET=' + require('crypto').randomBytes(32).toString('hex'))"
```

**Replace `YOUR_PASSWORD`** with your actual admin password!

---

## 🔒 Security Notes

1. **Never commit** `.env` files or service account keys to GitHub
2. **Keep passwords secure** - use strong passwords
3. **Rotate secrets** periodically
4. **Use different secrets** for production vs development

---

**Now you have all the values!** Add them to Vercel! 🚀
