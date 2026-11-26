import type { AgeRange, Place, PlaceFilter } from './types';

/** 방문 당시 개월 수 → 구간. 6개월 미만도 가장 어린 구간(6-12)으로 묶음 */
export function toAgeRange(months: number): AgeRange {
  if (months <= 12) return '6-12';
  if (months <= 24) return '13-24';
  return '24+';
}

export function matchesFilter(place: Place, filter: PlaceFilter = {}): boolean {
  const { regionId = 'all', ageRange = 'all', category = 'all' } = filter;
  if (regionId !== 'all' && place.regionId !== regionId) return false;
  if (category !== 'all' && place.category !== category) return false;
  if (ageRange !== 'all' && !place.ageRanges.includes(ageRange)) return false;
  return true;
}

export function filterPlaces(places: Place[], filter: PlaceFilter = {}): Place[] {
  return places.filter((p) => matchesFilter(p, filter));
}
