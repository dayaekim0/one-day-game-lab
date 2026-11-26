'use client';

import type { ButtonHTMLAttributes } from 'react';

interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  active?: boolean;
}

export function Chip({ active, className = '', children, ...rest }: ChipProps) {
  return (
    <button
      type="button"
      aria-pressed={active}
      className={`inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full border px-3.5 py-1.5 text-sm transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ink ${
        active
          ? 'border-ink bg-ink font-semibold text-white'
          : 'border-line bg-white text-ink hover:border-ink'
      } ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}
