"use client";

import { Plus, RotateCcw, Trash2 } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { Category } from "@/lib/types";
import { CategoryBadge, CategorySelect } from "./ui";

/** 루틴·주간 미션 공용 편집 패널 */
export default function EditableList({
  items,
  withMinutes,
  onAdd,
  onRemove,
  onReset,
  placeholder,
}: {
  items: { id: string; title: string; category: Category; minutes?: number }[];
  withMinutes?: boolean;
  onAdd: (v: { title: string; category: Category; minutes: number }) => void;
  onRemove: (id: string) => void;
  onReset: () => void;
  placeholder: string;
}) {
  const [title, setTitle] = useState("");
  const [minutes, setMinutes] = useState(2);
  const [category, setCategory] = useState<Category>("gonggu");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    const t = title.trim();
    if (!t) return;
    onAdd({ title: t, category, minutes: Math.max(1, Math.min(60, minutes || 1)) });
    setTitle("");
  };

  return (
    <div className="space-y-3">
      <ul className="space-y-2">
        {items.map((it) => (
          <li
            key={it.id}
            className="flex items-center gap-2 rounded-2xl bg-slate-50 px-3 py-2.5 text-sm"
          >
            <CategoryBadge category={it.category} />
            <span className="min-w-0 flex-1 truncate text-slate-700">{it.title}</span>
            {withMinutes && <span className="text-xs text-slate-400">{it.minutes}분</span>}
            <button
              type="button"
              onClick={() => onRemove(it.id)}
              className="grid h-8 w-8 place-items-center rounded-full text-slate-400 hover:bg-rose-50 hover:text-rose-500"
              aria-label={`${it.title} 삭제`}
            >
              <Trash2 size={16} />
            </button>
          </li>
        ))}
        {items.length === 0 && (
          <li className="rounded-2xl border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
            항목이 없어요. 아래에서 추가해 보세요.
          </li>
        )}
      </ul>

      <form onSubmit={submit} className="space-y-2.5 rounded-2xl border border-slate-200 p-3">
        <CategorySelect value={category} onChange={setCategory} />
        <div className="flex gap-2">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder={placeholder}
            className="min-w-0 flex-1 rounded-xl bg-slate-50 px-3 py-2.5 text-sm outline-none ring-1 ring-slate-200 focus:ring-2 focus:ring-slate-900"
          />
          {withMinutes && (
            <label className="flex items-center gap-1 rounded-xl bg-slate-50 px-2 text-xs text-slate-500 ring-1 ring-slate-200">
              <input
                type="number"
                inputMode="numeric"
                min={1}
                max={60}
                value={minutes}
                onChange={(e) => setMinutes(Number(e.target.value))}
                className="w-9 bg-transparent text-right text-sm text-slate-900 outline-none"
                aria-label="소요 시간(분)"
              />
              분
            </label>
          )}
          <button
            type="submit"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-slate-900 text-white disabled:opacity-40"
            disabled={!title.trim()}
            aria-label="추가"
          >
            <Plus size={18} />
          </button>
        </div>
      </form>

      <button
        type="button"
        onClick={() => {
          if (window.confirm("기본 목록으로 되돌릴까요?")) onReset();
        }}
        className="flex items-center gap-1 text-xs text-slate-400 hover:text-slate-600"
      >
        <RotateCcw size={12} /> 기본 목록으로 되돌리기
      </button>
    </div>
  );
}
