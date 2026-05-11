// app/(auth)/onboarding/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import { updateUser } from '@/lib/firestore';
import { getMoodLabel } from '@/lib/ai';
import type { MoodType } from '@/types/nexus';

// Preset avatars (emoji-based for simplicity)
const presetAvatars = [
  '🦊', '🐼', '🐨', '🦁', '🐸', '🐙', '🦄', '🐉', '🦋', '🐳', '🦜', '🐢',
];

// Mood options
const allMoods: MoodType[] = [
  'action', 'relax', 'comedy', 'drama', 'horror', 'romance', 'scifi', 'documentary',
];

const STEP_DURATION = 0.3;

export default function OnboardingPage() {
  const { user, firebaseUser } = useAuthStore();
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [selectedAvatar, setSelectedAvatar] = useState(presetAvatars[0]);
  const [moods, setMoods] = useState<MoodType[]>([]);

  // Safety check: if no user, redirect to login
  if (!user) {
    router.replace('/login');
    return null;
  }

  const handleAvatarSelect = (avatar: string) => {
    setSelectedAvatar(avatar);
    setStep(2);
  };

  const toggleMood = (mood: MoodType) => {
    setMoods((prev) =>
      prev.includes(mood)
        ? prev.filter((m) => m !== mood)
        : [...prev, mood]
    );
  };

  const handleMoodSave = async () => {
    if (moods.length < 2) return; // min 2 moods required
    await updateUser(user.uid, {
      avatarURL: selectedAvatar,
      moodPreferences: moods,
    });
    setStep(3);
  };

  // Auto-redirect after final step
  if (step === 3) {
    setTimeout(() => router.push('/home'), 2500);
  }

  return (
    <div className="flex min-h-screen flex-col bg-[var(--background)] text-white">
      {/* Progress bar */}
      <div className="mx-auto mt-8 flex w-full max-w-md gap-2 px-4">
        {[1, 2, 3].map((s) => (
          <div
            key={s}
            className={`h-1 flex-1 rounded-full transition-colors ${
              s <= step ? 'bg-[var(--primary)]' : 'bg-white/10'
            }`}
          />
        ))}
      </div>

      {/* Step content */}
      <div className="flex flex-1 items-center justify-center px-4">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <StepWrapper key="step1">
              <h2 className="mb-6 text-2xl font-semibold">Choose your avatar</h2>
              <div className="grid grid-cols-4 gap-4">
                {presetAvatars.map((avatar) => (
                  <motion.button
                    key={avatar}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => handleAvatarSelect(avatar)}
                    className={`flex h-16 w-16 items-center justify-center rounded-xl text-3xl transition-all ${
                      selectedAvatar === avatar
                        ? 'bg-[var(--primary)]/20 ring-2 ring-[var(--primary)]'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {avatar}
                  </motion.button>
                ))}
              </div>
              <p className="mt-6 text-sm text-[var(--text-secondary)]">
                Or upload a custom avatar (coming soon)
              </p>
            </StepWrapper>
          )}

          {step === 2 && (
            <StepWrapper key="step2">
              <h2 className="mb-6 text-2xl font-semibold">
                What do you usually watch?
              </h2>
              <div className="grid grid-cols-2 gap-3">
                {allMoods.map((mood) => (
                  <motion.button
                    key={mood}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                    onClick={() => toggleMood(mood)}
                    className={`flex items-center gap-2 rounded-xl px-4 py-3 text-left font-medium transition-all ${
                      moods.includes(mood)
                        ? 'bg-[var(--primary)]/20 ring-2 ring-[var(--primary)]'
                        : 'bg-white/5 hover:bg-white/10'
                    }`}
                  >
                    {getMoodLabel(mood)}
                  </motion.button>
                ))}
              </div>
              <p className="mt-4 text-xs text-[var(--text-secondary)]">
                Select at least 2 moods (you can change them later)
              </p>
              <button
                onClick={handleMoodSave}
                disabled={moods.length < 2}
                className="mt-8 w-full rounded-xl bg-[var(--primary)] py-3 font-semibold transition hover:opacity-90 disabled:opacity-50"
              >
                Continue
              </button>
            </StepWrapper>
          )}

          {step === 3 && (
            <StepWrapper key="step3">
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: 'spring', stiffness: 200 }}
                className="text-center"
              >
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ repeat: Infinity, duration: 2, ease: 'linear' }}
                  className="mx-auto mb-6 text-6xl"
                >
                  ✨
                </motion.div>
                <h2 className="gradient-text text-3xl font-extrabold">
                  Your universe is ready, {user.displayName || 'Explorer'}
                </h2>
                <p className="mt-4 text-lg text-[var(--text-secondary)]">
                  Streaming you across the NEXUS…
                </p>
              </motion.div>
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

/** Reusable animation wrapper for steps */
function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 40 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -40 }}
      transition={{ duration: STEP_DURATION, ease: 'easeInOut' }}
      className="w-full max-w-md"
    >
      {children}
    </motion.div>
  );
}