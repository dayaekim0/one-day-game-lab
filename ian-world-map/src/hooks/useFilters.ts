'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useMemo } from 'react';
import { AGE_RANGES, CATEGORIES } from '@/lib/constants';
import { BUDGET_BUCKETS } from '@/lib/trips';
import type { AgeRange, BudgetBucket, Category } from '@/lib/types';

export interface Filters {
  regionId: string | 'all';
  ageRange: AgeRange | 'all';
  category: Category | 'all';
  budget: BudgetBucket | 'all';
  strollerFriendly: boolean;
  mealFriendly: boolean;
  realOnly: boolean;
  query: string;
}

const PARAM: Record<keyof Filters, string> = {
  regionId: 'region',
  ageRange: 'age',
  category: 'cat',
  budget: 'budget',
  strollerFriendly: 'stroller',
  mealFriendly: 'meal',
  realOnly: 'real',
  query: 'q',
};

const DEFAULTS: Filters = {
  regionId: 'all',
  ageRange: 'all',
  category: 'all',
  budget: 'all',
  strollerFriendly: false,
  mealFriendly: false,
  realOnly: false,
  query: '',
};

/** URL 쿼리 ↔ 필터 (링크 공유 가능) */
export function useFilters(validRegionIds: string[]) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const filters = useMemo<Filters>(() => {
    const get = (k: keyof Filters) => params.get(PARAM[k]);
    const region = get('regionId');
    const age = get('ageRange');
    const cat = get('category');
    const budget = get('budget');
    return {
      regionId: region && validRegionIds.includes(region) ? region : 'all',
      ageRange: AGE_RANGES.some((a) => a.value === age) ? (age as AgeRange) : 'all',
      category: CATEGORIES.some((c) => c.value === cat) ? (cat as Category) : 'all',
      budget: BUDGET_BUCKETS.some((b) => b.value === budget) ? (budget as BudgetBucket) : 'all',
      strollerFriendly: get('strollerFriendly') === '1',
      mealFriendly: get('mealFriendly') === '1',
      realOnly: get('realOnly') === '1',
      query: (get('query') ?? '').slice(0, 50),
    };
  }, [params, validRegionIds]);

  const write = useCallback(
    (next: Filters) => {
      const sp = new URLSearchParams();
      (Object.keys(PARAM) as (keyof Filters)[]).forEach((k) => {
        const v = next[k];
        if (v === DEFAULTS[k]) return;
        sp.set(PARAM[k], typeof v === 'boolean' ? '1' : String(v));
      });
      const qs = sp.toString();
      router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
    },
    [pathname, router],
  );

  const setFilter = useCallback(
    <K extends keyof Filters>(key: K, value: Filters[K]) => write({ ...filters, [key]: value }),
    [filters, write],
  );

  /** 여러 값을 한 번에 교체 (나머지는 기본값) */
  const replaceFilters = useCallback(
    (partial: Partial<Filters>) => write({ ...DEFAULTS, ...partial }),
    [write],
  );

  const resetFilters = useCallback(() => write(DEFAULTS), [write]);

  const hasFilter = (Object.keys(DEFAULTS) as (keyof Filters)[]).some(
    (k) => filters[k] !== DEFAULTS[k],
  );

  return { filters, setFilter, replaceFilters, resetFilters, hasFilter };
}
