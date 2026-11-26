'use client';

import { Chip } from '@/components/ui/Chip';
import type { Filters } from '@/hooks/useFilters';
import { AGE_RANGES, CATEGORIES } from '@/lib/constants';

interface Props {
  filters: Filters;
  onChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
}

export function FilterBar({ filters, onChange }: Props) {
  return (
    <div
      className="no-scrollbar flex items-center gap-2 overflow-x-auto px-4 py-2.5 lg:px-6"
      role="toolbar"
      aria-label="필터"
    >
      <span className="shrink-0 text-xs font-semibold text-muted">개월 수</span>
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

      <span className="mx-1.5 h-6 w-px shrink-0 bg-line" aria-hidden />

      <span className="shrink-0 text-xs font-semibold text-muted">카테고리</span>
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
    </div>
  );
}
