// components/social/WatchPartyPanel.tsx
'use client';

import { motion } from 'framer-motion';
import { Users, UserPlus, UserMinus, Clock } from 'lucide-react';
import { useWatchParty } from '@/hooks/useWatchParty';
import { useAuthStore } from '@/store/authStore';
import { usePlayerStore } from '@/store/playerStore';
import LiveChat from './LiveChat';
import Badge from '@/components/ui/Badge';
import Button from '@/components/ui/Button';

interface WatchPartyPanelProps {
  partyId: string;
}

export default function WatchPartyPanel({ partyId }: WatchPartyPanelProps) {
  const { party, messages, isHost, joinParty, leaveParty, sendMessage, syncPlayback } = useWatchParty(partyId);
  const { user } = useAuthStore();
  const { currentTime, isPlaying } = usePlayerStore();

  if (!party) {
    return (
      <div className="glass p-6 text-center">
        <p className="text-[var(--text-secondary)]">Watch party not found</p>
      </div>
    );
  }

  const isMember = user ? party.members.includes(user.uid) : false;

  return (
    <div className="flex flex-col gap-4 p-4 h-full">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Users className="w-5 h-5 text-[var(--neon-cyan)]" />
          <h3 className="text-lg font-semibold">Watch Party</h3>
          <Badge variant="live" />
        </div>
        <span className="text-sm text-[var(--text-secondary)]">
          {party.members.length} viewer{party.members.length !== 1 && 's'}
        </span>
      </div>

      {/* Host info */}
      <div className="flex items-center gap-3 p-3 rounded-xl glass">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xs font-bold">
          {party.hostId.slice(0, 2).toUpperCase()}
        </div>
        <div>
          <p className="text-sm font-medium">Host</p>
          <p className="text-xs text-[var(--text-secondary)]">Synced playback</p>
        </div>
      </div>

      {/* Member list */}
      <div className="flex flex-wrap gap-2">
        {party.members.slice(0, 5).map((uid) => (
          <div
            key={uid}
            className="w-9 h-9 rounded-full bg-gradient-to-br from-[var(--secondary)]/20 to-[var(--primary)]/20 border border-white/10 flex items-center justify-center text-xs font-medium"
            title={uid}
          >
            {uid.slice(0, 2)}
          </div>
        ))}
        {party.members.length > 5 && (
          <div className="w-9 h-9 rounded-full bg-white/5 flex items-center justify-center text-xs text-[var(--text-secondary)]">
            +{party.members.length - 5}
          </div>
        )}
      </div>

      {/* Join/Leave button */}
      <div className="flex gap-2">
        {isHost && (
          <Button variant="secondary" size="sm" onClick={() => syncPlayback(currentTime)}>
            <Clock className="w-4 h-4" /> Sync ({(currentTime ?? 0).toFixed(1)}s)
          </Button>
        )}
        {!isMember && (
          <Button variant="primary" size="sm" onClick={joinParty} leftIcon={<UserPlus className="w-4 h-4" />}>
            Join Party
          </Button>
        )}
        {isMember && !isHost && (
          <Button variant="ghost" size="sm" onClick={leaveParty}>
            <UserMinus className="w-4 h-4" /> Leave
          </Button>
        )}
      </div>

      {/* Chat */}
      <div className="flex-1 min-h-0 overflow-hidden rounded-xl border border-white/10">
        <LiveChat messages={messages} onSendMessage={sendMessage} />
      </div>
    </div>
  );
}