import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  deleteDoc, 
  query, 
  orderBy,
  writeBatch
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { JournalEntry, ChatMessage, DailySummary, UserProfile } from '../types';
import { getSampleChat } from './storage';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  }
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

/**
 * Recursively removes keys with `undefined` values from objects or arrays.
 * Firestore setDoc/updateDoc fails if any property is `undefined`.
 */
export function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return data;
  }
  if (Array.isArray(data)) {
    return data
      .filter((item) => item !== undefined)
      .map((item) => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object' && !(data instanceof Date)) {
    const cleanObj: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleanObj[key] = sanitizeForFirestore(value);
      }
    }
    return cleanObj as T;
  }
  return data;
}

// Ensure user profile document exists
export async function syncUserProfile(profile: UserProfile): Promise<void> {
  const path = `users/${profile.uid}`;
  try {
    const userDocRef = doc(db, 'users', profile.uid);
    const payload = sanitizeForFirestore({
      userId: profile.uid,
      email: profile.email,
      displayName: profile.displayName,
      createdAt: profile.createdAt || new Date().toISOString(),
    });
    await setDoc(userDocRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Journal Entries Service
export async function getFirestoreJournalEntries(userId: string): Promise<JournalEntry[]> {
  const path = `users/${userId}/journals`;
  try {
    const journalsRef = collection(db, 'users', userId, 'journals');
    const q = query(journalsRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        title: data.title || '',
        content: data.content || '',
        mood: data.mood || 'Neutral',
        moodScore: Number(data.moodScore ?? 5),
        tags: Array.isArray(data.tags) ? data.tags : [],
        date: data.date || new Date().toISOString().split('T')[0],
        createdAt: data.createdAt || new Date().toISOString(),
        updatedAt: data.updatedAt,
        aiInsight: data.aiInsight,
      } as JournalEntry;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreJournalEntry(userId: string, entry: JournalEntry): Promise<void> {
  const path = `users/${userId}/journals/${entry.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'journals', entry.id);
    const payload = sanitizeForFirestore({
      ...entry,
      updatedAt: new Date().toISOString()
    });
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreJournalEntry(userId: string, entryId: string): Promise<void> {
  const path = `users/${userId}/journals/${entryId}`;
  try {
    const docRef = doc(db, 'users', userId, 'journals', entryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

// Chat Messages Service
export async function getFirestoreChatMessages(userId: string): Promise<ChatMessage[]> {
  const path = `users/${userId}/chatMessages`;
  try {
    const chatRef = collection(db, 'users', userId, 'chatMessages');
    const q = query(chatRef, orderBy('timestamp', 'asc'));
    const snapshot = await getDocs(q);
    
    let messages = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        sender: data.sender || 'mana',
        text: data.text || '',
        timestamp: data.timestamp || new Date().toISOString(),
        modelUsed: data.modelUsed,
        mode: data.mode,
        useSearch: data.useSearch,
        groundingMetadata: data.groundingMetadata,
      } as ChatMessage;
    });

    const hasOldText = messages.some(msg => msg.text && (msg.text.includes('(مانا)') || msg.text.includes('مانا')));
    const isSingleInitialMessage = messages.length === 1 && messages[0].sender === 'mana';

    if (hasOldText || isSingleInitialMessage) {
      const fresh = getSampleChat(userId);
      // Let's delete the old messages from firestore and write the fresh one to align the cloud state
      try {
        const batch = writeBatch(db);
        // Delete all existing documents in users/userId/chatMessages
        for (const docSnap of snapshot.docs) {
          batch.delete(docSnap.ref);
        }
        // Save the new clean sample chat
        for (const msg of fresh) {
          const newDocRef = doc(db, 'users', userId, 'chatMessages', msg.id);
          batch.set(newDocRef, sanitizeForFirestore(msg));
        }
        await batch.commit();
      } catch (err) {
        console.error('Failed to sync cleaned chat to Firestore:', err);
      }
      return fresh;
    }
    
    return messages;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreChatMessage(userId: string, message: ChatMessage): Promise<void> {
  const path = `users/${userId}/chatMessages/${message.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'chatMessages', message.id);
    const payload = sanitizeForFirestore(message);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function clearFirestoreChatHistory(userId: string, initialMessage: ChatMessage): Promise<void> {
  const path = `users/${userId}/chatMessages`;
  try {
    const chatRef = collection(db, 'users', userId, 'chatMessages');
    const snapshot = await getDocs(chatRef);
    
    const batch = writeBatch(db);
    snapshot.docs.forEach(doc => {
      batch.delete(doc.ref);
    });
    
    // Add the new welcome message
    const initialDocRef = doc(db, 'users', userId, 'chatMessages', initialMessage.id);
    batch.set(initialDocRef, sanitizeForFirestore(initialMessage));
    
    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

// Daily Summaries Service
export async function getFirestoreDailySummaries(userId: string): Promise<DailySummary[]> {
  const path = `users/${userId}/dailySummaries`;
  try {
    const summariesRef = collection(db, 'users', userId, 'dailySummaries');
    const q = query(summariesRef, orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    
    return snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        userId: data.userId,
        date: data.date || new Date().toISOString().split('T')[0],
        title: data.title || '',
        dominantMood: data.dominantMood || 'Neutral',
        moodScore: Number(data.moodScore ?? 5),
        emotionalThemes: Array.isArray(data.emotionalThemes) ? data.emotionalThemes : [],
        summaryPoints: Array.isArray(data.summaryPoints) ? data.summaryPoints : [],
        gratitudeAndStrengths: Array.isArray(data.gratitudeAndStrengths) ? data.gratitudeAndStrengths : [],
        gentlePrompt: data.gentlePrompt || '',
        manaNote: data.manaNote || '',
        createdAt: data.createdAt || new Date().toISOString(),
      } as DailySummary;
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
    return [];
  }
}

export async function saveFirestoreDailySummary(userId: string, summary: DailySummary): Promise<void> {
  const path = `users/${userId}/dailySummaries/${summary.id}`;
  try {
    const docRef = doc(db, 'users', userId, 'dailySummaries', summary.id);
    const payload = sanitizeForFirestore(summary);
    await setDoc(docRef, payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteFirestoreDailySummary(userId: string, summaryId: string): Promise<void> {
  const path = `users/${userId}/dailySummaries/${summaryId}`;
  try {
    const docRef = doc(db, 'users', userId, 'dailySummaries', summaryId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}
