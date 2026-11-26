'use client';

import { useEffect, useRef } from 'react';
import type { SelectSource } from '@/store/exploreStore';
import type { Place } from '@/lib/types';
import { AgeBadges, ReviewCountBadge, categoryOf } from './PlaceMeta';

interface Props {
  places: Place[];
  reviewCounts: Record<string, number>;
  selectedId: string | null;
  selectSource: SelectSource | null;
  onSelect: (id: string) => void;
  onCardClick: (id: string) => void;
}

/** 모바일 지도 하단의 스와이프 카드. 가운데 온 카드가 선택되어 지도 핀과 연동됨 */
export function MobileCarousel({
  places,
  reviewCounts,
  selectedId,
  selectSource,
  onSelect,
  onCardClick,
}: Props) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const programmatic = useRef(false);

  // 지도 핀을 누르면 해당 카드로 스크롤
  useEffect(() => {
    if (!selectedId || selectSource === 'carousel') return;
    const el = scrollerRef.current?.querySelector<HTMLElement>(`[data-id="${selectedId}"]`);
    if (!el || !scrollerRef.current) return;
    const s = scrollerRef.current;
    const left = el.offsetLeft - (s.clientWidth - el.clientWidth) / 2;
    if (Math.abs(s.scrollLeft - left) < 2) return;
    programmatic.current = true;
    s.scrollTo({ left, behavior: 'smooth' });
  }, [selectedId, selectSource]);

  const onScroll = () => {
    clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      const s = scrollerRef.current;
      if (!s) return;
      if (programmatic.current) {
        programmatic.current = false;
        return;
      }
      const center = s.scrollLeft + s.clientWidth / 2;
      let best: { id: string; d: number } | null = null;
      for (const el of Array.from(s.querySelectorAll<HTMLElement>('[data-id]'))) {
        const d = Math.abs(el.offsetLeft + el.clientWidth / 2 - center);
        if (!best || d < best.d) best = { id: el.dataset.id!, d };
      }
      if (best && best.id !== selectedId) onSelect(best.id);
    }, 120);
  };

  useEffect(() => () => clearTimeout(timer.current), []);

  if (!places.length) return null;

  return (
    <div
      ref={scrollerRef}
      onScroll={onScroll}
      className="no-scrollbar flex snap-x snap-mandatory gap-3 overflow-x-auto px-[7.5%] pb-[max(1rem,env(safe-area-inset-bottom))] pt-2"
      aria-label="장소 카드"
    >
      {places.map((p) => {
        const cat = categoryOf(p);
        const active = p.id === selectedId;
        return (
          <button
            key={p.id}
            type="button"
            data-id={p.id}
            onClick={() => (active ? onCardClick(p.id) : onSelect(p.id))}
            className={`flex w-[85%] shrink-0 snap-center gap-3 rounded-2xl bg-white p-2.5 text-left shadow-lg transition-shadow ${
              active ? 'ring-2 ring-ink' : ''
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.thumbnail} alt="" className="h-24 w-24 shrink-0 rounded-xl object-cover" />
            <div className="min-w-0 flex-1 space-y-1">
              <p className="text-[11px] font-semibold text-muted">
                {cat.emoji} {cat.label}
              </p>
              <h3 className="line-clamp-1 font-bold">{p.name}</h3>
              <p className="line-clamp-2 text-xs text-muted">{p.shortDescription}</p>
              <div className="flex items-center justify-between gap-1">
                <AgeBadges place={p} max={2} />
                <ReviewCountBadge count={reviewCounts[p.id] ?? 0} />
              </div>
            </div>
          </button>
        );
      })}
    </div>
  );
}
