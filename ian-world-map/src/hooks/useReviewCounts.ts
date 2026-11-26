'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

/** 장소별 방문 인증 수. 후기가 추가/삭제되면 자동 갱신 */
export function useReviewCounts() {
  const [counts, setCounts] = useState<Record<string, number>>({});
  useEffect(() => {
    let alive = true;
    const load = () =>
      api.reviews.countReviewsByPlace().then((c) => {
        if (alive) setCounts(c);
      });
    load();
    const unsub = api.reviews.subscribe(load);
    return () => {
      alive = false;
      unsub();
    };
  }, []);
  return counts;
}
