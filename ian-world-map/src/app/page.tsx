import { Suspense } from 'react';
import { ExploreApp } from '@/components/explore/ExploreApp';
import { api } from '@/lib/api';

export default async function Home() {
  const [regions, places] = await Promise.all([api.places.listRegions(), api.places.listPlaces()]);
  return (
    <Suspense fallback={<div className="flex h-dvh items-center justify-center text-muted">불러오는 중…</div>}>
      <ExploreApp places={places} regions={regions} />
    </Suspense>
  );
}
