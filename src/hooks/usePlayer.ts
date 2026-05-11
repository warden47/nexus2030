// hooks/usePlayer.ts
'use client';

import { useEffect, useCallback, useRef } from 'react';
import { usePlayerStore } from '@/store/playerStore';
import { addWatchHistory } from '@/lib/firestore';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { WatchParty } from '@/types/nexus';

export function usePlayer() {
  const store = usePlayerStore();
  const debounceTimeRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Save progress (debounced every 10 seconds)
  const saveProgress = useCallback(
    (contentId: string, currentTime: number, duration: number) => {
      if (debounceTimeRef.current) clearTimeout(debounceTimeRef.current);

      debounceTimeRef.current = setTimeout(async () => {
        try {
          await addWatchHistory({
            userId: '', // will be filled by the hook user's ID, but we can get from authStore
            contentId,
            progress: currentTime,
            watchedAt: new Date().toISOString(),
            completed: currentTime >= duration,
          });
        } catch (error) {
          console.error('Failed to save progress:', error);
        }
      }, 10_000);
    },
    []
  );

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeRef.current) clearTimeout(debounceTimeRef.current);
    };
  }, []);

  // Sync with watch party (subscription to Firestore)
  const syncWithWatchParty = useCallback((partyId: string) => {
    const unsub = onSnapshot(doc(db, 'watchParties', partyId), (snap) => {
      if (snap.exists()) {
        const party = snap.data() as WatchParty;
        // Update player store with shared timestamp and play state
        usePlayerStore.setState({
          currentTime: party.currentTimestamp,
          isPlaying: (party as any).isPlaying ?? false, // optional property
          watchPartyId: partyId,
        });
      }
    });
    return unsub;
  }, []);

  return {
    ...store,
    saveProgress,
    syncWithWatchParty,
  };
}