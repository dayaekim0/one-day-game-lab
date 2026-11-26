import type { Place } from '@/lib/types';
import { PhotoSlider } from './PhotoSlider';

const LINK_ICON = { blog: '📝', youtube: '▶️', instagram: '📷', web: '🔗' } as const;

/** 이안이 엄마의 에디터 리얼 후기 */
export function EditorReviewSection({ place }: { place: Place }) {
  const r = place.editorReview;
  return (
    <section>
      <h3 className="flex items-center gap-1.5 text-lg font-extrabold">
        ✍️ 이안이 엄마의 리얼 후기
        {r && place.isSample && (
          <span className="rounded-full bg-gray-900/70 px-2 py-0.5 text-[10px] font-semibold text-white">샘플</span>
        )}
      </h3>
      {!r ? (
        <p className="mt-2 rounded-xl bg-gray-50 p-4 text-sm text-muted">
          아직 에디터 후기가 없어요. 방문 기록과 다른 부모님들의 인증을 참고해 주세요.
        </p>
      ) : (
        <div className="mt-3 space-y-4">
          <p className="text-xs text-muted">
            {r.author} · {r.visitedAt} 방문 · 당시 {r.babyAgeMonthsAtVisit}개월
          </p>
          {r.photos.length > 1 && (
            <div className="overflow-hidden rounded-xl">
              <PhotoSlider photos={r.photos} alt={place.name} />
            </div>
          )}
          <p className="text-sm leading-relaxed">{r.summary}</p>
          <dl className="space-y-3 text-sm">
            {r.babyFoodPicks?.length ? (
              <div>
                <dt className="font-semibold">🥄 아기가 잘 먹은 음식</dt>
                <dd className="mt-1 flex flex-wrap gap-1.5">
                  {r.babyFoodPicks.map((f) => (
                    <span key={f} className="rounded-full bg-orange-50 px-2.5 py-1 text-xs text-orange-900">{f}</span>
                  ))}
                </dd>
              </div>
            ) : null}
            {r.activityPoints?.length ? (
              <div>
                <dt className="font-semibold">🎈 활동 포인트</dt>
                <dd>
                  <ul className="mt-1 list-inside list-disc space-y-0.5 text-ink/80">
                    {r.activityPoints.map((a) => <li key={a}>{a}</li>)}
                  </ul>
                </dd>
              </div>
            ) : null}
            {r.strollerTips && (
              <div className="rounded-xl bg-sky-50 p-3">
                <dt className="font-semibold">🚼 유모차 · 이동 동선 팁</dt>
                <dd className="mt-1 text-ink/80">{r.strollerTips}</dd>
              </div>
            )}
          </dl>
          {r.links?.length ? (
            <ul className="space-y-1.5">
              {r.links.map((l) => (
                <li key={l.url}>
                  <a href={l.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 rounded-xl border border-line px-3 py-2 text-sm hover:shadow-sm">
                    <span aria-hidden>{LINK_ICON[l.type]}</span>
                    <span className="flex-1 truncate">{l.title}</span>
                    <span aria-hidden>↗</span>
                  </a>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      )}
    </section>
  );
}
