import type { AgeRange, ISODateString, Photo } from './common';

export type ReviewStatus = 'published' | 'hidden' | 'reported';

/** "함께 다녀온 친구들" - 사용자 방문 인증 후기 */
export interface UserReview {
  id: string;
  placeId: string;
  /** 로컬: 익명 기기 ID · 추후: Supabase auth.users.id */
  authorId: string | null;
  nickname: string;
  /** 방문 당시 아기 개월 수 (입력값) */
  babyAgeMonths: number;
  /** babyAgeMonths로 자동 계산 → 배지·필터용 */
  ageRange: AgeRange;
  /** 한 줄 꿀팁 (최대 100자) */
  tip: string;
  body?: string;
  /** 프라이버시 스티커가 합성된 최종 이미지만 저장 (원본 저장 안 함) */
  photos: Photo[];
  /** "2025-08" */
  visitedAt?: string;
  status: ReviewStatus;
  likeCount: number;
  createdAt: ISODateString;
  /** 화면 확인용 샘플 후기 여부 */
  isSample?: boolean;
}

export interface NewUserReviewInput {
  placeId: string;
  nickname: string;
  babyAgeMonths: number;
  tip: string;
  body?: string;
  visitedAt?: string;
  /** 스티커 합성·리사이즈가 끝난 이미지. 저장소 업로드 후 URL로 변환됨 */
  photoFiles: Blob[];
}

export const REVIEW_TIP_MAX_LENGTH = 100;
export const REVIEW_MAX_PHOTOS = 4;
