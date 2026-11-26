import seedReviewsJson from '@data/seed-reviews.json';
import { toAgeRange } from '../../filters';
import type { Photo, UserReview } from '../../types';
import { REVIEW_MAX_PHOTOS, REVIEW_TIP_MAX_LENGTH } from '../../types';
import type { ReviewRepository } from '../contracts';
import { localAuth } from './auth';
import {
  deletePhotoBlob,
  isBrowser,
  newId,
  readJSON,
  resolvePhotoUrl,
  savePhotoBlob,
  storageKey,
  writeJSON,
} from './storage';

const seedReviews = seedReviewsJson as UserReview[];
const REVIEWS_KEY = 'reviews:v1';
const CHANGE_EVENT = 'iwm:reviews-changed';

function readUserReviews(): UserReview[] {
  return readJSON<UserReview[]>(REVIEWS_KEY, []);
}

function allReviews(): UserReview[] {
  return [...readUserReviews(), ...seedReviews]
    .filter((r) => r.status === 'published')
    .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

async function withResolvedPhotos(review: UserReview): Promise<UserReview> {
  const photos = await Promise.all(
    review.photos.map(async (p) => ({ ...p, url: await resolvePhotoUrl(p.url) })),
  );
  return { ...review, photos: photos.filter((p) => p.url) };
}

function notify() {
  if (isBrowser()) window.dispatchEvent(new Event(CHANGE_EVENT));
}

export const localReviewRepository: ReviewRepository = {
  async listReviews(placeId) {
    const list = allReviews().filter((r) => r.placeId === placeId);
    return Promise.all(list.map(withResolvedPhotos));
  },

  async countReviewsByPlace() {
    const counts: Record<string, number> = {};
    for (const r of allReviews()) counts[r.placeId] = (counts[r.placeId] ?? 0) + 1;
    return counts;
  },

  async createReview(input) {
    const nickname = input.nickname.trim();
    const tip = input.tip.trim();
    if (!nickname) throw new Error('닉네임을 입력해 주세요.');
    if (!tip) throw new Error('한 줄 꿀팁을 입력해 주세요.');
    if (tip.length > REVIEW_TIP_MAX_LENGTH) {
      throw new Error(`한 줄 꿀팁은 ${REVIEW_TIP_MAX_LENGTH}자 이내로 적어 주세요.`);
    }
    if (input.photoFiles.length > REVIEW_MAX_PHOTOS) {
      throw new Error(`사진은 최대 ${REVIEW_MAX_PHOTOS}장까지 올릴 수 있어요.`);
    }
    if (!Number.isFinite(input.babyAgeMonths) || input.babyAgeMonths < 0 || input.babyAgeMonths > 72) {
      throw new Error('아기 개월 수를 확인해 주세요.');
    }

    const user = await localAuth.ensureAnonymousUser(nickname);
    const photos: Photo[] = [];
    try {
      for (const file of input.photoFiles) {
        const id = newId();
        photos.push({ id, url: await savePhotoBlob(id, file) });
      }
      const review: UserReview = {
        id: newId(),
        placeId: input.placeId,
        authorId: user.id,
        nickname,
        babyAgeMonths: Math.round(input.babyAgeMonths),
        ageRange: toAgeRange(input.babyAgeMonths),
        tip,
        body: input.body?.trim() || undefined,
        visitedAt: input.visitedAt,
        photos,
        status: 'published',
        likeCount: 0,
        createdAt: new Date().toISOString(),
      };
      writeJSON(REVIEWS_KEY, [review, ...readUserReviews()]);
      notify();
      return withResolvedPhotos(review);
    } catch (e) {
      // 일부만 저장된 사진은 정리
      await Promise.all(photos.map((p) => deletePhotoBlob(p.url).catch(() => {})));
      throw e;
    }
  },

  async deleteReview(id) {
    const user = await localAuth.getCurrentUser();
    const mine = readUserReviews();
    const target = mine.find((r) => r.id === id);
    if (!target) throw new Error('삭제할 수 있는 후기가 아니에요.');
    if (!user || target.authorId !== user.id) throw new Error('내가 쓴 후기만 삭제할 수 있어요.');
    writeJSON(REVIEWS_KEY, mine.filter((r) => r.id !== id));
    await Promise.all(target.photos.map((p) => deletePhotoBlob(p.url)));
    notify();
  },

  subscribe(listener) {
    if (!isBrowser()) return () => {};
    const onStorage = (e: StorageEvent) => {
      if (e.key === storageKey(REVIEWS_KEY)) listener();
    };
    window.addEventListener(CHANGE_EVENT, listener);
    window.addEventListener('storage', onStorage); // 다른 탭에서 변경
    return () => {
      window.removeEventListener(CHANGE_EVENT, listener);
      window.removeEventListener('storage', onStorage);
    };
  },
};
