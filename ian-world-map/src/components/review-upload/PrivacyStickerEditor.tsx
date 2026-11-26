'use client';

import { useEffect, useRef, useState, type PointerEvent as RPointerEvent } from 'react';
import { STICKER_EMOJIS, type Sticker } from '@/lib/image/stickers';

interface Props {
  previewUrl: string;
  stickers: Sticker[];
  onChange: (stickers: Sticker[]) => void;
}

const clamp = (v: number, min = 0, max = 1) => Math.min(max, Math.max(min, v));
const DEFAULT_SIZE = 0.2;

/**
 * 프라이버시 스티커: 사진을 탭하면 스티커가 붙고, 끌어서 옮기고, 크기를 조절할 수 있어요.
 * 저장할 때 사진에 합성되므로 스티커 아래 원본은 남지 않아요.
 */
export function PrivacyStickerEditor({ previewUrl, stickers, onChange }: Props) {
  const boxRef = useRef<HTMLDivElement>(null);
  const [emoji, setEmoji] = useState<string>(STICKER_EMOJIS[0]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const drag = useRef<{ id: string; moved: boolean } | null>(null);
  const [boxWidth, setBoxWidth] = useState(0);

  useEffect(() => {
    const el = boxRef.current;
    if (!el) return;
    const ro = new ResizeObserver(() => setBoxWidth(el.clientWidth));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const pointFrom = (e: RPointerEvent) => {
    const r = boxRef.current!.getBoundingClientRect();
    return { x: clamp((e.clientX - r.left) / r.width), y: clamp((e.clientY - r.top) / r.height) };
  };

  const update = (id: string, patch: Partial<Sticker>) =>
    onChange(stickers.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const addAt = (e: RPointerEvent<HTMLDivElement>) => {
    if (e.target !== e.currentTarget && !(e.target as HTMLElement).dataset.bg) return;
    const { x, y } = pointFrom(e);
    const s: Sticker = { id: crypto.randomUUID(), emoji, x, y, size: DEFAULT_SIZE };
    onChange([...stickers, s]);
    setSelectedId(s.id);
  };

  const selected = stickers.find((s) => s.id === selectedId) ?? null;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar" role="radiogroup" aria-label="스티커 고르기">
        {STICKER_EMOJIS.map((em) => (
          <button
            key={em}
            type="button"
            role="radio"
            aria-checked={emoji === em}
            onClick={() => {
              setEmoji(em);
              if (selected) update(selected.id, { emoji: em });
            }}
            className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xl ${
              emoji === em ? 'bg-ink/10 ring-2 ring-ink' : 'bg-gray-100'
            }`}
          >
            {em}
          </button>
        ))}
      </div>

      <div
        ref={boxRef}
        onPointerDown={addAt}
        className="relative cursor-crosshair touch-none select-none overflow-hidden rounded-xl bg-gray-100"
        aria-label="사진을 눌러 스티커 붙이기"
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={previewUrl} alt="업로드할 사진" data-bg="1" className="block w-full" draggable={false} />
        {stickers.map((s) => (
          <button
            key={s.id}
            type="button"
            aria-label={`스티커 ${s.emoji} (방향키로 이동, Delete로 삭제)`}
            onPointerDown={(e) => {
              e.stopPropagation();
              (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
              drag.current = { id: s.id, moved: false };
              setSelectedId(s.id);
            }}
            onPointerMove={(e) => {
              if (drag.current?.id !== s.id) return;
              drag.current.moved = true;
              update(s.id, pointFrom(e));
            }}
            onPointerUp={() => (drag.current = null)}
            onKeyDown={(e) => {
              const step = 0.01;
              const moves: Record<string, Partial<Sticker>> = {
                ArrowLeft: { x: clamp(s.x - step) },
                ArrowRight: { x: clamp(s.x + step) },
                ArrowUp: { y: clamp(s.y - step) },
                ArrowDown: { y: clamp(s.y + step) },
              };
              if (moves[e.key]) {
                e.preventDefault();
                update(s.id, moves[e.key]);
              } else if (e.key === 'Delete' || e.key === 'Backspace') {
                onChange(stickers.filter((x) => x.id !== s.id));
                setSelectedId(null);
              }
            }}
            onFocus={() => setSelectedId(s.id)}
            className={`absolute -translate-x-1/2 -translate-y-1/2 cursor-move leading-none ${
              s.id === selectedId ? 'outline-2 outline-dashed outline-white drop-shadow-[0_0_2px_rgba(0,0,0,.8)]' : ''
            }`}
            style={{
              left: `${s.x * 100}%`,
              top: `${s.y * 100}%`,
              fontSize: `${s.size * boxWidth}px`,
            }}
          >
            {s.emoji}
          </button>
        ))}
      </div>

      {selected ? (
        <div className="flex items-center gap-3">
          <label className="flex flex-1 items-center gap-2 text-sm">
            <span className="shrink-0">크기</span>
            <input
              type="range"
              min={0.08}
              max={0.6}
              step={0.01}
              value={selected.size}
              onChange={(e) => update(selected.id, { size: Number(e.target.value) })}
              className="w-full accent-ink"
            />
          </label>
          <button
            type="button"
            onClick={() => {
              onChange(stickers.filter((x) => x.id !== selected.id));
              setSelectedId(null);
            }}
            className="shrink-0 rounded-full border border-gray-300 px-3 py-1.5 text-sm"
          >
            스티커 삭제
          </button>
        </div>
      ) : (
        <p className="text-xs text-muted">
          아이 얼굴을 가리고 싶은 곳을 누르면 스티커가 붙어요. 끌어서 옮길 수 있어요.
        </p>
      )}
    </div>
  );
}
