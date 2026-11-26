import { AMENITIES, EASE_LABEL } from '@/lib/constants';
import type { EaseLevel, Place } from '@/lib/types';

/** 편의시설 배지: 있음 / 없음 / 미확인 3가지 상태 */
export function AmenityBadges({ place }: { place: Place }) {
  return (
    <ul className="grid grid-cols-2 gap-2 sm:grid-cols-3">
      {AMENITIES.map((a) => {
        const v = place.amenities[a.key];
        const state = v === true ? 'yes' : v === false ? 'no' : 'unknown';
        return (
          <li
            key={a.key}
            className={`flex items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
              state === 'yes'
                ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                : state === 'no'
                  ? 'border-line bg-gray-50 text-gray-400 line-through'
                  : 'border-dashed border-gray-300 text-gray-400'
            }`}
          >
            <span aria-hidden>{a.emoji}</span>
            <span className="flex-1">{a.label}</span>
            <span className="text-xs font-semibold no-underline">
              {state === 'yes' ? '있음' : state === 'no' ? '없음' : '미확인'}
            </span>
          </li>
        );
      })}
    </ul>
  );
}

const EASE_STYLE: Record<EaseLevel, string> = {
  good: 'bg-emerald-50 text-emerald-800',
  fair: 'bg-amber-50 text-amber-800',
  poor: 'bg-rose-50 text-rose-800',
};

export function FriendlinessRow({ place }: { place: Place }) {
  const items: { label: string; v: EaseLevel | null }[] = [
    { label: '👶 유모차 이동', v: place.childFriendliness.stroller },
    { label: '🥣 아이 식사', v: place.childFriendliness.meal },
  ];
  return (
    <div className="flex flex-wrap gap-2 text-sm">
      {items.map((i) => (
        <span key={i.label} className={`rounded-full px-3 py-1 ${i.v ? EASE_STYLE[i.v] : 'border border-dashed border-gray-300 text-gray-400'}`}>
          {i.label} · {i.v ? EASE_LABEL[i.v] : '미확인'}
        </span>
      ))}
      {place.childFriendliness.note && <p className="w-full text-xs text-muted">{place.childFriendliness.note}</p>}
    </div>
  );
}
