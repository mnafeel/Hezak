# Firebase Configuration Helper

## Value Provided
`T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw`

This looks like a **Firebase API Key**. Here's how to configure it:

## Step 1: Get Complete Firebase Config

The value you provided is likely the API key. You need ALL Firebase configuration values. Here's how to get them:

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Click the gear icon ⚙️ → **Project settings**
4. Scroll down to **Your apps** section
5. Click on the **Web** icon (`</>`)
6. If you haven't created a web app yet, click **Add app** → **Web**
7. You'll see a config object like this:

```javascript
const firebaseConfig = {
  apiKey: "T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef"
};
```

## Step 2: Create Environment File

Create `frontend/.env` file with all values:

```env
VITE_FIREBASE_API_KEY=T5RzgmZ20sF2i9hMPoBCAPjVFLuE1BcZOi4Igf_gwFw
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your-sender-id
VITE_FIREBASE_APP_ID=your-app-id
```

**Replace the placeholder values with your actual Firebase config values!**

## Step 3: Enable Google Sign-In

1. In Firebase Console, go to **Authentication**
2. Click **Get started** (if first time)
3. Go to **Sign-in method** tab
4. Click on **Google**
5. Toggle **Enable**
6. Set **Project support email**
7. Click **Save**

## Step 4: Get Service Account Key (For Backend)

1. In Firebase Console → **Project Settings** → **Service accounts**
2. Click **Generate new private key**
3. Download the JSON file
4. Add to `backend/.env`:

```env
FIREBASE_SERVICE_ACCOUNT='{"type":"service_account","project_id":"...","private_key":"...","client_email":"..."}'
```

Or use file path:
```env
GOOGLE_APPLICATION_CREDENTIALS=./service-account-key.json
```

## Quick Setup Script

I can help you create the `.env` file if you provide:
- Your Firebase project ID
- Your auth domain
- Your storage bucket
- Your messaging sender ID
- Your app ID

Or you can copy them directly from Firebase Console!

