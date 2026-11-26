'use client';

import { useState } from 'react';
import { SampleBadge, VisitBadge, categoryOf, thumbOf } from '@/components/explore/PlaceMeta';
import { AdBannerSlot } from '@/components/monetization/AdBannerSlot';
import { AffiliateSection } from '@/components/monetization/AffiliateDisclosure';
import { AffiliateLink } from '@/components/monetization/AffiliateLink';
import { RegionGuide } from '@/components/region-guide/RegionGuide';
import { ReviewUploadModal } from '@/components/review-upload/ReviewUploadModal';
import { Modal } from '@/components/ui/Modal';
import { useReviews } from '@/hooks/useReviews';
import { AGE_RANGES, PLACE_TYPE_LABEL, SEASONS } from '@/lib/constants';
import type { Place, PlaceVisit, Region, TripBundle } from '@/lib/types';
import { AmenityBadges, FriendlinessRow } from './AmenityBadges';
import { CommunityFeed } from './CommunityFeed';
import { EditorReviewSection } from './EditorReviewSection';
import { PhotoSlider } from './PhotoSlider';
import { TripVisitsSection } from './TripVisitsSection';

interface Props {
  place: Place | null;
  places: Place[];
  regions: Region[];
  trips: TripBundle[];
  visits: Record<string, PlaceVisit[]>;
  onClose: () => void;
  onOpenTrip: (tripId: string) => void;
  onShowPlace: (placeId: string) => void;
}

type Tab = 'info' | 'guide';

export function PlaceDetailModal(props: Props) {
  if (!props.place) return null;
  // 장소가 바뀌면 탭·상태 초기화
  return <PlaceDetail key={props.place.id} {...props} place={props.place} />;
}

function PlaceDetail({ place, places, regions, trips, visits, onClose, onOpenTrip, onShowPlace }: Props & { place: Place }) {
  const [tab, setTab] = useState<Tab>('info');
  const [uploadOpen, setUploadOpen] = useState(false);
  const { reviews, user, loading } = useReviews(place.id);
  const region = regions.find((r) => r.id === place.regionId);
  const cat = categoryOf(place);
  const placeVisits = visits[place.id] ?? [];
  const regionTrips = trips.filter((b) => b.trip.regionIds.includes(place.regionId));
  const photos = place.editorReview?.photos.length
    ? place.editorReview.photos
    : place.thumbnail || place.isSample
      ? [{ id: 'thumb', url: thumbOf(place) }]
      : [];

  const footer = place.affiliateLink ? (
    <AffiliateSection links={[place.affiliateLink]}>
      <AffiliateLink link={place.affiliateLink} />
    </AffiliateSection>
  ) : undefined;

  return (
    <>
      <Modal open onClose={onClose} title={place.name} size="lg" footer={tab === 'info' ? footer : undefined}>
        <div role="tablist" className="sticky top-0 z-10 flex border-b border-line bg-white px-3">
          {(
            [
              ['info', '장소 정보'],
              ['guide', `${region?.name.replace(/^일본 /, '') ?? '지역'} 가이드`],
            ] as const
          ).map(([id, label]) => (
            <button
              key={id}
              type="button"
              role="tab"
              aria-selected={tab === id}
              onClick={() => setTab(id)}
              className={`border-b-2 px-3 py-3 text-sm font-semibold ${tab === id ? 'border-ink' : 'border-transparent text-muted hover:text-ink'}`}
            >
              {label}
            </button>
          ))}
        </div>

        {tab === 'info' ? (
          <div role="tabpanel">
            {photos.length ? (
              <PhotoSlider photos={photos} alt={place.name} />
            ) : (
              <div className="flex items-center gap-3 bg-gray-50 px-5 py-4 text-sm text-muted">
                <span className="text-2xl" aria-hidden>📷</span>
                <span className="flex-1">아직 등록된 사진이 없어요.</span>
                <button type="button" onClick={() => setUploadOpen(true)} className="shrink-0 rounded-full border border-ink px-3 py-1.5 text-xs font-semibold text-ink">
                  첫 방문 사진 올리기
                </button>
              </div>
            )}
            <div className="space-y-7 px-5 py-5">
              {/* 1. 기본 정보 */}
              <section>
                <p className="flex flex-wrap items-center gap-1.5 text-xs font-semibold text-muted">
                  <span>{cat.emoji} {cat.label}</span>·<span>{PLACE_TYPE_LABEL[place.placeType]}</span>
                  {region && <>·<span>{region.name}</span></>}
                  {place.isSample && <SampleBadge />}
                </p>
                <h2 className="mt-1 text-2xl font-extrabold">{place.name}</h2>
                {place.nameLocal && <p className="text-sm text-muted">{place.nameLocal}</p>}
                <p className="mt-1 text-xs text-muted">
                  📍{' '}
                  {place.location
                    ? `${place.location.address ?? '주소 미입력'}${place.location.precision === 'approximate' ? ' · 지도는 대략 위치' : ''}`
                    : '지도 위치 미입력'}
                </p>
                {place.shortDescription && <p className="mt-3 text-sm">{place.shortDescription}</p>}

                <dl className="mt-4 space-y-3 text-sm">
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 font-semibold">추천 개월 수</dt>
                    <dd className="flex flex-wrap gap-1">
                      {place.ageRanges.length ? (
                        AGE_RANGES.filter((a) => place.ageRanges.includes(a.value)).map((a) => (
                          <span key={a.value} className="rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-semibold text-amber-800">{a.label}</span>
                        ))
                      ) : (
                        <span className="text-gray-400">미입력</span>
                      )}
                      <VisitBadge visits={placeVisits} />
                    </dd>
                  </div>
                  <div className="flex gap-3">
                    <dt className="w-24 shrink-0 font-semibold">계절</dt>
                    <dd className="flex flex-wrap gap-1">
                      {place.seasons.length ? (
                        SEASONS.filter((s) => place.seasons.includes(s.value)).map((s) => (
                          <span key={s.value} className="rounded-full bg-gray-100 px-2 py-0.5 text-xs">{s.emoji} {s.label}</span>
                        ))
                      ) : (
                        <span className="text-gray-400">미입력</span>
                      )}
                    </dd>
                  </div>
                </dl>
                <h3 className="mb-2 mt-5 text-sm font-semibold">육아 편의시설</h3>
                <AmenityBadges place={place} />
                <div className="mt-3">
                  <FriendlinessRow place={place} />
                </div>
              </section>

              <TripVisitsSection placeId={place.id} visits={placeVisits} trips={trips} onOpenTrip={onOpenTrip} />

              {/* 2. 에디터 후기 */}
              <EditorReviewSection place={place} />

              {/* 3. 커뮤니티 */}
              <CommunityFeed reviews={reviews} user={user} loading={loading} onUpload={() => setUploadOpen(true)} />

              <AdBannerSlot slotId="detail-bottom" placement="detail-bottom" />
            </div>
          </div>
        ) : (
          <div role="tabpanel" className="px-5 py-5">
            {region ? (
              <RegionGuide region={region} places={places} trips={regionTrips} onShowPlace={onShowPlace} onOpenTrip={onOpenTrip} />
            ) : (
              <p className="text-sm text-muted">지역 정보가 없어요.</p>
            )}
          </div>
        )}
      </Modal>

      <ReviewUploadModal
        place={place}
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        onDone={() => setUploadOpen(false)}
      />
    </>
  );
}
