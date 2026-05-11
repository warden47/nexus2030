// components/ui/MoodPill.tsx
'use client';

import { motion } from 'framer-motion';
import { getMoodLabel } from '@/lib/ai';
import type { MoodType } from '@/types/nexus';

interface MoodPillProps {
  mood: MoodType;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

const MoodPill = ({ mood, selected = false, onClick, className = '' }: MoodPillProps) => {
  const label = getMoodLabel(mood);

  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className={`
        inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium
        transition-all select-none
        ${
          selected
            ? 'bg-[var(--primary)] text-white shadow-glow-primary border-transparent'
            : 'bg-white/5 text-[var(--text-secondary)] border border-white/10 hover:bg-white/10 hover:text-white'
        }
        ${className}
      `}
    >
      {label}
    </motion.button>
  );
};

export default MoodPill;