"use client";

import { ChevronLeft, ChevronRight, Pencil, Target, Trophy, X } from "lucide-react";
import { useState } from "react";
import { addDays, dateKey, formatWeekRange, weekOfMonthLabel, weekStart } from "@/lib/date";
import type { AppState } from "@/lib/types";
import type { Actions } from "@/lib/useAppState";
import CheckRow from "./CheckRow";
import EditableList from "./EditableList";
import { Card, CategoryBadge, ProgressBar, SectionTitle } from "./ui";

export default function WeeklyMissions({
  state,
  actions,
  today,
}: {
  state: AppState;
  actions: Actions;
  today: Date;
}) {
  const [offset, setOffset] = useState(0); // 0 = 이번 주
  const [editing, setEditing] = useState(false);

  const start = addDays(weekStart(today), offset * 7);
  const key = dateKey(start);
  const done = new Set(state.weeklyLog[key] ?? []);
  const missions = state.missions;
  const count = missions.filter((m) => done.has(m.id)).length;
  const daysLeft = offset === 0 ? 7 - ((today.getDay() + 6) % 7) : null;

  // 최근 4주 달성률
  const history = Array.from({ length: 4 }, (_, i) => {
    const s = addDays(weekStart(today), (i - 3) * 7);
    const d = new Set(state.weeklyLog[dateKey(s)] ?? []);
    const c = missions.filter((m) => d.has(m.id)).length;
    return { s, rate: missions.length ? c / missions.length : 0 };
  });

  return (
    <div className="space-y-4">
      <Card>
        <SectionTitle
          icon={<Target size={16} />}
          title="주간 미션"
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
            items={missions}
            placeholder="예) 공구 라이브 1회 진행"
            onAdd={({ title, category }) => actions.addMission({ title, category })}
            onRemove={actions.removeMission}
            onReset={actions.resetMissions}
          />
        ) : (
          <>
            <div className="mb-3 flex items-center justify-between rounded-2xl bg-slate-50 p-1">
              <button
                type="button"
                onClick={() => setOffset((o) => o - 1)}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white"
                aria-label="이전 주"
              >
                <ChevronLeft size={18} />
              </button>
              <div className="text-center">
                <p className="text-sm font-bold text-slate-900">{weekOfMonthLabel(start)}</p>
                <p className="text-[11px] text-slate-400">
                  {formatWeekRange(start)}
                  {offset === 0 && ` · 이번 주 ${daysLeft}일 남음`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setOffset((o) => Math.min(0, o + 1))}
                disabled={offset === 0}
                className="grid h-9 w-9 place-items-center rounded-xl text-slate-500 hover:bg-white disabled:opacity-30"
                aria-label="다음 주"
              >
                <ChevronRight size={18} />
              </button>
            </div>

            <div className="mb-4">
              <div className="mb-1.5 flex justify-between text-sm">
                <span className="text-slate-500">달성</span>
                <span className="font-bold tabular-nums text-slate-900">
                  {count} / {missions.length}
                </span>
              </div>
              <ProgressBar
                value={missions.length ? count / missions.length : 0}
                className="bg-violet-500"
              />
            </div>

            {missions.length > 0 && count === missions.length && (
              <div className="mb-4 flex items-center gap-3 rounded-2xl bg-violet-50 p-3 text-sm text-violet-800 ring-1 ring-violet-100">
                <Trophy size={20} className="shrink-0" />
                이번 주 미션 올클리어! 다음 주도 이 속도로 가요.
              </div>
            )}

            <ul className="space-y-2">
              {missions.map((m) => (
                <CheckRow
                  key={m.id}
                  done={done.has(m.id)}
                  onToggle={() => actions.toggleMission(key, m.id)}
                  meta={<CategoryBadge category={m.category} />}
                >
                  {m.title}
                </CheckRow>
              ))}
            </ul>
          </>
        )}
      </Card>

      <Card>
        <SectionTitle icon={<Trophy size={16} />} title="최근 4주 달성률" />
        <div className="grid grid-cols-4 gap-3">
          {history.map(({ s, rate }) => (
            <div key={dateKey(s)} className="flex flex-col items-center gap-2">
              <div className="flex h-24 w-full items-end overflow-hidden rounded-xl bg-slate-100">
                <div
                  className="w-full rounded-xl bg-violet-500 transition-[height] duration-500"
                  style={{ height: `${Math.round(rate * 100)}%` }}
                />
              </div>
              <span className="text-xs font-bold tabular-nums text-slate-700">
                {Math.round(rate * 100)}%
              </span>
              <span className="text-[10px] text-slate-400">
                {s.getMonth() + 1}.{s.getDate()}~
              </span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
