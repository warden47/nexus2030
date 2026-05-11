// store/uiStore.ts
import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { persist } from 'zustand/middleware';
import type { MoodType } from '@/types/nexus';

export interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error' | 'achievement';
}

export interface UIState {
  // State
  theme: 'dark' | 'light';
  sidebarOpen: boolean;
  searchOpen: boolean;
  currentMood: MoodType | null;
  toasts: Toast[];
  isVoiceSearchActive: boolean;

  // Actions
  toggleTheme: () => void;
  setSidebarOpen: (open: boolean) => void;
  toggleSearch: () => void;
  setMood: (mood: MoodType) => void;
  addToast: (message: string, type: Toast['type'], duration?: number) => void;
  removeToast: (id: string) => void;
  setVoiceSearch: (active: boolean) => void;
}

export const useUIStore = create<UIState>()(
  persist(
    immer((set, get) => ({
      // Initial state
      theme: 'dark',
      sidebarOpen: false,
      searchOpen: false,
      currentMood: null,
      toasts: [],
      isVoiceSearchActive: false,

      // Actions
      toggleTheme: () =>
        set((state) => {
          state.theme = state.theme === 'dark' ? 'light' : 'dark';
        }),

      setSidebarOpen: (open) =>
        set((state) => {
          state.sidebarOpen = open;
        }),

      toggleSearch: () =>
        set((state) => {
          state.searchOpen = !state.searchOpen;
        }),

      setMood: (mood) =>
        set((state) => {
          state.currentMood = mood;
        }),

      addToast: (message, type, duration = 4000) =>
        set((state) => {
          const id = `toast-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
          state.toasts.push({ id, message, type });
          // Auto-remove
          setTimeout(() => {
            get().removeToast(id);
          }, duration);
        }),

      removeToast: (id) =>
        set((state) => {
          state.toasts = state.toasts.filter((t) => t.id !== id);
        }),

      setVoiceSearch: (active) =>
        set((state) => {
          state.isVoiceSearchActive = active;
        }),
    })),
    {
      name: 'nexus-ui-store',          // localStorage key
      partialize: (state) => ({
        theme: state.theme,
        currentMood: state.currentMood,
      }),
    }
  )
);