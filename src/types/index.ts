// types/nexus.ts

/**
 * NEXUS 2030 – Core TypeScript definitions
 */

// ─── Shared unions / enums ──────────────────────────────

export type MoodType =
  | 'action'
  | 'relax'
  | 'comedy'
  | 'drama'
  | 'horror'
  | 'romance'
  | 'scifi'
  | 'documentary';

export type PremiumTier = 'free' | 'plus' | 'ultimate';

export type ContentType = 'movie' | 'series' | 'livestream' | 'clip';

export type UserRole = 'user' | 'creator' | 'admin';

export type SocialPostType = 'review' | 'comment' | 'reaction';

export type TransactionStatus = 'pending' | 'completed' | 'failed' | 'refunded';

export type VideoQuality = 'auto' | '360p' | '720p' | '1080p' | '1440p' | '2160p';

// ─── User ───────────────────────────────────────────────

export interface User {
  uid: string;
  displayName: string;
  email: string;
  avatarURL?: string;
  premiumTier: PremiumTier;
  watchStreak: number;
  moodPreferences: MoodType[];
  createdAt: string; // ISO 8601
  role: UserRole;
}

// ─── Content ────────────────────────────────────────────

export interface Content {
  contentId: string;
  title: string;
  type: ContentType;
  creatorId: string;
  description: string;
  tags: string[];
  duration: number;               // seconds
  thumbnailURL: string;
  hlsMasterURL?: string;          // Mux / CDN master playlist
  categories: string[];
  aiEmbedding?: number[];         // vector for similarity search
  publishedAt?: string;           // ISO 8601
  isPublished: boolean;
  viewCount: number;
  rating?: number;                // average rating, 0-5
}

// ─── Episode (for series) ───────────────────────────────

export interface Episode {
  episodeId: string;
  seriesId: string;
  season: number;
  episode: number;                // episode number within season
  title: string;
  duration: number;
  hlsURL: string;
  thumbnailURL: string;
}

// ─── Watch History ──────────────────────────────────────

export interface WatchHistory {
  id?: string;                    // Firestore auto‑generated ID
  userId: string;
  contentId: string;
  progress: number;               // seconds watched
  watchedAt: string;              // ISO 8601
  completed: boolean;
}

// ─── Recommendations ────────────────────────────────────

export interface Recommendation {
  userId: string;
  personalizedFeed: Array<{
    contentId: string;
    score: number;                // relevance (0–1)
  }>;
  lastUpdated: string;            // ISO 8601
}

// ─── Social ─────────────────────────────────────────────

export interface SocialPost {
  id?: string;
  userId: string;
  type: SocialPostType;
  contentId: string;
  body: string;
  timestamp: string;              // ISO 8601
  likes: number;
}

// ─── Live Chat ──────────────────────────────────────────

export interface ChatMessage {
  id?: string;
  userId: string;
  displayName: string;
  avatarURL?: string;
  body: string;
  timestamp: number;              // milliseconds (server timestamp)
  isModerated: boolean;
}

// ─── Watch Party ────────────────────────────────────────

export interface WatchParty {
  partyId: string;
  contentId: string;
  hostId: string;
  members: string[];              // array of userIds
  currentTimestamp: number;       // sync timestamp in seconds
  isActive: boolean;
  createdAt: string;
}

// ─── Creator Profile ────────────────────────────────────

export interface Creator {
  userId: string;
  bio: string;
  subscriberCount: number;
  totalRevenue: number;           // cents USD
  uploadLimits: number;           // GB or minutes
  verifiedBadge: boolean;
}

// ─── Transaction ────────────────────────────────────────

export interface Transaction {
  id?: string;
  userId: string;
  amount: number;                 // cents USD
  plan: PremiumTier;
  status: TransactionStatus;
  timestamp: string;              // ISO 8601
}

// ─── Player State (client‑side Zustand) ─────────────────

export interface PlayerState {
  contentId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;                // 0–1
  isFullscreen: boolean;
  quality: VideoQuality;
  isAmbientMode: boolean;
}

// ─── Global UI State ────────────────────────────────────

export interface UIState {
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  searchOpen: boolean;
  currentMood?: MoodType;
}