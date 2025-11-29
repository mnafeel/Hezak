# Google Login - Quick Start

## ✅ What's Been Done

1. ✅ Firebase SDK installed in frontend
2. ✅ Firebase Admin SDK installed in backend
3. ✅ Google login button added to login page
4. ✅ Backend endpoint created (`/auth/google`)
5. ✅ Authentication service updated

## 🚀 Next Steps (5 minutes)

### 1. Set Up Firebase Project

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create/Select your project
3. Go to **Authentication** → **Sign-in method**
4. Enable **Google** provider
5. Go to **Project Settings** → Copy your config

### 2. Configure Frontend

Create `frontend/.env`:
```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 3. Configure Backend

1. In Firebase Console → **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file

**Option A: Environment Variable (Recommended)**
Add to `backend/.env`:
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
```
(Paste the entire JSON content as a single line string)

**Option B: File Path**
Add to `backend/.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account-key.json
```

### 4. Test It!

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to login page
4. Click "Continue with Google"
5. Sign in!

## 📝 Files Created/Modified

**Frontend:**
- `frontend/src/lib/firebase.ts` - Firebase config
- `frontend/src/lib/firebaseAuth.ts` - Google auth helper
- `frontend/src/pages/store/LoginPage.tsx` - Added Google button
- `frontend/src/lib/api.ts` - Added `googleLogin` function

**Backend:**
- `backend/src/utils/firebaseAdmin.ts` - Firebase Admin setup
- `backend/src/services/userAuthService.ts` - Added `loginWithGoogle`
- `backend/src/controllers/userAuthController.ts` - Added `googleAuth`
- `backend/src/routes/userAuthRoutes.ts` - Added `/auth/google` route
- `backend/src/schemas/auth.ts` - Added Google login schema

## 🎨 Features

- ✅ Google Sign-In button with Google logo
- ✅ Automatic account creation for new users
- ✅ Seamless integration with existing auth system
- ✅ Works with orders, profile, and all features
- ✅ Beautiful UI matching your theme

## ⚠️ Important Notes

1. **Never commit** service account keys to Git
2. Add `*.json` (service account files) to `.gitignore`
3. For production, add your domain to Firebase authorized domains
4. Test thoroughly before deploying

## 📚 Full Documentation

See `GOOGLE_LOGIN_SETUP.md` for detailed instructions.

