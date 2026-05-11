// hooks/useWatchParty.ts
'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  doc,
  onSnapshot,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from 'firebase/firestore';
import { ref, onValue, push, serverTimestamp } from 'firebase/database';
import { db, rtdb } from '@/lib/firebase';
import { useAuthStore } from '@/store/authStore';
import type { WatchParty, ChatMessage } from '@/types/nexus';

export function useWatchParty(partyId: string) {
  const { user } = useAuthStore();
  const [party, setParty] = useState<WatchParty | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isHost, setIsHost] = useState(false);

  // ─── Subscribe to Firestore watchParty document ─────
  useEffect(() => {
    if (!partyId) return;

    const unsub = onSnapshot(doc(db, 'watchParties', partyId), (snap) => {
      if (snap.exists()) {
        const data = snap.data() as WatchParty;
        setParty(data);
        setIsHost(data.hostId === user?.uid);
      } else {
        setParty(null);
      }
    });

    return () => unsub();
  }, [partyId, user?.uid]);

  // ─── Subscribe to Realtime Database chat messages ──
  useEffect(() => {
    if (!partyId) return;

    const chatRef = ref(rtdb, `watchParty/${partyId}/messages`);
    const unsub = onValue(chatRef, (snapshot) => {
      const msgs: ChatMessage[] = [];
      snapshot.forEach((child) => {
        msgs.push({ id: child.key!, ...child.val() });
      });
      setMessages(msgs);
    });

    return () => unsub();
  }, [partyId]);

  // ─── Join party ──────────────────────────────────────
  const joinParty = useCallback(async () => {
    if (!user || !partyId) return;
    try {
      await updateDoc(doc(db, 'watchParties', partyId), {
        members: arrayUnion(user.uid),
      });
    } catch (error) {
      console.error('Failed to join party:', error);
    }
  }, [user, partyId]);

  // ─── Leave party ─────────────────────────────────────
  const leaveParty = useCallback(async () => {
    if (!user || !partyId) return;
    try {
      await updateDoc(doc(db, 'watchParties', partyId), {
        members: arrayRemove(user.uid),
      });
    } catch (error) {
      console.error('Failed to leave party:', error);
    }
  }, [user, partyId]);

  // ─── Send chat message ───────────────────────────────
  const sendMessage = useCallback(
    async (text: string) => {
      if (!user || !partyId || !text.trim()) return;
      const message: Omit<ChatMessage, 'id'> = {
        userId: user.uid,
        displayName: user.displayName ?? 'Guest',
        avatarURL: user.avatarURL ?? '',
        body: text.trim(),
        timestamp: Date.now(),
        isModerated: false,
      };
      try {
        const chatRef = ref(rtdb, `watchParty/${partyId}/messages`);
        await push(chatRef, {
          ...message,
          timestamp: serverTimestamp(),
        });
      } catch (error) {
        console.error('Failed to send message:', error);
      }
    },
    [user, partyId]
  );

  // ─── Sync playback (host only) ───────────────────────
  const syncPlayback = useCallback(
    async (currentTimestamp: number) => {
      if (!partyId || !isHost) return;
      try {
        await updateDoc(doc(db, 'watchParties', partyId), {
          currentTimestamp,
        });
      } catch (error) {
        console.error('Failed to sync playback:', error);
      }
    },
    [partyId, isHost]
  );

  return {
    party,
    messages,
    isHost,
    joinParty,
    leaveParty,
    sendMessage,
    syncPlayback,
  };
}