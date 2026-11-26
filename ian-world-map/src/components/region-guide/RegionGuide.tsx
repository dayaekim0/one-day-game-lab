'use client';

import { useState } from 'react';
import { AffiliateLink } from '@/components/monetization/AffiliateLink';
import { AffiliateSection } from '@/components/monetization/AffiliateDisclosure';
import { AdBannerSlot } from '@/components/monetization/AdBannerSlot';
import { SEASONS } from '@/lib/constants';
import { formatDateRange, partyLabel } from '@/lib/trips';
import type { Place, Region, Season, TripBundle } from '@/lib/types';

interface Props {
  region: Region;
  places: Place[];
  /** 이 지역을 방문한 실제 여행 */
  trips: TripBundle[];
  onShowPlace: (placeId: string) => void;
  onOpenTrip: (tripId: string) => void;
}

const currentSeason = (): Season => {
  const m = new Date().getMonth() + 1;
  return m >= 3 && m <= 5 ? 'spring' : m >= 6 && m <= 8 ? 'summer' : m >= 9 && m <= 11 ? 'autumn' : 'winter';
};

const SampleNote = () => (
  <span className="ml-1.5 rounded-full bg-gray-900/70 px-2 py-0.5 align-middle text-[10px] font-semibold text-white">
    샘플
  </span>
);

/** 지역별 통합 가이드: 추천 일정 / 계절별 옷차림 / 실제 사용한 육아템 */
export function RegionGuide({ region, places, trips, onShowPlace, onOpenTrip }: Props) {
  const seasons = SEASONS.filter((s) => region.clothingGuide[s.value]);
  const [season, setSeason] = useState<Season>(
    seasons.some((s) => s.value === currentSeason()) ? currentSeason() : (seasons[0]?.value ?? 'winter'),
  );
  const placeName = (id: string) => places.find((p) => p.id === id)?.name ?? id;
  const tip = region.clothingGuide[season];
  const sample = region.guideIsSample;

  return (
    <div className="space-y-7">
      {region.summary && <p className="text-sm leading-relaxed text-ink/80">{region.summary}</p>}

      {/* 실제 여행 */}
      {trips.length > 0 && (
        <section>
          <h3 className="font-bold">✅ 이 지역 실제 여행 기록</h3>
          <ul className="mt-2 space-y-2">
            {trips.map((b) => (
              <li key={b.trip.id}>
                <button
                  type="button"
                  onClick={() => onOpenTrip(b.trip.id)}
                  className="w-full rounded-xl border border-line p-3 text-left text-sm hover:shadow-md"
                >
                  <span className="font-semibold">{b.trip.title}</span>
                  <span className="block text-xs text-muted">
                    {formatDateRange(b.trip.startDate, b.trip.endDate)} · {partyLabel(b)} · 일정 보기 →
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      )}

      {/* 추천 일정 */}
      <section>
        <h3 className="font-bold">
          🗓️ 추천 일정 {region.itinerary.length > 0 && `(Day 1~${region.itinerary.length})`}
          {sample && region.itinerary.length > 0 && <SampleNote />}
        </h3>
        {region.itinerary.length ? (
          <ol className="mt-3 space-y-3">
            {region.itinerary.map((d) => (
              <li key={d.day} className="rounded-xl bg-gray-50 p-3">
                <p className="text-sm font-bold">
                  <span className="mr-1.5 rounded bg-ink px-1.5 py-0.5 text-xs text-white">Day {d.day}</span>
                  {d.title}
                </p>
                <p className="mt-1.5 flex flex-wrap items-center gap-1 text-sm">
                  {d.placeIds.map((id, i) => (
                    <span key={id} className="inline-flex items-center gap-1">
                      {i > 0 && <span className="text-muted">→</span>}
                      <button type="button" onClick={() => onShowPlace(id)} className="underline decoration-gray-300 underline-offset-2 hover:decoration-ink">
                        {placeName(id)}
                      </button>
                    </span>
                  ))}
                </p>
                {d.note && <p className="mt-1 text-xs text-muted">{d.note}</p>}
              </li>
            ))}
          </ol>
        ) : (
          <p className="mt-2 text-sm text-muted">아직 정리된 추천 일정이 없어요.{trips.length > 0 && ' 위 실제 여행 일정을 참고해 주세요.'}</p>
        )}
      </section>

      {/* 옷차림 */}
      <section>
        <h3 className="font-bold">
          🧥 계절별 아기 옷 입히기 {sample && seasons.length > 0 && <SampleNote />}
        </h3>
        {seasons.length ? (
          <>
            <div className="mt-3 flex gap-1.5" role="tablist">
              {seasons.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  role="tab"
                  aria-selected={season === s.value}
                  onClick={() => setSeason(s.value)}
                  className={`rounded-full px-3 py-1.5 text-sm ${season === s.value ? 'bg-ink font-semibold text-white' : 'bg-gray-100'}`}
                >
                  {s.emoji} {s.label}
                </button>
              ))}
            </div>
            {tip && (
              <div className="mt-3 rounded-xl bg-sky-50 p-3 text-sm">
                <p className="font-semibold">🌡️ {tip.tempRange}</p>
                <ol className="mt-2 space-y-1">
                  {tip.layers.map((l, i) => (
                    <li key={l} className="flex gap-2">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white text-[11px] font-bold">
                        {i + 1}
                      </span>
                      {l}
                    </li>
                  ))}
                </ol>
                <p className="mt-2 text-xs text-muted">💡 {tip.tip}</p>
              </div>
            )}
          </>
        ) : (
          <p className="mt-2 text-sm text-muted">아직 정리된 옷차림 가이드가 없어요.</p>
        )}
      </section>

      {/* 육아템 */}
      <section>
        <h3 className="font-bold">
          🧸 실제 사용한 육아템 & 옷차림 {sample && region.gearRecommendations.length > 0 && <SampleNote />}
        </h3>
        {region.gearRecommendations.length ? (
          <AffiliateSection links={region.gearRecommendations.map((g) => g.affiliateLink)} className="mt-3">
            <ul className="grid grid-cols-2 gap-3">
              {region.gearRecommendations.map((g) => (
                <li key={g.id} className="overflow-hidden rounded-xl border border-line">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={g.image} alt="" loading="lazy" className="aspect-square w-full object-cover" />
                  <div className="space-y-1 p-2.5">
                    <p className="line-clamp-1 text-sm font-bold">{g.name}</p>
                    <p className="line-clamp-3 text-xs text-muted">{g.review}</p>
                    {g.affiliateLink && (
                      <AffiliateLink link={g.affiliateLink} variant="inline">
                        구매 링크 ↗
                      </AffiliateLink>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </AffiliateSection>
        ) : (
          <p className="mt-2 text-sm text-muted">아직 등록된 육아템이 없어요.</p>
        )}
      </section>

      <AdBannerSlot slotId="guide-bottom" placement="guide-bottom" />
    </div>
  );
}
