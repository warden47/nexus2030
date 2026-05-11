// components/layout/FloatingNav.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Home,
  Compass,
  PlaySquare,
  Users,
  Search,
  Bell,
  Settings,
  LogOut,
  Sparkles,
  Mic,
} from 'lucide-react';
import { useUIStore } from '@/store/uiStore';
import { useAuthStore } from '@/store/authStore';
import { signOut } from '@/lib/auth';
import { clsx } from 'clsx';

const navLinks = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Explore', icon: Compass },
  { href: '/library', label: 'My List', icon: PlaySquare },
  { href: '/social', label: 'Social', icon: Users },
];

export default function FloatingNav() {
  const router = useRouter();
  const pathname = usePathname();
  const { toggleSearch, setVoiceSearch } = useUIStore();
  const { user } = useAuthStore();
  const [visible, setVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  // Hide on scroll down, show on scroll up
  useEffect(() => {
    const handleScroll = () => {
      const currentScroll = window.scrollY;
      // Show if near top or scrolling up
      setVisible(currentScroll < 10 || currentScroll < lastScrollY);
      setLastScrollY(currentScroll);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.header
          initial={{ y: -100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -100, opacity: 0 }}
          transition={{ type: 'spring', stiffness: 300, damping: 25 }}
          className="fixed top-0 left-0 right-0 z-50 px-4 py-3 flex items-center justify-between glass mx-4 mt-3 rounded-2xl backdrop-blur-xl border-b-0"
        >
          {/* Logo */}
          <div
            onClick={() => router.push('/home')}
            className="flex items-center gap-2 cursor-pointer select-none"
          >
            <span className="gradient-text text-xl font-extrabold tracking-tight">
              NEXUS
            </span>
            <span className="hidden sm:inline text-sm text-[var(--text-secondary)]">
              2030
            </span>
          </div>

          {/* Center nav links (desktop) */}
          <nav className="hidden md:flex items-center gap-1">
            {navLinks.map((link) => {
              const isActive = pathname.startsWith(link.href);
              const Icon = link.icon;
              return (
                <button
                  key={link.href}
                  onClick={() => router.push(link.href)}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all',
                    isActive
                      ? 'bg-[var(--primary)]/20 text-white shadow-glow-primary'
                      : 'text-[var(--text-secondary)] hover:bg-white/5 hover:text-white'
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {link.label}
                </button>
              );
            })}
          </nav>

          {/* Right actions */}
          <div className="flex items-center gap-2">
            {/* Voice search */}
            <button
              onClick={() => setVoiceSearch(true)}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition"
              aria-label="Voice search"
            >
              <Mic className="w-5 h-5" />
            </button>

            {/* Search toggle */}
            <button
              onClick={toggleSearch}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition"
              aria-label="Search"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Notifications */}
            <button className="relative p-2 rounded-xl text-[var(--text-secondary)] hover:text-white hover:bg-white/10 transition">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--accent)] rounded-full animate-pulse" />
            </button>

            {/* User menu (simple trigger to settings) */}
            <button
              onClick={() => router.push('/settings')}
              className="flex items-center gap-2 pl-3 pr-1 py-1 rounded-xl hover:bg-white/10 transition"
            >
              <span className="hidden sm:block text-sm font-medium text-[var(--text-primary)] max-w-[100px] truncate">
                {user?.displayName ?? 'User'}
              </span>
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] flex items-center justify-center text-xs font-bold">
                {user?.displayName?.charAt(0)?.toUpperCase() ?? 'N'}
              </div>
            </button>

            {/* Logout */}
            <button
              onClick={signOut}
              className="p-2 rounded-xl text-[var(--text-secondary)] hover:text-red-400 hover:bg-white/5 transition"
              aria-label="Sign out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </motion.header>
      )}
    </AnimatePresence>
  );
}