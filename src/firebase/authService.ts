import {
  signInAnonymously,
  signInWithPopup,
  GoogleAuthProvider,
  onAuthStateChanged,
  updateProfile,
  signOut as fbSignOut,
  User
} from 'firebase/auth';
import { auth } from './config';
import { UserProfile } from '../types';

const USER_NAME_STORAGE_KEY = 'biryani_bandi_guest_name';

export function getStoredGuestName(): string {
  try {
    return localStorage.getItem(USER_NAME_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function setStoredGuestName(name: string): void {
  try {
    localStorage.setItem(USER_NAME_STORAGE_KEY, name.trim());
  } catch {
    // ignore storage quota errors
  }
}

export function generateHyderabadNickname(): string {
  const titles = ['Ustaad', 'Bhaijaan', 'Miya', 'Chanti', 'Nawab', 'Biryani Lover', 'Shah', 'Captain'];
  const names = ['Salman', 'Raju', 'Fatima', 'Arjun', 'Zoya', 'Vikram', 'Pooja', 'Syed', 'Imran', 'Divya'];
  const t = titles[Math.floor(Math.random() * titles.length)];
  const n = names[Math.floor(Math.random() * names.length)];
  return `${t} ${n}`;
}

/**
 * Maps a Firebase User object to the application UserProfile.
 */
function mapFirebaseUser(user: User, fallbackName?: string): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName || fallbackName || (user.isAnonymous ? 'Guest Foodie' : 'Biryani Fan'),
    isAnonymous: user.isAnonymous,
    email: user.email,
    photoURL: user.photoURL || null
  };
}

/**
 * Checks if a persisted user session already exists from a prior session.
 * Does NOT force login if no user is signed in.
 */
export async function checkExistingAuthSession(): Promise<UserProfile | null> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    return null;
  }
  const stored = getStoredGuestName();
  return mapFirebaseUser(currentUser, stored);
}

/**
 * Explicitly signs in as an anonymous guest.
 * Preserves guest identity across reloads and reconnections.
 */
export async function signInAsGuest(customName?: string): Promise<UserProfile> {
  let currentUser = auth.currentUser;

  if (!currentUser) {
    try {
      const cred = await signInAnonymously(auth);
      currentUser = cred.user;
    } catch (anonError: any) {
      console.warn('Anonymous auth failed:', anonError);
      const msg = anonError instanceof Error ? anonError.message : String(anonError);
      if (msg.includes('admin-restricted-operation') || msg.includes('operation-not-allowed')) {
        throw new Error('ANONYMOUS_AUTH_DISABLED');
      }
      throw anonError;
    }
  }

  const nameToUse = (customName && customName.trim())
    || currentUser.displayName
    || getStoredGuestName()
    || generateHyderabadNickname();

  if (nameToUse && (!currentUser.displayName || currentUser.displayName !== nameToUse)) {
    try {
      await updateProfile(currentUser, { displayName: nameToUse });
    } catch {
      // Non-critical profile update failure
    }
    setStoredGuestName(nameToUse);
  }

  return mapFirebaseUser(currentUser, nameToUse);
}

/**
 * Ensures an authenticated user exists (used when casting a vote or launching a vote).
 * Prefers existing session, otherwise creates an anonymous guest session.
 */
export async function ensureAuthenticatedUser(requestedName?: string): Promise<UserProfile> {
  if (auth.currentUser) {
    return mapFirebaseUser(auth.currentUser, requestedName);
  }
  return signInAsGuest(requestedName);
}

/**
 * Signs in using Google Authentication.
 * Handles popup cancellation and returns user with Google profile name and photo.
 */
export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  provider.setCustomParameters({ prompt: 'select_account' });

  try {
    const cred = await signInWithPopup(auth, provider);
    const name = cred.user.displayName || 'Biryani Foodie';
    setStoredGuestName(name);
    return mapFirebaseUser(cred.user, name);
  } catch (error: any) {
    // Handle user cancellation gracefully
    if (
      error.code === 'auth/popup-closed-by-user' ||
      error.code === 'auth/cancelled-popup-request'
    ) {
      const cancelledErr = new Error('Sign-in cancelled by user');
      (cancelledErr as any).code = 'SIGN_IN_CANCELLED';
      throw cancelledErr;
    }
    throw error;
  }
}

export async function signOutUser(): Promise<void> {
  await fbSignOut(auth);
}

export function subscribeToAuthState(callback: (user: UserProfile | null) => void): () => void {
  return onAuthStateChanged(auth, (user: User | null) => {
    if (user) {
      const stored = getStoredGuestName();
      callback(mapFirebaseUser(user, stored));
    } else {
      callback(null);
    }
  });
}
