// app/(auth)/login/page.tsx
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { signInWithGoogle, signInWithEmail, signInAnonymously } from '@/lib/auth';
import { Mail, ArrowRight, Sparkles } from 'lucide-react';
import { FcGoogle } from 'react-icons/fc'; // or a Google icon component

const staggerContainer = {
  hidden: {},
  show: {
    transition: { staggerChildren: 0.1 },
  },
};
const cardVariant = {
  hidden: { opacity: 0, y: 30 },
  show: { opacity: 1, y: 0, transition: { ease: 'easeOut' } },
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [linkSent, setLinkSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    setIsLoading('google');
    setError(null);
    try {
      await signInWithGoogle();
      router.push('/home');
    } catch (e: any) {
      setError(e.message ?? 'Google sign‑in failed');
    } finally {
      setIsLoading(null);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    setIsLoading('magic');
    setError(null);
    try {
      await signInWithEmail(email);
      setLinkSent(true);
    } catch (e: any) {
      setError(e.message ?? 'Magic link failed');
    } finally {
      setIsLoading(null);
    }
  };

  const handleGuest = async () => {
    setIsLoading('guest');
    setError(null);
    try {
      await signInAnonymously();
      router.push('/home');
    } catch (e: any) {
      setError(e.message ?? 'Guest sign‑in failed');
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Title */}
      <motion.h2
        variants={cardVariant}
        className="text-3xl font-bold text-white"
      >
        Enter the Stream
      </motion.h2>

      {/* Option 1: Google */}
      <motion.button
        variants={cardVariant}
        onClick={handleGoogleSignIn}
        disabled={isLoading === 'google'}
        className="flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white/5 px-6 py-4 text-lg font-semibold text-white backdrop-blur-md transition-all hover:bg-white/10 hover:shadow-glow-primary disabled:opacity-50"
      >
        <FcGoogle className="h-6 w-6" />
        {isLoading === 'google' ? 'Connecting…' : 'Continue with Google'}
      </motion.button>

      {/* Option 2: Magic Link */}
      <motion.div variants={cardVariant}>
        <form
          onSubmit={handleMagicLink}
          className="rounded-xl border border-white/10 bg-white/5 p-6 backdrop-blur-md"
        >
          <p className="mb-4 text-sm text-[var(--text-secondary)]">
            Or sign in with a magic link
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]"
                required
                disabled={linkSent}
              />
            </div>
            <button
              type="submit"
              disabled={linkSent || isLoading === 'magic'}
              className="flex items-center gap-2 rounded-lg bg-[var(--primary)] px-6 py-3 font-semibold text-white transition hover:opacity-90 disabled:opacity-50"
            >
              {isLoading === 'magic' ? (
                'Sending…'
              ) : (
                <>
                  Send <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>

          {/* Confirmation message */}
          <AnimatePresence>
            {linkSent && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="mt-4 flex items-center gap-3 rounded-lg border border-[var(--neon-cyan)] bg-[var(--neon-cyan)]/10 px-4 py-3 text-sm text-[var(--neon-cyan)]"
              >
                <Sparkles className="h-5 w-5" />
                Magic link sent! Check your inbox for the sign‑in link.
              </motion.div>
            )}
          </AnimatePresence>
        </form>
      </motion.div>

      {/* Option 3: Guest */}
      <motion.button
        variants={cardVariant}
        onClick={handleGuest}
        disabled={isLoading === 'guest'}
        className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-transparent px-6 py-4 text-base font-medium text-gray-300 transition-all hover:bg-white/5 disabled:opacity-50"
      >
        👤 Explore as Guest
      </motion.button>

      {/* Optional biometric button (coming soon) */}
      <motion.div
        variants={cardVariant}
        className="flex items-center justify-center gap-2 rounded-xl border border-dashed border-white/10 px-6 py-4 text-sm text-gray-500"
      >
        <span>🔒 Biometric login</span>
        <span className="rounded-full bg-[var(--accent)]/20 px-2 py-0.5 text-xs text-[var(--accent)]">
          Coming soon
        </span>
      </motion.div>

      {/* Error message */}
      {error && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="rounded-lg border border-red-500 bg-red-500/10 p-3 text-center text-sm text-red-300"
        >
          {error}
        </motion.p>
      )}
    </motion.div>
  );
}