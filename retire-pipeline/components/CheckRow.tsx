import { Check } from "lucide-react";
import type { ReactNode } from "react";

export default function CheckRow({
  done,
  onToggle,
  children,
  meta,
}: {
  done: boolean;
  onToggle: () => void;
  children: ReactNode;
  meta?: ReactNode;
}) {
  return (
    <li>
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={done}
        className={`flex w-full items-center gap-3 rounded-2xl px-3 py-3 text-left transition active:scale-[0.99] ${
          done ? "bg-slate-50" : "bg-white ring-1 ring-slate-200 hover:ring-slate-300"
        }`}
      >
        <span
          className={`grid h-6 w-6 shrink-0 place-items-center rounded-lg border-2 transition ${
            done ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 text-transparent"
          }`}
        >
          <Check size={14} strokeWidth={3} />
        </span>
        <span
          className={`min-w-0 flex-1 text-[15px] leading-snug ${
            done ? "text-slate-400 line-through" : "text-slate-800"
          }`}
        >
          {children}
        </span>
        {meta}
      </button>
    </li>
  );
}
