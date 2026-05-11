// utils/analytics.ts
'use client';

import { getAnalytics } from '@/lib/firebase';
import { logEvent as firebaseLogEvent, type Analytics } from 'firebase/analytics';

type EventNames =
  | 'video_start'
  | 'video_complete'
  | 'video_pause'
  | 'search_query'
  | 'voice_search'
  | 'mood_select'
  | 'reaction'
  | 'subscribe_click'
  | 'watch_party_join'
  | 'chat_message_sent';

interface EventParams {
  contentId?: string;
  mood?: string;
  query?: string;
  plan?: string;
  [key: string]: any;
}

let analytics: Analytics | null = null;
const initPromise = getAnalytics().then((a) => {
  analytics = a;
});

export const logCustomEvent = async (eventName: EventNames, params?: EventParams) => {
  await initPromise;
  if (analytics) {
    firebaseLogEvent(analytics, eventName, params);
  }
};

// Exported convenience functions
export const logVideoStart = (contentId: string) =>
  logCustomEvent('video_start', { contentId });
export const logVideoComplete = (contentId: string) =>
  logCustomEvent('video_complete', { contentId });
export const logVideoPause = (contentId: string) =>
  logCustomEvent('video_pause', { contentId });
export const logSearch = (query: string) =>
  logCustomEvent('search_query', { query });
export const logVoiceSearch = (query: string) =>
  logCustomEvent('voice_search', { query });
export const logMoodSelect = (mood: string) =>
  logCustomEvent('mood_select', { mood });
export const logReaction = (contentId: string) =>
  logCustomEvent('reaction', { contentId });
export const logSubscribeClick = (plan: string) =>
  logCustomEvent('subscribe_click', { plan });
export const logWatchPartyJoin = (partyId: string) =>
  logCustomEvent('watch_party_join', { partyId });
export const logChatMessage = (contentId: string) =>
  logCustomEvent('chat_message_sent', { contentId });