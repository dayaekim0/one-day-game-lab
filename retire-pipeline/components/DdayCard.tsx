import { CalendarClock, Flag } from "lucide-react";
import { OWNER, RETIRE_DATE } from "@/lib/constants";
import { diffDays, parseKey, retireDate } from "@/lib/date";
import { ProgressBar } from "./ui";

export default function DdayCard({ today, startDate }: { today: Date; startDate: string }) {
  const target = retireDate();
  const left = diffDays(today, target);
  const start = parseKey(startDate);
  const total = Math.max(1, diffDays(start, target));
  const progress = 1 - Math.max(0, left) / total;

  const label = left > 0 ? `D-${left}` : left === 0 ? "D-DAY" : `D+${-left}`;
  const weeks = Math.floor(Math.max(0, left) / 7);
  const months = Math.max(
    0,
    (target.getFullYear() - today.getFullYear()) * 12 + (target.getMonth() - today.getMonth()),
  );

  return (
    <section className="relative overflow-hidden rounded-3xl bg-slate-900 p-6 text-white shadow-lg">
      <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-orange-500/30 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-36 w-36 rounded-full bg-violet-500/30 blur-2xl" />

      <div className="relative">
        <p className="flex items-center gap-1.5 text-xs font-medium text-slate-300">
          <CalendarClock size={14} />
          {RETIRE_DATE.y}.{RETIRE_DATE.m}.{RETIRE_DATE.d} 퇴사까지
        </p>
        <p className="mt-2 text-6xl font-black tracking-tight tabular-nums">{label}</p>
        <p className="mt-2 text-sm text-slate-300">
          {left > 0 ? (
            <>
              약 <b className="text-white">{months}개월</b> · <b className="text-white">{weeks}주</b> 남았어요.
              {` ${OWNER}님, 오늘 15분이 퇴사를 하루 당겨요.`}
            </>
          ) : (
            <>🎉 {OWNER}님, 퇴사 축하해요! 이제 파이프라인이 월급이에요.</>
          )}
        </p>

        <div className="mt-5">
          <div className="mb-1.5 flex justify-between text-[11px] text-slate-400">
            <span>시작 {startDate.replaceAll("-", ".")}</span>
            <span className="flex items-center gap-1">
              <Flag size={11} /> {Math.round(progress * 100)}%
            </span>
          </div>
          <ProgressBar
            value={progress}
            track="bg-white/10"
            className="bg-gradient-to-r from-orange-400 via-violet-400 to-emerald-400"
          />
        </div>
      </div>
    </section>
  );
}
