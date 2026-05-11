// components/layout/Sidebar.tsx
'use client';

import { useUIStore } from '@/store/uiStore';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Users, Clock, Zap } from 'lucide-react';
import { useSocialPosts } from '@/hooks/useSocialPosts'; // imaginary hook
import FriendActivity from '@/components/home/FriendActivity';

export default function SocialSidebar() {
  const { sidebarOpen, setSidebarOpen, addToast } = useUIStore();

  return (
    <AnimatePresence>
      {sidebarOpen && (
        <motion.aside
          initial={{ x: '100%', opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: '100%', opacity: 0 }}
          transition={{ type: 'spring', stiffness: 400, damping: 30 }}
          className="fixed top-0 right-0 h-full w-72 lg:w-80 bg-[var(--surface)]/90 backdrop-blur-xl border-l border-white/10 z-40 p-5 overflow-y-auto shadow-2xl"
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Users className="w-5 h-5 text-[var(--neon-cyan)]" />
              Friend Activity
            </h2>
            <button
              onClick={() => setSidebarOpen(false)}
              className="p-1 rounded-lg hover:bg-white/10 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Friend Activity Widget */}
          <FriendActivity />

          {/* Quick tip */}
          <div className="mt-8 glass p-4 rounded-xl text-xs text-[var(--text-secondary)]">
            <Zap className="w-4 h-4 inline mr-1 text-[var(--secondary)]" />
            Watch parties are live! Join friends watching right now.
          </div>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}