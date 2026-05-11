// components/player/PlayerControls.tsx
'use client';

import { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  SkipBack,
  SkipForward,
  Settings,
  Eye,
} from 'lucide-react';
import { usePlayerStore } from '@/store/playerStore';

export default function PlayerControls() {
  const {
    isPlaying,
    currentTime,
    duration,
    volume,
    isMuted,
    isFullscreen,
    isAmbientMode,
    quality,
    togglePlay,
    setVolume,
    toggleMute,
    setFullscreen,
    toggleAmbientMode,
    setQuality,
  } = usePlayerStore();
  const [visible, setVisible] = useState(true);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  useEffect(() => {
    const handleMouseMove = () => {
      setVisible(true);
      clearTimeout(timerRef.current);
      timerRef.current = setTimeout(() => setVisible(false), 2000);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      clearTimeout(timerRef.current);
    };
  }, []);

  const handleTimelineClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const fraction = (e.clientX - rect.left) / rect.width;
    usePlayerStore.getState().seek(fraction * duration);
  };

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.querySelector('.player-container')?.requestFullscreen();
      setFullscreen(true);
    } else {
      document.exitFullscreen();
      setFullscreen(false);
    }
  };

  const formatTime = (t: number) => {
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute bottom-0 left-0 right-0 px-4 pb-4 z-20"
        >
          {/* Timeline */}
          <div
            className="relative w-full h-1 bg-white/20 rounded cursor-pointer group mb-2"
            onClick={handleTimelineClick}
          >
            <div
              className="absolute h-full bg-[var(--primary)] rounded"
              style={{ width: `${(currentTime / duration) * 100}%` }}
            />
            <div className="absolute top-1/2 -translate-y-1/2 left-0 right-0 h-4 opacity-0 group-hover:opacity-100" />
          </div>

          <div className="flex items-center justify-between">
            {/* Left */}
            <div className="flex items-center gap-3">
              <button onClick={togglePlay} className="p-1 rounded-full hover:bg-white/10">
                {isPlaying ? <Pause className="w-6 h-6 fill-white" /> : <Play className="w-6 h-6 fill-white" />}
              </button>
              <button onClick={() => usePlayerStore.getState().seek(Math.max(0, currentTime - 10))} className="p-1 rounded-full hover:bg-white/10">
                <SkipBack className="w-5 h-5" />
              </button>
              <button onClick={() => usePlayerStore.getState().seek(Math.min(duration, currentTime + 10))} className="p-1 rounded-full hover:bg-white/10">
                <SkipForward className="w-5 h-5" />
              </button>
              <div className="flex items-center gap-1">
                <button onClick={toggleMute} className="p-1 rounded-full hover:bg-white/10">
                  {isMuted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.05}
                  value={isMuted ? 0 : volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-20 h-1 bg-white/20 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-white"
                />
              </div>
              <span className="text-xs text-[var(--text-secondary)]">
                {formatTime(currentTime)} / {formatTime(duration)}
              </span>
            </div>

            {/* Right */}
            <div className="flex items-center gap-2">
              <button onClick={toggleAmbientMode} className={`p-1 rounded-full hover:bg-white/10 ${isAmbientMode ? 'text-[var(--primary)]' : ''}`}>
                <Eye className="w-5 h-5" />
              </button>

              {/* Quality selector */}
              <div className="relative group">
                <button className="p-1 rounded-full hover:bg-white/10">
                  <Settings className="w-5 h-5" />
                </button>
                <div className="absolute bottom-full right-0 mb-2 hidden group-hover:block bg-black/80 rounded-xl p-2 space-y-1">
                  {['auto', '2160p', '1080p', '720p', '480p'].map((q) => (
                    <button
                      key={q}
                      onClick={() => setQuality(q as any)}
                      className={`block w-full text-left px-3 py-1 rounded-lg text-sm ${quality === q ? 'bg-[var(--primary)] text-white' : 'hover:bg-white/10'}`}
                    >
                      {q}
                    </button>
                  ))}
                </div>
              </div>

              <button onClick={toggleFullscreen} className="p-1 rounded-full hover:bg-white/10">
                {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}