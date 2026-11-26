import type {
  AffiliateLink,
  AgeRange,
  Category,
  GeoPoint,
  ISODateString,
  Photo,
  Season,
} from './common';

export interface Amenities {
  /** 유아용 의자 */
  highChair: boolean;
  /** 유모차 진입 가능 */
  strollerAccess: boolean;
  /** 기저귀 갈이대 */
  diaperStation: boolean;
  /** 수유실 */
  nursingRoom: boolean;
  /** 아기 메뉴 */
  babyMenu: boolean;
}

export type AmenityKey = keyof Amenities;

export interface ExternalLink {
  type: 'blog' | 'youtube' | 'instagram';
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

export interface Place {
  id: string;
  regionId: string;
  name: string;
  nameLocal?: string;
  category: Category;
  location: GeoPoint & { address: string };
  thumbnail: string;
  shortDescription: string;
  ageRanges: AgeRange[];
  seasons: Season[];
  amenities: Amenities;
  tags?: string[];
  editorReview: EditorReview;
  /** 숙소·액티비티용 제휴 링크. 있으면 상세 하단 CTA + 고지 문구 자동 노출 */
  affiliateLink?: AffiliateLink;
  priceLevel?: 1 | 2 | 3;
  createdAt: ISODateString;
  updatedAt: ISODateString;
}

export interface PlaceFilter {
  /** 'all' 또는 regionId */
  regionId?: string | 'all';
  ageRange?: AgeRange | 'all';
  category?: Category | 'all';
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
