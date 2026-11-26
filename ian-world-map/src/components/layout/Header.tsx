'use client';

import type { Filters } from '@/hooks/useFilters';
import type { Region } from '@/lib/types';
import { FilterBar } from './FilterBar';
import { RegionSelect } from './RegionSelect';

interface Props {
  regions: Region[];
  filters: Filters;
  onFilterChange: <K extends keyof Filters>(key: K, value: Filters[K]) => void;
  onReset: () => void;
  onSubmitPlace: () => void;
}

export function Header({ regions, filters, onFilterChange, onReset, onSubmitPlace }: Props) {
  return (
    <header className="z-[1100] shrink-0 border-b border-line bg-white">
      <div className="flex h-16 items-center gap-3 px-4 lg:px-6">
        <button
          type="button"
          onClick={onReset}
          className="flex shrink-0 items-center gap-1.5 text-brand"
          aria-label="이안이와 세계지도 - 처음으로"
        >
          <span className="text-2xl" aria-hidden>
            🗺️
          </span>
          <span className="hidden text-lg font-extrabold tracking-tight sm:inline">
            이안이와 세계지도
          </span>
        </button>

        <RegionSelect
          regions={regions}
          value={filters.regionId}
          onChange={(v) => onFilterChange('regionId', v)}
          className="min-w-0 lg:ml-6"
        />

        <div className="flex-1" />

        <button
          type="button"
          onClick={onSubmitPlace}
          className="shrink-0 rounded-full bg-brand px-3.5 py-2.5 text-sm font-bold text-white shadow-sm transition-colors hover:bg-brand-dark focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink"
        >
          <span className="sm:hidden">+ 제보</span>
          <span className="hidden sm:inline">+ 새로운 장소 제보하기</span>
        </button>
      </div>
      <div className="border-t border-line">
        <FilterBar filters={filters} onChange={onFilterChange} />
      </div>
    </header>
  );
}
