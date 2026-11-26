import { toAgeRange } from './age';
import { CATEGORIES, PLACE_TYPE_LABEL } from './constants';
import type { AgeRange, Place, PlaceFilter, PlaceVisit, Region, TripBundle } from './types';
import { tripBudgetBucket } from './trips';

export { toAgeRange };

/** 필터 계산에 필요한 부가 데이터 (실제 방문 기록 등) */
export interface PlaceFilterContext {
  visits?: Record<string, PlaceVisit[]>;
  trips?: TripBundle[];
  regions?: Region[];
}

/** 실제 여행에서 방문했던 아이 개월 수 구간 */
export function visitedAgeRanges(placeId: string, ctx: PlaceFilterContext): AgeRange[] {
  const set = new Set<AgeRange>();
  for (const v of ctx.visits?.[placeId] ?? []) v.childAgesMonths.forEach((m) => set.add(toAgeRange(m)));
  return [...set];
}

/** 유모차 이동이 편한 곳: 확인된 평가가 good, 또는 평가가 없고 유모차 진입이 확인된 곳 */
export function isStrollerFriendly(p: Place): boolean {
  const v = p.childFriendliness.stroller;
  if (v) return v === 'good';
  return p.amenities.strollerAccess === true;
}

/** 아이 식사가 편한 곳: 확인된 평가가 good, 또는 평가가 없고 아기메뉴/유아의자가 확인된 곳 */
export function isMealFriendly(p: Place): boolean {
  const v = p.childFriendliness.meal;
  if (v) return v === 'good';
  return p.amenities.babyMenu === true || p.amenities.highChair === true;
}

const normalize = (s: string) => s.toLowerCase().replace(/\s+/g, '');

export function matchesQuery(p: Place, query: string, ctx: PlaceFilterContext = {}): boolean {
  const q = normalize(query);
  if (!q) return true;
  const region = ctx.regions?.find((r) => r.id === p.regionId);
  const hay = [
    p.name,
    p.nameLocal ?? '',
    ...(p.tags ?? []),
    region?.name ?? '',
    PLACE_TYPE_LABEL[p.placeType],
    CATEGORIES.find((c) => c.value === p.category)?.label ?? '',
  ]
    .map(normalize)
    .join('|');
  return hay.includes(q);
}

export function matchesFilter(place: Place, filter: PlaceFilter = {}, ctx: PlaceFilterContext = {}): boolean {
  const {
    regionId = 'all',
    ageRange = 'all',
    category = 'all',
    strollerFriendly,
    mealFriendly,
    realOnly,
    budget = 'all',
    query = '',
  } = filter;
  if (realOnly && place.isSample) return false;
  if (regionId !== 'all' && place.regionId !== regionId) return false;
  if (category !== 'all' && place.category !== category) return false;
  if (
    ageRange !== 'all' &&
    !place.ageRanges.includes(ageRange) &&
    !visitedAgeRanges(place.id, ctx).includes(ageRange)
  )
    return false;
  if (strollerFriendly && !isStrollerFriendly(place)) return false;
  if (mealFriendly && !isMealFriendly(place)) return false;
  if (budget !== 'all') {
    const tripIds = new Set((ctx.visits?.[place.id] ?? []).map((v) => v.tripId));
    const ok = (ctx.trips ?? []).some(
      (b) => tripIds.has(b.trip.id) && tripBudgetBucket(b) === budget,
    );
    if (!ok) return false;
  }
  if (query && !matchesQuery(place, query, ctx)) return false;
  return true;
}

export function filterPlaces(places: Place[], filter: PlaceFilter = {}, ctx: PlaceFilterContext = {}): Place[] {
  return places.filter((p) => matchesFilter(p, filter, ctx));
}
