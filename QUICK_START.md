# Quick Start: Deploy to Firebase

## Step-by-Step Instructions

### 1. Set Up Firebase Project (5 minutes)

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Enter project name (e.g., "ecommerce-hezak")
4. Disable Google Analytics (optional)
5. Click "Create project"

### 2. Install Firebase CLI

```bash
npm install -g firebase-tools
firebase login
```

### 3. Initialize Firebase in Your Project

```bash
cd "/Users/admin/Ecommerce Web hezak"
firebase init hosting
```

**When prompted:**
- ✅ Use an existing project → Select your project
- ✅ What do you want to use as your public directory? → `frontend/dist`
- ✅ Configure as a single-page app? → **Yes**
- ✅ Set up automatic builds and deploys with GitHub? → **No** (for now)

### 4. Update Firebase Project ID

Edit `.firebaserc` and replace `your-firebase-project-id` with your actual Firebase project ID.

### 5. Set Up Database (Choose One)

#### Option A: Supabase (Free, Recommended)

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create new project
3. Go to Settings → Database
4. Copy the connection string (looks like: `postgresql://postgres:[YOUR-PASSWORD]@db.xxxxx.supabase.co:5432/postgres`)

#### Option B: Railway

1. Go to [railway.app](https://railway.app)
2. Sign up with GitHub
3. New Project → Add PostgreSQL
4. Copy the connection string

### 6. Update Backend for PostgreSQL

```bash
cd backend
# Copy the PostgreSQL schema
cp prisma/schema.postgresql.prisma prisma/schema.prisma
# Or manually edit schema.prisma and change:
# provider = "postgresql"
```

### 7. Update Environment Variables

Create `backend/.env`:
```env
DATABASE_URL="your-postgresql-connection-string"
JWT_SECRET="your-secret-key-here-make-it-long-and-random"
PORT=4000
NODE_ENV=production
```

### 8. Deploy Backend (Railway - Easiest)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Connect your repository
4. Set root directory: `backend`
5. Add environment variables:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `PORT=4000`
   - `NODE_ENV=production`
6. Railway will auto-deploy
7. Copy your backend URL (e.g., `https://your-app.railway.app`)

### 9. Update Frontend API URL

Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.railway.app
```

Update `frontend/src/lib/apiClient.ts` to use:
```typescript
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:4000';
```

### 10. Build and Deploy Frontend

```bash
cd frontend
npm install
npm run build
firebase deploy --only hosting
```

### 11. Test Your Deployment

1. Visit your Firebase hosting URL (shown after deploy)
2. Test admin login
3. Test product browsing
4. Test order creation

## Troubleshooting

### Build Fails
- Make sure all dependencies are installed: `npm install`
- Check Node.js version (should be 18+)

### Database Connection Fails
- Verify DATABASE_URL is correct
- Check if database allows connections from your IP
- For Supabase: Check connection pooling settings

### API Calls Fail
- Verify VITE_API_URL is set correctly
- Check backend CORS settings
- Check browser console for errors

### Frontend Shows Blank Page
- Check browser console for errors
- Verify build completed successfully
- Check Firebase hosting logs

## Next Steps

1. Set up custom domain (optional)
2. Configure Firebase Storage for file uploads
3. Set up CI/CD with GitHub Actions
4. Add monitoring and error tracking

## Support

- Firebase Docs: https://firebase.google.com/docs
- Railway Docs: https://docs.railway.app
- Supabase Docs: https://supabase.com/docs

