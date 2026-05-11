// components/social/ReactionBar.tsx
'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { SmilePlus } from 'lucide-react';
import { createSocialPost } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';

const REACTIONS = [
  { emoji: '👍', label: 'Like' },
  { emoji: '❤️', label: 'Love' },
  { emoji: '😂', label: 'Laugh' },
  { emoji: '🎉', label: 'Hype' },
  { emoji: '🔥', label: 'Fire' },
  { emoji: '😮', label: 'Wow' },
  { emoji: '😢', label: 'Sad' },
  { emoji: '😡', label: 'Angry' },
];

interface ReactionBarProps {
  contentId: string;
  compact?: boolean;
}

export default function ReactionBar({ contentId, compact = false }: ReactionBarProps) {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const [open, setOpen] = useState(false);
  const [burstEmoji, setBurstEmoji] = useState<string | null>(null);

  const handleReaction = async (emoji: string) => {
    if (!user) return;
    try {
      await createSocialPost({
        userId: user.uid,
        type: 'reaction',
        contentId,
        body: emoji,
      });

      // Confetti burst animation
      setBurstEmoji(emoji);
      setTimeout(() => setBurstEmoji(null), 800);

      addToast(`Reacted with ${emoji}`, 'success');
    } catch (e) {
      addToast('Reaction failed', 'error');
    }
    setOpen(false);
  };

  return (
    <div className="flex items-center gap-2">
      {/* Burst animation overlay */}
      <AnimatePresence>
        {burstEmoji && (
          <motion.div
            initial={{ scale: 0, opacity: 1 }}
            animate={{ scale: 2, opacity: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="fixed inset-0 flex items-center justify-center pointer-events-none z-50"
          >
            <span className="text-6xl">{burstEmoji}</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Reaction buttons */}
      {compact ? (
        // Compact mode: just a smile icon that opens a popover
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-xl hover:bg-white/10 transition"
          >
            <SmilePlus className="w-5 h-5 text-[var(--text-secondary)]" />
          </button>
          {open && (
            <div className="absolute bottom-full left-0 mb-2 p-2 rounded-xl glass flex gap-1 z-30">
              {REACTIONS.map((r) => (
                <button
                  key={r.emoji}
                  onClick={() => handleReaction(r.emoji)}
                  className="p-1 text-xl hover:scale-125 transition-transform"
                  title={r.label}
                >
                  {r.emoji}
                </button>
              ))}
            </div>
          )}
        </div>
      ) : (
        // Full row
        <div className="flex items-center gap-1">
          {REACTIONS.slice(0, 6).map((r) => (
            <motion.button
              key={r.emoji}
              whileHover={{ scale: 1.2 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => handleReaction(r.emoji)}
              className="p-2 text-lg rounded-full hover:bg-white/10 transition"
              title={r.label}
            >
              {r.emoji}
            </motion.button>
          ))}
          <button
            onClick={() => setOpen(!open)}
            className="p-2 rounded-full hover:bg-white/10 transition text-[var(--text-secondary)]"
          >
            <SmilePlus className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}