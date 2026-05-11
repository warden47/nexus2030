import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

// Initialize Firebase Admin if not already
if (!getApps().length) {
  // Use default credentials when deployed on Firebase, else use service account
  initializeApp({
    credential: process.env.FIREBASE_ADMIN_SDK
      ? cert(JSON.parse(process.env.FIREBASE_ADMIN_SDK))
      : undefined,
  });
}
const db = getFirestore();

export async function POST(request: NextRequest) {
  try {
    // Verify Firebase ID token from Authorization header
    const authHeader = request.headers.get('Authorization') ?? '';
    const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { getAuth } = await import('firebase-admin/auth');
    const decoded = await getAuth().verifyIdToken(token);
    const userId = decoded.uid;

    const body = await request.json();
    const mood = body.mood ?? null;

    // 1. Fetch user's watch history (last 50)
    const historySnap = await db
      .collection('watchHistory')
      .where('userId', '==', userId)
      .orderBy('watchedAt', 'desc')
      .limit(50)
      .get();

    const watchedContentIds = historySnap.docs.map(d => d.data().contentId);
    const watchedTags: string[] = [];
    if (watchedContentIds.length > 0) {
      const contentSnaps = await Promise.all(
        watchedContentIds.map(id => db.collection('content').doc(id).get())
      );
      contentSnaps.forEach(snap => {
        if (snap.exists) {
          const tags = snap.data()?.tags || [];
          watchedTags.push(...tags);
        }
      });
    }

    // Tag frequency
    const tagFreq: Record<string, number> = {};
    watchedTags.forEach(tag => (tagFreq[tag] = (tagFreq[tag] || 0) + 1));

    // 2. Query candidate content (published, exclude watched)
    let query: FirebaseFirestore.Query = db
      .collection('content')
      .where('isPublished', '==', true)
      .orderBy('viewCount', 'desc')
      .limit(100);

    if (mood) {
      query = query.where('tags', 'array-contains', mood);
    }

    const contentSnap = await query.get();
    const feed: Array<{ contentId: string; score: number }> = [];

    contentSnap.docs.forEach(doc => {
      if (watchedContentIds.includes(doc.id)) return;
      const data = doc.data();
      const tags: string[] = data.tags || [];
      let score = tags.reduce((s, tag) => s + (tagFreq[tag] || 0), 0);
      score += Math.log(1 + (data.viewCount || 0)) * 0.1;
      if (mood && tags.includes(mood)) score += 5;
      feed.push({ contentId: doc.id, score });
    });

    feed.sort((a, b) => b.score - a.score);

    // 3. Cache in Firestore
    await db.collection('recommendations').doc(userId).set({
      userId,
      personalizedFeed: feed.slice(0, 30),
      lastUpdated: FieldValue.serverTimestamp(),
    }, { merge: true });

    return NextResponse.json({ personalizedFeed: feed.slice(0, 30) });
  } catch (error: any) {
    console.error('Recommendation API error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}