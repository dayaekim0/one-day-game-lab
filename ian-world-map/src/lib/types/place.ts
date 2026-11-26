import type {
  AffiliateLink,
  AgeRange,
  Category,
  EaseLevel,
  GeoPoint,
  ISODateString,
  Photo,
  Season,
  Tri,
} from './common';

/** 각 값: true(있음) / false(없음) / null(미입력) */
export interface Amenities {
  /** 유아용 의자 */
  highChair: Tri;
  /** 유모차 진입 가능 */
  strollerAccess: Tri;
  /** 기저귀 갈이대 */
  diaperStation: Tri;
  /** 수유실 */
  nursingRoom: Tri;
  /** 아기 메뉴 */
  babyMenu: Tri;
}

export type AmenityKey = keyof Amenities;

/** 아이 동반 편의성 평가. 확인된 경우에만 입력 */
export interface ChildFriendliness {
  /** 유모차 이동 편의성 */
  stroller: EaseLevel | null;
  /** 식사 편의성 (아이 메뉴·의자·식기 등 종합) */
  meal: EaseLevel | null;
  note?: string | null;
}

/** 세부 장소 유형 (검색·표시용). category보다 구체적 */
export type PlaceType =
  | 'airport'
  | 'ryokan'
  | 'hotel'
  | 'aquarium'
  | 'zoo'
  | 'park'
  | 'museum'
  | 'shop'
  | 'restaurant'
  | 'cafe'
  | 'campus'
  | 'beach'
  | 'theme-park'
  | 'mall'
  | 'other';

export interface ExternalLink {
  type: 'blog' | 'youtube' | 'instagram' | 'web';
  url: string;
  title: string;
}

/** 이안이 엄마의 에디터 리얼 후기 */
export interface EditorReview {
  author: string;
  /** "2025-02" 형태 */
  visitedAt: string;
  babyAgeMonthsAtVisit: number;
  summary: string;
  photos: Photo[];
  babyFoodPicks?: string[];
  activityPoints?: string[];
  strollerTips?: string;
  links?: ExternalLink[];
}

export interface PlaceLocation extends GeoPoint {
  address: string | null;
  /** exact: 확인된 좌표 / approximate: 대표 지점 기준 대략 좌표 */
  precision: 'exact' | 'approximate';
}

export interface Place {
  id: string;
  regionId: string;
  name: string;
  nameLocal?: string | null;
  category: Category;
  placeType: PlaceType;
  /** null이면 지도에 표시하지 않음 (위치 미입력) */
  location: PlaceLocation | null;
  thumbnail?: string | null;
  shortDescription?: string | null;
  /** 추천 개월 수. 빈 배열 = 미입력 */
  ageRanges: AgeRange[];
  /** 추천 계절. 빈 배열 = 미입력 */
  seasons: Season[];
  amenities: Amenities;
  childFriendliness: ChildFriendliness;
  tags?: string[];
  editorReview?: EditorReview | null;
  /** 숙소·액티비티용 제휴 링크. 있으면 상세 하단 CTA + 고지 문구 자동 노출 */
  affiliateLink?: AffiliateLink | null;
  priceLevel?: 1 | 2 | 3 | null;
  /** 화면 확인용 샘플 데이터 여부 */
  isSample: boolean;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

/** 실제 여행에서 이 장소를 방문한 기록 (trips 데이터에서 계산) */
export interface PlaceVisit {
  tripId: string;
  date: string | null;
  childAgesMonths: number[];
}

export type BudgetBucket = 'under-3m' | '3m-6m' | 'over-6m';

export interface PlaceFilter {
  /** 'all' 또는 regionId */
  regionId?: string | 'all';
  ageRange?: AgeRange | 'all';
  category?: Category | 'all';
  /** 유모차 이동이 편한 곳만 */
  strollerFriendly?: boolean;
  /** 아이 식사가 편한 곳만 */
  mealFriendly?: boolean;
  /** 실제 여행 데이터만 (샘플 제외) */
  realOnly?: boolean;
  /** 이 예산 구간의 여행에서 방문한 곳만 */
  budget?: BudgetBucket | 'all';
  /** 이름·현지명·태그·지역명 검색 */
  query?: string;
}

/** '+ 새로운 장소 제보하기'로 들어온 제보. 검수 전에는 지도에 노출되지 않음 */
export interface PlaceSubmission {
  id: string;
  submitterId: string | null;
  nickname: string;
  name: string;
  category: Category;
  regionId?: string;
  address: string;
  location?: GeoPoint;
  reason: string;
  link?: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: ISODateString;
}

export type NewPlaceSubmission = Omit<
  PlaceSubmission,
  'id' | 'status' | 'createdAt' | 'submitterId'
>;
