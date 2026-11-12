import type { Category, Mission, Revenue, RoutineItem } from "./types";

export const OWNER = "다예";
export const STORAGE_KEY = "retire-pipeline:v1";

// 퇴사일: 2027년 12월 31일 (로컬 시간 자정 기준)
export const RETIRE_DATE = { y: 2027, m: 12, d: 31 };

// 월 목표 수익 (만원)
export const TARGET: Revenue = { gonggu: 700, sponsor: 200, affiliate: 100 };
export const TARGET_TOTAL = TARGET.gonggu + TARGET.sponsor + TARGET.affiliate;

export const CATEGORY_META: Record<
  Category,
  { label: string; text: string; bg: string; soft: string; bar: string }
> = {
  gonggu: {
    label: "공구",
    text: "text-orange-600",
    bg: "bg-orange-500",
    soft: "bg-orange-50 text-orange-700 ring-orange-200",
    bar: "bg-orange-500",
  },
  sponsor: {
    label: "협찬",
    text: "text-violet-600",
    bg: "bg-violet-500",
    soft: "bg-violet-50 text-violet-700 ring-violet-200",
    bar: "bg-violet-500",
  },
  affiliate: {
    label: "제휴",
    text: "text-emerald-600",
    bg: "bg-emerald-500",
    soft: "bg-emerald-50 text-emerald-700 ring-emerald-200",
    bar: "bg-emerald-500",
  },
  content: {
    label: "콘텐츠",
    text: "text-sky-600",
    bg: "bg-sky-500",
    soft: "bg-sky-50 text-sky-700 ring-sky-200",
    bar: "bg-sky-500",
  },
};

export const REVENUE_KEYS = ["gonggu", "sponsor", "affiliate"] as const;

// 하루 15분 루틴 (합계 15분)
export const DEFAULT_ROUTINE: RoutineItem[] = [
  { id: "r1", title: "공구 문의 DM·댓글 답장", minutes: 3, category: "gonggu" },
  { id: "r2", title: "공구 후보 상품 1개 리서치·메모", minutes: 3, category: "gonggu" },
  { id: "r3", title: "인스타 스토리 1개 업로드", minutes: 3, category: "content" },
  { id: "r4", title: "협찬 제안 메일 확인·1곳 컨택", minutes: 3, category: "sponsor" },
  { id: "r5", title: "제휴 링크 클릭·전환 체크", minutes: 2, category: "affiliate" },
  { id: "r6", title: "오늘 수익·인사이트 한 줄 기록", minutes: 1, category: "content" },
];

export const DEFAULT_MISSIONS: Mission[] = [
  { id: "m1", title: "공구 오픈 1건 또는 공구 제안서 2곳 발송", category: "gonggu" },
  { id: "m2", title: "공구 판매 후기·리그램 3개 공유", category: "gonggu" },
  { id: "m3", title: "협찬 희망 브랜드 5곳 리스트업 & 컨택", category: "sponsor" },
  { id: "m4", title: "제휴 링크 콘텐츠 2개 발행", category: "affiliate" },
  { id: "m5", title: "릴스 3개 업로드", category: "content" },
  { id: "m6", title: "주간 수익 정산 & 다음 주 계획 회고", category: "content" },
];

export const EMPTY_REVENUE: Revenue = { gonggu: 0, sponsor: 0, affiliate: 0 };
