'use client';

import { useEffect, useRef } from 'react';

declare global {
  interface Window {
    adsbygoogle?: unknown[];
  }
}

interface AdBannerSlotProps {
  /** 애드센스 광고 단위 ID (data-ad-slot) */
  slotId: string;
  /** 위치 식별용 (분석/디버깅) */
  placement: 'list-inline' | 'detail-bottom' | 'guide-bottom';
  className?: string;
}

const ADSENSE_CLIENT = process.env.NEXT_PUBLIC_ADSENSE_CLIENT; // ca-pub-xxxxxxxx

/**
 * 광고 자리.
 * - NEXT_PUBLIC_ADSENSE_CLIENT 가 없으면 레이아웃 확인용 자리표시자만 보여 줍니다.
 * - 설정하면 애드센스 <ins> 태그를 렌더링합니다. (layout.tsx에 adsbygoogle.js 스크립트 추가 필요)
 */
export function AdBannerSlot({ slotId, placement, className = '' }: AdBannerSlotProps) {
  const pushed = useRef(false);

  useEffect(() => {
    if (!ADSENSE_CLIENT || pushed.current) return;
    pushed.current = true;
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch {
      /* 광고 차단기 등 */
    }
  }, []);

  if (ADSENSE_CLIENT) {
    return (
      <div className={className} data-ad-placement={placement}>
        <ins
          className="adsbygoogle block"
          data-ad-client={ADSENSE_CLIENT}
          data-ad-slot={slotId}
          data-ad-format="auto"
          data-full-width-responsive="true"
        />
      </div>
    );
  }

  return (
    <div
      data-ad-placement={placement}
      className={`flex min-h-[96px] items-center justify-center rounded-xl border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400 ${className}`}
    >
      <span className="mr-1.5 rounded border border-gray-300 px-1 text-[10px] font-semibold">AD</span>
      광고 영역
    </div>
  );
}
