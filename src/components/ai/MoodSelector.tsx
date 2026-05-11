// components/ai/MoodSelector.tsx
'use client';

import { motion } from 'framer-motion';
import { useUIStore } from '@/store/uiStore';
import { getMoodLabel } from '@/lib/ai';
import type { MoodType } from '@/types/nexus';

const moods: MoodType[] = [
  'action',
  'relax',
  'comedy',
  'drama',
  'horror',
  'romance',
  'scifi',
  'documentary',
];

export default function MoodSelector() {
  const { currentMood, setMood } = useUIStore();

  return (
    <div className="flex gap-3 overflow-x-auto px-4 py-4 scrollbar-hide">
      {moods.map((mood) => {
        const isActive = currentMood === mood;
        return (
          <motion.button
            key={mood}
            onClick={() => setMood(mood)}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={`
              shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium
              transition-colors backdrop-blur-sm
              ${
                isActive
                  ? 'bg-[var(--primary)] text-white shadow-glow-primary border border-[var(--primary)]/50'
                  : 'bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:bg-white/10 hover:text-white'
              }
            `}
          >
            {getMoodLabel(mood)}
            {isActive && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="w-2 h-2 rounded-full bg-white"
              />
            )}
          </motion.button>
        );
      })}
    </div>
  );
}