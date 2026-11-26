import type { AffiliateProvider, AgeRange, Category, Season } from './types';
import type { AmenityKey } from './types';

export const AGE_RANGES: { value: AgeRange; label: string }[] = [
  { value: '6-12', label: '6~12개월' },
  { value: '13-24', label: '13~24개월' },
  { value: '24+', label: '24개월 이상' },
];

export const CATEGORIES: { value: Category; label: string; emoji: string }[] = [
  { value: 'restaurant', label: '아기식당', emoji: '🍚' },
  { value: 'activity', label: '놀이/활동', emoji: '🎠' },
  { value: 'stay', label: '숙소/편의시설', emoji: '🏨' },
];

export const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: 'spring', label: '봄', emoji: '🌸' },
  { value: 'summer', label: '여름', emoji: '☀️' },
  { value: 'autumn', label: '가을', emoji: '🍁' },
  { value: 'winter', label: '겨울', emoji: '❄️' },
];

export const AMENITIES: { key: AmenityKey; label: string; emoji: string }[] = [
  { key: 'highChair', label: '유아용 의자', emoji: '🪑' },
  { key: 'strollerAccess', label: '유모차 진입', emoji: '👶' },
  { key: 'diaperStation', label: '기저귀 갈이대', emoji: '🧷' },
  { key: 'nursingRoom', label: '수유실', emoji: '🍼' },
  { key: 'babyMenu', label: '아기 메뉴', emoji: '🥣' },
];

export const AFFILIATE_PROVIDER_LABEL: Record<AffiliateProvider, string> = {
  agoda: '아고다',
  booking: '부킹닷컴',
  klook: '클룩',
  myrealtrip: '마이리얼트립',
  coupang: '쿠팡',
  other: '제휴처',
};

export const DEFAULT_AFFILIATE_CTA = '예약 및 최저가 확인하기';

export const AFFILIATE_DISCLOSURE =
  '이 영역의 링크를 통해 구매·예약하시면 이안이와 세계지도에 일정액의 제휴 수수료가 지급될 수 있어요. 가격은 동일하며, 후기는 직접 경험을 바탕으로 작성했어요.';

export const COUPANG_PARTNERS_DISCLOSURE =
  '이 포스팅은 쿠팡 파트너스 활동의 일환으로, 이에 따른 일정액의 수수료를 제공받습니다.';

/** 리스트에서 카드 N개마다 광고 슬롯 1개 */
export const AD_SLOT_EVERY_N_CARDS = 4;
