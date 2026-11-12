"use client";

import { CalendarCheck, HardDrive, ListChecks, Wallet } from "lucide-react";
import { useEffect, useState } from "react";
import DailyRoutine from "@/components/DailyRoutine";
import DataSheet from "@/components/DataSheet";
import DdayCard from "@/components/DdayCard";
import Portfolio from "@/components/Portfolio";
import WeeklyMissions from "@/components/WeeklyMissions";
import { CATEGORY_META, EMPTY_REVENUE, OWNER, REVENUE_KEYS, TARGET_TOTAL } from "@/lib/constants";
import { diffDays, monthKey, retireDate } from "@/lib/date";
import { useAppState, useToday } from "@/lib/useAppState";

type Tab = "today" | "money" | "weekly";

const TABS: { id: Tab; label: string; icon: typeof ListChecks }[] = [
  { id: "today", label: "오늘", icon: ListChecks },
  { id: "money", label: "수익", icon: Wallet },
  { id: "weekly", label: "주간", icon: CalendarCheck },
];

const TAB_KEY = "retire-pipeline:tab";

export default function Home() {
  const { state, actions } = useAppState();
  const today = useToday();
  const [tab, setTab] = useState<Tab>("today");
  const [sheet, setSheet] = useState(false);

  useEffect(() => {
    try {
      const t = window.localStorage.getItem(TAB_KEY) as Tab | null;
      if (t && TABS.some((x) => x.id === t)) setTab(t);
    } catch {}
  }, []);

  const changeTab = (t: Tab) => {
    setTab(t);
    window.scrollTo({ top: 0 });
    try {
      window.localStorage.setItem(TAB_KEY, t);
    } catch {}
  };

  if (!state || !today) {
    return (
      <main className="mx-auto flex min-h-dvh max-w-md items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-slate-900" />
      </main>
    );
  }

  const left = diffDays(today, retireDate());
  const rev = { ...EMPTY_REVENUE, ...state.revenue[monthKey(today)] };
  const monthTotal = REVENUE_KEYS.reduce((a, k) => a + rev[k], 0);

  return (
    <div className="mx-auto min-h-dvh max-w-md">
      <header className="sticky top-0 z-30 bg-slate-100/85 px-4 pb-3 pt-[calc(0.75rem+env(safe-area-inset-top))] backdrop-blur">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-wider text-slate-400">
              Retire Pipeline
            </p>
            <h1 className="text-lg font-black text-slate-900">{OWNER}님의 퇴사 파이프라인</h1>
          </div>
          <div className="flex items-center gap-2">
            {tab !== "today" && (
              <span className="rounded-full bg-slate-900 px-2.5 py-1 text-xs font-bold tabular-nums text-white">
                {left > 0 ? `D-${left}` : "D-DAY"}
              </span>
            )}
            <button
              type="button"
              onClick={() => setSheet(true)}
              className="grid h-9 w-9 place-items-center rounded-full bg-white text-slate-600 shadow-sm ring-1 ring-slate-200"
              aria-label="데이터 관리"
            >
              <HardDrive size={17} />
            </button>
          </div>
        </div>
      </header>

      <main className="space-y-4 px-4 pb-[calc(6rem+env(safe-area-inset-bottom))] pt-1">
        {tab === "today" && (
          <>
            <DdayCard today={today} startDate={state.startDate} />
            <button
              type="button"
              onClick={() => changeTab("money")}
              className="flex w-full items-center gap-3 rounded-3xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100"
            >
              <div className="min-w-0 flex-1">
                <p className="text-xs text-slate-400">이번 달 수익</p>
                <p className="text-lg font-black tabular-nums text-slate-900">
                  {monthTotal.toLocaleString("ko-KR")}
                  <span className="text-sm font-bold text-slate-400"> / 1,000만 원</span>
                </p>
                <div className="mt-2 flex h-2 overflow-hidden rounded-full bg-slate-100">
                  {REVENUE_KEYS.map((k) => (
                    <div
                      key={k}
                      className={CATEGORY_META[k].bg}
                      style={{ width: `${(rev[k] / Math.max(monthTotal, TARGET_TOTAL)) * 100}%` }}
                    />
                  ))}
                </div>
              </div>
              <span className="text-2xl font-black tabular-nums text-orange-500">
                {Math.round((monthTotal / TARGET_TOTAL) * 100)}%
              </span>
            </button>
            <DailyRoutine state={state} actions={actions} today={today} />
          </>
        )}
        {tab === "money" && <Portfolio state={state} actions={actions} today={today} />}
        {tab === "weekly" && <WeeklyMissions state={state} actions={actions} today={today} />}
      </main>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-200 bg-white/90 pb-[env(safe-area-inset-bottom)] backdrop-blur">
        <ul className="mx-auto grid max-w-md grid-cols-3">
          {TABS.map(({ id, label, icon: Icon }) => {
            const active = id === tab;
            return (
              <li key={id}>
                <button
                  type="button"
                  onClick={() => changeTab(id)}
                  aria-current={active ? "page" : undefined}
                  className={`flex w-full flex-col items-center gap-0.5 py-2.5 text-[11px] font-semibold transition ${
                    active ? "text-slate-900" : "text-slate-400"
                  }`}
                >
                  <Icon size={22} strokeWidth={active ? 2.5 : 2} />
                  {label}
                </button>
              </li>
            );
          })}
        </ul>
      </nav>

      {sheet && <DataSheet state={state} actions={actions} onClose={() => setSheet(false)} />}
    </div>
  );
}
