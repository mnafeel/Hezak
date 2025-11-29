# 🚀 Quick Deployment Guide

## ⚠️ Important: Fix Firebase Config First

The `firebase.json` file has the wrong path. Let's fix it:

### Option 1: Deploy from Frontend Directory (Recommended)

1. **Create `firebase.json` in the `frontend` folder:**

```bash
cd "/Users/admin/Ecommerce Web hezak/frontend"
cat > firebase.json << 'EOF'
{
  "hosting": {
    "public": "dist",
    "ignore": [
      "firebase.json",
      "**/.*",
      "**/node_modules/**"
    ],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ]
  }
}
EOF
```

2. **Login to Firebase:**
```bash
npx firebase login
```

3. **Initialize (if not done):**
```bash
npx firebase init hosting
```
- Select: Use existing project → `hezak-f6fb3`
- Public directory: `dist`
- Single-page app: `Yes`
- GitHub Actions: `No`
- Overwrite index.html: `No`

4. **Deploy:**
```bash
npm run build
npx firebase deploy --only hosting
```

### Option 2: Fix Root firebase.json

If you want to deploy from the root directory, update the root `firebase.json`:

```json
{
  "hosting": {
    "public": "frontend/dist",
    ...
  }
}
```

Then deploy from root:
```bash
cd "/Users/admin/Ecommerce Web hezak"
npx firebase deploy --only hosting
```

## 🔧 Production API Configuration

**IMPORTANT:** After deployment, you need to set your backend API URL:

1. **In Firebase Console:**
   - Go to your project → Hosting → Add custom domain (or use the default)
   
2. **Set Environment Variable:**
   - Create `frontend/.env.production`:
   ```
   VITE_API_URL=https://your-backend-url.com/api
   ```
   
   Or set it in Firebase Hosting environment variables.

3. **Rebuild and Redeploy:**
   ```bash
   cd frontend
   npm run build
   npx firebase deploy --only hosting
   ```

## ✅ After Deployment

Your site will be at:
- **https://hezak-f6fb3.web.app**
- **https://hezak-f6fb3.firebaseapp.com**

## 🐛 Troubleshooting

**"Site not found":**
- Make sure you've deployed: `npx firebase deploy --only hosting`
- Check Firebase Console → Hosting

**"API errors":**
- Set `VITE_API_URL` in `.env.production`
- Rebuild: `npm run build`
- Redeploy: `npx firebase deploy --only hosting`

**"404 on routes":**
- Make sure `rewrites` in `firebase.json` points to `/index.html`

---

**Run these commands in your terminal!** 🚀

