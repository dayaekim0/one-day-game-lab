import { AGE_RANGES, AMENITIES, CATEGORIES, PLACE_TYPE_LABEL } from '@/lib/constants';
import type { Place, PlaceVisit } from '@/lib/types';

export const categoryOf = (p: Place) => CATEGORIES.find((c) => c.value === p.category)!;

export const PLACEHOLDER_BY_CATEGORY: Record<Place['category'], string> = {
  restaurant: '/images/placeholders/restaurant.svg',
  activity: '/images/placeholders/activity.svg',
  stay: '/images/placeholders/stay.svg',
  transport: '/images/placeholders/exterior.svg',
};
/** 사진이 없으면: 샘플 데이터는 카테고리 그림, 실제 데이터는 '사진 미입력' */
export const thumbOf = (p: Place) =>
  p.thumbnail || (p.isSample ? PLACEHOLDER_BY_CATEGORY[p.category] : '/images/placeholders/no-photo.svg');

/** 설명이 미입력이면 장소 유형만 표시 */
export const descriptionOf = (p: Place) =>
  p.shortDescription || `${PLACE_TYPE_LABEL[p.placeType]} · 상세 정보 미입력`;

/** 실제 여행 방문 기록 배지: "✅ 28개월 방문" */
export function VisitBadge({ visits }: { visits?: PlaceVisit[] }) {
  if (!visits?.length) return null;
  const ages = [...new Set(visits.flatMap((v) => v.childAgesMonths))].sort((a, b) => a - b);
  return (
    <span className="rounded-md bg-emerald-50 px-1.5 py-0.5 text-[11px] font-semibold text-emerald-800">
      ✅ {ages.length ? `${ages.join('·')}개월 방문` : '실제 방문'}
    </span>
  );
}

export function SampleBadge({ className = '' }: { className?: string }) {
  return (
    <span
      title="화면 확인용 샘플 데이터예요"
      className={`rounded-full bg-gray-900/70 px-2 py-0.5 text-[11px] font-semibold text-white ${className}`}
    >
      샘플
    </span>
  );
}

export function AgeBadges({ place, max = 3 }: { place: Place; max?: number }) {
  if (!place.ageRanges.length) return null;
  return (
    <div className="flex flex-wrap gap-1">
      {AGE_RANGES.filter((a) => place.ageRanges.includes(a.value))
        .slice(0, max)
        .map((a) => (
          <span
            key={a.value}
            className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800"
          >
            {a.label}
          </span>
        ))}
    </div>
  );
}

/** 있는 편의시설만 이모지로 간단히 */
export function AmenityIcons({ place }: { place: Place }) {
  const items = AMENITIES.filter((a) => place.amenities[a.key] === true);
  if (!items.length) return null;
  return (
    <ul className="flex gap-1.5" aria-label="편의시설">
      {items.map((a) => (
        <li key={a.key} title={a.label} className="text-sm leading-none">
          <span aria-hidden>{a.emoji}</span>
          <span className="sr-only">{a.label}</span>
        </li>
      ))}
    </ul>
  );
}

export function ReviewCountBadge({ count }: { count: number }) {
  if (!count) return null;
  return (
    <span className="shrink-0 text-xs font-semibold text-ink">
      📸 방문 인증 {count}
    </span>
  );
}
