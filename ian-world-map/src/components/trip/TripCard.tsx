'use client';

import type { Region, TripBundle } from '@/lib/types';
import { formatDateRange, formatManwon, partyLabel, summarizeTripCost } from '@/lib/trips';
import { CostBar } from './CostBreakdown';

interface Props {
  bundle: TripBundle;
  regions: Region[];
  onOpen: (tripId: string) => void;
}

export function TripCard({ bundle, regions, onOpen }: Props) {
  const { trip } = bundle;
  const cost = summarizeTripCost(bundle);
  const stays = trip.stays
    .map((s) => `${regions.find((r) => r.id === s.regionId)?.name.replace(/^일본 /, '') ?? s.regionId} ${s.nights}박`)
    .join(' · ');
  return (
    <button
      type="button"
      onClick={() => onOpen(trip.id)}
      className="block w-full rounded-2xl border border-line bg-white p-4 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ink"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <p className="text-xs font-semibold text-emerald-700">
            ✅ 실제 여행 기록 · {trip.status === 'completed' ? '다녀왔어요' : '계획 중'}
          </p>
          <h3 className="mt-0.5 truncate text-base font-extrabold">{trip.title}</h3>
          <p className="mt-0.5 text-xs text-muted">
            {formatDateRange(trip.startDate, trip.endDate)} · {partyLabel(bundle)}
          </p>
          {stays && <p className="text-xs text-muted">🛏️ {stays}</p>}
        </div>
        <div className="shrink-0 text-right">
          <p className="text-[11px] text-muted">실제 결제</p>
          <p className="text-lg font-extrabold">
            {cost.actualTotal != null ? formatManwon(cost.actualTotal) : '미입력'}
          </p>
        </div>
      </div>
      <div className="mt-3">
        <CostBar cost={cost} />
      </div>
      <p className="mt-2 text-right text-xs font-semibold text-ink underline underline-offset-2">
        일정 · 비용 자세히 보기 →
      </p>
    </button>
  );
}
