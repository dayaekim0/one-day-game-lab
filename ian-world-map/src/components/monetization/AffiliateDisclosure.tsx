import type { ReactNode } from 'react';
import { AFFILIATE_DISCLOSURE, COUPANG_PARTNERS_DISCLOSURE } from '@/lib/constants';
import type { AffiliateLink } from '@/lib/types';

/**
 * 제휴 링크가 포함된 영역. links 중 하나라도 있으면 하단에 수수료 고지 문구가 자동으로 붙음.
 * 쿠팡 링크가 있으면 쿠팡 파트너스 필수 문구도 함께 표시.
 */
export function AffiliateSection({
  links,
  children,
  className = '',
}: {
  links: (AffiliateLink | null | undefined)[];
  children: ReactNode;
  className?: string;
}) {
  const present = links.filter((l): l is AffiliateLink => !!l);
  return (
    <div className={className}>
      {children}
      {present.length > 0 && (
        <div className="mt-2 space-y-0.5 text-[11px] leading-snug text-gray-400" data-affiliate-disclosure>
          {present.some((l) => l.provider === 'coupang') && <p>{COUPANG_PARTNERS_DISCLOSURE}</p>}
          <p>{AFFILIATE_DISCLOSURE}</p>
        </div>
      )}
    </div>
  );
}
