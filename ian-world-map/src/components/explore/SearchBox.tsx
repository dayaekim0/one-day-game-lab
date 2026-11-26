'use client';

import { useEffect, useState } from 'react';

interface Props {
  value: string;
  onChange: (q: string) => void;
}

/** 장소 이름·현지명·태그·지역 검색 (입력 300ms 후 반영) */
export function SearchBox({ value, onChange }: Props) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  useEffect(() => {
    if (text === value) return;
    const t = setTimeout(() => onChange(text.trim()), 300);
    return () => clearTimeout(t);
  }, [text, value, onChange]);

  return (
    <label className="relative block">
      <span className="sr-only">장소 검색</span>
      <span className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-sm" aria-hidden>
        🔍
      </span>
      <input
        type="search"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder="장소·지역 검색 (예: 수족관, 오타루, 大通)"
        className="h-11 w-full rounded-full border border-line bg-white pl-10 pr-4 text-sm shadow-sm outline-none focus:border-ink focus:ring-1 focus:ring-ink"
        maxLength={50}
      />
    </label>
  );
}
