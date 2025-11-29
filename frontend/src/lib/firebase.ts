import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getAnalytics } from 'firebase/analytics';

// Firebase configuration
// Using environment variables for security, with fallback to your project config
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY || "AIzaSyDG-sE-c16dHqO01FvlomU_ZmNT6icV-XY",
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || "hezak-f6fb3.firebaseapp.com",
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID || "hezak-f6fb3",
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || "hezak-f6fb3.firebasestorage.app",
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || "795434723912",
  appId: import.meta.env.VITE_FIREBASE_APP_ID || "1:795434723912:web:10c9db09a2351a9468467d",
  measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID || "G-HCP5KN2S6Q"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Initialize Firebase Authentication and get a reference to the service
export const auth = getAuth(app);

// Initialize Analytics (only in browser environment)
export const analytics = typeof window !== 'undefined' ? getAnalytics(app) : null;

// Google Auth Provider
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({
  prompt: 'select_account'
});

export default app;

