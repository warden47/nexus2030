// components/player/SubtitleOverlay.tsx
'use client';

import { motion, AnimatePresence } from 'framer-motion';

interface Subtitle {
  id: string;
  start: number;
  end: number;
  text: string;
  emotion?: 'action' | 'whisper' | 'normal';
}

interface SubtitleOverlayProps {
  subtitles: Subtitle[];
  currentTime: number;
}

export default function SubtitleOverlay({ subtitles, currentTime }: SubtitleOverlayProps) {
  const active = subtitles.find((s) => currentTime >= s.start && currentTime <= s.end);

  return (
    <div className="absolute bottom-16 left-1/2 -translate-x-1/2 z-30 text-center pointer-events-none">
      <AnimatePresence mode="wait">
        {active && (
          <motion.p
            key={active.id}
            initial={{ opacity: 0, y: 5 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -5 }}
            transition={{ duration: 0.2 }}
            className="px-4 py-1.5 rounded-xl bg-black/70 text-white text-lg font-medium shadow-lg select-none"
            style={{
              fontSize: active.emotion === 'action' ? '1.3em' : active.emotion === 'whisper' ? '0.9em' : '1em',
              textShadow: active.emotion === 'action' ? '0 0 8px rgba(255,71,133,0.5)' : 'none',
            }}
          >
            {active.text}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}