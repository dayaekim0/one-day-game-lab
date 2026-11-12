"use client";

import { BarChart3, ChevronLeft, ChevronRight, PieChart, Wallet } from "lucide-react";
import { useState } from "react";
import {
  CATEGORY_META,
  EMPTY_REVENUE,
  OWNER,
  REVENUE_KEYS,
  TARGET,
  TARGET_TOTAL,
} from "@/lib/constants";
import { formatMonth, monthKey, shiftMonth } from "@/lib/date";
import type { AppState, Revenue } from "@/lib/types";
import type { Actions } from "@/lib/useAppState";
import { Card, ProgressBar, SectionTitle } from "./ui";

const won = (man: number) => `${man.toLocaleString("ko-KR")}만`;

function sum(r: Revenue) {
  return r.gonggu + r.sponsor + r.affiliate;
}

export default function Portfolio({
  state,
  actions,
  today,
}: {
  state: AppState;
  actions: Actions;
  today: Date;
}) {
  const thisMonth = monthKey(today);
  const [month, setMonth] = useState(thisMonth);
  const rev: Revenue = { ...EMPTY_REVENUE, ...state.revenue[month] };
  const total = sum(rev);
  const rate = total / TARGET_TOTAL;
  const gap = Math.max(0, TARGET_TOTAL - total);

  const trend = Array.from({ length: 6 }, (_, i) => {
    const k = shiftMonth(thisMonth, i - 5);
    return { k, r: { ...EMPTY_REVENUE, ...state.revenue[k] } };
  });
  const trendMax = Math.max(TARGET_TOTAL, ...trend.map((t) => sum(t.r)));

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle icon={<PieChart size={16} />} title="월 1,000만 원 포트폴리오" />
        <p className="mb-3 text-sm text-slate-500">
          {OWNER}님의 퇴사 조건: 매달 아래 세 파이프라인이 동시에 돌아가기
        </p>
        <div className="flex h-10 overflow-hidden rounded-2xl">
          {REVENUE_KEYS.map((k) => (
            <div
              key={k}
              className={`${CATEGORY_META[k].bg} flex items-center justify-center text-xs font-bold text-white`}
              style={{ width: `${(TARGET[k] / TARGET_TOTAL) * 100}%` }}
            >
              {TARGET[k] >= 150 ? CATEGORY_META[k].label : ""}
            </div>
          ))}
        </div>
        <ul className="mt-3 grid grid-cols-3 gap-2 text-center">
          {REVENUE_KEYS.map((k) => (
            <li key={k} className="rounded-2xl bg-slate-50 py-2.5">
              <p className={`text-xs font-semibold ${CATEGORY_META[k].text}`}>
                {CATEGORY_META[k].label}
              </p>
              <p className="text-lg font-black tabular-nums text-slate-900">{TARGET[k]}만</p>
              <p className="text-[11px] text-slate-400">
                {Math.round((TARGET[k] / TARGET_TOTAL) * 100)}%
              </p>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={<Wallet size={16} />} title="이번 달 실적 기록" />

        <div className="mb-4 flex items-center justify-between rounded-2xl bg-slate-50 p-1">
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, -1))}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white"
            aria-label="이전 달"
          >
            <ChevronLeft size={18} />
          </button>
          <p className="text-sm font-bold text-slate-900">
            {formatMonth(month)}
            {month === thisMonth && <span className="ml-1 text-xs text-slate-400">(이번 달)</span>}
          </p>
          <button
            type="button"
            onClick={() => setMonth((m) => shiftMonth(m, 1))}
            disabled={month >= thisMonth}
            className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white disabled:opacity-30"
            aria-label="다음 달"
          >
            <ChevronRight size={18} />
          </button>
        </div>

        <div className="mb-5 rounded-2xl bg-slate-900 p-4 text-white">
          <div className="flex items-baseline justify-between">
            <span className="text-xs text-slate-300">합계</span>
            <span className="text-xs text-slate-300">목표 {won(TARGET_TOTAL)}원</span>
          </div>
          <p className="mt-1 text-3xl font-black tabular-nums">
            {won(total)}
            <span className="text-base font-bold text-slate-400">원</span>
            <span className="ml-2 text-base font-bold text-orange-300">
              {Math.round(rate * 100)}%
            </span>
          </p>
          {/* 카테고리별로 쌓인 막대 */}
          <div className="mt-3 flex h-2.5 overflow-hidden rounded-full bg-white/10">
            {REVENUE_KEYS.map((k) => (
              <div
                key={k}
                className={`${CATEGORY_META[k].bg} transition-[width] duration-500`}
                style={{ width: `${(rev[k] / Math.max(total, TARGET_TOTAL)) * 100}%` }}
              />
            ))}
          </div>
          <p className="mt-2 text-xs text-slate-300">
            {gap > 0 ? `목표까지 ${won(gap)}원 남았어요` : "🎉 목표 달성! 퇴사 조건 충족 달이에요"}
          </p>
        </div>

        <ul className="space-y-4">
          {REVENUE_KEYS.map((k) => {
            const v = rev[k];
            const p = v / TARGET[k];
            return (
              <li key={k}>
                <div className="mb-1.5 flex items-center justify-between gap-3">
                  <span className={`text-sm font-bold ${CATEGORY_META[k].text}`}>
                    {CATEGORY_META[k].label}
                    <span className="ml-1 text-xs font-medium text-slate-400">
                      / {won(TARGET[k])}
                    </span>
                  </span>
                  <label className="flex items-center gap-1 rounded-xl bg-slate-50 px-3 py-1.5 ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-slate-900">
                    <input
                      type="text"
                      inputMode="numeric"
                      value={v ? v.toLocaleString("ko-KR") : ""}
                      placeholder="0"
                      onChange={(e) => {
                        const n = Number(e.target.value.replace(/[^\d]/g, ""));
                        actions.setRevenue(month, k, Math.min(99_999, n));
                      }}
                      className="w-20 bg-transparent text-right text-sm font-bold tabular-nums text-slate-900 outline-none"
                      aria-label={`${CATEGORY_META[k].label} 수익(만원)`}
                    />
                    <span className="text-xs text-slate-400">만원</span>
                  </label>
                </div>
                <ProgressBar value={p} className={CATEGORY_META[k].bar} />
                <p className="mt-1 text-right text-[11px] tabular-nums text-slate-400">
                  {Math.round(p * 100)}%
                </p>
              </li>
            );
          })}
        </ul>
      </Card>

      <Card>
        <SectionTitle icon={<BarChart3 size={16} />} title="최근 6개월 추이" />
        <div className="grid grid-cols-6 gap-2 text-center">
          {trend.map(({ k, r }) => (
            <span key={k} className="text-[10px] font-bold tabular-nums text-slate-600">
              {sum(r) ? sum(r).toLocaleString("ko-KR") : "-"}
            </span>
          ))}
        </div>
        <div className="relative mt-1 h-32">
          <div
            className="pointer-events-none absolute inset-x-0 z-10 border-t border-dashed border-slate-400"
            style={{ bottom: `${(TARGET_TOTAL / trendMax) * 100}%` }}
          >
            <span className="absolute -top-4 right-0 text-[10px] text-slate-400">목표 1,000</span>
          </div>
          <div className="grid h-full grid-cols-6 items-end gap-2">
            {trend.map(({ k, r }) => {
              const t = sum(r);
              return (
                <button
                  key={k}
                  type="button"
                  onClick={() => setMonth(k)}
                  aria-label={`${formatMonth(k)} 보기`}
                  className={`flex h-full w-full flex-col justify-end rounded-lg ${
                    k === month ? "bg-slate-100" : ""
                  }`}
                >
                  <div
                    className="flex w-full flex-col-reverse overflow-hidden rounded-lg"
                    style={{ height: `${(t / trendMax) * 100}%` }}
                  >
                    {REVENUE_KEYS.map((c) => (
                      <div
                        key={c}
                        className={CATEGORY_META[c].bg}
                        style={{ height: t ? `${(r[c] / t) * 100}%` : 0 }}
                      />
                    ))}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
        <div className="mt-1.5 grid grid-cols-6 gap-2 text-center">
          {trend.map(({ k }) => (
            <span
              key={k}
              className={`text-[11px] ${k === month ? "font-bold text-slate-900" : "text-slate-400"}`}
            >
              {Number(k.slice(5))}월
            </span>
          ))}
        </div>
        <p className="mt-3 text-[11px] text-slate-400">막대를 누르면 해당 달 실적을 볼 수 있어요. 단위: 만원</p>
      </Card>
    </div>
  );
}
