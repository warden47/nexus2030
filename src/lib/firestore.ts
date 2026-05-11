// lib/firestore.ts
import {
  collection,
  doc,
  getDoc,
  setDoc,
  addDoc,
  updateDoc,
  query,
  where,
  orderBy,
  limit,
  serverTimestamp,
  type QueryConstraint,
} from 'firebase/firestore';
import { db } from './firebase';
import type {
  User,
  Content,
  ContentType,
  WatchHistory,
  Recommendation,
  SocialPost,
  WatchParty,
} from '@/types/nexus';

// ───── Helper ─────
function throwIfNotFound<T>(snapshot: any, entity: string, id: string): T {
  if (!snapshot.exists()) {
    throw new Error(`${entity} not found (id: ${id})`);
  }
  return { id: snapshot.id, ...snapshot.data() } as T;
}

// ───── Users ─────
export async function getUser(uid: string): Promise<User> {
  try {
    const snap = await getDoc(doc(db, 'users', uid));
    return throwIfNotFound<User>(snap, 'User', uid);
  } catch (error) {
    console.error('getUser failed:', error);
    throw error;
  }
}

export async function updateUser(
  uid: string,
  data: Partial<Omit<User, 'uid' | 'createdAt'>>
): Promise<void> {
  try {
    await updateDoc(doc(db, 'users', uid), data as Record<string, any>);
  } catch (error) {
    console.error('updateUser failed:', error);
    throw error;
  }
}

// ───── Content ─────
export async function getContent(contentId: string): Promise<Content> {
  try {
    const snap = await getDoc(doc(db, 'content', contentId));
    return throwIfNotFound<Content>(snap, 'Content', contentId);
  } catch (error) {
    console.error('getContent failed:', error);
    throw error;
  }
}

export async function getContentList(
  filters: {
    category?: string;
    type?: ContentType;
    limit?: number;
  } = {}
): Promise<Content[]> {
  try {
    const constraints: QueryConstraint[] = [];

    if (filters.category) {
      constraints.push(where('categories', 'array-contains', filters.category));
    }
    if (filters.type) {
      constraints.push(where('type', '==', filters.type));
    }

    constraints.push(where('isPublished', '==', true));
    constraints.push(orderBy('publishedAt', 'desc'));

    if (filters.limit) {
      constraints.push(limit(filters.limit));
    }

    const q = query(collection(db, 'content'), ...constraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ contentId: doc.id, ...doc.data() } as Content));
  } catch (error) {
    console.error('getContentList failed:', error);
    throw error;
  }
}

// ───── Watch History ─────
export async function addWatchHistory(entry: WatchHistory): Promise<void> {
  try {
    const timestamp = entry.watchedAt ? new Date(entry.watchedAt) : serverTimestamp();
    await addDoc(collection(db, 'watchHistory'), {
      ...entry,
      watchedAt: timestamp,
    });
  } catch (error) {
    console.error('addWatchHistory failed:', error);
    throw error;
  }
}

export async function getWatchHistory(
  userId: string,
  limitCount: number = 20
): Promise<WatchHistory[]> {
  try {
    const q = query(
      collection(db, 'watchHistory'),
      where('userId', '==', userId),
      orderBy('watchedAt', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as WatchHistory));
  } catch (error) {
    console.error('getWatchHistory failed:', error);
    throw error;
  }
}

// ───── Recommendations ─────
export async function getRecommendations(userId: string): Promise<Recommendation> {
  try {
    const snap = await getDoc(doc(db, 'recommendations', userId));
    return throwIfNotFound<Recommendation>(snap, 'Recommendations', userId);
  } catch (error) {
    console.error('getRecommendations failed:', error);
    throw error;
  }
}

// ───── Social Posts ─────
export async function createSocialPost(
  post: Omit<SocialPost, 'id' | 'timestamp'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'socialPosts'), {
      ...post,
      likes: 0,
      timestamp: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('createSocialPost failed:', error);
    throw error;
  }
}

export async function getSocialPosts(
  contentId: string,
  limitCount: number = 50
): Promise<SocialPost[]> {
  try {
    const q = query(
      collection(db, 'socialPosts'),
      where('contentId', '==', contentId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SocialPost));
  } catch (error) {
    console.error('getSocialPosts failed:', error);
    throw error;
  }
}

// ───── Watch Parties ─────
export async function createWatchParty(
  party: Omit<WatchParty, 'partyId' | 'createdAt'>
): Promise<string> {
  try {
    const docRef = await addDoc(collection(db, 'watchParties'), {
      ...party,
      isActive: true,
      currentTimestamp: 0,
      createdAt: serverTimestamp(),
    });
    return docRef.id;
  } catch (error) {
    console.error('createWatchParty failed:', error);
    throw error;
  }
}

export async function getWatchParty(partyId: string): Promise<WatchParty> {
  try {
    const snap = await getDoc(doc(db, 'watchParties', partyId));
    return throwIfNotFound<WatchParty>(snap, 'WatchParty', partyId);
  } catch (error) {
    console.error('getWatchParty failed:', error);
    throw error;
  }
}

export async function updateWatchPartySync(
  partyId: string,
  timestamp: number,
  playState: boolean
): Promise<void> {
  try {
    await updateDoc(doc(db, 'watchParties', partyId), {
      currentTimestamp: timestamp,
      isPlaying: playState, // we added an extra field, but your WatchParty does not have isPlaying; we can omit or extend.
      // We'll keep it simple and just update the sync timestamp
    });
  } catch (error) {
    console.error('updateWatchPartySync failed:', error);
    throw error;
  }
}