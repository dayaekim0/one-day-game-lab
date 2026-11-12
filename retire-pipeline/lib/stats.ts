import { addDays, dateKey } from "./date";
import type { AppState } from "./types";

export function isDayComplete(state: AppState, day: string): boolean {
  if (state.routine.length === 0) return false;
  const done = new Set(state.dailyLog[day] ?? []);
  return state.routine.every((r) => done.has(r.id));
}

/** 연속 달성일. 오늘을 아직 못 끝냈으면 어제부터 센다 (오늘 중에는 끊기지 않음) */
export function currentStreak(state: AppState, today: Date): number {
  let d = isDayComplete(state, dateKey(today)) ? today : addDays(today, -1);
  let n = 0;
  while (isDayComplete(state, dateKey(d))) {
    n++;
    d = addDays(d, -1);
  }
  return n;
}

export function totalCompleteDays(state: AppState): number {
  return Object.keys(state.dailyLog).filter((k) => isDayComplete(state, k)).length;
}
