// components/player/AmbientMode.tsx
'use client';

import { motion } from 'framer-motion';

interface AmbientModeProps {
  color: { r: number; g: number; b: number };
}

export default function AmbientMode({ color }: AmbientModeProps) {
  if (!color) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5 }}
      className="absolute inset-0 pointer-events-none z-0"
      style={{
        background: `radial-gradient(ellipse at center, rgba(${color.r},${color.g},${color.b},0.3) 0%, transparent 70%)`,
        mixBlendMode: 'screen',
      }}
    />
  );
}