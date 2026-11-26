'use client';

import dynamic from 'next/dynamic';
import type { MapViewProps } from './types';

/**
 * 지도 공급자 교체 지점.
 * Kakao/Google로 바꿀 때는 providers/ 에 같은 MapViewProps를 받는 컴포넌트를 만들고
 * 아래 import 경로만 바꾸면 됩니다.
 */
const ProviderMap = dynamic(() => import('./providers/leaflet/LeafletMap'), {
  ssr: false,
  loading: () => <MapSkeleton />,
});

export function MapView(props: MapViewProps) {
  return <ProviderMap {...props} />;
}

function MapSkeleton() {
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#eef1f4] text-sm text-muted">
      지도를 불러오는 중…
    </div>
  );
}

export type { MapMarker, MapViewProps } from './types';
