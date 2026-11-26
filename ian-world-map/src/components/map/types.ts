import type { Category, GeoPoint } from '@/lib/types';

export interface MapMarker {
  id: string;
  position: GeoPoint;
  label: string;
  category: Category;
}

export interface MapInsets {
  top?: number;
  right?: number;
  bottom?: number;
  left?: number;
}

/**
 * 지도 공급자(Leaflet / Google / Kakao)가 공통으로 구현해야 하는 props.
 * 페이지 코드는 이 인터페이스에만 의존합니다.
 */
export interface MapViewProps {
  markers: MapMarker[];
  /** 클릭으로 선택된 장소 (강조 + 필요 시 이동) */
  selectedId: string | null;
  /** 리스트에서 hover 중인 장소 (강조만) */
  hoveredId: string | null;
  /** 선택 시 지도를 이동시킬지 (지도에서 직접 클릭한 경우엔 이동 불필요) */
  panOnSelect: boolean;
  onMarkerClick: (id: string) => void;
  onMarkerHover?: (id: string | null) => void;
  onMapClick?: () => void;
  /** 마커가 없을 때 기본 위치 */
  fallbackCenter: GeoPoint;
  fallbackZoom: number;
  /** 지도 위를 덮는 UI(모바일 캐러셀 등) 만큼 여백을 두고 fit/pan */
  insets?: MapInsets;
  className?: string;
}
