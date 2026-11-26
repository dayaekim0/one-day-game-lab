'use client';

import type { Place } from '@/lib/types';
import { AgeBadges, AmenityIcons, ReviewCountBadge, categoryOf } from './PlaceMeta';

interface Props {
  place: Place;
  reviewCount: number;
  highlighted: boolean;
  selected: boolean;
  onHover: (id: string | null) => void;
  onClick: (id: string) => void;
}

export function PlaceCard({ place, reviewCount, highlighted, selected, onHover, onClick }: Props) {
  const cat = categoryOf(place);
  return (
    <article
      id={`place-card-${place.id}`}
      onMouseEnter={() => onHover(place.id)}
      onMouseLeave={() => onHover(null)}
      className={`group scroll-mt-4 rounded-2xl p-2 transition-shadow ${
        selected ? 'ring-2 ring-ink' : highlighted ? 'ring-1 ring-gray-300' : ''
      }`}
    >
      <button
        type="button"
        onClick={() => onClick(place.id)}
        onFocus={() => onHover(place.id)}
        onBlur={() => onHover(null)}
        className="block w-full text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ink rounded-xl"
      >
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={place.thumbnail}
            alt=""
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
          />
          <span className="absolute left-2.5 top-2.5 rounded-full bg-white/95 px-2.5 py-1 text-xs font-bold shadow-sm">
            {cat.emoji} {cat.label}
          </span>
          {place.affiliateLink && (
            <span className="absolute right-2.5 top-2.5 rounded-full bg-black/60 px-2 py-0.5 text-[11px] font-semibold text-white">
              예약 가능
            </span>
          )}
        </div>
        <div className="mt-2.5 space-y-1 px-0.5">
          <div className="flex items-start justify-between gap-2">
            <h3 className="line-clamp-1 font-bold">{place.name}</h3>
            <ReviewCountBadge count={reviewCount} />
          </div>
          <p className="line-clamp-2 text-sm text-muted">{place.shortDescription}</p>
          <div className="flex items-center justify-between gap-2 pt-0.5">
            <AgeBadges place={place} />
            <AmenityIcons place={place} />
          </div>
        </div>
      </button>
    </article>
  );
}
