'use client';

import { useState } from 'react';
import { Modal } from '@/components/ui/Modal';
import { EASE_LABEL, ITINERARY_KIND } from '@/lib/constants';
import { formatDateRange, partyLabel, summarizeTripCost } from '@/lib/trips';
import type { Place, Region, TripBundle } from '@/lib/types';
import { CostBreakdown } from './CostBreakdown';

interface Props {
  bundle: TripBundle | null;
  places: Place[];
  regions: Region[];
  onClose: () => void;
  /** 일정의 장소를 누르면 지도에서 보기 */
  onShowPlace: (placeId: string) => void;
}

const TABS = [
  { id: 'itinerary', label: '일정' },
  { id: 'cost', label: '비용' },
  { id: 'reviews', label: '아이 동반 후기' },
  { id: 'contents', label: '관련 콘텐츠' },
] as const;
type TabId = (typeof TABS)[number]['id'];

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토'];
const dayLabel = (date: string | null) => {
  if (!date) return '';
  const d = new Date(`${date}T00:00:00`);
  return `${d.getMonth() + 1}/${d.getDate()} (${WEEKDAY[d.getDay()]})`;
};

export function TripDetailModal({ bundle, places, regions, onClose, onShowPlace }: Props) {
  const [tab, setTab] = useState<TabId>('itinerary');
  if (!bundle) return null;
  const { trip, itinerary, childReviews, contents } = bundle;
  const cost = summarizeTripCost(bundle);
  const regionName = (id: string | null) =>
    (id && regions.find((r) => r.id === id)?.name.replace(/^일본 /, '')) || null;
  const placeName = (id: string | null) => places.find((p) => p.id === id)?.name ?? null;

  return (
    <Modal open onClose={onClose} title={trip.title} size="lg">
      <div className="border-b border-line px-5 pb-4 pt-4">
        <p className="text-xs font-semibold text-emerald-700">✅ 실제 여행 기록</p>
        <p className="mt-1 text-sm">
          📅 {formatDateRange(trip.startDate, trip.endDate)} ({trip.nights}박 {trip.days}일)
        </p>
        <p className="text-sm">👨‍👩‍👧 {partyLabel(bundle)}</p>
        {trip.stays.length > 0 && (
          <p className="text-sm">
            🛏️ {trip.stays.map((s) => `${regionName(s.regionId) ?? s.regionId} ${s.nights}박`).join(' · ')}
          </p>
        )}
      </div>

      <div role="tablist" className="no-scrollbar sticky top-0 z-10 flex gap-1 overflow-x-auto border-b border-line bg-white px-3">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            type="button"
            aria-selected={tab === t.id}
            onClick={() => setTab(t.id)}
            className={`shrink-0 border-b-2 px-3 py-3 text-sm font-semibold ${
              tab === t.id ? 'border-ink text-ink' : 'border-transparent text-muted hover:text-ink'
            }`}
          >
            {t.label}
            {t.id === 'reviews' && ` ${childReviews.length}`}
            {t.id === 'contents' && ` ${contents.length}`}
          </button>
        ))}
      </div>

      <div className="px-5 py-4" role="tabpanel">
        {tab === 'itinerary' && (
          <ol className="space-y-5">
            {itinerary.map((d) => (
              <li key={d.day}>
                <div className="flex items-baseline gap-2">
                  <span className="rounded bg-ink px-2 py-0.5 text-xs font-bold text-white">DAY {d.day}</span>
                  <span className="text-sm font-semibold">{dayLabel(d.date)}</span>
                  {regionName(d.overnightRegionId) && (
                    <span className="text-xs text-muted">· {regionName(d.overnightRegionId)} 숙박</span>
                  )}
                </div>
                <ul className="mt-2 space-y-1.5 border-l-2 border-line pl-4">
                  {d.items.map((it) => {
                    const linked = it.placeId && placeName(it.placeId);
                    return (
                      <li key={it.order} className="text-sm">
                        <span className="mr-1.5" aria-hidden>
                          {ITINERARY_KIND[it.kind]}
                        </span>
                        {linked ? (
                          <button
                            type="button"
                            onClick={() => onShowPlace(it.placeId!)}
                            className="font-semibold underline decoration-gray-300 underline-offset-2 hover:decoration-ink"
                          >
                            {it.title}
                          </button>
                        ) : (
                          <span className="font-semibold">{it.title}</span>
                        )}
                        {it.time && <span className="ml-1.5 text-xs text-muted">{it.time}</span>}
                        {it.stayMinutes != null && (
                          <span className="ml-1.5 text-xs text-muted">· {it.stayMinutes}분 머묾</span>
                        )}
                        {!it.placeId && it.kind !== 'transport' && (
                          <span className="ml-1.5 text-xs text-gray-400">(가게 미입력)</span>
                        )}
                        {it.note && <p className="mt-0.5 text-xs text-muted">{it.note}</p>}
                      </li>
                    );
                  })}
                </ul>
              </li>
            ))}
            <li className="text-xs text-gray-400">시간대 · 체류 시간은 아직 입력되지 않았어요.</li>
          </ol>
        )}

        {tab === 'cost' && <CostBreakdown cost={cost} />}

        {tab === 'reviews' &&
          (childReviews.length ? (
            <ul className="space-y-3">
              {childReviews.map((r) => (
                <li key={r.id} className="rounded-xl border border-line p-3 text-sm">
                  <p className="font-semibold">
                    {placeName(r.placeId) ?? '여행 전체'}{' '}
                    <span className="ml-1 rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] text-amber-800">
                      {r.childAgeMonths}개월
                    </span>
                  </p>
                  {r.rating != null && <p>추천도 {'★'.repeat(r.rating)}</p>}
                  {r.reaction && <p>아이 반응: {r.reaction}</p>}
                  {r.stroller && <p>유모차: {EASE_LABEL[r.stroller]}</p>}
                  {r.meal && <p>식사: {EASE_LABEL[r.meal]}</p>}
                  {r.text && <p className="mt-1 text-muted">{r.text}</p>}
                </li>
              ))}
            </ul>
          ) : (
            <Empty>아직 입력된 아이 동반 후기가 없어요.</Empty>
          ))}

        {tab === 'contents' &&
          (contents.length ? (
            <ul className="space-y-2">
              {contents.map((c) => (
                <li key={c.id}>
                  <a
                    href={c.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 rounded-xl border border-line p-3 text-sm hover:shadow-md"
                  >
                    <span className="text-xl" aria-hidden>
                      {c.type === 'youtube' ? '▶️' : c.type === 'instagram' ? '📷' : c.type === 'blog' ? '📝' : '🔗'}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate font-semibold">{c.title}</span>
                      <span className="block truncate text-xs text-muted">{c.url}</span>
                    </span>
                    <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : (
            <Empty>연결된 콘텐츠가 없어요.</Empty>
          ))}
      </div>
    </Modal>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-10 text-center text-sm text-muted">{children}</p>;
}
