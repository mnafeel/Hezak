# Complete Deployment Guide

## Prerequisites
- Node.js installed
- Firebase account
- Cloud database account (Supabase/Railway/Render)

## Part 1: Database Migration (PostgreSQL)

### Option A: Supabase (Recommended - Free Tier)

1. **Create Supabase Project**
   - Go to [supabase.com](https://supabase.com)
   - Create new project
   - Note your database URL (format: `postgresql://postgres:[PASSWORD]@db.[PROJECT].supabase.co:5432/postgres`)

2. **Update Prisma Schema**
   ```bash
   cd backend
   # Edit prisma/schema.prisma - change provider to "postgresql"
   ```

3. **Run Migrations**
   ```bash
   cd backend
   npm run prisma:generate
   npx prisma migrate deploy
   ```

### Option B: Railway

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Create new project
   - Add PostgreSQL database
   - Copy connection string

2. **Update Prisma**
   - Same as Supabase steps above

## Part 2: Backend Deployment

### Option A: Railway (Easiest)

1. **Connect Repository**
   - Go to Railway dashboard
   - New Project → Deploy from GitHub
   - Select your repository
   - Set root directory to `backend`

2. **Configure Environment Variables**
   ```
   DATABASE_URL=your-postgres-connection-string
   JWT_SECRET=your-secret-key
   PORT=3000
   NODE_ENV=production
   ```

3. **Configure Build Settings**
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

4. **Deploy**
   - Railway will auto-deploy on push
   - Note your backend URL (e.g., `https://your-app.railway.app`)

### Option B: Render

1. **Create Web Service**
   - Go to [render.com](https://render.com)
   - New → Web Service
   - Connect GitHub repository
   - Root directory: `backend`

2. **Settings**
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Environment: Node

3. **Environment Variables**
   - Add all required env vars

## Part 3: Frontend Deployment (Firebase Hosting)

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase
```bash
cd frontend
firebase init hosting
```

**Select:**
- Use existing project (or create new)
- Public directory: `dist`
- Single-page app: Yes
- GitHub Actions: No (for now)

### Step 3: Update API URL
Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.railway.app
```

### Step 4: Build and Deploy
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

### Step 5: Update Firebase Config
Edit `.firebaserc` and replace `your-firebase-project-id` with your actual project ID.

## Part 4: File Uploads (Firebase Storage)

### Step 1: Enable Firebase Storage
1. Go to Firebase Console
2. Storage → Get Started
3. Start in test mode (update rules later)

### Step 2: Update Backend Upload Routes
You can either:
- Keep using local uploads (simpler)
- Migrate to Firebase Storage (better for production)

### Step 3: Storage Security Rules
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      allow read: if true;
      allow write: if request.auth != null; // Or your custom logic
    }
  }
}
```

## Part 5: Continuous Deployment

### GitHub Actions (Optional)

Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Firebase

on:
  push:
    branches: [ main ]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: cd frontend && npm install
      - run: cd frontend && npm run build
      - uses: FirebaseExtended/action-hosting-deploy@v0
        with:
          repoToken: '${{ secrets.GITHUB_TOKEN }}'
          firebaseServiceAccount: '${{ secrets.FIREBASE_SERVICE_ACCOUNT }}'
          channelId: live
          projectId: your-project-id
```

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL format
- Verify database is accessible
- Check firewall settings

### Build Failures
- Ensure all dependencies are in package.json
- Check Node.js version compatibility
- Review build logs

### CORS Issues
- Update backend CORS settings
- Add frontend URL to allowed origins

## Post-Deployment Checklist

- [ ] Database migrated and connected
- [ ] Backend deployed and accessible
- [ ] Frontend deployed to Firebase
- [ ] Environment variables configured
- [ ] API URL updated in frontend
- [ ] File uploads working
- [ ] Admin login working
- [ ] Test all major features

## Support

For issues:
1. Check Firebase Console logs
2. Check backend deployment logs
3. Verify environment variables
4. Test API endpoints directly

