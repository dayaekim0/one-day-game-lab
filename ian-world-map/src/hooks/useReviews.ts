'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import type { AppUser, UserReview } from '@/lib/types';

/** 장소별 방문 인증 후기 + 현재 사용자. 새 후기가 올라오면 자동 갱신 */
export function useReviews(placeId: string | null) {
  const [reviews, setReviews] = useState<UserReview[]>([]);
  const [user, setUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(false);

  const load = useCallback(async () => {
    if (!placeId) return;
    const [list, u] = await Promise.all([api.reviews.listReviews(placeId), api.auth.getCurrentUser()]);
    setReviews(list);
    setUser(u);
    setLoading(false);
  }, [placeId]);

  useEffect(() => {
    if (!placeId) {
      setReviews([]);
      return;
    }
    setLoading(true);
    load();
    return api.reviews.subscribe(load);
  }, [placeId, load]);

  return { reviews, user, loading, reload: load };
}
