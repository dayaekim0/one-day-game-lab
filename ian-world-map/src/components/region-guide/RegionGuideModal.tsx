'use client';

import { Modal } from '@/components/ui/Modal';
import type { Place, Region, TripBundle } from '@/lib/types';
import { RegionGuide } from './RegionGuide';

interface Props {
  region: Region | null;
  places: Place[];
  trips: TripBundle[];
  onClose: () => void;
  onShowPlace: (placeId: string) => void;
  onOpenTrip: (tripId: string) => void;
}

export function RegionGuideModal({ region, places, trips, onClose, onShowPlace, onOpenTrip }: Props) {
  if (!region) return null;
  return (
    <Modal open onClose={onClose} title={`${region.name} 아기랑 여행 가이드`} size="lg">
      <div className="px-5 py-5">
        <RegionGuide
          region={region}
          places={places}
          trips={trips.filter((b) => b.trip.regionIds.includes(region.id))}
          onShowPlace={onShowPlace}
          onOpenTrip={onOpenTrip}
        />
      </div>
    </Modal>
  );
}
