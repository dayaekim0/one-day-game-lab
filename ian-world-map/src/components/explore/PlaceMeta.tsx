import { AGE_RANGES, AMENITIES, CATEGORIES } from '@/lib/constants';
import type { Place } from '@/lib/types';

export const categoryOf = (p: Place) => CATEGORIES.find((c) => c.value === p.category)!;

export function AgeBadges({ place, max = 3 }: { place: Place; max?: number }) {
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
  const items = AMENITIES.filter((a) => place.amenities[a.key]);
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
