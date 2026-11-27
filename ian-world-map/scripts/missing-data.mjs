// 실제 여행 데이터에서 아직 비어 있는(미입력) 항목을 뽑아 입력용 체크리스트를 만듭니다.
//   npm run data:missing            → 화면 출력
//   npm run data:missing -- --write → docs/data-checklist.md 저장
import { readdirSync, readFileSync, statSync, writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const readJSON = (...p) => JSON.parse(readFileSync(join(root, ...p), 'utf8'));
const places = readJSON('data', 'places.json');
const regions = readJSON('data', 'regions.json');
const AMENITY = { highChair: '유아용 의자', strollerAccess: '유모차 진입', diaperStation: '기저귀 갈이대', nursingRoom: '수유실', babyMenu: '아기 메뉴' };

const out = [];
const w = (s = '') => out.push(s);
w('# 실제 데이터 입력 체크리스트');
w();
w('> `npm run data:missing -- --write`로 자동 생성됩니다. 아는 것만 적어 주세요. 모르는 칸은 비워 두면 계속 "미입력"으로 표시돼요.');
w('> 편의시설: 있음 / 없음 / 모름 · 편의성: 좋음 / 보통 / 불편 · 추천도: 1~5');

const tripsDir = join(root, 'data', 'trips');
for (const folder of readdirSync(tripsDir).filter((f) => statSync(join(tripsDir, f)).isDirectory())) {
  const trip = readJSON('data', 'trips', folder, 'trip.json');
  const itinerary = readJSON('data', 'trips', folder, 'itinerary.json');
  const expenses = readJSON('data', 'trips', folder, 'expenses.json');
  const reviews = readJSON('data', 'trips', folder, 'child-reviews.json');
  w();
  w(`## 여행: ${trip.title} (${trip.startDate} ~ ${trip.endDate})`);
  w();
  w('### 여행 전체');
  if (!trip.summary) w('- [ ] 한 줄 소개 (예: 첫 해외여행, 료칸 위주 등)');
  for (const s of trip.stays) {
    const r = regions.find((x) => x.id === s.regionId)?.name ?? s.regionId;
    if (!s.placeId) w(`- [ ] ${r} ${s.nights}박 숙소가 어디였나요?`);
  }
  if (expenses.every((e) => e.granularity === 'category-total')) w('- [ ] (선택) 개별 결제 건: 날짜 / 가게 / 금액');
  if (!expenses.some((e) => e.kind === 'estimate')) w('- [ ] (선택) 다음에 같은 여행을 간다면 예상 비용 (항목별)');
  if (!trip.coverImage) w('- [ ] 대표 사진 1장');

  w();
  w('### 일정');
  for (const d of itinerary) {
    for (const it of d.items) {
      const missing = [];
      if (!it.placeId && !['transport', 'flight'].includes(it.kind)) missing.push('가게 이름');
      if (!it.time) missing.push('시간');
      if (it.stayMinutes == null && ['place', 'meal', 'shopping'].includes(it.kind)) missing.push('머문 시간');
      if (missing.length) w(`- [ ] DAY ${d.day} ${it.title}: ${missing.join(', ')}`);
    }
  }

  w();
  w('### 방문 장소');
  const placeIds = [...new Set(itinerary.flatMap((d) => d.items.map((i) => i.placeId)).filter(Boolean))];
  for (const id of placeIds) {
    const p = places.find((x) => x.id === id);
    if (!p) continue;
    const lines = [];
    const unknownAmenities = Object.entries(AMENITY).filter(([k]) => p.amenities[k] === null).map(([, v]) => v);
    if (unknownAmenities.length) lines.push(`편의시설 (${unknownAmenities.join(' / ')})`);
    if (!p.childFriendliness.stroller) lines.push('유모차 이동 편의성');
    if (!p.childFriendliness.meal && ['restaurant', 'stay'].includes(p.category)) lines.push('식사 편의성');
    if (!reviews.some((r) => r.placeId === id)) lines.push('아이 반응 · 추천도 · 머문 시간 · 한 줄 후기');
    if (!p.ageRanges.length) lines.push('추천 개월 수');
    if (!p.thumbnail) lines.push('사진');
    if (!p.location) lines.push('주소 또는 구글맵 링크 (지도 표시용)');
    else if (p.location.precision === 'approximate') lines.push('(선택) 정확한 주소 — 지금은 대략 위치');
    if (lines.length) {
      w(`- **${p.name}**`);
      lines.forEach((l) => w(`  - [ ] ${l}`));
    }
  }
}

const text = out.join('\n') + '\n';
if (process.argv.includes('--write')) {
  mkdirSync(join(root, 'docs'), { recursive: true });
  writeFileSync(join(root, 'docs', 'data-checklist.md'), text);
  console.log('docs/data-checklist.md 저장');
} else {
  process.stdout.write(text);
}
