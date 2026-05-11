// components/player/VideoPlayer.tsx
'use client';

import { useEffect, useRef } from 'react';
import Hls from 'hls.js';
import { usePlayerStore } from '@/store/playerStore';
import { useAuthStore } from '@/store/authStore';
import { getMuxSignedUrl } from '@/lib/mux';
import type { Content } from '@/types/nexus';

interface VideoPlayerProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  content?: Content;
}

export default function VideoPlayer({ videoRef, content }: VideoPlayerProps) {
  const hlsRef = useRef<Hls | null>(null);
  const { user } = useAuthStore();
  const {
    isPlaying,
    currentTime,
    volume,
    isMuted,
    quality,
    setBuffering,
    setError,
    setDuration,
  } = usePlayerStore();

  // ── Setup HLS / source ──────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video || !content?.hlsMasterURL) return;

    const initSource = async () => {
      try {
        let src = content.hlsMasterURL;
        // Sign the URL if required (Mux signed URLs)
        if (user) {
          const signed = await getMuxSignedUrl(content.contentId, user.uid);
          if (signed) src = signed;
        }

        if (Hls.isSupported()) {
          if (hlsRef.current) hlsRef.current.destroy();
          const hls = new Hls({ capLevelToPlayerSize: true, autoStartLoad: false });
          hls.loadSource(src);
          hls.attachMedia(video);

          hls.on(Hls.Events.MANIFEST_PARSED, () => {
            setDuration(video.duration);
          });
          hls.on(Hls.Events.ERROR, (_, data) => {
            if (data.fatal) {
              setError(data.type);
              hls.destroy();
            }
          });
          hlsRef.current = hls;
        } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
          video.src = src;
        }
      } catch {
        setError('Failed to load video source');
      }
    };

    initSource();

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [content?.hlsMasterURL, videoRef, user, setDuration, setError]);

  // ── Play / pause from store ─────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (isPlaying && video.paused) video.play().catch(() => {});
    if (!isPlaying && !video.paused) video.pause();
  }, [isPlaying, videoRef]);

  // ── Volume & mute ──────────────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = volume;
    video.muted = isMuted;
  }, [volume, isMuted, videoRef]);

  // ── Seek (external control) ────────────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (Math.abs(video.currentTime - currentTime) > 0.5) {
      video.currentTime = currentTime;
    }
  }, [currentTime, videoRef]);

  // ── Quality switch (HLS) ───────────────────────────
  useEffect(() => {
    if (!hlsRef.current || quality === 'auto') return;
    const targetHeight = parseInt(quality) || 0;
    const levels = hlsRef.current.levels;
    const idx = levels.findIndex((l) => l.height <= targetHeight);
    if (idx !== -1) hlsRef.current.currentLevel = idx;
  }, [quality]);

  // ── Sync video events back to store ────────────────
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const onTimeUpdate = () => usePlayerStore.setState({ currentTime: video.currentTime });
    const onDuration = () => setDuration(video.duration);
    const onWaiting = () => setBuffering(true);
    const onPlaying = () => { setBuffering(false); usePlayerStore.setState({ isPlaying: true }); };
    const onPause = () => usePlayerStore.setState({ isPlaying: false });
    const onEnded = () => usePlayerStore.setState({ isPlaying: false });

    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('pause', onPause);
    video.addEventListener('ended', onEnded);

    return () => {
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('ended', onEnded);
    };
  }, [videoRef, setBuffering, setDuration]);

  return null; // logic-only component
}