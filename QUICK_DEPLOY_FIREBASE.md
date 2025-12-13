# 🚀 Quick Deploy Firebase Functions - Step by Step

## ✅ You've Deleted Render - Let's Deploy to Firebase!

Since you've deleted Render and added Firebase SDK to Vercel, follow these steps:

---

## 📋 Step 1: Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

**This will open a browser** - log in with your Google account that has access to Firebase project `hezak-f6fb3`.

---

## 📦 Step 2: Install Functions Dependencies

```bash
cd functions
npm install
```

**Wait for installation** - this may take 2-3 minutes.

---

## 🔧 Step 3: Set Environment Variables (Optional)

Firebase Functions can use Firebase Functions config or environment variables.

### Option A: Using Firebase Functions Config (Recommended)

```bash
# From project root (not functions/)
firebase functions:config:set \
  admin.email="admin@example.com" \
  admin.password_hash="$2b$10$..." \
  jwt.secret="your-secret-key-min-16-chars"
```

**To get password hash**, run:
```bash
node -e "const bcrypt = require('bcrypt'); bcrypt.hash('your-password', 10).then(hash => console.log(hash));"
```

### Option B: Using .env file (For local testing)

Create `functions/.env`:
```bash
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD_HASH=$2b$10$...
JWT_SECRET=your-secret-key-min-16-chars
```

**Note**: In Firebase Functions, Firestore and Storage are **automatically available** - no service account needed!

---

## 🏗️ Step 4: Build Functions

```bash
cd functions
npm run build
```

**This compiles TypeScript** to JavaScript in `functions/lib/`.

**If you see errors**, check:
- All dependencies installed? Run `npm install` again
- TypeScript errors? Check `functions/tsconfig.json`

---

## 🚀 Step 5: Deploy to Firebase

```bash
# From project root (not functions/)
firebase deploy --only functions
```

**This will**:
- Build your functions
- Deploy to Firebase
- Give you a URL like: `https://us-central1-hezak-f6fb3.cloudfunctions.net/api`

**⏱️ First deployment takes 3-5 minutes** - be patient!

**📋 Copy the URL from the output!** You'll need it for Vercel.

---

## 🌐 Step 6: Update Frontend (Vercel)

1. **Go to**: [Vercel Dashboard](https://vercel.com/dashboard)
2. **Select**: Your project
3. **Settings** → **Environment Variables**
4. **Add/Update**:
   ```
   VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api
   ```
   *(Replace with your actual Functions URL from Step 5)*

5. **Redeploy** frontend:
   - Go to **Deployments** tab
   - Click **⋯** (three dots) on latest deployment
   - Click **Redeploy**

---

## ✅ Step 7: Verify It Works

### Test Firebase Function:

```bash
curl https://us-central1-hezak-f6fb3.cloudfunctions.net/api/health
```

**Expected**: 
```json
{"status":"ok","timestamp":"...","service":"Firebase Functions","region":"us-central1"}
```

### Test Products:

```bash
curl https://us-central1-hezak-f6fb3.cloudfunctions.net/api/products
```

**Expected**: Array of products from Firestore (may be empty if no products yet)

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
cd ..
firebase functions:config:set admin.email="admin@example.com" admin.password_hash="$2b$10$..." jwt.secret="your-secret"

# 4. Build
cd functions
npm run build

# 5. Deploy
cd ..
firebase deploy --only functions

# 6. Copy URL from output and add to Vercel:
# VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api
```

---

## ⚠️ Important Notes

1. **Firestore is auto-available** in Firebase Functions - no service account needed!
2. **Storage is auto-available** - no service account needed!
3. **Environment variables** - Use Firebase Functions config or `.env` file
4. **First deployment** may take 3-5 minutes
5. **Cold starts** - First request after inactivity may be slow (normal for serverless)
6. **Memory limit** - Currently set to 512MB (can increase in `functions/src/index.ts`)

---

## 🔍 Troubleshooting

### Error: "Functions directory not found"

**Fix**: Make sure you're in the **project root**, not `functions/` directory

### Error: "Module not found"

**Fix**: Run `cd functions && npm install`

### Error: "Build failed"

**Fix**: 
- Check `functions/tsconfig.json`
- Check TypeScript errors: `cd functions && npm run build`
- Look for import errors

### Error: "Permission denied"

**Fix**: Run `firebase login` again

### Error: "Function failed to deploy"

**Fix**: 
- Check Firebase Console → Functions → Logs
- Look for runtime errors
- Check environment variables are set

---

## 🎉 After Deployment

1. ✅ Copy the Functions URL from deployment output
2. ✅ Add to Vercel: `VITE_API_URL=https://us-central1-hezak-f6fb3.cloudfunctions.net/api`
3. ✅ Redeploy frontend
4. ✅ Test your site!

---

## 📊 What Changed

- ✅ Backend code copied to `functions/src/backend/`
- ✅ Firebase Admin auto-initialized (no service account needed)
- ✅ Firestore always enabled
- ✅ Storage always available
- ✅ All routes configured
- ✅ Ready to deploy!

---

**Your backend will be on Firebase Functions!** 🔥

**Next**: Run the commands above to deploy!

