'use client';

import { Fragment } from 'react';
import { AdBannerSlot } from '@/components/monetization/AdBannerSlot';
import { AD_SLOT_EVERY_N_CARDS } from '@/lib/constants';
import type { Place } from '@/lib/types';
import { PlaceCard } from './PlaceCard';

interface Props {
  places: Place[];
  reviewCounts: Record<string, number>;
  hoveredId: string | null;
  selectedId: string | null;
  onHover: (id: string | null) => void;
  onCardClick: (id: string) => void;
}

export function PlaceList({ places, reviewCounts, hoveredId, selectedId, onHover, onCardClick }: Props) {
  return (
    <div className="grid grid-cols-1 gap-x-3 gap-y-4 sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
      {places.map((p, i) => {
        const showAd = (i + 1) % AD_SLOT_EVERY_N_CARDS === 0 && i < places.length - 1;
        return (
          <Fragment key={p.id}>
            <PlaceCard
              place={p}
              reviewCount={reviewCounts[p.id] ?? 0}
              highlighted={hoveredId === p.id}
              selected={selectedId === p.id}
              onHover={onHover}
              onClick={onCardClick}
            />
            {showAd && (
              <AdBannerSlot
                slotId="list-inline"
                placement="list-inline"
                className="col-span-full mx-2"
              />
            )}
          </Fragment>
        );
      })}
    </div>
  );
}
