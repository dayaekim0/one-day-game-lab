"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { DEFAULT_MISSIONS, DEFAULT_ROUTINE, EMPTY_REVENUE, STORAGE_KEY } from "./constants";
import { dateKey } from "./date";
import type { AppState, Mission, Revenue, RoutineItem } from "./types";

function freshState(): AppState {
  return {
    version: 1,
    startDate: dateKey(),
    routine: DEFAULT_ROUTINE,
    dailyLog: {},
    missions: DEFAULT_MISSIONS,
    weeklyLog: {},
    revenue: {},
  };
}

const isObj = (v: unknown): v is Record<string, unknown> =>
  typeof v === "object" && v !== null && !Array.isArray(v);

/** 저장된 값이 깨져 있어도 앱이 열리도록 필드별로 검증해서 기본값과 합친다 */
export function sanitize(raw: unknown): AppState {
  const base = freshState();
  if (!isObj(raw)) return base;
  const s = raw as Partial<AppState>;
  return {
    version: 1,
    startDate: typeof s.startDate === "string" ? s.startDate : base.startDate,
    routine: Array.isArray(s.routine) ? s.routine : base.routine,
    dailyLog: isObj(s.dailyLog) ? (s.dailyLog as AppState["dailyLog"]) : {},
    missions: Array.isArray(s.missions) ? s.missions : base.missions,
    weeklyLog: isObj(s.weeklyLog) ? (s.weeklyLog as AppState["weeklyLog"]) : {},
    revenue: isObj(s.revenue) ? (s.revenue as AppState["revenue"]) : {},
  };
}

function readStorage(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? sanitize(JSON.parse(raw)) : freshState();
  } catch {
    return freshState();
  }
}

const uid = () => Math.random().toString(36).slice(2, 9);

function toggleIn(log: Record<string, string[]>, key: string, id: string) {
  const cur = log[key] ?? [];
  const next = cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id];
  return { ...log, [key]: next };
}

export function useAppState() {
  const [state, setState] = useState<AppState | null>(null);
  const loaded = useRef(false);

  // 최초 로드 (SSR 과 hydration 불일치를 피하려고 마운트 후에 읽는다)
  useEffect(() => {
    setState(readStorage());
    loaded.current = true;
    // 다른 탭에서 수정하면 동기화
    const onStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) setState(readStorage());
    };
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  // 변경될 때마다 저장
  useEffect(() => {
    if (!loaded.current || !state) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      /* 저장 공간 부족·시크릿 모드 등: 화면은 계속 동작 */
    }
  }, [state]);

  const update = useCallback((fn: (s: AppState) => AppState) => {
    setState((s) => (s ? fn(s) : s));
  }, []);

  const actions = {
    toggleRoutine: (day: string, id: string) =>
      update((s) => ({ ...s, dailyLog: toggleIn(s.dailyLog, day, id) })),
    addRoutine: (item: Omit<RoutineItem, "id">) =>
      update((s) => ({ ...s, routine: [...s.routine, { ...item, id: uid() }] })),
    removeRoutine: (id: string) =>
      update((s) => ({ ...s, routine: s.routine.filter((r) => r.id !== id) })),
    resetRoutine: () => update((s) => ({ ...s, routine: DEFAULT_ROUTINE })),

    toggleMission: (week: string, id: string) =>
      update((s) => ({ ...s, weeklyLog: toggleIn(s.weeklyLog, week, id) })),
    addMission: (m: Omit<Mission, "id">) =>
      update((s) => ({ ...s, missions: [...s.missions, { ...m, id: uid() }] })),
    removeMission: (id: string) =>
      update((s) => ({ ...s, missions: s.missions.filter((m) => m.id !== id) })),
    resetMissions: () => update((s) => ({ ...s, missions: DEFAULT_MISSIONS })),

    setRevenue: (month: string, key: keyof Revenue, value: number) =>
      update((s) => ({
        ...s,
        revenue: {
          ...s.revenue,
          [month]: { ...EMPTY_REVENUE, ...s.revenue[month], [key]: value },
        },
      })),

    importState: (raw: unknown) => setState(sanitize(raw)),
    resetAll: () => setState(freshState()),
  };

  return { state, actions };
}

export type Actions = ReturnType<typeof useAppState>["actions"];

/** 자정이 지나면 날짜가 바뀌도록 1분마다 오늘 날짜를 갱신 */
export function useToday(): Date | null {
  const [today, setToday] = useState<Date | null>(null);
  useEffect(() => {
    const tick = () =>
      setToday((prev) => {
        const now = new Date();
        return prev && dateKey(prev) === dateKey(now) ? prev : now;
      });
    tick();
    const t = window.setInterval(tick, 60_000);
    return () => window.clearInterval(t);
  }, []);
  return today;
}
