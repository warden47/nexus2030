// store/authStore.ts
import { create } from 'zustand';
import type { User as FirebaseUser } from 'firebase/auth';
import type { User, UserRole } from '@/types/nexus';

export interface AuthState {
  user: User | null;
  firebaseUser: FirebaseUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  role: UserRole;

  setUser: (user: User | null) => void;
  setFirebaseUser: (fbUser: FirebaseUser | null) => void;
  setLoading: (loading: boolean) => void;
  setRole: (role: UserRole) => void;
  clearAuth: () => void;
}

const initialState = {
  user: null,
  firebaseUser: null,
  isLoading: true,
  isAuthenticated: false,
  role: 'user' as UserRole,
};

export const useAuthStore = create<AuthState>()((set) => ({
  ...initialState,

  setUser: (user) =>
    set({
      user,
      isAuthenticated: !!user,
    }),

  setFirebaseUser: (fbUser) => set({ firebaseUser: fbUser }),

  setLoading: (loading) => set({ isLoading: loading }),

  setRole: (role) => set({ role }),

  clearAuth: () =>
    set({
      ...initialState,
      isLoading: false, // after clearing, auth is not loading
    }),
}));