'use client';

import { useRef, useState } from 'react';
import type { Photo } from '@/lib/types';

const KIND_LABEL: Record<string, string> = { exterior: '전경', food: '아기 음식', facility: '편의시설', activity: '활동' };

export function PhotoSlider({ photos, alt }: { photos: Photo[]; alt: string }) {
  const ref = useRef<HTMLDivElement>(null);
  const [index, setIndex] = useState(0);
  if (!photos.length) return null;

  const go = (i: number) => {
    const el = ref.current;
    if (!el) return;
    const next = Math.max(0, Math.min(photos.length - 1, i));
    el.scrollTo({ left: next * el.clientWidth, behavior: 'smooth' });
  };

  return (
    <div className="relative" aria-roledescription="carousel" aria-label={`${alt} 사진`}>
      <div
        ref={ref}
        onScroll={(e) => setIndex(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="no-scrollbar flex snap-x snap-mandatory overflow-x-auto"
      >
        {photos.map((p, i) => (
          <figure key={p.id} className="relative w-full shrink-0 snap-center" aria-label={`${i + 1} / ${photos.length}`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={p.url} alt={p.caption ?? alt} className="aspect-[4/3] w-full bg-gray-100 object-cover" loading={i ? 'lazy' : 'eager'} />
            {(p.caption || p.kind) && (
              <figcaption className="absolute bottom-3 left-3 rounded-full bg-black/60 px-2.5 py-1 text-xs text-white">
                {p.kind && <b className="mr-1">{KIND_LABEL[p.kind] ?? p.kind}</b>}
                {p.caption}
              </figcaption>
            )}
          </figure>
        ))}
      </div>
      {photos.length > 1 && (
        <>
          <button type="button" onClick={() => go(index - 1)} disabled={index === 0} aria-label="이전 사진"
            className="absolute left-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow disabled:opacity-0 lg:flex">‹</button>
          <button type="button" onClick={() => go(index + 1)} disabled={index === photos.length - 1} aria-label="다음 사진"
            className="absolute right-2 top-1/2 hidden h-8 w-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 shadow disabled:opacity-0 lg:flex">›</button>
          <div className="absolute bottom-3 right-3 rounded-full bg-black/60 px-2 py-0.5 text-xs text-white">
            {index + 1} / {photos.length}
          </div>
        </>
      )}
    </div>
  );
}
