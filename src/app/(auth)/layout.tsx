// app/(auth)/layout.tsx
'use client';

import dynamic from 'next/dynamic';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const ParticleBackground = dynamic(
  () => import('@/components/three/ParticleBackground'),
  { ssr: false }
);

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();

  // Redirect authenticated users to /home
  if (isAuthenticated) {
    router.replace('/home');
    return null;
  }

  return (
    <div className="relative flex h-screen w-full items-center justify-center overflow-hidden bg-[var(--background)]">
      {/* Cinematic particle background */}
      <ParticleBackground className="absolute inset-0 z-0" />

      {/* Centered glass card container */}
      <div className="relative z-10 flex w-full max-w-lg flex-col items-center">
        {/* Logo & tagline */}
        <div className="mb-10 text-center">
          <h1 className="gradient-text text-4xl font-extrabold tracking-tight md:text-6xl">
            NEXUS<span className="text-[var(--text-primary)]">2030</span>
          </h1>
          <p className="mt-3 text-lg text-[var(--text-secondary)]">
            Step into the stream
          </p>
        </div>

        {/* Glass card containing auth content */}
        <div className="glass w-full px-8 py-10 shadow-2xl backdrop-blur-xl">
          {children}
        </div>
      </div>
    </div>
  );
}