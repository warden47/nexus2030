// lib/auth.ts
import {
  GoogleAuthProvider,
  signInWithPopup,
  signInWithEmailLink,
  sendSignInLinkToEmail,
  isSignInWithEmailLink,
  signInAnonymously as firebaseSignInAnonymously,
  signOut as firebaseSignOut,
  onAuthStateChanged as firebaseOnAuthStateChanged,
  updateProfile,
  type User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { useUserStore } from '@/store/userStore'; // Assumed Zustand store for user state
import type { User } from '@/types/nexus';

// ───── Constants ─────
const MAGIC_LINK_KEY = 'nexus_magic_link_email';

// ───── Helper: Create / initialise user document ─────
async function createUserDocument(uid: string, data: Partial<User>) {
  const defaultUser: User = {
    uid,
    displayName: data.displayName ?? 'Guest',
    email: data.email ?? '',
    avatarURL: data.avatarURL ?? '',
    premiumTier: 'free',
    watchStreak: 1,
    moodPreferences: [],
    createdAt: new Date().toISOString(),
    role: 'user',
  };

  await setDoc(doc(db, 'users', uid), {
    ...defaultUser,
    ...data,
    uid, // ensure uid is always set
  });
}

// ───── signInWithGoogle ─────
export async function signInWithGoogle(): Promise<void> {
  try {
    const provider = new GoogleAuthProvider();
    const result = await signInWithPopup(auth, provider);
    const { user } = result;

    // Create Firestore document only if new user
    if (result._tokenResponse?.isNewUser) {
      await createUserDocument(user.uid, {
        displayName: user.displayName ?? '',
        email: user.email ?? '',
        avatarURL: user.photoURL ?? '',
      });
    }

    // Zustand store update (if you have a login action)
    const { setUser } = useUserStore.getState();
    setUser({
      uid: user.uid,
      displayName: user.displayName ?? '',
      email: user.email ?? '',
      avatarURL: user.photoURL ?? '',
      role: 'user', // you may want to fetch from claims / db later
      premiumTier: 'free',
    });
  } catch (error) {
    console.error('Google sign‑in failed:', error);
    throw error;
  }
}

// ───── signInWithEmail (magic link) ─────
export async function signInWithEmail(email: string, actionCodeSettings?: {
  url: string;
}): Promise<void> {
  try {
    const settings = actionCodeSettings ?? {
      url: typeof window !== 'undefined' ? window.location.href : '',
      handleCodeInApp: true,
    };

    await sendSignInLinkToEmail(auth, email, settings);
    // Store email so we know who is trying to sign in later
    localStorage.setItem(MAGIC_LINK_KEY, email);
  } catch (error) {
    console.error('Magic link send failed:', error);
    throw error;
  }
}

// ───── confirmMagicLink ─────
export async function confirmMagicLink(): Promise<void> {
  try {
    const email = localStorage.getItem(MAGIC_LINK_KEY);
    if (!email) {
      throw new Error('No saved email for magic link confirmation.');
    }

    if (isSignInWithEmailLink(auth, window.location.href)) {
      const result = await signInWithEmailLink(auth, email, window.location.href);
      const { user } = result;

      // Clear stored email
      localStorage.removeItem(MAGIC_LINK_KEY);

      // If new user, create Firestore document
      if (result._tokenResponse?.isNewUser) {
        await createUserDocument(user.uid, {
          displayName: user.displayName ?? '',
          email: user.email ?? email,
          avatarURL: user.photoURL ?? '',
        });
      }

      // Update Zustand store
      const { setUser } = useUserStore.getState();
      setUser({
        uid: user.uid,
        displayName: user.displayName ?? '',
        email: user.email ?? email,
        avatarURL: user.photoURL ?? '',
        role: 'user',
        premiumTier: 'free',
      });
    } else {
      throw new Error('Current URL is not a valid magic link sign‑in.');
    }
  } catch (error) {
    console.error('Magic link confirmation failed:', error);
    throw error;
  }
}

// ───── signInAnonymously ─────
export async function signInAnonymously(): Promise<void> {
  try {
    const result = await firebaseSignInAnonymously(auth);
    const { user } = result;

    // Determine if we need to create a document (anonymous users are new by default)
    await createUserDocument(user.uid, {
      displayName: `Guest_${user.uid.slice(0, 6)}`,
      email: '',
      avatarURL: '',
      premiumTier: 'free',
      role: 'user',
    });

    const { setUser } = useUserStore.getState();
    setUser({
      uid: user.uid,
      displayName: `Guest_${user.uid.slice(0, 6)}`,
      email: '',
      avatarURL: '',
      role: 'user',
      premiumTier: 'free',
    });
  } catch (error) {
    console.error('Anonymous sign‑in failed:', error);
    throw error;
  }
}

// ───── signOut ─────
export async function signOut(): Promise<void> {
  try {
    await firebaseSignOut(auth);
    // Clear Zustand user store
    useUserStore.getState().reset();
  } catch (error) {
    console.error('Sign‑out failed:', error);
    throw error;
  }
}

// ───── getCurrentUser ─────
export function getCurrentUser(): FirebaseUser | null {
  return auth.currentUser;
}

// ───── onAuthStateChanged ─────
export function onAuthStateChanged(callback: (user: FirebaseUser | null) => void) {
  return firebaseOnAuthStateChanged(auth, callback);
}

// ───── getUserCustomClaims ─────
export async function getUserCustomClaims(): Promise<Record<string, any> | null> {
  const user = auth.currentUser;
  if (!user) return null;

  try {
    const idTokenResult = await user.getIdTokenResult();
    return idTokenResult.claims;
  } catch (error) {
    console.error('Failed to get custom claims:', error);
    throw error;
  }
}

// ───── updateUserProfile ─────
export async function updateUserProfile(
  uid: string,
  updates: { displayName?: string; avatarURL?: string }
): Promise<void> {
  try {
    const user = auth.currentUser;
    if (user) {
      await updateProfile(user, {
        displayName: updates.displayName,
        photoURL: updates.avatarURL,
      });
    }

    // Also update Firestore document
    const userRef = doc(db, 'users', uid);
    await updateDoc(userRef, updates as Record<string, any>);
  } catch (error) {
    console.error('Profile update failed:', error);
    throw error;
  }
}