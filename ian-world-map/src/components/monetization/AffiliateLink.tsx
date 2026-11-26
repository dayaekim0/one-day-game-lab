import type { ReactNode } from 'react';
import { AFFILIATE_PROVIDER_LABEL, DEFAULT_AFFILIATE_CTA } from '@/lib/constants';
import type { AffiliateLink as AffiliateLinkData } from '@/lib/types';

interface Props {
  link: AffiliateLinkData;
  variant?: 'cta' | 'inline';
  children?: ReactNode;
  className?: string;
}

/** 제휴 링크. 검색엔진·광고 정책에 맞게 rel="sponsored" 표시 */
export function AffiliateLink({ link, variant = 'cta', children, className = '' }: Props) {
  const label = children ?? link.label ?? DEFAULT_AFFILIATE_CTA;
  const cls =
    variant === 'cta'
      ? 'flex w-full items-center justify-center gap-2 rounded-xl bg-brand px-4 py-3.5 font-bold text-white shadow-sm hover:bg-brand-dark'
      : 'inline-flex items-center gap-1 text-sm font-semibold text-ink underline underline-offset-2';
  return (
    <a
      href={link.url}
      target="_blank"
      rel="sponsored noopener noreferrer nofollow"
      data-affiliate-provider={link.provider}
      className={`${cls} ${className}`}
    >
      {label}
      {variant === 'cta' && (
        <span className="text-xs font-medium opacity-80">· {AFFILIATE_PROVIDER_LABEL[link.provider]} ↗</span>
      )}
    </a>
  );
}
