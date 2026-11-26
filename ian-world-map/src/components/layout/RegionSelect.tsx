'use client';

import type { Region } from '@/lib/types';

interface Props {
  regions: Region[];
  value: string;
  onChange: (regionId: string) => void;
  className?: string;
}

export function RegionSelect({ regions, value, onChange, className = '' }: Props) {
  return (
    <label className={`relative inline-flex items-center ${className}`}>
      <span className="sr-only">지역 선택</span>
      <span className="pointer-events-none absolute left-3 text-sm" aria-hidden>
        📍
      </span>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 cursor-pointer appearance-none rounded-full border border-line bg-white pl-8 pr-8 text-sm font-semibold shadow-sm hover:shadow-md focus-visible:outline-2 focus-visible:outline-ink"
      >
        <option value="all">전체 지역</option>
        {regions.map((r) => (
          <option key={r.id} value={r.id}>
            {r.name}
          </option>
        ))}
      </select>
      <span className="pointer-events-none absolute right-3 text-xs text-muted" aria-hidden>
        ▼
      </span>
    </label>
  );
}
