// app/(main)/home/page.tsx
'use client';

import { useEffect } from 'react';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { useUIStore } from '@/store/uiStore';
import HeroSection from '@/components/home/HeroSection';
import MoodStrip from '@/components/home/MoodStrip';
import ContinueWatching from '@/components/home/ContinueWatching';
import AIRecommendationRow from '@/components/home/AIRecommendationRow';
import LiveNow from '@/components/home/LiveNow';
import TrendingToday from '@/components/home/TrendingToday';
import FriendActivity from '@/components/home/FriendActivity';

export default function HomePage() {
  const { user } = useAuthStore();
  const { setMood } = useUIStore();
  const displayName = user?.displayName ?? 'Explorer';

  useEffect(() => {
    // Optional: reset mood when arriving home
    setMood('action');
  }, [setMood]);

  return (
    <div className="space-y-10 pb-20">
      {/* 1. Hero Section */}
      <HeroSection greeting={`Welcome back, ${displayName}.`} />

      {/* 2. Mood Strip */}
      <MoodStrip />

      {/* 3. Continue Watching */}
      <ContinueWatching />

      {/* 4. AI Recommendation Row 1 */}
      <AIRecommendationRow title="Because you loved Action" />

      {/* 5. Live Now */}
      <LiveNow />

      {/* 6. Trending Today */}
      <TrendingToday />

      {/* 7. Friend Activity (desktop sidebar already shows, but also as mobile row) */}
      <div className="lg:hidden">
        <FriendActivity />
      </div>

      {/* 8. More AI rows (repeat pattern) */}
      <AIRecommendationRow title="Chill & Relax" />
      <AIRecommendationRow title="Sci‑Fi Adventures" />
    </div>
  );
}