'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Header } from '@/components/layout/Header';
import { MapView, type MapMarker } from '@/components/map/MapView';
import { SubmitPlaceModal } from '@/components/submit-place/SubmitPlaceModal';
import { TripCard } from '@/components/trip/TripCard';
import { TripDetailModal } from '@/components/trip/TripDetailModal';
import { PlaceDetailModal } from '@/components/place-detail/PlaceDetailModal';
import { RegionGuideModal } from '@/components/region-guide/RegionGuideModal';
import { useFilters } from '@/hooks/useFilters';
import { DESKTOP_QUERY, useMediaQuery } from '@/hooks/useMediaQuery';
import { useReviewCounts } from '@/hooks/useReviewCounts';
import { filterPlaces, type PlaceFilterContext } from '@/lib/filters';
import { filterTrips } from '@/lib/trips';
import type { Place, PlaceVisit, Region, TripBundle } from '@/lib/types';
import { useExploreStore } from '@/store/exploreStore';
import { MobileCarousel } from './MobileCarousel';
import { PlaceList } from './PlaceList';
import { RegionSummary } from './RegionSummary';
import { SearchBox } from './SearchBox';
import { ViewToggleFab } from './ViewToggleFab';

interface Props {
  places: Place[];
  regions: Region[];
  trips: TripBundle[];
  visits: Record<string, PlaceVisit[]>;
}

/** 모바일 지도 하단 캐러셀 + 토글 버튼이 차지하는 높이 (지도 fit/pan 여백) */
const MOBILE_BOTTOM_INSET = 220;

