import { create } from 'zustand';

/** 선택이 어디서 일어났는지. 리스트↔지도 동기화 시 무한 루프/불필요한 스크롤 방지용 */
export type SelectSource = 'list' | 'map' | 'carousel';

interface ExploreState {
  hoveredId: string | null;
  selectedId: string | null;
  selectSource: SelectSource | null;
  /** 모바일 전용: 지도/목록 전환 */
  mobileView: 'map' | 'list';
  setHovered: (id: string | null) => void;
  select: (id: string | null, source: SelectSource) => void;
  setMobileView: (view: 'map' | 'list') => void;
}

export const useExploreStore = create<ExploreState>((set) => ({
  hoveredId: null,
  selectedId: null,
  selectSource: null,
  mobileView: 'map',
  setHovered: (hoveredId) => set({ hoveredId }),
  select: (selectedId, selectSource) => set({ selectedId, selectSource }),
  setMobileView: (mobileView) => set({ mobileView }),
}));
