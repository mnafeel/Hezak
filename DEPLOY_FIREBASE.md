# 🚀 Deploy to Firebase Hosting

## ✅ Firebase CLI Installed

Firebase CLI has been installed locally in your project. You can use it with `npx` or the npm scripts.

## Quick Deploy Steps

### Step 1: Login to Firebase

```bash
npx firebase login
```

Or use the npm script:
```bash
npm run firebase:login
```

This will open your browser to authenticate.

### Step 2: Initialize Firebase Hosting (First Time Only)

```bash
cd frontend
npx firebase init hosting
```

**When prompted:**
- ✅ Use an existing project → Select **hezak-f6fb3**
- ✅ What do you want to use as your public directory? → **dist**
- ✅ Configure as a single-page app? → **Yes**
- ✅ Set up automatic builds and deploys with GitHub? → **No** (for now)
- ✅ File dist/index.html already exists. Overwrite? → **No**

Or use the npm script:
```bash
npm run firebase:init
```

### Step 3: Update Firebase Project ID

The `.firebaserc` file should already have your project ID. Verify it shows:
```json
{
  "projects": {
    "default": "hezak-f6fb3"
  }
}
```

### Step 4: Build and Deploy

```bash
cd frontend
npm run build
npx firebase deploy --only hosting
```

Or use the npm script from project root:
```bash
npm run firebase:deploy
```

### Step 5: Your Site is Live! 🎉

Your site will be available at:
- **Default URL**: `https://hezak-f6fb3.web.app`
- **Custom Domain**: (if you configure one in Firebase Console)

## Useful Commands

### Check Firebase Version
```bash
npx firebase --version
```

### View Deployment History
```bash
npx firebase hosting:channel:list
```

### Serve Locally (Test Production Build)
```bash
cd frontend
npm run build
npx firebase serve
```

Or:
```bash
npm run firebase:serve
```

### Rollback Deployment
```bash
npx firebase hosting:rollback
```

## Environment Variables for Production

Before deploying, make sure to set your production API URL in `frontend/.env.production`:

```env
VITE_API_URL=https://your-backend-url.railway.app
```

Then rebuild:
```bash
cd frontend
npm run build
npx firebase deploy --only hosting
```

## Troubleshooting

### "Firebase CLI not found"
- Use `npx firebase` instead of just `firebase`
- Or install globally: `sudo npm install -g firebase-tools`

### "Project not found"
- Make sure you're logged in: `npx firebase login`
- Verify project ID in `.firebaserc`

### "Build fails"
- Check for TypeScript errors: `cd frontend && npm run build`
- Verify all dependencies are installed: `npm install`

### "Deploy fails"
- Check Firebase Console for quota limits
- Verify you have permission to deploy
- Check Firebase hosting is enabled in Console

## Next Steps After Deployment

1. **Set up custom domain** (optional)
   - Firebase Console → Hosting → Add custom domain

2. **Configure authorized domains**
   - Firebase Console → Authentication → Settings
   - Add your custom domain to authorized domains

3. **Set up CI/CD** (optional)
   - Use GitHub Actions for automatic deployments
   - See Firebase documentation for setup

## 🎉 You're Ready to Deploy!

Run these commands:
```bash
# 1. Login
npx firebase login

# 2. Initialize (first time only)
cd frontend && npx firebase init hosting

# 3. Deploy
npm run firebase:deploy
```

Your site will be live in minutes! 🚀

