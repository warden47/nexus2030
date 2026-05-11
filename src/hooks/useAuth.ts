// hooks/useAuth.ts
'use client';

import { useEffect } from 'react';
import { onAuthStateChanged } from '@/lib/auth';
import { getUser } from '@/lib/firestore';
import { useAuthStore } from '@/store/authStore';
import { getUserCustomClaims } from '@/lib/auth';
import type { User } from '@/types/nexus';

export function useAuth() {
  const {
    user,
    firebaseUser,
    isLoading,
    isAuthenticated,
    role,
    setUser,
    setFirebaseUser,
    setLoading,
    setRole,
  } = useAuthStore();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(async (fbUser) => {
      setFirebaseUser(fbUser);

      if (!fbUser) {
        setUser(null);
        setRole('user');
        setLoading(false);
        return;
      }

      try {
        // Fetch Firestore user document
        const userDoc = await getUser(fbUser.uid);
        setUser(userDoc);

        // Get custom claims for role (admin, creator)
        const claims = await getUserCustomClaims();
        if (claims) {
          setRole(claims.role || 'user');
        } else {
          setRole(userDoc?.role ?? 'user');
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
        setRole('user');
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [setUser, setFirebaseUser, setLoading, setRole]);

  return { user, firebaseUser, isAuthenticated, isLoading, role };
}

// ─── Derived hooks ──────────────────────────────────────
export function useIsAdmin() {
  const { role } = useAuthStore();
  return role === 'admin';
}

export function useIsCreator() {
  const { role } = useAuthStore();
  return role === 'creator' || role === 'admin';
}

export function useIsPremium() {
  const { user } = useAuthStore();
  return user?.premiumTier === 'plus' || user?.premiumTier === 'ultimate';
}