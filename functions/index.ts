// functions/index.ts
import * as admin from 'firebase-admin';
import * as functions from 'firebase-functions/v2';
import { getRecommendations } from './ai/recommendations';
import { transcodeVideo } from './media/transcode';
import { moderateChat } from './social/moderation';

// Initialize Admin SDK (auto-discovery of credentials on Firebase environment)
admin.initializeApp();

// Export Cloud Functions
export const ai = {
  getRecommendations,
};

export const media = {
  transcodeVideo,
};

export const social = {
  moderateChat,
};