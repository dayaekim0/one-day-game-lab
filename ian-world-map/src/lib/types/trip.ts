import type { CurrencyCode, EaseLevel, ISODateString, Photo } from './common';
import type { ExternalLink } from './place';

/**
 * 실제 영유아 동반 가족여행 데이터.
 * 한 여행 = data/trips/<tripId>/ 폴더 하나
 *   trip.json            여행 기본 정보 (Trip)
 *   itinerary.json       일자별 일정 (ItineraryDay[])
 *   expenses.json        결제 내역 + 예상 비용 (Expense[])
 *   child-reviews.json   아이 동반 후기 (ChildReview[])
 *   contents.json        관련 콘텐츠 (RelatedContent[])
 * 방문 장소는 data/places.json 에 공용으로 두고 placeId로 참조합니다.
 */

export interface TripChild {
  /** 여행 당시 개월 수 */
  ageMonths: number;
  label?: string | null;
}

export interface TripParty {
  adults: number;
  children: TripChild[];
}

/** 지역별 숙박 박수 */
export interface TripStay {
  regionId: string;
  nights: number;
  /** 확인된 경우에만 숙소 placeId */
  placeId: string | null;
}

export type TripStatus = 'planned' | 'completed';

export interface Trip {
  id: string;
  title: string;
  country: string;
  /** 방문 지역 (regions.json id). 여행지 필터에 사용 */
  regionIds: string[];
  startDate: string; // YYYY-MM-DD
  endDate: string;
  nights: number;
  days: number;
  party: TripParty;
  stays: TripStay[];
  currency: CurrencyCode;
  /** 실제 총 결제액. expenses(kind=actual) 합계와 일치해야 함 */
  totalPaid: number | null;
  status: TripStatus;
  summary?: string | null;
  coverImage?: string | null;
  /** 원본 기록 출처 */
  sourceUrl?: string | null;
  isSample: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export type ItineraryItemKind =
  | 'place'
  | 'lodging'
  | 'meal'
  | 'shopping'
  | 'transport'
  | 'flight'
  | 'other';

export interface ItineraryItem {
  order: number;
  kind: ItineraryItemKind;
  /** 방문 장소가 특정된 경우 places.json id. 특정되지 않으면 null (예: '수프카레') */
  placeId: string | null;
  title: string;
  /** "14:30" 형태. 미입력 null */
  time: string | null;
  /** 체류 시간(분). 미입력 null */
  stayMinutes: number | null;
  note: string | null;
}

export interface ItineraryDay {
  tripId: string;
  day: number;
  date: string | null;
  /** 그날 숙박 지역 */
  overnightRegionId: string | null;
  items: ItineraryItem[];
}

export type ExpenseCategory = 'lodging' | 'flight' | 'shopping' | 'food' | 'transport' | 'etc';

/**
 * 결제/비용 항목.
 * - kind 'actual'  : 실제 결제 금액
 * - kind 'estimate': 향후 예상 비용 (다음 여행 계획용). 실제 결제와 절대 합산하지 않음
 */
export interface Expense {
  id: string;
  tripId: string;
  kind: 'actual' | 'estimate';
  category: ExpenseCategory;
  label: string;
  amount: number;
  currency: CurrencyCode;
  /** category-total: 카테고리 합계로만 입력됨 / item: 개별 결제 건 */
  granularity: 'category-total' | 'item';
  date: string | null;
  placeId: string | null;
  note: string | null;
}

/** 아이 동반 후기 (여행자 본인 기록). 확인된 내용만 입력 */
export interface ChildReview {
  id: string;
  tripId: string;
  placeId: string | null;
  childAgeMonths: number;
  /** 아이 반응 */
  reaction: string | null;
  /** 추천도 1~5 */
  rating: 1 | 2 | 3 | 4 | 5 | null;
  stayMinutes: number | null;
  stroller: EaseLevel | null;
  meal: EaseLevel | null;
  text: string | null;
  photos: Photo[];
  createdAt: ISODateString;
}

export interface RelatedContent {
  id: string;
  tripId: string;
  placeId: string | null;
  type: ExternalLink['type'];
  title: string;
  url: string;
  publishedAt: string | null;
}

/** 한 여행의 전체 데이터 */
export interface TripBundle {
  trip: Trip;
  itinerary: ItineraryDay[];
  expenses: Expense[];
  childReviews: ChildReview[];
  contents: RelatedContent[];
}

export interface TripFilter {
  regionId?: string | 'all';
  /** 동반 아이 개월 수 구간 */
  ageRange?: import('./common').AgeRange | 'all';
  budget?: import('./place').BudgetBucket | 'all';
  realOnly?: boolean;
}
