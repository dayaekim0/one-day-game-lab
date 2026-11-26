'use client';

import { useEffect, useId, useRef, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

interface ModalProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  footer?: ReactNode;
  /** PC에서의 최대 너비 */
  size?: 'md' | 'lg' | 'xl';
}

const SIZE = { md: 'lg:max-w-lg', lg: 'lg:max-w-2xl', xl: 'lg:max-w-4xl' };

/**
 * 모바일: 아래에서 올라오는 전체 높이 시트 / PC: 가운데 다이얼로그.
 * Esc 닫기, 배경 클릭 닫기, 스크롤 잠금, 포커스 복귀 처리.
 */
export function Modal({ open, onClose, title, children, footer, size = 'md' }: ModalProps) {
  const titleId = useId();
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKey);
    const first = panelRef.current?.querySelector<HTMLElement>(
      'input, select, textarea, button:not([data-modal-close])',
    );
    (first ?? panelRef.current)?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      window.removeEventListener('keydown', onKey);
      prevFocus?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[2000] flex items-end justify-center lg:items-center lg:p-6">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} aria-hidden />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={`relative flex max-h-[92dvh] w-full flex-col overflow-hidden rounded-t-2xl bg-white shadow-2xl outline-none lg:max-h-[88vh] lg:rounded-2xl ${SIZE[size]}`}
      >
        <header className="flex shrink-0 items-center gap-2 border-b border-line px-4 py-3">
          <button
            type="button"
            data-modal-close
            onClick={onClose}
            aria-label="닫기"
            className="-ml-1 flex h-9 w-9 items-center justify-center rounded-full text-lg hover:bg-gray-100"
          >
            ✕
          </button>
          <h2 id={titleId} className="flex-1 truncate text-center text-base font-bold">
            {title}
          </h2>
          <span className="w-9" aria-hidden />
        </header>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain">{children}</div>
        {footer && (
          <footer className="shrink-0 border-t border-line px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
            {footer}
          </footer>
        )}
      </div>
    </div>,
    document.body,
  );
}
