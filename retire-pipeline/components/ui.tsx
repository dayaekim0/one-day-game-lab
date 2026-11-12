import type { ReactNode } from "react";
import { CATEGORY_META } from "@/lib/constants";
import type { Category } from "@/lib/types";

export function Card({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-3xl bg-white p-5 shadow-sm ring-1 ring-slate-100 ${className}`}>
      {children}
    </section>
  );
}

export function SectionTitle({
  icon,
  title,
  right,
}: {
  icon: ReactNode;
  title: string;
  right?: ReactNode;
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <h2 className="flex items-center gap-2 text-base font-bold text-slate-900">
        <span className="grid h-8 w-8 place-items-center rounded-xl bg-slate-100 text-slate-700">
          {icon}
        </span>
        {title}
      </h2>
      {right}
    </div>
  );
}

export function ProgressBar({
  value,
  className = "bg-slate-900",
  track = "bg-slate-100",
  height = "h-2.5",
}: {
  value: number; // 0~1
  className?: string;
  track?: string;
  height?: string;
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100;
  return (
    <div
      className={`w-full overflow-hidden rounded-full ${track} ${height}`}
      role="progressbar"
      aria-valuenow={Math.round(pct)}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <div
        className={`h-full rounded-full transition-[width] duration-500 ease-out ${className}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  );
}

export function CategoryBadge({ category }: { category: Category }) {
  const m = CATEGORY_META[category];
  return (
    <span className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-semibold ring-1 ${m.soft}`}>
      {m.label}
    </span>
  );
}

export function CategorySelect({
  value,
  onChange,
}: {
  value: Category;
  onChange: (c: Category) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {(Object.keys(CATEGORY_META) as Category[]).map((c) => {
        const active = c === value;
        const m = CATEGORY_META[c];
        return (
          <button
            key={c}
            type="button"
            onClick={() => onChange(c)}
            className={`rounded-full px-3 py-1 text-xs font-semibold ring-1 transition ${
              active ? `${m.bg} text-white ring-transparent` : "bg-white text-slate-500 ring-slate-200"
            }`}
          >
            {m.label}
          </button>
        );
      })}
    </div>
  );
}
