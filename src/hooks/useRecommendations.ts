// hooks/useRecommendations.ts
'use client';

import { useQuery, useQueryClient } from '@tanstack/react-query';
import { getRecommendations } from '@/lib/ai';
import type { MoodType, Recommendation } from '@/types/nexus';

/**
 * Primary recommendation hook.
 * Fetches AI‑curated feed for a user, optionally filtered by mood.
 */
export function useRecommendations(userId: string, mood?: MoodType) {
  return useQuery<Recommendation | null>({
    queryKey: ['recommendations', userId, mood],
    queryFn: () => getRecommendations(userId, mood),
    staleTime: 5 * 60 * 1000,    // 5 minutes
    refetchOnWindowFocus: false,
    enabled: !!userId,
  });
}

/**
 * Secondary hook that filters the already‑cached, full recommendations
 * (without a specific mood) down to a single mood.
 *
 * This avoids a new network request when the user switches moods rapidly.
 *
 * ⚠️ Requires that the AI API returns a `moods` array on each feed item.
 * Update your `Recommendation` feed item type to include `moods?: MoodType[]`.
 */
export function useMoodRecommendations(userId: string, mood: MoodType) {
  const queryClient = useQueryClient();
  const cachedData = queryClient.getQueryData<Recommendation>(['recommendations', userId]);

  const { data, isLoading, error, refetch } = useRecommendations(userId); // fallback load

  // If a full general feed exists in the cache, filter it client‑side.
  const filtered =
    cachedData ? {
      ...cachedData,
      personalizedFeed: cachedData.personalizedFeed.filter((item) =>
        (item as any).moods?.includes(mood)
      ),
    } : data;

  return {
    data: filtered ?? null,
    isLoading: isLoading && !cachedData, // loading only if no cache
    error,
    refetch,
  };
}