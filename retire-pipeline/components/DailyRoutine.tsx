"use client";

import { Flame, PartyPopper, Pencil, Timer, X } from "lucide-react";
import { useState } from "react";
import { OWNER } from "@/lib/constants";
import { addDays, dateKey, formatKoreanDate, weekdayShort } from "@/lib/date";
import { currentStreak, isDayComplete, totalCompleteDays } from "@/lib/stats";
import type { AppState } from "@/lib/types";
import type { Actions } from "@/lib/useAppState";
import CheckRow from "./CheckRow";
import EditableList from "./EditableList";
import { Card, CategoryBadge, ProgressBar, SectionTitle } from "./ui";

export default function DailyRoutine({
  state,
  actions,
  today,
}: {
  state: AppState;
  actions: Actions;
  today: Date;
}) {
  const [editing, setEditing] = useState(false);
  const key = dateKey(today);
  const done = new Set(state.dailyLog[key] ?? []);
  const items = state.routine;
  const doneItems = items.filter((r) => done.has(r.id));
  const totalMin = items.reduce((a, r) => a + r.minutes, 0);
  const doneMin = doneItems.reduce((a, r) => a + r.minutes, 0);
  const allDone = items.length > 0 && doneItems.length === items.length;

  const streak = currentStreak(state, today);
  const totalDays = totalCompleteDays(state);
  const last7 = Array.from({ length: 7 }, (_, i) => addDays(today, i - 6));

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          icon={<Timer size={16} />}
          title={`${OWNER}님의 하루 ${totalMin}분 루틴`}
          right={
            <button
              type="button"
              onClick={() => setEditing((v) => !v)}
              className="flex items-center gap-1 rounded-full bg-slate-100 px-3 py-1.5 text-xs font-semibold text-slate-600"
            >
              {editing ? <X size={13} /> : <Pencil size={13} />}
              {editing ? "완료" : "편집"}
            </button>
          }
        />

        {editing ? (
          <EditableList
            items={items}
            withMinutes
            placeholder="예) 공구 공지 스토리 올리기"
            onAdd={(v) => actions.addRoutine(v)}
            onRemove={actions.removeRoutine}
            onReset={actions.resetRoutine}
          />
        ) : (
          <>
            <div className="mb-4">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm text-slate-500">{formatKoreanDate(today)}</span>
                <span className="text-sm font-bold tabular-nums text-slate-900">
                  {doneMin} / {totalMin}분
                </span>
              </div>
              <ProgressBar
                value={totalMin ? doneMin / totalMin : 0}
                className={allDone ? "bg-emerald-500" : "bg-slate-900"}
              />
            </div>

            {allDone && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-emerald-50 p-3 text-sm text-emerald-800 ring-1 ring-emerald-100">
                <PartyPopper size={20} className="shrink-0" />
                <span>
                  오늘 루틴 완료! 파이프라인에 벽돌 하나 더 쌓았어요.
                </span>
              </div>
            )}

            <ul className="space-y-2">
              {items.map((r) => (
                <CheckRow
                  key={r.id}
                  done={done.has(r.id)}
                  onToggle={() => actions.toggleRoutine(key, r.id)}
                  meta={
                    <span className="flex shrink-0 flex-col items-end gap-1">
                      <CategoryBadge category={r.category} />
                      <span className="text-[11px] text-slate-400">{r.minutes}분</span>
                    </span>
                  }
                >
                  {r.title}
                </CheckRow>
              ))}
              {items.length === 0 && (
                <li className="rounded-2xl border border-dashed border-slate-200 p-5 text-center text-sm text-slate-400">
                  루틴이 비어 있어요. 편집을 눌러 추가해 주세요.
                </li>
              )}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <SectionTitle icon={<Flame size={16} />} title="루틴 스트릭" />
        <div className="flex items-end justify-between">
          <div>
            <p className="text-4xl font-black tabular-nums text-slate-900">
              {streak}
              <span className="ml-1 text-base font-bold text-slate-400">일 연속</span>
            </p>
            <p className="mt-1 text-xs text-slate-400">누적 완료 {totalDays}일</p>
          </div>
          <div className="flex gap-1.5">
            {last7.map((d) => {
              const k = dateKey(d);
              const ok = isDayComplete(state, k);
              const partial = !ok && (state.dailyLog[k]?.length ?? 0) > 0;
              const isToday = k === key;
              return (
                <div key={k} className="flex flex-col items-center gap-1">
                  <span
                    className={`h-7 w-7 rounded-lg ${
                      ok ? "bg-orange-500" : partial ? "bg-orange-200" : "bg-slate-100"
                    } ${isToday ? "ring-2 ring-slate-900 ring-offset-1" : ""}`}
                    title={k}
                  />
                  <span className="text-[10px] text-slate-400">{weekdayShort(d)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
    </div>
  );
}
