// app/(main)/social/page.tsx
'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { useSocialPosts } from '@/hooks/useSocialPosts'; // assumes we create this hook
import SocialPostCard from '@/components/social/SocialPostCard';
import { getContentList } from '@/lib/firestore';

export default function SocialPage() {
  // For demo, fetching posts for a trending content; real app would have a global feed
  const [contentId, setContentId] = useState<string | null>(null);
  const { posts, isLoading } = useSocialPosts(contentId ?? '');

  // In a real implementation, you'd have a global social feed.
  // This page could display a curated feed from friends/trending.
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      <h1 className="text-3xl font-bold mb-8">Social Hub</h1>
      {isLoading ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-24 rounded-xl bg-white/5 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {posts?.map((post) => (
            <SocialPostCard key={post.id} post={post} />
          ))}
          {posts?.length === 0 && (
            <p className="text-[var(--text-secondary)] text-center py-20">
              No posts yet. Start watching to join the conversation!
            </p>
          )}
        </div>
      )}
    </div>
  );
}