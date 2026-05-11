// app/(creator)/studio/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { createSocialPost } from '@/lib/firestore';
import UploadZone from '@/components/creator/UploadZone';
import DashboardStats from '@/components/creator/DashboardStats';

export default function CreatorStudioPage() {
  const { user } = useAuthStore();
  const router = useRouter();
  const [isUploading, setIsUploading] = useState(false);

  if (!user || (user.role !== 'creator' && user.role !== 'admin')) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-xl text-[var(--text-secondary)]">
          You need a creator account to access the studio.
        </p>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <h1 className="mb-8 text-4xl font-bold">Creator Studio</h1>

      <DashboardStats userId={user.uid} />

      <div className="grid gap-8 lg:grid-cols-2">
        {/* Upload new content */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass p-6 rounded-2xl"
        >
          <h2 className="text-xl font-semibold mb-4">Upload Content</h2>
          <UploadZone
            onUploadStart={() => setIsUploading(true)}
            onUploadComplete={() => setIsUploading(false)}
          />
        </motion.div>

        {/* Quick post / update */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass p-6 rounded-2xl"
        >
          <h2 className="text-xl font-semibold mb-4">Post Update</h2>
          <QuickPostForm />
        </motion.div>
      </div>
    </div>
  );
}

function QuickPostForm() {
  const [body, setBody] = useState('');
  const { user } = useAuthStore();

  const handlePost = async () => {
    if (!body.trim() || !user) return;
    await createSocialPost({ userId: user.uid, body, type: 'comment', contentId: 'studio' }); // placeholder
    setBody('');
  };

  return (
    <div className="space-y-4">
      <textarea
        value={body}
        onChange={(e) => setBody(e.target.value)}
        placeholder="Share something with your fans..."
        className="w-full rounded-xl border border-white/10 bg-white/5 p-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
        rows={3}
      />
      <button
        onClick={handlePost}
        className="rounded-xl bg-[var(--primary)] px-6 py-2 font-semibold transition hover:bg-opacity-90"
      >
        Post
      </button>
    </div>
  );
}