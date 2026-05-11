// functions/media/transcode.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { Storage } from '@google-cloud/storage';
import fetch from 'node-fetch';

const db = admin.firestore();
const storage = new Storage();

// Mux API credentials (set via Firebase environment config)
const MUX_TOKEN_ID = process.env.MUX_TOKEN_ID!;
const MUX_TOKEN_SECRET = process.env.MUX_TOKEN_SECRET!;
const MUX_API = 'https://api.mux.com/video/v1';

/**
 * Triggered when a new video is uploaded to Storage under /uploads/{userId}/{fileName}
 * Creates a Mux asset, stores the playback ID and HLS URL in Firestore.
 */
export const transcodeVideo = functions.storage.onObjectFinalized(
  { bucket: 'stream-tv-50161.firebasestorage.app' },
  async (event) => {
    const object = event.data;
    const filePath = object.name || '';
    if (!filePath.startsWith('uploads/')) return; // only process uploads

    const fileName = filePath.split('/').pop();
    const userId = filePath.split('/')[1]; // uploads/{userId}/filename.mp4

    console.log(`New upload: ${filePath}`);

    try {
      // 1. Get a signed URL to the uploaded file (valid for 1 hour)
      const bucket = storage.bucket(object.bucket);
      const file = bucket.file(filePath);
      const [uploadUrl] = await file.getSignedUrl({
        action: 'read',
        expires: Date.now() + 60 * 60 * 1000,
      });

      // 2. Create a Mux direct upload
      const assetCreation = await fetch(`${MUX_API}/assets`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Basic ${Buffer.from(`${MUX_TOKEN_ID}:${MUX_TOKEN_SECRET}`).toString('base64')}`,
        },
        body: JSON.stringify({
          input: uploadUrl,
          playback_policy: ['signed'],
          mp4_support: 'standard',
        }),
      });

      if (!assetCreation.ok) {
        throw new Error(`Mux asset creation failed: ${await assetCreation.text()}`);
      }

      const asset = await assetCreation.json();
      const assetId = asset.data.id;
      const playbackId = asset.data.playback_ids?.[0]?.id;
      const hlsMasterURL = `https://stream.mux.com/${playbackId}.m3u8`;

      // 3. Save content metadata to Firestore (assuming a content doc already exists)
      const contentRef = db.collection('content').doc(); // or update an existing doc by custom ID
      await contentRef.set(
        {
          creatorId: userId,
          hlsMasterURL,
          thumbnailURL: `https://image.mux.com/${playbackId}/thumbnail.jpg`,
          duration: asset.data.duration || 0,
          type: 'movie', // default
          isPublished: true,
          publishedAt: admin.firestore.FieldValue.serverTimestamp(),
          viewCount: 0,
        },
        { merge: true }
      );

      console.log(`Mux asset created: ${assetId}, contentId: ${contentRef.id}`);
    } catch (error: any) {
      console.error('Transcoding error:', error);
      // Could set error state in Firestore
    }
  }
);