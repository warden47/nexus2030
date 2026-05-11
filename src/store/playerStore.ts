// store/playerStore.ts
import { create } from 'zustand';

export interface PlayerState {
  contentId: string | null;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  isMuted: boolean;
  isFullscreen: boolean;
  isAmbientMode: boolean;
  quality: 'auto' | '2160p' | '1080p' | '720p' | '480p' | '360p';
  isWatchParty: boolean;
  watchPartyId: string | null;
  buffering: boolean;
  error: string | null;

  // Actions
  setContent: (contentId: string) => void;
  play: () => void;
  pause: () => void;
  togglePlay: () => void;
  seek: (time: number) => void;
  setVolume: (v: number) => void;
  toggleMute: () => void;
  setFullscreen: (fs: boolean) => void;
  toggleAmbientMode: () => void;
  setQuality: (q: PlayerState['quality']) => void;
  setWatchParty: (partyId: string | null) => void;
  setBuffering: (b: boolean) => void;
  setError: (e: string | null) => void;
  reset: () => void;
}

const initialState = {
  contentId: null,
  isPlaying: false,
  currentTime: 0,
  duration: 0,
  volume: 0.8,
  isMuted: false,
  isFullscreen: false,
  isAmbientMode: false,
  quality: 'auto' as const,
  isWatchParty: false,
  watchPartyId: null,
  buffering: false,
  error: null,
};

export const usePlayerStore = create<PlayerState>()((set) => ({
  ...initialState,

  setContent: (contentId) => set({ contentId }),

  play: () => set({ isPlaying: true }),
  pause: () => set({ isPlaying: false }),
  togglePlay: () => set((state) => ({ isPlaying: !state.isPlaying })),

  seek: (time) => set({ currentTime: time }),

  setVolume: (v) =>
    set({
      volume: Math.max(0, Math.min(1, v)),
      isMuted: false,
    }),

  toggleMute: () => set((state) => ({ isMuted: !state.isMuted })),

  setFullscreen: (fs) => set({ isFullscreen: fs }),

  toggleAmbientMode: () =>
    set((state) => ({ isAmbientMode: !state.isAmbientMode })),

  setQuality: (q) => set({ quality: q }),

  setWatchParty: (partyId) =>
    set({
      isWatchParty: !!partyId,
      watchPartyId: partyId,
    }),

  setBuffering: (b) => set({ buffering: b }),

  setError: (e) => set({ error: e }),

  reset: () => set(initialState),
}));