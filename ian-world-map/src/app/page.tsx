import { Suspense } from 'react';
import { ExploreApp } from '@/components/explore/ExploreApp';
import { api } from '@/lib/api';

export default async function Home() {
  const [regions, places, trips, visits] = await Promise.all([
    api.places.listRegions(),
    api.places.listPlaces(),
    api.trips.listTripBundles(),
    api.trips.listPlaceVisits(),
  ]);
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center text-muted">불러오는 중…</div>}>
      <ExploreApp places={places} regions={regions} trips={trips} visits={visits} />
    </Suspense>
  );
}
