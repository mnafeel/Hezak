# Firebase CLI Setup

## Installation Options

### Option 1: Global Install (Recommended - Run in your terminal)

Since global install requires sudo permissions, please run this in your terminal:

```bash
sudo npm install -g firebase-tools
```

You'll be prompted for your password.

### Option 2: Local Install (Already Done ✅)

Firebase CLI has been installed locally in your project. You can use it with:

```bash
# Using npx (recommended)
npx firebase --version
npx firebase login
npx firebase init hosting
npx firebase deploy

# Or add to package.json scripts
```

### Option 3: Use npx (No Install Needed)

You can use Firebase CLI without installing:

```bash
npx firebase-tools login
npx firebase-tools init hosting
npx firebase-tools deploy
```

## Quick Commands

### Login to Firebase
```bash
npx firebase login
```

### Initialize Firebase Hosting
```bash
cd frontend
npx firebase init hosting
```

**When prompted:**
- Use existing project: **Yes** → Select `hezak-f6fb3`
- Public directory: **dist**
- Single-page app: **Yes**
- GitHub Actions: **No** (for now)

### Deploy Frontend
```bash
cd frontend
npm run build
npx firebase deploy --only hosting
```

## Next Steps

1. **Login**: `npx firebase login`
2. **Initialize**: `cd frontend && npx firebase init hosting`
3. **Build**: `npm run build`
4. **Deploy**: `npx firebase deploy --only hosting`

Your site will be live at: `https://hezak-f6fb3.web.app` (or your custom domain)

