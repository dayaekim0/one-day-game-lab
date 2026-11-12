import { RETIRE_DATE } from "./constants";

const pad = (n: number) => String(n).padStart(2, "0");

export function dateKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export function monthKey(d: Date = new Date()): string {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`;
}

export function parseKey(key: string): Date {
  const [y, m, d] = key.split("-").map(Number);
  return new Date(y, (m ?? 1) - 1, d ?? 1);
}

export function startOfDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

export function addDays(d: Date, n: number): Date {
  const r = new Date(d);
  r.setDate(r.getDate() + n);
  return r;
}

const DAY_MS = 24 * 60 * 60 * 1000;

/** 두 날짜 사이의 달력 일수 (서머타임 영향 없이 반올림) */
export function diffDays(from: Date, to: Date): number {
  return Math.round((startOfDay(to).getTime() - startOfDay(from).getTime()) / DAY_MS);
}

export function retireDate(): Date {
  return new Date(RETIRE_DATE.y, RETIRE_DATE.m - 1, RETIRE_DATE.d);
}

/** 월요일 시작 주. key 는 그 주 월요일 날짜 (예: 2026-11-09) */
export function weekStart(d: Date = new Date()): Date {
  const s = startOfDay(d);
  const day = (s.getDay() + 6) % 7; // 월=0 ... 일=6
  return addDays(s, -day);
}

export function weekKey(d: Date = new Date()): string {
  return dateKey(weekStart(d));
}

const WEEKDAY = ["일", "월", "화", "수", "목", "금", "토"];

export function formatKoreanDate(d: Date): string {
  return `${d.getMonth() + 1}월 ${d.getDate()}일 (${WEEKDAY[d.getDay()]})`;
}

export function weekdayShort(d: Date): string {
  return WEEKDAY[d.getDay()];
}

export function formatWeekRange(start: Date): string {
  const end = addDays(start, 6);
  return `${start.getMonth() + 1}.${start.getDate()} – ${end.getMonth() + 1}.${end.getDate()}`;
}

/** 해당 월의 몇째 주인지 (월요일 기준) */
export function weekOfMonthLabel(start: Date): string {
  // 목요일이 속한 달을 그 주의 달로 본다 (ISO 방식)
  const thursday = addDays(start, 3);
  const firstOfMonth = new Date(thursday.getFullYear(), thursday.getMonth(), 1);
  const firstWeekStart = weekStart(addDays(firstOfMonth, (4 - firstOfMonth.getDay() + 7) % 7));
  const n = Math.floor(diffDays(firstWeekStart, start) / 7) + 1;
  return `${thursday.getMonth() + 1}월 ${n}주차`;
}

export function shiftMonth(key: string, delta: number): string {
  const [y, m] = key.split("-").map(Number);
  return monthKey(new Date(y, m - 1 + delta, 1));
}

export function formatMonth(key: string): string {
  const [y, m] = key.split("-").map(Number);
  return `${y}년 ${m}월`;
}
