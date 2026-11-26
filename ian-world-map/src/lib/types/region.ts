import type { AffiliateLink, GeoPoint, Season } from './common';

export interface RegionItineraryDay {
  day: number;
  title: string;
  /** places.json의 id 순서대로 동선 */
  placeIds: string[];
  note?: string;
}

export interface ClothingTip {
  /** "-8℃ ~ 0℃" */
  tempRange: string;
  /** 안쪽부터 바깥쪽 순서의 레이어링 */
  layers: string[];
  tip: string;
}

export type GearCategory = 'clothing' | 'stroller' | 'feeding' | 'sleep' | 'etc';

/** 실제 사용한 육아템 & 옷차림 */
export interface GearItem {
  id: string;
  name: string;
  image: string;
  category: GearCategory;
  review: string;
  affiliateLink?: AffiliateLink;
}

export interface Region {
  id: string;
  name: string;
  country: string;
  /** 헤더 드롭다운 정렬용 */
  order: number;
  center: GeoPoint;
  zoom: number;
  /** 지역 소개. 미입력 null */
  summary: string | null;
  highlights?: string[];
  itinerary: RegionItineraryDay[];
  clothingGuide: Partial<Record<Season, ClothingTip>>;
  gearRecommendations: GearItem[];
  /** 가이드(소개·일정·옷차림·육아템)가 샘플 데이터인지 */
  guideIsSample: boolean;
}
