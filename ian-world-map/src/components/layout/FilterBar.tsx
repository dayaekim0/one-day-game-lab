'use client';

import { Chip } from '@/components/ui/Chip';
import type { Filters } from '@/hooks/useFilters';
import { AGE_RANGES, CATEGORIES } from '@/lib/constants';
import { BUDGET_BUCKETS } from '@/lib/trips';

interface Props {
  filters: Filters;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

const Divider = () => <span className="mx-1.5 h-6 w-px shrink-0 bg-line" aria-hidden />;
const Label = ({ children }: { children: string }) => (
  <span className="shrink-0 text-xs font-semibold text-muted">{children}</span>
);

export function FilterBar({ filters, onChange }: Props) {
  return (
    <div
      className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5 lg:px-6"
      role="toolbar"
      aria-label="필터"
    >
      <Label>개월 수</Label>
      <Chip active={filters.ageRange === 'all'} onClick={() => onChange('ageRange', 'all')}>
        전체
      </Chip>
      {AGE_RANGES.map((a) => (
        <Chip
          key={a.value}
          active={filters.ageRange === a.value}
          onClick={() => onChange('ageRange', filters.ageRange === a.value ? 'all' : a.value)}
        >
          {a.label}
        </Chip>
      ))}

      <Divider />
      <Label>카테고리</Label>
      <Chip active={filters.category === 'all'} onClick={() => onChange('category', 'all')}>
        전체
      </Chip>
      {CATEGORIES.map((c) => (
        <Chip
          key={c.value}
          active={filters.category === c.value}
          onClick={() => onChange('category', filters.category === c.value ? 'all' : c.value)}
        >
          <span aria-hidden>{c.emoji}</span>
          {c.label}
        </Chip>
      ))}

      <Divider />
      <Label>아이 편의</Label>
      <Chip
        active={filters.strollerFriendly}
        onClick={() => onChange('strollerFriendly', !filters.strollerFriendly)}
        title="유모차 이동 편의성이 확인된 곳만"
      >
        👶 유모차 편해요
      </Chip>
      <Chip
        active={filters.mealFriendly}
        onClick={() => onChange('mealFriendly', !filters.mealFriendly)}
        title="아기 메뉴·유아 의자 등 식사 편의가 확인된 곳만"
      >
        🥣 아이 식사 편해요
      </Chip>
      <Chip
        active={filters.realOnly}
        onClick={() => onChange('realOnly', !filters.realOnly)}
        title="샘플 데이터를 빼고 실제 여행 기록만"
      >
        ✅ 실제 방문만
      </Chip>

      <Divider />
      <Label>여행 예산</Label>
      {BUDGET_BUCKETS.map((b) => (
        <Chip
          key={b.value}
          active={filters.budget === b.value}
          onClick={() => onChange('budget', filters.budget === b.value ? 'all' : b.value)}
          title="실제 총 결제액 기준. 이 예산대 여행에서 방문한 장소만"
        >
          {b.label}
        </Chip>
      ))}
    </div>
  );
}
