// components/home/LiveCard.tsx
'use client';

import { motion } from 'framer-motion';
import { Users } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import type { Content } from '@/types/nexus';

interface LiveCardProps {
  content: Content;
  viewerCount: number;
  onClick?: () => void;
}

export default function LiveCard({ content, viewerCount, onClick }: LiveCardProps) {
  return (
    <motion.div
      whileHover={{ scale: 1.03, y: -4 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className="relative w-72 h-44 rounded-2xl overflow-hidden cursor-pointer group"
    >
      {/* Thumbnail */}
      <img
        src={content.thumbnailURL}
        alt={content.title}
        className="absolute inset-0 w-full h-full object-cover"
        loading="lazy"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Neon breathing border */}
      <div className="absolute inset-0 rounded-2xl border-2 border-[var(--accent)]/40 group-hover:border-[var(--accent)] animate-neon-breathe pointer-events-none" />

      {/* Live badge (top left) */}
      <div className="absolute top-3 left-3 z-10">
        <Badge variant="live" />
      </div>

      {/* Viewer count (top right) */}
      <div className="absolute top-3 right-3 z-10 flex items-center gap-1 text-white text-xs font-medium bg-black/60 px-2 py-1 rounded-full">
        <Users className="w-3 h-3" />
        {viewerCount}
      </div>

      {/* Bottom info */}
      <div className="absolute bottom-0 left-0 right-0 p-4 z-10">
        <h3 className="text-sm font-semibold text-white truncate">{content.title}</h3>
        <p className="text-xs text-gray-400 mt-0.5 truncate">{content.creatorId || 'NEXUS Live'}</p>
      </div>
    </motion.div>
  );
}