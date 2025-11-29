# ⚡ Quick Deploy to Firebase

## ✅ Ready to Deploy!

Firebase CLI is installed and your project is configured.

## 🚀 3-Step Deploy

### Step 1: Login (First Time)
```bash
npx firebase login
```
Opens browser → Click "Allow" → Done!

### Step 2: Initialize Hosting (First Time Only)
```bash
cd frontend
npx firebase init hosting
```

**Select:**
- ✅ Existing project → **hezak-f6fb3**
- ✅ Public directory → **dist**
- ✅ Single-page app → **Yes**
- ✅ GitHub Actions → **No**

### Step 3: Deploy!
```bash
npm run firebase:deploy
```

Or manually:
```bash
cd frontend
npm run build
npx firebase deploy --only hosting
```

## 🎉 Your Site Will Be Live At:
`https://hezak-f6fb3.web.app`

## 📝 NPM Scripts Available

From project root:
- `npm run firebase:login` - Login to Firebase
- `npm run firebase:init` - Initialize hosting
- `npm run firebase:deploy` - Build and deploy
- `npm run firebase:serve` - Test locally

## ⚠️ Before Deploying

Make sure your backend is deployed and update `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.com
```

## 🔗 Quick Links

- Firebase Console: https://console.firebase.google.com/project/hezak-f6fb3
- Your Site: https://hezak-f6fb3.web.app (after deploy)

---

**Ready?** Run `npx firebase login` to get started! 🚀

