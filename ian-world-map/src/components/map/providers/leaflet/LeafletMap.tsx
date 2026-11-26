'use client';

import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import { useEffect, useMemo, useRef, useState } from 'react';
import { MapContainer, Marker, TileLayer, ZoomControl, useMap, useMapEvents } from 'react-leaflet';
import { CATEGORIES } from '@/lib/constants';
import type { Category } from '@/lib/types';
import type { MapInsets, MapMarker, MapViewProps } from '../../types';

/** 키 없이 쓸 수 있는 CARTO Voyager 타일 (OSM 데이터). 교체 시 여기만 수정 */
const TILE = {
  url: 'https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png',
  attribution:
    '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
  subdomains: 'abcd',
  maxZoom: 19,
};

const CATEGORY_EMOJI = Object.fromEntries(CATEGORIES.map((c) => [c.value, c.emoji])) as Record<
  Category,
  string
>;

type PinState = 'default' | 'hovered' | 'selected';

/** 화면상 이 거리(px) 이내의 핀은 하나의 묶음으로 표시 */
const CLUSTER_RADIUS_PX = 44;

const escapeHtml = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);

/**
 * 아이콘 DOM은 장소별로 한 번만 만들고, hover/선택 상태는 class만 바꿉니다.
 * (상태마다 아이콘을 교체하면 클릭 도중 DOM이 바뀌어 클릭이 씹힐 수 있음)
 */
const iconCache = new Map<string, L.DivIcon>();
function pinIcon(marker: MapMarker): L.DivIcon {
  const key = `${marker.id}|${marker.category}|${marker.label}`;
  let icon = iconCache.get(key);
  if (!icon) {
    icon = L.divIcon({
      className: 'iwm-pin-wrap',
      html: `<div class="iwm-pin iwm-pin--default"><span class="iwm-pin__emoji">${
        CATEGORY_EMOJI[marker.category]
      }</span><span class="iwm-pin__label">${escapeHtml(marker.label)}</span></div>`,
      iconSize: [0, 0],
      iconAnchor: [0, 0],
    });
    iconCache.set(key, icon);
  }
  return icon;
}

function clusterIcon(count: number) {
  return L.divIcon({
    className: 'iwm-pin-wrap',
    html: `<div class="iwm-cluster iwm-cluster--default">${count}곳</div>`,
    iconSize: [0, 0],
    iconAnchor: [0, 0],
  });
}

/** 마커 DOM에 상태 class / zIndex 반영 */
function useMarkerState(ref: React.RefObject<L.Marker | null>, base: 'iwm-pin' | 'iwm-cluster', state: PinState) {
  useEffect(() => {
    const marker = ref.current;
    if (!marker) return;
    const apply = () => {
      const el = marker.getElement()?.querySelector(`.${base}`);
      if (el) el.className = `${base} ${base}--${state}`;
      marker.setZIndexOffset(state === 'selected' ? 1000 : state === 'hovered' ? 900 : base === 'iwm-cluster' ? 500 : 0);
    };
    apply();
    marker.on('add', apply); // 지도에 다시 붙을 때(줌 등) 재적용
    return () => {
      marker.off('add', apply);
    };
  }, [ref, base, state]);
}

function PinMarker({
  item,
  onMarkerClick,
  onMarkerHover,
}: {
  item: PinItem;
  onMarkerClick: (id: string) => void;
  onMarkerHover?: (id: string | null) => void;
}) {
  const ref = useRef<L.Marker>(null);
  const { m, state } = item;
  useMarkerState(ref, 'iwm-pin', state);
  const handlers = useMemo<L.LeafletEventHandlerFnMap>(
    () => ({
      click: (e) => {
        L.DomEvent.stopPropagation(e);
        onMarkerClick(m.id);
      },
      mouseover: () => onMarkerHover?.(m.id),
      mouseout: () => onMarkerHover?.(null),
    }),
    [m.id, onMarkerClick, onMarkerHover],
  );
  return (
    <Marker
      ref={ref}
      position={[m.position.lat, m.position.lng]}
      icon={pinIcon(m)}
      keyboard
      title={m.label}
      eventHandlers={handlers}
    />
  );
}

