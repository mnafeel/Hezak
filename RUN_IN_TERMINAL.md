# 🚀 Run These Commands in Your Terminal

## Step 1: Login to Firebase

Open your terminal and run:

```bash
cd "/Users/admin/Ecommerce Web hezak"
npx firebase login
```

This will open your browser to authenticate.

## Step 2: Initialize Firebase Hosting (First Time Only)

After logging in, run:

```bash
cd frontend
npx firebase init hosting
```

**When prompted, answer:**
1. **Use an existing project** → Select `hezak-f6fb3`
2. **Public directory** → Type: `dist`
3. **Single-page app** → Type: `Yes` or `y`
4. **GitHub Actions** → Type: `No` or `n`
5. **Overwrite index.html** → Type: `No` or `n`

## Step 3: Build Your Frontend

```bash
cd frontend
npm run build
```

## Step 4: Deploy!

```bash
cd frontend
npx firebase deploy --only hosting
```

Or from project root:
```bash
npm run firebase:deploy
```

## ✅ What's Already Ready

- ✅ Firebase project configured (`hezak-f6fb3`)
- ✅ `firebase.json` configured
- ✅ `.firebaserc` set up
- ✅ Build folder exists (`frontend/dist`)

## 🎉 After Deployment

Your site will be live at:
- **https://hezak-f6fb3.web.app**
- **https://hezak-f6fb3.firebaseapp.com**

---

**Copy and paste these commands into your terminal!** 🚀

