import type { AgeRange } from './types';

/** 방문 당시 개월 수 → 구간. 6개월 미만도 가장 어린 구간(6-12)으로 묶음 */
export function toAgeRange(months: number): AgeRange {
  if (months <= 12) return '6-12';
  if (months <= 24) return '13-24';
  return '24+';
}
