import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  signInAnonymously,
  signOut,
  updateProfile,
  User as FirebaseUser
} from 'firebase/auth';
import { auth, googleProvider } from './firebase';
import { UserProfile } from '../types';
import { setStoredUser, getStoredUser } from './storage';
import { syncUserProfile } from './firestoreService';

// Map Firebase User to our UserProfile type
export function mapFirebaseUser(user: FirebaseUser): UserProfile {
  return {
    uid: user.uid,
    email: user.email || `${user.uid}@anonymous.mana.app`,
    displayName: user.displayName || 'Mindful Explorer',
    isAnonymous: user.isAnonymous,
    createdAt: user.metadata.creationTime || new Date().toISOString()
  };
}

export async function authenticateWithEmail(
  email: string,
  pass: string,
  mode: 'signin' | 'signup',
  displayName?: string
): Promise<UserProfile> {
  let userCredential;
  if (mode === 'signup') {
    userCredential = await createUserWithEmailAndPassword(auth, email, pass);
    if (displayName) {
      await updateProfile(userCredential.user, { displayName });
    }
  } else {
    userCredential = await signInWithEmailAndPassword(auth, email, pass);
  }

  const profile = mapFirebaseUser(userCredential.user);
  if (displayName && mode === 'signup') {
    profile.displayName = displayName;
  }
  
  // Sync profile metadata to Firestore
  await syncUserProfile(profile);
  
  setStoredUser(profile);
  return profile;
}

export async function signInWithGoogle(): Promise<UserProfile> {
  const result = await signInWithPopup(auth, googleProvider);
  const profile = mapFirebaseUser(result.user);
  
  // Sync profile metadata to Firestore
  await syncUserProfile(profile);
  
  setStoredUser(profile);
  return profile;
}

export async function createDemoSession(name = 'Mindful Explorer'): Promise<UserProfile> {
  const userCredential = await signInAnonymously(auth);
  await updateProfile(userCredential.user, { displayName: name });
  
  const profile = mapFirebaseUser(userCredential.user);
  profile.displayName = name;
  
  // Sync profile to Firestore
  await syncUserProfile(profile);
  
  setStoredUser(profile);
  return profile;
}

export async function logOutUser(): Promise<void> {
  await signOut(auth);
  setStoredUser(null);
}

export function getCurrentSession(): UserProfile | null {
  return getStoredUser();
}
