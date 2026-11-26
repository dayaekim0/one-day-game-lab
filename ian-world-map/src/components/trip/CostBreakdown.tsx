import { EXPENSE_CATEGORY } from '@/lib/constants';
import { formatKRW, formatManwon, type TripCostSummary } from '@/lib/trips';

/** 카테고리별 실제 결제 비율 막대 */
export function CostBar({ cost, height = 'h-2' }: { cost: TripCostSummary; height?: string }) {
  if (!cost.actualByCategory.length) return null;
  return (
    <div className={`flex w-full overflow-hidden rounded-full bg-gray-100 ${height}`} aria-hidden>
      {cost.actualByCategory.map((c) => (
        <span
          key={c.category}
          style={{ width: `${c.ratio * 100}%`, background: EXPENSE_CATEGORY[c.category].color }}
        />
      ))}
    </div>
  );
}

export function CostBreakdown({ cost }: { cost: TripCostSummary }) {
  return (
    <div className="space-y-5">
      {/* 실제 결제 */}
      <section>
        <div className="flex items-baseline justify-between">
          <h4 className="font-bold">
            실제 결제 금액
            <span className="ml-1.5 rounded bg-ink px-1.5 py-0.5 align-middle text-[10px] font-bold text-white">
              ACTUAL
            </span>
          </h4>
          <p className="text-lg font-extrabold">
            {cost.actualTotal != null ? formatKRW(cost.actualTotal) : '미입력'}
          </p>
        </div>
        {cost.totalMismatch && (
          <p className="mt-1 text-xs font-semibold text-brand">
            ⚠ 총 결제액과 항목별 합계가 달라요. 데이터를 확인해 주세요.
          </p>
        )}
        {cost.actualByCategory.length > 0 && (
          <>
            <div className="mt-3">
              <CostBar cost={cost} height="h-3" />
            </div>
            <ul className="mt-3 divide-y divide-line text-sm">
              {cost.actualByCategory.map((c) => {
                const meta = EXPENSE_CATEGORY[c.category];
                return (
                  <li key={c.category} className="flex items-center gap-2 py-2">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ background: meta.color }}
                      aria-hidden
                    />
                    <span className="flex-1">
                      {meta.emoji} {c.label}
                    </span>
                    <span className="w-12 text-right text-xs text-muted">
                      {(c.ratio * 100).toFixed(1)}%
                    </span>
                    <span className="w-28 text-right font-semibold tabular-nums">
                      {formatKRW(c.amount)}
                    </span>
                  </li>
                );
              })}
            </ul>
          </>
        )}
        {(cost.derived.perDay != null || cost.derived.lodgingPerNight != null) && (
          <div className="mt-2 rounded-xl bg-gray-50 p-3 text-xs text-muted">
            <p className="mb-1 font-semibold text-ink">실제 결제액에서 계산한 값</p>
            {cost.derived.perDay != null && <p>· 하루 평균 {formatManwon(cost.derived.perDay)}</p>}
            {cost.derived.lodgingPerNight != null && (
              <p>· 숙박 1박 평균 {formatManwon(cost.derived.lodgingPerNight)}</p>
            )}
          </div>
        )}
      </section>

      {/* 예상 비용 */}
      <section className="rounded-xl border border-dashed border-gray-300 p-3">
        <div className="flex items-baseline justify-between">
          <h4 className="font-bold">
            향후 예상 비용
            <span className="ml-1.5 rounded border border-gray-400 px-1.5 py-0.5 align-middle text-[10px] font-bold text-muted">
              ESTIMATE
            </span>
          </h4>
          <p className="font-bold">
            {cost.estimateTotal != null ? formatKRW(cost.estimateTotal) : '미입력'}
          </p>
        </div>
        {cost.estimateByCategory.length > 0 ? (
          <ul className="mt-2 space-y-1 text-sm">
            {cost.estimateByCategory.map((c) => (
              <li key={c.category} className="flex justify-between">
                <span>
                  {EXPENSE_CATEGORY[c.category].emoji} {c.label}
                </span>
                <span className="tabular-nums">{formatKRW(c.amount)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-1 text-xs text-muted">
            다음 여행을 위한 예상 비용은 아직 입력되지 않았어요. 실제 결제 금액과는 따로 관리돼요.
          </p>
        )}
      </section>
    </div>
  );
}