function ClusterMarker({ group, insets }: { group: PinItem[]; insets?: MapInsets }) {
  const map = useMap();
  const ref = useRef<L.Marker>(null);
  const state: PinState = group.some((x) => x.state === 'selected')
    ? 'selected'
    : group.some((x) => x.state === 'hovered')
      ? 'hovered'
      : 'default';
  useMarkerState(ref, 'iwm-cluster', state);
  const lat = group.reduce((s, x) => s + x.m.position.lat, 0) / group.length;
  const lng = group.reduce((s, x) => s + x.m.position.lng, 0) / group.length;
  const icon = useMemo(() => clusterIcon(group.length), [group.length]);
  return (
    <Marker
      ref={ref}
      position={[lat, lng]}
      icon={icon}
      keyboard
      title={`${group.map((x) => x.m.label).join(', ')} (눌러서 확대)`}
      eventHandlers={{
        click: (e) => {
          L.DomEvent.stopPropagation(e);
          const b = L.latLngBounds(group.map((x) => [x.m.position.lat, x.m.position.lng]));
          map.flyToBounds(b, { ...paddingFor(insets, 80), maxZoom: 16, duration: 0.6 });
        },
      }}
    />
  );
}

function paddingFor(insets: MapInsets = {}, base = 48) {
  return {
    paddingTopLeft: L.point((insets.left ?? 0) + base, (insets.top ?? 0) + base),
    paddingBottomRight: L.point((insets.right ?? 0) + base, (insets.bottom ?? 0) + base),
  };
}

/** 마커 집합이 바뀌면(필터 변경) 전체가 보이도록 맞춤 */
function FitToMarkers({
  markers,
  insets,
  fallbackCenter,
  fallbackZoom,
}: Pick<MapViewProps, 'markers' | 'insets' | 'fallbackCenter' | 'fallbackZoom'>) {
  const map = useMap();
  const key = markers.map((m) => m.id).join(',');
  const insetsKey = JSON.stringify(insets ?? {});
  useEffect(() => {
    if (markers.length === 0) {
      map.setView([fallbackCenter.lat, fallbackCenter.lng], fallbackZoom);
      return;
    }
    if (markers.length === 1) {
      map.setView([markers[0].position.lat, markers[0].position.lng], 15);
      return;
    }
    const bounds = L.latLngBounds(markers.map((m) => [m.position.lat, m.position.lng]));
    map.fitBounds(bounds, { ...paddingFor(insets), maxZoom: 15 });
    // markers/insets 내용은 key로 비교
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, key, insetsKey]);
  return null;
}

