// app/(main)/layout.tsx
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { useAuthStore } from '@/store/authStore';
import FloatingNav from '@/components/layout/FloatingNav';
import SocialSidebar from '@/components/layout/SocialSidebar';
import ToastContainer from '@/components/ui/ToastContainer';

export default function MainLayout({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center bg-[var(--background)]">
        <div className="animate-pulse-glow h-16 w-16 rounded-full bg-[var(--primary)]" />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-[var(--background)]">
      <FloatingNav />
      <main className="pt-20 lg:pr-72">
        {children}
      </main>
      <SocialSidebar />
      <ToastContainer />
    </div>
  );
}