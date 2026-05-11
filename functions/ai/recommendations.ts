// functions/ai/recommendations.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { FieldValue } from 'firebase-admin/firestore';

const db = admin.firestore();

/**
 * Callable function: `getRecommendations`
 * Accepts userId and optional mood.
 * Returns a personalized feed array of { contentId, score }.
 * Uses a basic collaborative + content-based heuristic.
 * In production, replace with Vertex AI model.
 */
export const getRecommendations = functions.https.onCall(
  { enforceAppCheck: false }, // enable if using App Check
  async (request) => {
    const { userId, mood } = request.data ?? {};
    if (!userId) {
      throw new functions.https.HttpsError('invalid-argument', 'Missing userId.');
    }

    try {
      // 1. Fetch user's watch history (last 50 items)
      const historySnap = await db
        .collection('watchHistory')
        .where('userId', '==', userId)
        .orderBy('watchedAt', 'desc')
        .limit(50)
        .get();

      const watchedContentIds = historySnap.docs.map(doc => doc.data().contentId);
      const watchedTags: string[] = [];

      // 2. Fetch tags from watched content
      if (watchedContentIds.length > 0) {
        const contentSnaps = await Promise.all(
          watchedContentIds.map(id => db.collection('content').doc(id).get())
        );
        contentSnaps.forEach(snap => {
          if (snap.exists) {
            const data = snap.data();
            if (data?.tags) watchedTags.push(...data.tags);
          }
        });
      }

      // 3. Build a simple tag frequency map
      const tagFreq: Record<string, number> = {};
      watchedTags.forEach(tag => {
        tagFreq[tag] = (tagFreq[tag] || 0) + 1;
      });

      // 4. Query content candidates: published, exclude already watched
      let query: FirebaseFirestore.Query = db
        .collection('content')
        .where('isPublished', '==', true)
        .orderBy('viewCount', 'desc')
        .limit(100);

      if (mood) {
        // Assume mood maps to a tag (e.g., 'action' -> 'action')
        query = query.where('tags', 'array-contains', mood);
      }

      const contentSnap = await query.get();

      const feed: Array<{ contentId: string; score: number }> = [];

      contentSnap.docs.forEach(doc => {
        if (watchedContentIds.includes(doc.id)) return;
        const data = doc.data();
        const tags: string[] = data.tags || [];
        // Score = sum of tag frequencies matched
        let score = tags.reduce((s, tag) => s + (tagFreq[tag] || 0), 0);
        // Boost by popularity (viewCount)
        score += Math.log(1 + (data.viewCount || 0)) * 0.1;
        // Boost if mood matches directly
        if (mood && tags.includes(mood)) score += 5;
        feed.push({ contentId: doc.id, score });
      });

      // Sort descending by score
      feed.sort((a, b) => b.score - a.score);

      // 5. Store the generated feed in Firestore for caching
      await db.collection('recommendations').doc(userId).set({
        userId,
        personalizedFeed: feed.slice(0, 30),
        lastUpdated: FieldValue.serverTimestamp(),
      }, { merge: true });

      return { personalizedFeed: feed.slice(0, 30) };
    } catch (error: any) {
      console.error('Recommendations error:', error);
      throw new functions.https.HttpsError('internal', error.message);
    }
  }
);