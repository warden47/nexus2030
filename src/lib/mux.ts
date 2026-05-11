// lib/mux.ts
import { auth } from './firebase';

// ─── Helpers ────────────────────────────────────────────
async function getIdToken(): Promise<string | null> {
  const user = auth.currentUser;
  if (!user) return null;
  try {
    return await user.getIdToken();
  } catch {
    return null;
  }
}

// ─── 1. Sign request for Mux playback URL ──────────────
export async function getMuxSignedUrl(
  playbackId: string,
  userId: string
): Promise<string | null> {
  try {
    const token = await getIdToken();
    const response = await fetch('/api/mux/sign', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({ playbackId, userId }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);
    const data = await response.json();
    return data.signedUrl ?? null;
  } catch (error) {
    console.error('Failed to get signed Mux URL:', error);
    return null;
  }
}

// ─── 2. Thumbnail URL ──────────────────────────────────
export function getMuxThumbnail(
  playbackId: string,
  time?: number // seconds
): string {
  const timeParam = time ? `?time=${encodeURIComponent(time)}` : '';
  return `https://image.mux.com/${playbackId}/thumbnail.jpg${timeParam}`;
}

// ─── 3. Animated GIF preview (hover trailer) ───────────
export function getMuxAnimatedGif(
  playbackId: string,
  start: number,
  end: number
): string {
  return `https://image.mux.com/${playbackId}/animated.gif?start=${start}&end=${end}`;
}

// ─── 4. User‑friendly error messages ───────────────────
export function parseMuxError(error: any): string {
  if (!error) return 'Unknown playback error.';
  if (typeof error === 'string') return error;
  if (error.code === 'network_error') return 'Network error – please check your connection.';
  if (error.code === 'token_expired') return 'Your video session has expired. Please refresh.';
  if (error.code === 'geo_restricted') return 'This content is not available in your region.';
  return error.message ?? 'An error occurred while loading the video.';
}

// ─── 5. Quality levels for UI ──────────────────────────
export interface QualityOption {
  label: string;
  value: string;
  width?: number;  // approximate width in pixels
}

export function getQualityLevels(): QualityOption[] {
  return [
    { label: 'Auto', value: 'auto' },
    { label: '4K', value: '2160p', width: 3840 },
    { label: '1080p', value: '1080p', width: 1920 },
    { label: '720p', value: '720p', width: 1280 },
    { label: '480p', value: '480p', width: 854 },
    { label: '360p', value: '360p', width: 640 },
  ];
}

// ─── 6. Bandwidth estimation ───────────────────────────
export async function estimateBandwidth(): Promise<number | null> {
  // Modern browsers: Network Information API
  if ('connection' in navigator) {
    const conn = (navigator as any).connection;
    if (conn && conn.downlink) {
      // downlink is in Mbps, return in bps
      return conn.downlink * 1_000_000;
    }
  }

  // Fallback: time a small resource fetch
  try {
    const start = performance.now();
    const response = await fetch('/api/ping'); // lightweight endpoint
    const end = performance.now();
    if (response.ok) {
      const duration = (end - start) / 1000; // seconds
      const size = response.headers.get('content-length');
      if (size) {
        const bits = parseInt(size, 10) * 8;
        return bits / duration; // bps
      }
    }
  } catch {
    // ignore
  }

  return null;
}