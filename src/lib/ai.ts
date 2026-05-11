// lib/ai.ts
import { auth } from './firebase';
import type { MoodType, Recommendation } from '@/types/nexus';

// ─── Helper: obtain Authorization header with Firebase ID token ───
async function getAuthHeaders(): Promise<HeadersInit> {
  const user = auth.currentUser;
  if (!user) return {};
  try {
    const token = await user.getIdToken();
    return {
      Authorization: `Bearer ${token}`,
    };
  } catch {
    console.warn('Failed to get ID token – request will be unauthenticated.');
    return {};
  }
}

// ─── Helper: generic fetch wrapper with error handling ───
async function apiPost<T>(url: string, body?: any): Promise<T | null> {
  try {
    const headers = {
      'Content-Type': 'application/json',
      ...(await getAuthHeaders()),
    };
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) throw new Error(`API returned ${res.status}`);
    return (await res.json()) as T;
  } catch (error) {
    console.error(`AI API request to ${url} failed:`, error);
    return null;
  }
}

// ─── 1. getRecommendations ──────────────────────────────
export async function getRecommendations(
  userId: string,
  mood?: MoodType
): Promise<Recommendation | null> {
  return apiPost<Recommendation>('/api/recommendations', { userId, mood });
}

// ─── 2. detectMoodFromHistory ──────────────────────────
// Accepts an array of category strings (genres) from watch history
// Maps genre frequency to the most likely mood
const genreToMood: Record<string, MoodType> = {
  action: 'action',
  adventure: 'action',
  comedy: 'comedy',
  drama: 'drama',
  horror: 'horror',
  romance: 'romance',
  scifi: 'scifi',
  documentary: 'documentary',
  relaxation: 'relax',
  thriller: 'drama',
  musical: 'comedy',
};

export function detectMoodFromHistory(
  categories: string[]
): MoodType | null {
  if (categories.length === 0) return null;

  const freq: Record<string, number> = {};
  categories.forEach(cat => {
    const mood = genreToMood[cat.toLowerCase()];
    if (mood) {
      freq[mood] = (freq[mood] || 0) + 1;
    }
  });

  const entries = Object.entries(freq);
  if (entries.length === 0) return null;

  entries.sort((a, b) => b[1] - a[1]);
  return entries[0][0] as MoodType;
}

// ─── 3. generateContentSummary ──────────────────────────
export async function generateContentSummary(
  contentId: string
): Promise<string | null> {
  const res = await apiPost<{ summary: string }>('/api/ai/summary', { contentId });
  return res?.summary ?? null;
}

// ─── 4. voiceSearchTranscribe ───────────────────────────
export async function voiceSearchTranscribe(
  audioBlob: Blob
): Promise<string | null> {
  try {
    const headers = await getAuthHeaders();
    const formData = new FormData();
    formData.append('audio', audioBlob, 'recording.webm');

    const res = await fetch('/api/ai/voice-search', {
      method: 'POST',
      headers,
      body: formData,
    });
    if (!res.ok) throw new Error(`Voice API returned ${res.status}`);
    const data = await res.json();
    return data.transcription ?? null;
  } catch (error) {
    console.error('Voice search transcription failed:', error);
    return null;
  }
}

// ─── 5. getMoodLabel ───────────────────────────────────
const moodEmojiMap: Record<MoodType, string> = {
  action: '🎬',
  relax: '😌',
  comedy: '🤣',
  drama: '🎭',
  horror: '👻',
  romance: '❤️',
  scifi: '🛸',
  documentary: '📚',
};

export function getMoodLabel(mood: MoodType): string {
  const label = mood.charAt(0).toUpperCase() + mood.slice(1);
  return `${moodEmojiMap[mood] ?? '🎥'} ${label}`;
}

// ─── 6. getTimeOfDayMood ───────────────────────────────
export function getTimeOfDayMood(): MoodType {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 12) return 'action';   // morning energy
  if (hour >= 12 && hour < 17) return 'comedy';   // afternoon lightness
  if (hour >= 17 && hour < 22) return 'relax';    // evening unwind
  return 'drama';                                  // late night depth
}