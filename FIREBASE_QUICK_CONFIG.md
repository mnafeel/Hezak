# Quick Firebase Configuration

## ✅ Your API Key
You provided: `T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw`

## 📝 Create Environment File

Create `frontend/.env` file with this content:

```env
VITE_FIREBASE_API_KEY=T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw
VITE_FIREBASE_AUTH_DOMAIN=YOUR_AUTH_DOMAIN
VITE_FIREBASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_FIREBASE_STORAGE_BUCKET=YOUR_STORAGE_BUCKET
VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_SENDER_ID
VITE_FIREBASE_APP_ID=YOUR_APP_ID
```

## 🔍 How to Get Missing Values

1. **Go to Firebase Console**: https://console.firebase.google.com/
2. **Select your project**
3. **Click ⚙️ (gear icon)** → **Project settings**
4. **Scroll down** to **"Your apps"** section
5. **Click the Web icon** (`</>`)
6. **Copy the config values** from the code snippet shown

The config will look like:
```javascript
const firebaseConfig = {
  apiKey: "T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw", // ✅ You have this
  authDomain: "your-project.firebaseapp.com",           // ⬅️ Copy this
  projectId: "your-project-id",                        // ⬅️ Copy this
  storageBucket: "your-project.appspot.com",           // ⬅️ Copy this
  messagingSenderId: "123456789",                      // ⬅️ Copy this
  appId: "1:123456789:web:abcdef"                       // ⬅️ Copy this
};
```

## 🚀 Quick Setup

**Option 1: Use the script**
```bash
./setup-firebase.sh
```

**Option 2: Manual setup**
1. Copy the template: `cp frontend/.env.template frontend/.env`
2. Edit `frontend/.env` and fill in the values from Firebase Console

## ✅ Enable Google Sign-In

1. Firebase Console → **Authentication**
2. **Sign-in method** tab
3. Click **Google** → **Enable**
4. Set **Project support email**
5. **Save**

## 🔐 Backend Setup (For Google Login)

1. Firebase Console → **Project Settings** → **Service accounts**
2. **Generate new private key** → Download JSON
3. Add to `backend/.env`:
   ```env
   FIREBASE_SERVICE_ACCOUNT='{"type":"service_account",...}'
   ```
   (Paste entire JSON as single line)

## ✨ Test It!

1. Start backend: `cd backend && npm run dev`
2. Start frontend: `cd frontend && npm run dev`
3. Go to login page
4. Click "Continue with Google" 🎉

---

**Need help?** Check `GOOGLE_LOGIN_SETUP.md` for detailed instructions.

