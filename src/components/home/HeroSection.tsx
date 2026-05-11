// components/home/HeroSection.tsx
'use client';

import { motion } from 'framer-motion';
import { Sparkles } from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { getMoodLabel } from '@/lib/ai';

interface HeroSectionProps {
  greeting: string;
}

export default function HeroSection({ greeting }: HeroSectionProps) {
  const { currentMood } = useUIStore();
  const moodLabel = currentMood ? getMoodLabel(currentMood) : null;

  return (
    <section className="relative px-4 pt-12 pb-8 overflow-hidden">
      {/* Ambient glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[var(--primary)]/20 rounded-full blur-[120px] pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: 'easeOut' }}
        className="relative z-10 max-w-4xl mx-auto text-center"
      >
        {/* Animated greeting */}
        <motion.h1
          className="text-4xl md:text-6xl font-extrabold tracking-tight leading-tight"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2, duration: 0.6 }}
        >
          <span className="gradient-text">{greeting}</span>
        </motion.h1>

        {/* Mood-based subheadline */}
        {moodLabel && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.4 }}
            className="mt-4 flex items-center justify-center gap-2 text-lg md:text-xl text-[var(--text-secondary)]"
          >
            <Sparkles className="w-5 h-5 text-[var(--neon-cyan)]" />
            <span>
              {moodLabel} mood detected — here are picks just for you
            </span>
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}