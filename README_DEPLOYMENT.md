# 🚀 Deployment Guide for E-commerce Website

This guide will help you deploy your e-commerce website to Firebase Hosting with a cloud database.

## 📋 Overview

Your current setup:
- **Frontend**: React + Vite (will deploy to Firebase Hosting)
- **Backend**: Express.js + Prisma (will deploy to Railway/Render)
- **Database**: SQLite (will migrate to PostgreSQL)

## 🎯 Quick Start (30 minutes)

### Step 1: Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Click "Add project"
3. Name it (e.g., "ecommerce-hezak")
4. Create project

### Step 2: Set Up Database (Supabase - Free)

1. Go to [supabase.com](https://supabase.com)
2. Sign up and create project
3. Go to Settings → Database
4. Copy connection string

### Step 3: Update Backend for PostgreSQL

```bash
cd backend
# Edit prisma/schema.prisma
# Change: provider = "postgresql"
```

### Step 4: Deploy Backend (Railway)

1. Go to [railway.app](https://railway.app)
2. New Project → Deploy from GitHub
3. Root directory: `backend`
4. Add environment variables:
   - `DATABASE_URL` (from Supabase)
   - `JWT_SECRET` (generate a random string)
   - `PORT=4000`
   - `NODE_ENV=production`
5. Copy your backend URL

### Step 5: Configure Frontend

1. Create `frontend/.env.production`:
```env
VITE_API_URL=https://your-backend-url.railway.app
```

2. Initialize Firebase:
```bash
npm install -g firebase-tools
firebase login
cd frontend
firebase init hosting
# Select: dist, single-page app: Yes
```

3. Update `.firebaserc` with your project ID

### Step 6: Deploy

```bash
cd frontend
npm run build
firebase deploy --only hosting
```

## 📚 Detailed Guides

- **QUICK_START.md** - Step-by-step instructions
- **DEPLOYMENT_GUIDE.md** - Complete deployment guide
- **FIREBASE_SETUP.md** - Firebase-specific setup

## 🔧 Configuration Files Created

- `firebase.json` - Firebase hosting configuration
- `.firebaserc` - Firebase project ID (update this!)
- `backend/prisma/schema.postgresql.prisma` - PostgreSQL schema template

## ⚠️ Important Notes

1. **Update `.firebaserc`** with your Firebase project ID
2. **Set `VITE_API_URL`** in `frontend/.env.production`
3. **Migrate database** before deploying backend
4. **Test locally** after updating API URL

## 🆘 Troubleshooting

### Database Issues
- Verify DATABASE_URL format
- Check Supabase connection settings
- Ensure database is accessible

### Build Issues
- Run `npm install` in both frontend and backend
- Check Node.js version (18+)
- Review error messages

### API Connection Issues
- Verify VITE_API_URL is correct
- Check backend CORS settings
- Test backend URL directly

## 📞 Need Help?

1. Check the detailed guides
2. Review Firebase/Railway documentation
3. Check browser console for errors
4. Verify all environment variables

## ✅ Post-Deployment Checklist

- [ ] Database migrated to PostgreSQL
- [ ] Backend deployed and accessible
- [ ] Frontend deployed to Firebase
- [ ] API URL configured correctly
- [ ] Admin login works
- [ ] Products display correctly
- [ ] Orders can be created
- [ ] File uploads work

---

**Ready to deploy?** Start with `QUICK_START.md`!

