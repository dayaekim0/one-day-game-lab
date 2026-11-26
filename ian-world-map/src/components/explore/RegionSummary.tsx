'use client';

import type { Place, Region } from '@/lib/types';

interface Props {
  regions: Region[];
  allPlaces: Place[];
  selectedRegionId: string | 'all';
  onSelectRegion: (id: string) => void;
  onOpenGuide: (regionId: string) => void;
}

/** 리스트 상단 지역 요약 가이드 */
export function RegionSummary({ regions, allPlaces, selectedRegionId, onSelectRegion, onOpenGuide }: Props) {
  const region = regions.find((r) => r.id === selectedRegionId);

  if (!region) {
    return (
      <section className="rounded-2xl bg-gradient-to-br from-rose-50 to-amber-50 p-4">
        <h2 className="text-lg font-extrabold">아기랑 어디로 떠나볼까요? 👶✈️</h2>
        <p className="mt-1 text-sm text-muted">
          이안이네가 직접 다녀온 곳과 다른 부모님들의 방문 인증을 모았어요.
        </p>
        <div className="mt-3 grid grid-cols-2 gap-2 sm:grid-cols-3">
          {regions.map((r) => (
            <button
              key={r.id}
              type="button"
              onClick={() => onSelectRegion(r.id)}
              className="rounded-xl bg-white px-3 py-2.5 text-left shadow-sm transition-shadow hover:shadow-md focus-visible:outline-2 focus-visible:outline-ink"
            >
              <span className="block font-bold">{r.name}</span>
              <span className="text-xs text-muted">
                {r.country} · 장소 {allPlaces.filter((p) => p.regionId === r.id).length}곳
              </span>
            </button>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="rounded-2xl bg-gradient-to-br from-sky-50 to-emerald-50 p-4">
      <p className="flex items-center gap-1.5 text-xs font-semibold text-muted">
        {region.country}
        {region.guideIsSample && region.summary && (
          <span
            title="지역 가이드 내용은 화면 확인용 샘플이에요"
            className="rounded-full bg-gray-900/70 px-2 py-0.5 text-[10px] text-white"
          >
            샘플 가이드
          </span>
        )}
      </p>
      <h2 className="text-lg font-extrabold">{region.name} 아기랑 여행 가이드</h2>
      {region.summary ? (
        <p className="mt-1.5 text-sm leading-relaxed text-ink/80">{region.summary}</p>
      ) : (
        <p className="mt-1.5 text-sm text-muted">
          아직 정리된 지역 가이드가 없어요. 아래 실제 여행 기록과 방문 장소를 참고해 주세요.
        </p>
      )}
      {region.highlights && region.highlights.length > 0 && (
        <ul className="mt-3 flex flex-wrap gap-1.5">
          {region.highlights.map((h) => (
            <li key={h} className="rounded-full bg-white px-2.5 py-1 text-xs shadow-sm">
              ✔ {h}
            </li>
          ))}
        </ul>
      )}
      {region.itinerary.length > 0 && (
        <ol className="mt-3 space-y-1 text-sm">
          {region.itinerary.map((d) => (
            <li key={d.day} className="flex gap-2">
              <span className="shrink-0 rounded bg-ink px-1.5 text-xs font-bold leading-5 text-white">
                Day {d.day}
              </span>
              <span className="line-clamp-1">{d.title}</span>
            </li>
          ))}
        </ol>
      )}
      <button
        type="button"
        onClick={() => onOpenGuide(region.id)}
        className="mt-3 rounded-full bg-white px-3.5 py-2 text-sm font-semibold shadow-sm hover:shadow-md"
      >
        🗺️ 지역 가이드 보기 (일정 · 옷차림 · 육아템) →
      </button>
    </section>
  );
}
