# Firebase Initialization & Deployment Instructions

## ⚠️ Important: Login Required First

Firebase commands require interactive login. Please run these commands in your **terminal** (not through this interface):

## Step-by-Step Instructions

### Step 1: Login to Firebase (Run in Your Terminal)

```bash
cd "/Users/admin/Ecommerce Web hezak"
npx firebase login
```

This will:
1. Open your browser
2. Ask you to sign in with your Google account
3. Ask for permissions
4. Return to terminal when done

### Step 2: Initialize Firebase Hosting

After logging in, run:

```bash
cd frontend
npx firebase init hosting
```

**When prompted, select:**
- ✅ **Use an existing project** → Select `hezak-f6fb3`
- ✅ **What do you want to use as your public directory?** → Type: `dist`
- ✅ **Configure as a single-page app?** → Type: `Yes` or `y`
- ✅ **Set up automatic builds and deploys with GitHub?** → Type: `No` or `n`
- ✅ **File dist/index.html already exists. Overwrite?** → Type: `No` or `n`

### Step 3: Build Your Frontend

```bash
cd frontend
npm run build
```

This creates the `dist` folder with your production build.

### Step 4: Deploy to Firebase

```bash
cd frontend
npx firebase deploy --only hosting
```

Or from project root:
```bash
npm run firebase:deploy
```

## ✅ What's Already Configured

- ✅ `firebase.json` - Hosting configuration
- ✅ `.firebaserc` - Project ID set to `hezak-f6fb3`
- ✅ Firebase config in `frontend/src/lib/firebase.ts`
- ✅ Environment variables in `frontend/.env`

## 🚀 Quick Command Reference

```bash
# Login (first time only)
npx firebase login

# Initialize (first time only)
cd frontend && npx firebase init hosting

# Build
cd frontend && npm run build

# Deploy
cd frontend && npx firebase deploy --only hosting
```

## 📍 Your Deployment URL

After deployment, your site will be live at:
- **https://hezak-f6fb3.web.app**
- **https://hezak-f6fb3.firebaseapp.com**

## 🔧 Alternative: Use NPM Scripts

From project root, you can use:

```bash
npm run firebase:login    # Login
npm run firebase:init     # Initialize
npm run firebase:deploy   # Build and deploy
```

## ⚠️ Troubleshooting

**"Not logged in" error:**
- Run `npx firebase login` first

**"Project not found":**
- Make sure you selected the correct project during init
- Check `.firebaserc` has `hezak-f6fb3`

**"Build fails":**
- Check for errors: `cd frontend && npm run build`
- Make sure all dependencies are installed: `npm install`

---

**Run these commands in your terminal to complete the setup!** 🚀

