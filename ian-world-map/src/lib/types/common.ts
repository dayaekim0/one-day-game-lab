/** 아기 개월 수 구간 */
export type AgeRange = '6-12' | '13-24' | '24+';

/** 장소 카테고리(상위 분류): 아기식당 / 놀이·활동 / 숙소·편의시설 / 교통·공항 */
export type Category = 'restaurant' | 'activity' | 'stay' | 'transport';

/**
 * 확인 여부를 구분하는 값.
 * true/false = 확인됨, null = 미입력(확인되지 않음). 임의로 채우지 않습니다.
 */
export type Tri = boolean | null;

/** 아이 동반 편의 수준. null = 미입력 */
export type EaseLevel = 'good' | 'fair' | 'poor';

/** 금액은 항상 정수 + 통화 코드로 저장 */
export type CurrencyCode = 'KRW' | 'JPY' | 'USD';

export type Season = 'spring' | 'summer' | 'autumn' | 'winter';

export interface GeoPoint {
  lat: number;
  lng: number;
}

export type PhotoKind = 'exterior' | 'food' | 'facility' | 'activity';

export interface Photo {
  id: string;
  /** 시드: /images/... · 로컬 업로드: blob/dataURL · 추후: Supabase Storage 공개 URL */
  url: string;
  caption?: string;
  kind?: PhotoKind;
  width?: number;
  height?: number;
}

export type AffiliateProvider =
  | 'agoda'
  | 'booking'
  | 'klook'
  | 'myrealtrip'
  | 'coupang'
  | 'other';

export interface AffiliateLink {
  url: string;
  provider: AffiliateProvider;
  /** 버튼 문구. 없으면 기본 문구("예약 및 최저가 확인하기") 사용 */
  label?: string;
}

/** ISO 8601 문자열 */
export type ISODateString = string;
