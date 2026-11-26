'use client';

import { useState } from 'react';
import { api } from '@/lib/api';
import { AGE_RANGES } from '@/lib/constants';
import type { AppUser, UserReview } from '@/lib/types';

interface Props {
  reviews: UserReview[];
  user: AppUser | null;
  loading: boolean;
  onUpload: () => void;
}

const ageLabel = (r: UserReview) => AGE_RANGES.find((a) => a.value === r.ageRange)?.label;

/** 함께 다녀온 친구들: 방문 인증 사진 갤러리 + 개월 수 배지 + 한 줄 꿀팁 */
export function CommunityFeed({ reviews, user, loading, onUpload }: Props) {
  const [zoom, setZoom] = useState<string | null>(null);
  const gallery = reviews.flatMap((r) => r.photos.map((p) => ({ ...p, review: r })));

  return (
    <section>
      <div className="flex items-baseline justify-between gap-2">
        <h3 className="text-lg font-extrabold">
          👨‍👩‍👧 함께 다녀온 친구들 <span className="text-brand">{reviews.length}</span>
        </h3>
      </div>
      <button
        type="button"
        onClick={onUpload}
        className="mt-3 w-full rounded-xl border-2 border-dashed border-brand/50 bg-rose-50/50 py-3 text-sm font-bold text-brand hover:bg-rose-50"
      >
        + 우리 아이 방문 사진 올리기
      </button>

      {gallery.length > 0 && (
        <ul className="mt-4 grid grid-cols-3 gap-1.5" aria-label="방문 인증 사진">
          {gallery.slice(0, 9).map((g) => (
            <li key={g.id} className="relative">
              <button type="button" onClick={() => setZoom(g.url)} className="block w-full overflow-hidden rounded-lg">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={g.url} alt={`${g.review.nickname}님의 방문 사진`} className="aspect-square w-full object-cover" loading="lazy" />
              </button>
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 text-[10px] font-semibold text-white">
                {g.review.babyAgeMonths}개월
              </span>
            </li>
          ))}
        </ul>
      )}

      {loading ? (
        <p className="py-6 text-center text-sm text-muted">불러오는 중…</p>
      ) : reviews.length === 0 ? (
        <p className="py-6 text-center text-sm text-muted">첫 번째 방문 인증을 남겨 주세요! 🙌</p>
      ) : (
        <ul className="mt-4 divide-y divide-line">
          {reviews.map((r) => (
            <ReviewItem key={r.id} review={r} mine={!!user && r.authorId === user.id} />
          ))}
        </ul>
      )}

      {zoom && (
        <div className="fixed inset-0 z-[2200] flex items-center justify-center bg-black/85 p-4" onClick={() => setZoom(null)} role="dialog" aria-label="사진 크게 보기">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={zoom} alt="" className="max-h-full max-w-full rounded-lg" />
          <button type="button" className="absolute right-4 top-4 h-10 w-10 rounded-full bg-white/90 text-lg" aria-label="닫기">✕</button>
        </div>
      )}
    </section>
  );
}

function ReviewItem({ review: r, mine }: { review: UserReview; mine: boolean }) {
  const [busy, setBusy] = useState(false);
  return (
    <li className="py-3">
      <div className="flex items-center gap-2 text-sm">
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-100" aria-hidden>
          {r.nickname.slice(0, 1)}
        </span>
        <span className="font-semibold">{r.nickname}</span>
        <span className="rounded-md bg-amber-50 px-1.5 py-0.5 text-[11px] font-semibold text-amber-800">
          {r.babyAgeMonths}개월 · {ageLabel(r)}
        </span>
        {r.isSample && <span className="rounded-full bg-gray-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">샘플</span>}
        <span className="ml-auto text-xs text-muted">{r.visitedAt ?? r.createdAt.slice(0, 7)}</span>
      </div>
      <p className="mt-1.5 text-sm">💡 {r.tip}</p>
      {r.body && <p className="mt-1 whitespace-pre-line text-sm text-muted">{r.body}</p>}
      {mine && (
        <button
          type="button"
          disabled={busy}
          onClick={async () => {
            if (!confirm('이 후기를 삭제할까요?')) return;
            setBusy(true);
            try {
              await api.reviews.deleteReview(r.id);
            } catch (e) {
              alert((e as Error).message);
              setBusy(false);
            }
          }}
          className="mt-1 text-xs text-muted underline"
        >
          삭제
        </button>
      )}
    </li>
  );
}
