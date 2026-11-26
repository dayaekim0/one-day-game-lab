import { toAgeRange } from './age';
import type {
  BudgetBucket,
  Expense,
  ExpenseCategory,
  TripBundle,
  TripFilter,
} from './types';

export const BUDGET_BUCKETS: { value: BudgetBucket; label: string; min: number; max: number }[] = [
  { value: 'under-3m', label: '300만원 이하', min: 0, max: 3_000_000 },
  { value: '3m-6m', label: '300~600만원', min: 3_000_001, max: 6_000_000 },
  { value: 'over-6m', label: '600만원 초과', min: 6_000_001, max: Number.POSITIVE_INFINITY },
];

export function budgetBucketOf(amount: number): BudgetBucket {
  return BUDGET_BUCKETS.find((b) => amount >= b.min && amount <= b.max)!.value;
}

const sum = (xs: Expense[]) => xs.reduce((s, x) => s + x.amount, 0);

export interface TripCostSummary {
  /** 실제 결제 합계 (expenses kind=actual). 없으면 null */
  actualTotal: number | null;
  /** 향후 예상 비용 합계 (kind=estimate). 없으면 null */
  estimateTotal: number | null;
  actualByCategory: { category: ExpenseCategory; label: string; amount: number; ratio: number }[];
  estimateByCategory: { category: ExpenseCategory; label: string; amount: number }[];
  /** trip.totalPaid와 결제 내역 합계가 다르면 true */
  totalMismatch: boolean;
  /** 실제 결제액에서 계산한 값 (임의 추정 아님) */
  derived: {
    perDay: number | null;
    lodgingPerNight: number | null;
  };
  /** 예산 필터 기준 금액: 실제 결제액 → 없으면 예상 비용 */
  budgetBasis: { amount: number; kind: 'actual' | 'estimate' } | null;
}

export function summarizeTripCost({ trip, expenses }: TripBundle): TripCostSummary {
  const actual = expenses.filter((e) => e.kind === 'actual');
  const estimate = expenses.filter((e) => e.kind === 'estimate');
  const actualSum = actual.length ? sum(actual) : null;
  const actualTotal = trip.totalPaid ?? actualSum;
  const estimateTotal = estimate.length ? sum(estimate) : null;

  const byCat = (xs: Expense[]) => {
    const map = new Map<ExpenseCategory, { label: string; amount: number }>();
    for (const x of xs) {
      const cur = map.get(x.category);
      map.set(x.category, { label: cur?.label ?? x.label, amount: (cur?.amount ?? 0) + x.amount });
    }
    return [...map.entries()]
      .map(([category, v]) => ({ category, ...v }))
      .sort((a, b) => b.amount - a.amount);
  };
  const actualCats = byCat(actual);
  const lodging = actualCats.find((c) => c.category === 'lodging')?.amount ?? null;

  return {
    actualTotal,
    estimateTotal,
    actualByCategory: actualCats.map((c) => ({
      ...c,
      ratio: actualSum ? c.amount / actualSum : 0,
    })),
    estimateByCategory: byCat(estimate),
    totalMismatch: trip.totalPaid != null && actualSum != null && trip.totalPaid !== actualSum,
    derived: {
      perDay: actualTotal != null && trip.days ? Math.round(actualTotal / trip.days) : null,
      lodgingPerNight: lodging != null && trip.nights ? Math.round(lodging / trip.nights) : null,
    },
    budgetBasis:
      actualTotal != null
        ? { amount: actualTotal, kind: 'actual' }
        : estimateTotal != null
          ? { amount: estimateTotal, kind: 'estimate' }
          : null,
  };
}

export function tripBudgetBucket(bundle: TripBundle): BudgetBucket | null {
  const basis = summarizeTripCost(bundle).budgetBasis;
  return basis ? budgetBucketOf(basis.amount) : null;
}

export function matchesTripFilter(bundle: TripBundle, filter: TripFilter = {}): boolean {
  const { trip } = bundle;
  const { regionId = 'all', ageRange = 'all', budget = 'all', realOnly = false } = filter;
  if (realOnly && trip.isSample) return false;
  if (regionId !== 'all' && !trip.regionIds.includes(regionId)) return false;
  if (ageRange !== 'all' && !trip.party.children.some((c) => toAgeRange(c.ageMonths) === ageRange))
    return false;
  if (budget !== 'all' && tripBudgetBucket(bundle) !== budget) return false;
  return true;
}

export function filterTrips(bundles: TripBundle[], filter: TripFilter = {}): TripBundle[] {
  return bundles.filter((b) => matchesTripFilter(b, filter));
}

export function partyLabel(bundle: TripBundle): string {
  const { adults, children } = bundle.trip.party;
  const kids = children.map((c) => `${c.ageMonths}개월`).join(', ');
  return children.length ? `성인 ${adults} · 아이 ${children.length} (${kids})` : `성인 ${adults}`;
}

export const formatKRW = (n: number) => `${n.toLocaleString('ko-KR')}원`;

export function formatManwon(n: number) {
  const man = n / 10_000;
  return `${man >= 100 ? Math.round(man).toLocaleString('ko-KR') : man.toFixed(1)}만원`;
}

export function formatDateRange(start: string, end: string) {
  const [y, m, d] = start.split('-').map(Number);
  const [, m2, d2] = end.split('-').map(Number);
  return `${y}.${m}.${d} ~ ${m2 === m ? '' : `${m2}.`}${d2}`;
}
