'use client';

interface Props {
  view: 'map' | 'list';
  onToggle: () => void;
  className?: string;
}

export function ViewToggleFab({ view, onToggle, className = '' }: Props) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={`inline-flex items-center gap-2 rounded-full bg-ink px-5 py-3 text-sm font-bold text-white shadow-xl transition-transform active:scale-95 ${className}`}
    >
      {view === 'map' ? (
        <>
          목록 보기 <span aria-hidden>☰</span>
        </>
      ) : (
        <>
          지도 보기 <span aria-hidden>🗺️</span>
        </>
      )}
    </button>
  );
}
