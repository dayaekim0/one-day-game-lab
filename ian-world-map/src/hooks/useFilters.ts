'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { AGE_RANGES, CATEGORIES } from '@/lib/constants';
import type { AgeRange, Category } from '@/lib/types';

export interface Filters {
  regionId: string | 'all';
  ageRange: AgeRange | 'all';
  category: Category | 'all';
}

const PARAM = { regionId: 'region', ageRange: 'age', category: 'cat' } as const;

/** 필터 상태를 URL 쿼리(?region=sapporo&age=13-24&cat=restaurant)와 동기화 → 링크 공유 가능 */
export function useFilters(validRegionIds: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo<Filters>(() => {
    const region = params.get(PARAM.regionId);
    const age = params.get(PARAM.ageRange);
    const cat = params.get(PARAM.category);
    return {
      regionId: region && validRegionIds.includes(region) ? region : 'all',
      ageRange: AGE_RANGES.some((a) => a.value === age) ? (age as AgeRange) : 'all',
      category: CATEGORIES.some((c) => c.value === cat) ? (cat as Category) : 'all',
    };
  }, [params, validRegionIds]);

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => {
      const next = new URLSearchParams(params.toString());
      if (value === 'all') next.delete(PARAM[key]);
      else next.set(PARAM[key], value);
      const qs = next.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [params, pathname, router],
  );

  const resetFilters = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [pathname, router]);

  return { filters, setFilter, resetFilters };
}
