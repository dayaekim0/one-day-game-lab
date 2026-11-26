import type {
  AppUser,
  AuthProvider,
  NewPlaceSubmission,
  NewUserReviewInput,
  Place,
  PlaceFilter,
  PlaceSubmission,
  Region,
  UserReview,
} from '../types';

/**
 * UI는 이 인터페이스만 사용합니다.
 * 로컬(JSON + localStorage/IndexedDB) 구현과 Supabase 구현이 같은 계약을 따릅니다.
 */
export interface PlaceRepository {
  listPlaces(filter?: PlaceFilter): Promise<Place[]>;
  getPlace(id: string): Promise<Place | null>;
  listRegions(): Promise<Region[]>;
  getRegion(id: string): Promise<Region | null>;
  submitPlace(input: NewPlaceSubmission): Promise<PlaceSubmission>;
}

export interface ReviewRepository {
  /** 공개된 후기, 최신순 */
  listReviews(placeId: string): Promise<UserReview[]>;
  /** 장소별 후기 개수 (카드 배지용) */
  countReviewsByPlace(): Promise<Record<string, number>>;
  createReview(input: NewUserReviewInput): Promise<UserReview>;
  /** 본인 후기만 삭제 가능 */
  deleteReview(id: string): Promise<void>;
  /** 후기 변경 구독 (로컬: 탭 내 이벤트 + storage 이벤트 · Supabase: realtime) */
  subscribe(listener: () => void): () => void;
}

export interface AuthService {
  getCurrentUser(): Promise<AppUser | null>;
  signIn(provider: Exclude<AuthProvider, 'anonymous'>): Promise<void>;
  signOut(): Promise<void>;
}

export interface DataSource {
  places: PlaceRepository;
  reviews: ReviewRepository;
  auth: AuthService;
}

export class NotSignedInError extends Error {
  constructor() {
    super('로그인이 필요해요.');
    this.name = 'NotSignedInError';
  }
}

export class StorageQuotaError extends Error {
  constructor() {
    super('기기 저장 공간이 가득 찼어요. 사진 수를 줄이거나 오래된 후기를 지워 주세요.');
    this.name = 'StorageQuotaError';
  }
}
