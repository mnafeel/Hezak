# Firebase Hosting & Database Setup Guide

## Current Setup
- **Backend**: Express.js with Prisma ORM
- **Database**: SQLite (local)
- **Frontend**: React with Vite

## Option 1: Hybrid Approach (Recommended)
Keep your Express backend, use Firebase Hosting for frontend, and migrate to a cloud SQL database.

### Benefits:
- ✅ Minimal code changes
- ✅ Keep Prisma and existing backend logic
- ✅ Use Firebase Hosting (free tier available)
- ✅ Use Firebase Storage for file uploads
- ✅ Better scalability than SQLite

### Steps:

#### 1. Set up Firebase Project
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Firebase Hosting
4. Enable Firebase Storage

#### 2. Migrate Database to PostgreSQL
Recommended providers:
- **Supabase** (Free tier, PostgreSQL)
- **Railway** (Easy setup, PostgreSQL)
- **Render** (Free tier available, PostgreSQL)

#### 3. Update Prisma Schema
Change from SQLite to PostgreSQL in `backend/prisma/schema.prisma`:
```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

#### 4. Deploy Backend
Host your Express backend on:
- **Railway** (recommended)
- **Render**
- **Heroku**
- **DigitalOcean App Platform**

#### 5. Deploy Frontend to Firebase Hosting
See setup instructions below.

---

## Option 2: Full Firebase Migration
Migrate everything to Firebase (Firestore, Cloud Functions, Firebase Hosting).

### Benefits:
- ✅ Fully managed by Google
- ✅ Real-time capabilities
- ✅ Automatic scaling
- ✅ Integrated authentication

### Considerations:
- ⚠️ Requires rewriting backend as Cloud Functions
- ⚠️ Firestore is NoSQL (different from your current SQL structure)
- ⚠️ More complex migration

---

## Quick Start: Hybrid Approach

### Step 1: Install Firebase CLI
```bash
npm install -g firebase-tools
firebase login
```

### Step 2: Initialize Firebase in Frontend
```bash
cd frontend
firebase init hosting
```

### Step 3: Configure Firebase
Select:
- Use an existing project (or create new)
- Public directory: `dist` (Vite build output)
- Configure as single-page app: Yes
- Set up automatic builds: No (we'll do it manually)

### Step 4: Build and Deploy
```bash
cd frontend
npm run build
firebase deploy --only hosting
```

---

## Environment Variables Setup

### Backend (.env)
```env
DATABASE_URL="postgresql://user:password@host:5432/dbname"
JWT_SECRET="your-secret-key"
PORT=3000
NODE_ENV=production
```

### Frontend (.env.production)
```env
VITE_API_URL="https://your-backend-url.com"
```

---

## Next Steps
1. Choose your approach (Hybrid recommended)
2. Set up cloud database (PostgreSQL)
3. Update environment variables
4. Deploy backend
5. Deploy frontend to Firebase Hosting

See individual setup files for detailed instructions.

