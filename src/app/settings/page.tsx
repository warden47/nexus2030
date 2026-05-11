// app/settings/page.tsx
'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { updateUser } from '@/lib/firestore';
import { useUIStore } from '@/store/uiStore';
import { motion } from 'framer-motion';

export default function SettingsPage() {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useUIStore();
  const [displayName, setDisplayName] = useState(user?.displayName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');

  const handleSaveProfile = async () => {
    if (!user) return;
    await updateUser(user.uid, { displayName });
    // also update auth profile if needed
  };

  return (
    <div className="mx-auto max-w-xl px-4 py-12">
      <h1 className="mb-8 text-3xl font-bold">Settings</h1>

      <div className="space-y-8">
        {/* Profile */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Profile</h2>
          <div className="space-y-4">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
              placeholder="Display Name"
            />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-gray-400"
            />
            <button
              onClick={handleSaveProfile}
              className="rounded-lg bg-[var(--primary)] px-6 py-2 font-semibold transition hover:opacity-90"
            >
              Save Profile
            </button>
          </div>
        </motion.section>

        {/* Theme */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Appearance</h2>
          <div className="flex items-center justify-between">
            <span>Theme: {theme === 'dark' ? 'Dark' : 'Light'}</span>
            <button
              onClick={toggleTheme}
              className="rounded-lg border border-white/10 px-4 py-2 transition hover:bg-white/10"
            >
              Toggle Theme
            </button>
          </div>
        </motion.section>

        {/* Subscription */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass rounded-2xl p-6"
        >
          <h2 className="text-lg font-semibold mb-4">Subscription</h2>
          <p className="text-[var(--text-secondary)]">
            Current plan: <span className="text-white capitalize">{user?.premiumTier ?? 'Free'}</span>
          </p>
          <button className="mt-4 rounded-lg border border-[var(--primary)] px-6 py-2 text-[var(--primary)] transition hover:bg-[var(--primary)]/10">
            Manage Subscription
          </button>
        </motion.section>
      </div>
    </div>
  );
}