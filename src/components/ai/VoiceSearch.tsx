// components/ai/VoiceSearch.tsx
'use client';

import { useState, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Mic, MicOff, X, Search } from 'lucide-react';
import { voiceSearchTranscribe } from '@/lib/ai';
import { useUIStore } from '@/store/uiStore';
import { useRouter } from 'next/navigation';

export default function VoiceSearch() {
  const { isVoiceSearchActive, setVoiceSearch } = useUIStore();
  const router = useRouter();
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const mediaRecorder = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      setError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
      mediaRecorder.current = recorder;
      chunksRef.current = [];

      recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
      recorder.onstop = async () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setIsRecording(false);
        try {
          const text = await voiceSearchTranscribe(blob);
          if (text) {
            setTranscript(text);
            // Auto-navigate after 1s to search page
            setTimeout(() => {
              router.push(`/search?q=${encodeURIComponent(text)}`);
              closeModal();
            }, 1500);
          } else {
            setError('No speech detected.');
          }
        } catch {
          setError('Transcription failed.');
        }
      };

      recorder.start();
      setIsRecording(true);
    } catch {
      setError('Microphone permission denied.');
    }
  };

  const stopRecording = () => {
    mediaRecorder.current?.stop();
    mediaRecorder.current?.stream.getTracks().forEach(t => t.stop());
  };

  const closeModal = useCallback(() => {
    stopRecording();
    setTranscript(null);
    setError(null);
    setVoiceSearch(false);
  }, [setVoiceSearch]);

  return (
    <AnimatePresence>
      {isVoiceSearchActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/60 backdrop-blur-md"
          onClick={(e) => e.target === e.currentTarget && closeModal()}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="glass p-8 rounded-3xl flex flex-col items-center gap-6 max-w-md w-full mx-4"
          >
            <button
              onClick={closeModal}
              className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10"
            >
              <X className="w-5 h-5" />
            </button>

            {/* Microphone button with pulse animation */}
            <motion.button
              onClick={isRecording ? stopRecording : startRecording}
              className="relative w-24 h-24 rounded-full flex items-center justify-center bg-[var(--primary)]/20 border-2 border-[var(--primary)]/50"
              animate={isRecording ? { scale: [1, 1.2, 1] } : {}}
              transition={{ repeat: Infinity, duration: 1.5 }}
            >
              <div className="absolute inset-0 rounded-full bg-[var(--primary)]/10 animate-ping" />
              {isRecording ? (
                <MicOff className="w-10 h-10 text-[var(--accent)]" />
              ) : (
                <Mic className="w-10 h-10 text-[var(--primary)]" />
              )}
            </motion.button>

            <div className="text-center space-y-2">
              {!isRecording && !transcript && !error && (
                <p className="text-lg font-medium">Press the mic and speak</p>
              )}
              {isRecording && (
                <p className="text-lg font-medium text-[var(--accent)]">Listening…</p>
              )}
              {transcript && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="text-lg font-medium text-[var(--neon-cyan)]"
                >
                  “{transcript}”
                </motion.p>
              )}
              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}
            </div>

            {transcript && (
              <div className="flex gap-2 items-center text-[var(--text-secondary)] text-sm">
                <Search className="w-4 h-4" />
                <span>Searching now…</span>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}