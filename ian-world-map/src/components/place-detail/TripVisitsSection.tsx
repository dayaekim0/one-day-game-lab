import { EASE_LABEL } from '@/lib/constants';
import type { PlaceVisit, TripBundle } from '@/lib/types';

interface Props {
  placeId: string;
  visits: PlaceVisit[];
  trips: TripBundle[];
  onOpenTrip: (tripId: string) => void;
}

/** 실제 가족여행에서 이 장소를 방문한 기록 + 아이 동반 후기 + 관련 콘텐츠 */
export function TripVisitsSection({ placeId, visits, trips, onOpenTrip }: Props) {
  if (!visits.length) return null;
  return (
    <section>
      <h3 className="text-lg font-extrabold">✅ 실제 여행에서 다녀왔어요</h3>
      <ul className="mt-3 space-y-2">
        {visits.map((v) => {
          const b = trips.find((t) => t.trip.id === v.tripId);
          if (!b) return null;
          const day = b.itinerary.find((d) => d.date === v.date && d.items.some((i) => i.placeId === placeId));
          const reviews = b.childReviews.filter((r) => r.placeId === placeId);
          const contents = b.contents.filter((c) => c.placeId === placeId);
          return (
            <li key={`${v.tripId}-${v.date}`} className="rounded-xl border border-line p-3 text-sm">
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-semibold">{b.trip.title}</p>
                  <p className="text-xs text-muted">
                    {day ? `DAY ${day.day} · ` : ''}
                    {v.date ?? '날짜 미입력'} · 아이 {v.childAgesMonths.map((m) => `${m}개월`).join(', ')}
                  </p>
                </div>
                <button type="button" onClick={() => onOpenTrip(b.trip.id)} className="shrink-0 rounded-full border border-ink px-3 py-1 text-xs font-semibold">
                  여행 일정 보기
                </button>
              </div>
              {reviews.length > 0 ? (
                reviews.map((r) => (
                  <div key={r.id} className="mt-2 rounded-lg bg-gray-50 p-2.5 text-xs">
                    {r.rating != null && <p>추천도 {'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</p>}
                    {r.reaction && <p>아이 반응: {r.reaction}</p>}
                    {r.stayMinutes != null && <p>머문 시간: {r.stayMinutes}분</p>}
                    {r.stroller && <p>유모차: {EASE_LABEL[r.stroller]}</p>}
                    {r.meal && <p>식사: {EASE_LABEL[r.meal]}</p>}
                    {r.text && <p className="mt-1 text-muted">{r.text}</p>}
                  </div>
                ))
              ) : (
                <p className="mt-2 text-xs text-gray-400">아이 반응 · 추천도 · 머문 시간은 아직 입력되지 않았어요.</p>
              )}
              {contents.map((c) => (
                <a key={c.id} href={c.url} target="_blank" rel="noopener noreferrer" className="mt-2 block truncate text-xs font-semibold underline">
                  🔗 {c.title}
                </a>
              ))}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
