// app/(main)/watch/[id]/page.tsx
'use client';

import { useEffect, useRef } from 'react';
import { useParams } from 'next/navigation';
import { usePlayer } from '@/hooks/usePlayer';
import { useAmbientColor } from '@/hooks/useAmbientColor';
import VideoPlayer from '@/components/player/VideoPlayer';
import AmbientMode from '@/components/player/AmbientMode';
import WatchPartySidebar from '@/components/social/WatchPartySidebar';
import ChatPanel from '@/components/social/ChatPanel';
import SocialReactions from '@/components/social/SocialReactions';
import { usePlayerStore } from '@/store/playerStore';
import { getContent } from '@/lib/firestore';
import type { Content } from '@/types/nexus';

export default function WatchPage() {
  const params = useParams();
  const id = params.id as string;
  const { setContent } = usePlayerStore();
  const videoRef = useRef<HTMLVideoElement>(null);
  const ambientColor = useAmbientColor(videoRef);

  useEffect(() => {
    if (id) setContent(id);
  }, [id, setContent]);

  return (
    <div className="relative flex min-h-screen flex-col lg:flex-row">
      {/* Main player area */}
      <div className="flex-1">
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full aspect-video bg-black"
            // src will be set by VideoPlayer
          />
          <VideoPlayer videoRef={videoRef} />
          {ambientColor && <AmbientMode color={ambientColor} />}
        </div>

        {/* Title and info below player */}
        <div className="px-4 pt-4">
          <h1 className="text-2xl font-bold">{/* content title */}</h1>
          <SocialReactions contentId={id} />
        </div>
      </div>

      {/* Right sidebar: chat / watch party */}
      <div className="lg:w-80 border-l border-white/10">
        <WatchPartySidebar />
        <ChatPanel contentId={id} />
      </div>
    </div>
  );
}