/** 리스트/캐러셀에서 선택하면 해당 핀이 화면 안에 들어오도록 이동 */
function PanToSelected({
  markers,
  selectedId,
  panOnSelect,
  insets,
}: Pick<MapViewProps, 'markers' | 'selectedId' | 'panOnSelect' | 'insets'>) {
  const map = useMap();
  useEffect(() => {
    if (!panOnSelect || !selectedId) return;
    const m = markers.find((x) => x.id === selectedId);
    if (!m) return;
    const ll = L.latLng(m.position.lat, m.position.lng);
    // 선택한 장소가 묶음(클러스터) 안에 있으면 개별 핀이 보일 때까지 확대
    const others = markers.filter((x) => x.id !== m.id).map((x) => L.latLng(x.position.lat, x.position.lng));
    const clustered = (z: number) =>
      others.some((o) => map.project(ll, z).distanceTo(map.project(o, z)) < CLUSTER_RADIUS_PX);
    let z = map.getZoom();
    while (clustered(z) && z < 17) z++;
    if (z !== map.getZoom()) {
      map.flyTo(ll, z, { duration: 0.6 });
      return;
    }
    map.panInside(ll, { ...paddingFor(insets, 64), animate: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [map, selectedId, panOnSelect]);
  return null;
}

/** 이 줌 이상이면 모든 핀에 이름 표시 */
const LABEL_ZOOM = 15;

function MapClickHandler({ onMapClick }: { onMapClick?: () => void }) {
  const map = useMapEvents({ click: () => onMapClick?.() });
  useEffect(() => {
    const syncLabels = () => {
      map.getContainer().classList.toggle('iwm-labels', map.getZoom() >= LABEL_ZOOM);
    };
    syncLabels();
    map.on('zoomend viewreset', syncLabels);
    return () => {
      map.off('zoomend viewreset', syncLabels);
    };
  }, [map]);
  return null;
}

/** 컨테이너 크기 변화(PC↔모바일 레이아웃 전환 등)에 맞춰 지도 크기 재계산 */
function ResizeWatcher() {
  const map = useMap();
  useEffect(() => {
    const el = map.getContainer();
    const ro = new ResizeObserver(() => map.invalidateSize());
    ro.observe(el);
    return () => ro.disconnect();
  }, [map]);
  return null;
}

interface PinItem {
  m: MapMarker;
  state: PinState;
}

/** 간단한 거리 기반 클러스터링 (외부 플러그인 없이) */
function ClusteredMarkers({
  items,
  onMarkerClick,
  onMarkerHover,
  insets,
}: {
  items: PinItem[];
  onMarkerClick: (id: string) => void;
  onMarkerHover?: (id: string | null) => void;
  insets?: MapInsets;
}) {
  const map = useMap();
  const [zoom, setZoom] = useState(() => map.getZoom());
  // 렌더마다 재등록하면 fitBounds 직후의 zoomend를 놓칠 수 있어 map 생성 시 한 번만 등록
  useEffect(() => {
    const sync = () => setZoom(map.getZoom());
    sync();
    map.on('zoomend viewreset', sync);
    return () => {
      map.off('zoomend viewreset', sync);
    };
  }, [map]);

  const groups = useMemo(() => {
    const pts = items.map((it) => ({
      it,
      p: map.project([it.m.position.lat, it.m.position.lng], zoom),
    }));
    const used = new Set<number>();
    const out: PinItem[][] = [];
    pts.forEach((a, i) => {
      if (used.has(i)) return;
      used.add(i);
      const g = [a.it];
      pts.forEach((b, j) => {
        if (!used.has(j) && a.p.distanceTo(b.p) < CLUSTER_RADIUS_PX) {
          used.add(j);
          g.push(b.it);
        }
      });
      out.push(g);
    });
    return out;
  }, [items, zoom, map]);

  return (
    <>
      {groups.map((g) =>
        g.length === 1 ? (
          <PinMarker
            key={g[0].m.id}
            item={g[0]}
            onMarkerClick={onMarkerClick}
            onMarkerHover={onMarkerHover}
          />
        ) : (
          <ClusterMarker key={'c:' + g.map((x) => x.m.id).join(',')} group={g} insets={insets} />
        ),
      )}
    </>
  );
}

export default function LeafletMap({
  markers,
  selectedId,
  hoveredId,
  panOnSelect,
  onMarkerClick,
  onMarkerHover,
  onMapClick,
  fallbackCenter,
  fallbackZoom,
  insets,
  className,
}: MapViewProps) {
  const initialCenter = useRef<[number, number]>([fallbackCenter.lat, fallbackCenter.lng]);

  const ordered = useMemo(() => {
    // 강조된 핀이 위로 오도록 zIndex 지정
    return markers.map((m) => {
      const state: PinState =
        m.id === selectedId ? 'selected' : m.id === hoveredId ? 'hovered' : 'default';
      return { m, state };
    });
  }, [markers, selectedId, hoveredId]);

  return (
    <MapContainer
      center={initialCenter.current}
      zoom={fallbackZoom}
      zoomControl={false}
      className={className ?? 'h-full w-full'}
      worldCopyJump
    >
      <TileLayer {...TILE} />
      <ZoomControl position="topright" />
      <ResizeWatcher />
      <FitToMarkers
        markers={markers}
        insets={insets}
        fallbackCenter={fallbackCenter}
        fallbackZoom={fallbackZoom}
      />
      <PanToSelected
        markers={markers}
        selectedId={selectedId}
        panOnSelect={panOnSelect}
        insets={insets}
      />
      <MapClickHandler onMapClick={onMapClick} />
      <ClusteredMarkers
        items={ordered}
        onMarkerClick={onMarkerClick}
        onMarkerHover={onMarkerHover}
        insets={insets}
      />
    </MapContainer>
  );
}
