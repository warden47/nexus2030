// components/home/CinematicHoverCard.tsx
'use client';

import { useRef, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';
import { Play, Clock, Star } from 'lucide-react';
import type { Content } from '@/types/nexus';

interface CinematicHoverCardProps {
  content: Content;
  progress?: number; // 0-100 for continue watching
  onClick?: () => void;
}

export default function CinematicHoverCard({
  content,
  progress,
  onClick,
}: CinematicHoverCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  // 3D tilt effect
  const mouseX = useMotionValue(0.5);
  const mouseY = useMotionValue(0.5);
  const rotateX = useSpring(useTransform(mouseY, [0, 1], [10, -10]), { stiffness: 300, damping: 20 });
  const rotateY = useSpring(useTransform(mouseX, [0, 1], [-10, 10]), { stiffness: 300, damping: 20 });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    mouseX.set(x);
    mouseY.set(y);
  }

  function handleMouseLeave() {
    mouseX.set(0.5);
    mouseY.set(0.5);
    setIsHovered(false);
  }

  return (
    <motion.div
      ref={cardRef}
      className="relative w-64 h-40 rounded-2xl overflow-hidden cursor-pointer select-none"
      style={{
        perspective: 800,
        rotateX,
        rotateY,
      }}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={handleMouseLeave}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
    >
      {/* Background image */}
      <div className="absolute inset-0">
        <img
          src={content.thumbnailURL}
          alt={content.title}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
      </div>

      {/* Animated glow on hover */}
      <motion.div
        className="absolute inset-0 border-2 border-transparent rounded-2xl pointer-events-none"
        animate={{
          borderColor: isHovered ? 'rgba(108,92,231,0.6)' : 'rgba(255,255,255,0)',
          boxShadow: isHovered
            ? '0 0 20px rgba(108,92,231,0.4), inset 0 0 20px rgba(0,0,0,0.3)'
            : 'none',
        }}
        transition={{ duration: 0.2 }}
      />

      {/* Content overlay */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-sm font-semibold text-white truncate">{content.title}</h3>
        <div className="flex items-center gap-3 mt-1 text-xs text-gray-300">
          {content.duration && (
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" /> {Math.floor(content.duration / 60)}m
            </span>
          )}
          {content.rating && (
            <span className="flex items-center gap-1">
              <Star className="w-3 h-3 text-yellow-400" /> {content.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      {/* Play button (center, appears on hover) */}
      <motion.div
        className="absolute inset-0 flex items-center justify-center z-20"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: isHovered ? 1 : 0, scale: isHovered ? 1 : 0.8 }}
        transition={{ duration: 0.2 }}
      >
        <div className="p-3 rounded-full bg-[var(--primary)]/90 backdrop-blur-sm">
          <Play className="w-5 h-5 text-white fill-white" />
        </div>
      </motion.div>

      {/* Progress ring (for continue watching) */}
      {progress !== undefined && (
        <svg className="absolute top-2 right-2 w-8 h-8 -rotate-90">
          <circle cx="16" cy="16" r="14" stroke="white" strokeWidth="2" fill="none" opacity="0.3" />
          <circle
            cx="16"
            cy="16"
            r="14"
            stroke="var(--neon-cyan)"
            strokeWidth="2"
            fill="none"
            strokeLinecap="round"
            strokeDasharray={`${2 * Math.PI * 14}`}
            strokeDashoffset={`${2 * Math.PI * 14 * (1 - progress / 100)}`}
          />
        </svg>
      )}
    </motion.div>
  );
}