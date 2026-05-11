// functions/social/moderation.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import fetch from 'node-fetch';

const PERSPECTIVE_API_KEY = process.env.PERSPECTIVE_API_KEY!;
const PERSPECTIVE_URL =
  'https://commentanalyzer.googleapis.com/v1alpha1/comments:analyze';

const db = admin.firestore();
const rtdb = admin.database();

/**
 * Triggered by new chat messages in Realtime Database:
 * /liveChat/{contentId}/messages/{msgId}
 * Scans the message body with Perspective API and blocks/updates moderation status.
 */
export const moderateChat = functions.database
  .ref('/liveChat/{contentId}/messages/{msgId}')
  .onWrite(async (change, context) => {
    const { contentId, msgId } = context.params;
    const after = change.after.val();

    // Only process new messages
    if (!after || after.isModerated) return;

    const text = after.body;
    if (!text || text.trim().length === 0) return;

    try {
      const response = await fetch(PERSPECTIVE_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          comment: { text },
          requestedAttributes: {
            TOXICITY: {},
            SEVERE_TOXICITY: {},
            INSULT: {},
            PROFANITY: {},
            THREAT: {},
          },
          languages: ['en'],
        }),
        qs: { key: PERSPECTIVE_API_KEY },
      });

      const result = await response.json();
      const scores = result.attributeScores;
      const toxicity = scores?.TOXICITY?.summaryScore?.value ?? 0;

      if (toxicity > 0.7) {
        // Flag as moderated — either delete or mark
        await change.after.ref.update({
          isModerated: true,
          body: '[Message removed by moderation]',
        });

        // Log to Firestore for admin review
        await db.collection('moderationLogs').add({
          contentId,
          msgId,
          userId: after.userId,
          originalText: text,
          toxicity,
          timestamp: admin.firestore.FieldValue.serverTimestamp(),
        });

        console.log(`Message ${msgId} moderated (toxicity: ${toxicity})`);
      }
    } catch (error) {
      console.error('Moderation error:', error);
    }
  });