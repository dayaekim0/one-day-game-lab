// 임시 페이지: 데이터 레이어 확인용. 다음 단계에서 탐색 UI(헤더 + 리스트/지도)로 교체됩니다.
import { api } from '@/lib/api';
import { CATEGORIES } from '@/lib/constants';

export default async function Home() {
  const [regions, places] = await Promise.all([api.places.listRegions(), api.places.listPlaces()]);
  return (
    <main className="mx-auto max-w-2xl p-6">
      <h1 className="text-2xl font-bold">이안이와 세계지도 🗺️</h1>
      <p className="mt-1 text-sm text-muted">데이터 레이어 확인용 임시 화면이에요.</p>
      {regions.map((r) => (
        <section key={r.id} className="mt-6">
          <h2 className="text-lg font-semibold">{r.name}</h2>
          <ul className="mt-2 space-y-1 text-sm">
            {places
              .filter((p) => p.regionId === r.id)
              .map((p) => (
                <li key={p.id}>
                  {CATEGORIES.find((c) => c.value === p.category)?.emoji} {p.name}
                  <span className="text-muted"> · {p.shortDescription}</span>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </main>
  );
}
