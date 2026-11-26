/**
 * 로컬 여행 데이터 목록.
 * 새 여행을 추가하면 data/trips/<tripId>/ 폴더를 만들고 아래에 한 블록을 추가하세요.
 */
import type { TripBundle } from '../../types';

import t1Trip from '@data/trips/sapporo-otaru-2026-10/trip.json';
import t1Itinerary from '@data/trips/sapporo-otaru-2026-10/itinerary.json';
import t1Expenses from '@data/trips/sapporo-otaru-2026-10/expenses.json';
import t1ChildReviews from '@data/trips/sapporo-otaru-2026-10/child-reviews.json';
import t1Contents from '@data/trips/sapporo-otaru-2026-10/contents.json';

export const TRIP_BUNDLES: TripBundle[] = [
  {
    trip: t1Trip,
    itinerary: t1Itinerary,
    expenses: t1Expenses,
    childReviews: t1ChildReviews,
    contents: t1Contents,
  } as TripBundle,
];
