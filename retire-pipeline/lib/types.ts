export type Category = "gonggu" | "sponsor" | "affiliate" | "content";

export interface RoutineItem {
  id: string;
  title: string;
  minutes: number;
  category: Category;
}

export interface Mission {
  id: string;
  title: string;
  category: Category;
}

export interface Revenue {
  gonggu: number; // 단위: 만원
  sponsor: number;
  affiliate: number;
}

export interface AppState {
  version: 1;
  startDate: string; // YYYY-MM-DD, 처음 앱을 연 날
  routine: RoutineItem[];
  dailyLog: Record<string, string[]>; // 날짜 -> 완료한 루틴 id
  missions: Mission[];
  weeklyLog: Record<string, string[]>; // 주차 -> 완료한 미션 id
  revenue: Record<string, Revenue>; // YYYY-MM -> 월 수익
}
