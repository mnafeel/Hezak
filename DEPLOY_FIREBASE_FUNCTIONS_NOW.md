# 🚀 Deploy Firebase Functions - Quick Steps

## ✅ You've Deleted Render - Now Deploy to Firebase!

Since you've deleted Render and added Firebase SDK to Vercel, here's how to deploy your backend to Firebase Functions:

---

## 📋 Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

---

## 📦 Step 2: Install Functions Dependencies

```bash
cd functions
npm install
```

This will install all required packages.

---

## 🔧 Step 3: Set Environment Variables

Firebase Functions uses Firebase Functions config or `.env` file.

### Option A: Using Firebase Functions Config (Recommended)

```bash
# From project root
firebase functions:config:set \
  admin.email="admin@example.com" \
  admin.password_hash="$2b$10$..." \
  jwt.secret="your-secret-key"
```

### Option B: Using .env file

Create `functions/.env`:

```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=your-secret-key
```

**Note**: In Firebase Functions, Firestore and Storage are automatically available - no service account needed!

---

## 🏗️ Step 4: Build Functions

```bash
cd functions
npm run build
```

This compiles TypeScript to JavaScript in `functions/lib/`.

---

## 🚀 Step 5: Deploy to Firebase

```bash
# From project root
firebase deploy --only functions
```

**This will**:
- Build your functions
- Deploy to Firebase
- Give you a URL like: `https://us-central1-hezak-f6fb3.cloudfunctions.net/api`

**Copy this URL!** You'll need it for the frontend.

---

## 🌐 Step 6: Update Frontend (Vercel)

1. **Go to**: Vercel Dashboard → Your project
2. **Settings** → **Environment Variables**
3. **Add/Update**:
   ```
   VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api
   ```
   *(Replace with your actual Functions URL)*

4. **Redeploy** frontend

---

## ✅ Step 7: Verify

### Test Firebase Function:

```bash
curl https://us-central1-hezak-f6fb3.cloudfunctions.net/api/health
```

**Expected**: `{"status":"ok","service":"Firebase Functions",...}`

### Test Products:

```bash
curl https://us-central1-hezak-f6fb3.cloudfunctions.net/api/products
```

**Expected**: Array of products from Firestore

---

## 🎯 Quick Command Summary

```bash
# 1. Install CLI
npm install -g firebase-tools
firebase login

# 2. Install dependencies
cd functions
npm install

# 3. Set config (optional - if needed)
firebase functions:config:set admin.email="admin@example.com" admin.password_hash="$2b$10$..." jwt.secret="your-secret"

# 4. Build
npm run build

# 5. Deploy
cd ..
firebase deploy --only functions

# 6. Get URL from output and add to Vercel
```

---

## ⚠️ Important Notes

1. **Firestore is auto-available** in Firebase Functions - no service account needed!
2. **Storage is auto-available** - no service account needed!
3. **Environment variables** - Use Firebase Functions config or `.env` file
4. **First deployment** may take 3-5 minutes
5. **Cold starts** - First request after inactivity may be slow (normal for serverless)

---

## 🔍 Troubleshooting

### Error: "Functions directory not found"

**Fix**: Make sure you're in the project root, not `functions/` directory

### Error: "Module not found"

**Fix**: Run `cd functions && npm install`

### Error: "Build failed"

**Fix**: Check `functions/tsconfig.json` and TypeScript errors

### Error: "Permission denied"

**Fix**: Run `firebase login` again

---

## 🎉 After Deployment

1. ✅ Copy the Functions URL from deployment output
2. ✅ Add to Vercel: `VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api`
3. ✅ Redeploy frontend
4. ✅ Test your site!

---

**Your backend will be on Firebase Functions!** 🔥