export function ExploreApp({ places, regions, trips, visits }: Props) {
  const regionIds = useMemo(() => regions.map((r) => r.id), [regions]);
  const { filters, setFilter, replaceFilters, resetFilters, hasFilter } = useFilters(regionIds);
  const [openTripId, setOpenTripId] = useState<string | null>(null);
  const [openPlaceId, setOpenPlaceId] = useState<string | null>(null);
  const [guideRegionId, setGuideRegionId] = useState<string | null>(null);
  const [pendingSelect, setPendingSelect] = useState<string | null>(null);
  const isDesktop = useMediaQuery(DESKTOP_QUERY);
  const reviewCounts = useReviewCounts();
  const [submitOpen, setSubmitOpen] = useState(false);

  const { hoveredId, selectedId, selectSource, mobileView, setHovered, select, setMobileView } =
    useExploreStore();

  const ctx = useMemo<PlaceFilterContext>(() => ({ visits, trips, regions }), [visits, trips, regions]);
  const visible = useMemo(() => filterPlaces(places, filters, ctx), [places, filters, ctx]);
  const visibleTrips = useMemo(() => filterTrips(trips, filters), [trips, filters]);

  // 위치가 미입력인 장소는 목록에만 표시
  const markers = useMemo<MapMarker[]>(
    () =>
      visible.flatMap((p) =>
        p.location
          ? [
              {
                id: p.id,
                position: { lat: p.location.lat, lng: p.location.lng },
                label: p.name,
                category: p.category,
              },
            ]
          : [],
      ),
    [visible],
  );
  const unmappedCount = visible.length - markers.length;

  // 필터로 사라진 장소는 선택 해제
  useEffect(() => {
    if (selectedId && !visible.some((p) => p.id === selectedId)) select(null, 'list');
  }, [visible, selectedId, select]);

  // PC: 지도 핀 클릭 → 해당 카드로 스크롤
  useEffect(() => {
    if (!isDesktop || selectSource !== 'map' || !selectedId) return;
    document
      .getElementById(`place-card-${selectedId}`)
      ?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, [isDesktop, selectedId, selectSource]);

  const fallback = useMemo(() => {
    const r = regions.find((x) => x.id === filters.regionId);
    if (r) return { center: r.center, zoom: r.zoom };
    const lat = regions.reduce((s, x) => s + x.center.lat, 0) / Math.max(regions.length, 1);
    const lng = regions.reduce((s, x) => s + x.center.lng, 0) / Math.max(regions.length, 1);
    return { center: { lat, lng }, zoom: 5 };
  }, [regions, filters.regionId]);

  const insets = useMemo(
    () => (isDesktop ? undefined : { bottom: MOBILE_BOTTOM_INSET }),
    [isDesktop],
  );

  /** 카드 클릭: 지도에서 선택 + 상세 모달 열기 */
  const onCardClick = useCallback(
    (id: string) => {
      select(id, 'list');
      setOpenPlaceId(id);
    },
    [select],
  );

  /** 다른 모달 위에서 여행 상세로 이동 */
  const openTrip = useCallback((tripId: string) => {
    setOpenPlaceId(null);
    setGuideRegionId(null);
    setOpenTripId(tripId);
  }, []);

  /** 일정·가이드에서 장소를 누르면: 모달을 닫고, 필터에 가려져 있으면 해당 지역으로 바꿔 지도에서 보여 줌 */
  const showPlaceFromTrip = useCallback(
    (placeId: string) => {
      const place = places.find((p) => p.id === placeId);
      if (!place) return;
      setOpenTripId(null);
      setOpenPlaceId(null);
      setGuideRegionId(null);
      if (!visible.some((p) => p.id === placeId)) replaceFilters({ regionId: place.regionId });
      setMobileView('map');
      setPendingSelect(placeId); // 필터 변경이 반영된 뒤 선택
    },
    [places, visible, replaceFilters, setMobileView],
  );

  useEffect(() => {
    if (pendingSelect && visible.some((p) => p.id === pendingSelect)) {
      select(pendingSelect, 'list');
      setPendingSelect(null);
    }
  }, [pendingSelect, visible, select]);
  const showList = isDesktop || mobileView === 'list';

  return (
    <div className="flex h-dvh flex-col">
      <Header
        regions={regions}
        filters={filters}
        onFilterChange={setFilter}
        onReset={() => {
          resetFilters();
          select(null, 'list');
        }}
        onSubmitPlace={() => setSubmitOpen(true)}
      />

      <main className="relative min-h-0 flex-1 lg:grid lg:grid-cols-[45%_55%]">
        {/* 리스트: PC 좌측 고정 / 모바일 '목록 보기' 시 지도 위를 덮음 */}
        <section
          aria-label="장소 목록"
          className={`absolute inset-0 z-[1050] overflow-y-auto bg-white lg:static lg:z-auto ${
            showList ? '' : 'hidden'
          } lg:block`}
        >
          <div className="space-y-4 px-4 pb-28 pt-4 lg:px-6 lg:pb-8">
            <SearchBox value={filters.query} onChange={(q) => setFilter('query', q)} />
            <RegionSummary
              regions={regions}
              allPlaces={places}
              selectedRegionId={filters.regionId}
              onSelectRegion={(id) => setFilter('regionId', id)}
              onOpenGuide={setGuideRegionId}
            />
            {visibleTrips.length > 0 && !filters.query && (
              <section aria-label="실제 여행 기록" className="space-y-2">
                <h2 className="px-1 text-sm font-semibold">
                  실제 가족여행 기록 <span className="text-brand">{visibleTrips.length}</span>건
                </h2>
                {visibleTrips.map((b) => (
                  <TripCard key={b.trip.id} bundle={b} regions={regions} onOpen={setOpenTripId} />
                ))}
              </section>
            )}
            <div className="flex items-start justify-between gap-3 px-1">
              <p className="text-sm font-semibold">
                아기랑 가기 좋은 장소 <span className="text-brand">{visible.length}</span>곳
                {unmappedCount > 0 && (
                  <span className="block text-xs font-normal text-muted sm:ml-1.5 sm:inline">
                    (지도 위치 미입력 {unmappedCount}곳)
                  </span>
                )}
              </p>
              {hasFilter && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="shrink-0 text-sm text-muted underline underline-offset-2 hover:text-ink"
                >
                  필터 초기화
                </button>
              )}
            </div>
            {visible.length ? (
              <PlaceList
                places={visible}
                reviewCounts={reviewCounts}
                visits={visits}
                hoveredId={hoveredId}
                selectedId={selectedId}
                onHover={setHovered}
                onCardClick={onCardClick}
              />
            ) : (
              <EmptyState onReset={resetFilters} />
            )}
          </div>
        </section>

        {/* 지도: PC 우측 / 모바일 전체 화면 */}
        <section aria-label="지도" className="absolute inset-0 lg:static lg:border-l lg:border-line">
          <MapView
            markers={markers}
            selectedId={selectedId}
            hoveredId={hoveredId}
            panOnSelect={selectSource !== 'map'}
            onMarkerClick={(id) => select(id, 'map')}
            onMarkerHover={setHovered}
            onMapClick={() => select(null, 'map')}
            fallbackCenter={fallback.center}
            fallbackZoom={fallback.zoom}
            insets={insets}
          />
          {!isDesktop && (
            <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[1000] lg:hidden">
              <div className="pointer-events-auto">
                <MobileCarousel
                  places={visible}
                  reviewCounts={reviewCounts}
                  visits={visits}
                  selectedId={selectedId}
                  selectSource={selectSource}
                  onSelect={(id) => select(id, 'carousel')}
                  onCardClick={onCardClick}
                />
              </div>
            </div>
          )}
          {!isDesktop && !visible.length && (
            <div className="absolute inset-x-4 bottom-24 z-[1000] rounded-2xl bg-white p-4 shadow-lg">
              <EmptyState onReset={resetFilters} />
            </div>
          )}
        </section>

        {/* 모바일 전용: 목록/지도 전환 */}
        {!isDesktop && (
          <ViewToggleFab
            view={mobileView}
            onToggle={() => setMobileView(mobileView === 'map' ? 'list' : 'map')}
            className={`fixed left-1/2 z-[1060] -translate-x-1/2 lg:hidden ${
              mobileView === 'map' && visible.length
                ? 'bottom-[calc(11rem+env(safe-area-inset-bottom))]'
                : 'bottom-[calc(1.5rem+env(safe-area-inset-bottom))]'
            }`}
          />
        )}
      </main>

      <PlaceDetailModal
        place={places.find((p) => p.id === openPlaceId) ?? null}
        places={places}
        regions={regions}
        trips={trips}
        visits={visits}
        onClose={() => setOpenPlaceId(null)}
        onOpenTrip={openTrip}
        onShowPlace={showPlaceFromTrip}
      />

      <RegionGuideModal
        region={regions.find((r) => r.id === guideRegionId) ?? null}
        places={places}
        trips={trips}
        onClose={() => setGuideRegionId(null)}
        onShowPlace={showPlaceFromTrip}
        onOpenTrip={openTrip}
      />

      <TripDetailModal
        bundle={trips.find((b) => b.trip.id === openTripId) ?? null}
        places={places}
        regions={regions}
        onClose={() => setOpenTripId(null)}
        onShowPlace={showPlaceFromTrip}
      />

      <SubmitPlaceModal
        open={submitOpen}
        onClose={() => setSubmitOpen(false)}
        regions={regions}
        defaultRegionId={filters.regionId === 'all' ? undefined : filters.regionId}
      />
    </div>
  );
}

function EmptyState({ onReset }: { onReset: () => void }) {
  return (
    <div className="py-10 text-center">
      <p className="text-3xl">🧸</p>
      <p className="mt-2 font-semibold">조건에 맞는 장소가 아직 없어요</p>
      <p className="mt-1 text-sm text-muted">필터를 바꾸거나 새로운 장소를 제보해 주세요.</p>
      <button
        type="button"
        onClick={onReset}
        className="mt-4 rounded-full border border-ink px-4 py-2 text-sm font-semibold"
      >
        필터 초기화
      </button>
    </div>
  );
}
