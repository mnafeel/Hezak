import { signInWithPopup, GoogleAuthProvider, type User as FirebaseUser } from 'firebase/auth';
import { auth, googleProvider } from './firebase';

export interface GoogleLoginResult {
  idToken: string;
  email: string;
  name: string;
  photoURL?: string | null;
}

export const signInWithGoogle = async (): Promise<GoogleLoginResult> => {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;
    
    // Get the ID token
    const idToken = await user.getIdToken();
    
    return {
      idToken,
      email: user.email || '',
      name: user.displayName || user.email?.split('@')[0] || 'User',
      photoURL: user.photoURL
    };
  } catch (error: any) {
    console.error('Google sign-in error:', error);
    throw new Error(error.message || 'Failed to sign in with Google');
  }
};

