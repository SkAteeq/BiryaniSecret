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

export async function ensureAuthenticatedUser(requestedName?: string): Promise<UserProfile> {
  let currentUser = auth.currentUser;

  if (!currentUser) {
    try {
      // Try anonymous authentication first for frictionless guest entry
      const cred = await signInAnonymously(auth);
      currentUser = cred.user;
    } catch (anonError) {
      console.warn('Anonymous auth failed or disabled, falling back to popup sign-in:', anonError);
      // If anonymous auth is disabled on Firebase project, re-throw with actionable code
      const msg = anonError instanceof Error ? anonError.message : String(anonError);
      if (msg.includes('admin-restricted-operation') || msg.includes('operation-not-allowed')) {
        throw new Error('ANONYMOUS_AUTH_DISABLED');
      }
      throw anonError;
    }
  }

  const nameToUse = (requestedName && requestedName.trim()) 
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

export async function signInWithGoogle(): Promise<UserProfile> {
  const provider = new GoogleAuthProvider();
  const cred = await signInWithPopup(auth, provider);
  const name = cred.user.displayName || getStoredGuestName() || 'Biryani Fan';
  setStoredGuestName(name);
  return mapFirebaseUser(cred.user, name);
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

function mapFirebaseUser(user: User, fallbackName?: string): UserProfile {
  return {
    uid: user.uid,
    displayName: user.displayName || fallbackName || 'Biryani Guest',
    isAnonymous: user.isAnonymous,
    email: user.email
  };
}
