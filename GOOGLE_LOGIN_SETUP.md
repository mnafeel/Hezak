# Google Login Setup Guide

## Overview
Google login has been integrated into your e-commerce website using Firebase Authentication.

## Prerequisites
- Firebase project created
- Firebase Authentication enabled
- Google sign-in provider enabled in Firebase Console

## Step 1: Set Up Firebase Authentication

### 1.1 Enable Google Sign-In in Firebase Console

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Authentication** → **Sign-in method**
4. Click on **Google**
5. Enable it and set:
   - **Project support email**: Your email
   - **Project public-facing name**: Your project name
6. Click **Save**

### 1.2 Get Firebase Configuration

1. In Firebase Console, go to **Project Settings** (gear icon)
2. Scroll down to **Your apps**
3. Click on the **Web** icon (`</>`)
4. Register your app (if not already done)
5. Copy the Firebase configuration object

### 1.3 Set Up Frontend Environment Variables

Create `frontend/.env` (for development) and `frontend/.env.production` (for production):

```env
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

### 1.4 Update Firebase Config File

Edit `frontend/src/lib/firebase.ts` and replace the placeholder values with your actual Firebase config, or ensure the environment variables are set correctly.

## Step 2: Set Up Firebase Admin SDK (Backend)

### 2.1 Get Service Account Key

1. In Firebase Console, go to **Project Settings**
2. Click on **Service accounts** tab
3. Click **Generate new private key**
4. Download the JSON file (keep it secure!)

### 2.2 Configure Backend Environment

**Option A: Environment Variable (Recommended for Production)**

Add to `backend/.env`:
```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key_id":"...","private_key":"...","client_email":"...","client_id":"...","auth_uri":"...","token_uri":"...","auth_provider_x509_cert_url":"...","client_x509_cert_url":"..."}'
```

**Option B: Service Account File (For Development)**

1. Place the downloaded JSON file in `backend/` directory
2. Add to `backend/.env`:
```env
GOOGLE_APPLICATION_CREDENTIALS=./path-to-service-account-key.json
```

**Option C: Direct File Path (Alternative)**

You can also modify `backend/src/utils/firebaseAdmin.ts` to directly import the service account file (not recommended for production).

## Step 3: Install Dependencies

### Frontend
```bash
cd frontend
npm install firebase
```

### Backend
```bash
cd backend
npm install firebase-admin
```

## Step 4: Test Google Login

1. Start your development servers:
   ```bash
   # Terminal 1 - Backend
   cd backend
   npm run dev

   # Terminal 2 - Frontend
   cd frontend
   npm run dev
   ```

2. Navigate to the login page
3. Click "Continue with Google"
4. Sign in with your Google account
5. You should be redirected and logged in

## Step 5: Authorized Domains (Production)

When deploying to production:

1. Go to Firebase Console → **Authentication** → **Settings**
2. Under **Authorized domains**, add your production domain
3. Firebase automatically includes:
   - `localhost` (for development)
   - Your Firebase project domain
   - You need to add your custom domain

## Troubleshooting

### "Firebase Admin not initialized"
- Check that `FIREBASE_SERVICE_ACCOUNT` or `GOOGLE_APPLICATION_CREDENTIALS` is set
- Verify the service account JSON is valid
- Check backend logs for initialization errors

### "Invalid ID token"
- Ensure Firebase Admin SDK is properly initialized
- Check that the ID token is being sent correctly
- Verify Firebase project IDs match between frontend and backend

### "Popup blocked" or "Popup closed"
- Check browser popup settings
- Ensure the domain is authorized in Firebase Console
- Try a different browser

### Google Sign-In Button Not Showing
- Check browser console for errors
- Verify Firebase config is correct
- Ensure `firebase` package is installed

## Security Notes

1. **Never commit** service account keys to Git
2. Add `*.json` (service account files) to `.gitignore`
3. Use environment variables in production
4. Restrict service account permissions in Google Cloud Console
5. Regularly rotate service account keys

## Features

✅ Google Sign-In button on login page
✅ Automatic account creation for new Google users
✅ Seamless integration with existing user system
✅ JWT token generation for authenticated users
✅ Works with existing order and profile features

## Next Steps

- [ ] Set up Firebase project
- [ ] Enable Google sign-in provider
- [ ] Configure environment variables
- [ ] Set up Firebase Admin SDK
- [ ] Test Google login
- [ ] Deploy and configure authorized domains

## Support

For issues:
1. Check Firebase Console → Authentication → Users (to see if users are being created)
2. Check backend logs for authentication errors
3. Verify all environment variables are set correctly
4. Test with a different Google account

