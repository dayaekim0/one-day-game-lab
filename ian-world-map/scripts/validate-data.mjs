// data/ 무결성 검사: npm run validate:data
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const readJSON = (...p) => JSON.parse(readFileSync(join(root, ...p), 'utf8'));
const places = readJSON('data', 'places.json');
const regions = readJSON('data', 'regions.json');
const reviews = readJSON('data', 'seed-reviews.json');

const errors = [];
const warnings = [];
const AGE = ['6-12', '13-24', '24+'];
const CAT = ['restaurant', 'activity', 'stay', 'transport'];
const PTYPE = ['airport', 'ryokan', 'hotel', 'aquarium', 'zoo', 'park', 'museum', 'shop', 'restaurant', 'cafe', 'campus', 'beach', 'theme-park', 'mall', 'other'];
const SEASON = ['spring', 'summer', 'autumn', 'winter'];
const AMENITY = ['highChair', 'strollerAccess', 'diaperStation', 'nursingRoom', 'babyMenu'];
const EASE = ['good', 'fair', 'poor', null];
const EXP_CAT = ['lodging', 'flight', 'shopping', 'food', 'transport', 'etc'];
const ITEM_KIND = ['place', 'lodging', 'meal', 'shopping', 'transport', 'flight', 'other'];
const DATE = /^\d{4}-\d{2}-\d{2}$/;

const idSet = (arr, label) => {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x.id)) errors.push(`${label}: 중복 id "${x.id}"`);
    seen.add(x.id);
  }
  return seen;
};
const regionIds = idSet(regions, 'regions');
const placeIds = idSet(places, 'places');
idSet(reviews, 'seed-reviews');

const checkImage = (url, where) => {
  if (url && url.startsWith('/') && !existsSync(join(root, 'public', url))) {
    errors.push(`${where}: 이미지 파일 없음 ${url}`);
  }
};

// ── places ──────────────────────────────
for (const p of places) {
  const at = `places[${p.id}]`;
  if (!regionIds.has(p.regionId)) errors.push(`${at}: 없는 regionId "${p.regionId}"`);
  if (!CAT.includes(p.category)) errors.push(`${at}: 잘못된 category "${p.category}"`);
  if (!PTYPE.includes(p.placeType)) errors.push(`${at}: 잘못된 placeType "${p.placeType}"`);
  if (typeof p.isSample !== 'boolean') errors.push(`${at}: isSample 누락`);
  if (!Array.isArray(p.ageRanges) || p.ageRanges.some((a) => !AGE.includes(a))) errors.push(`${at}: ageRanges 확인`);
  if (!Array.isArray(p.seasons) || p.seasons.some((s) => !SEASON.includes(s))) errors.push(`${at}: seasons 확인`);
  for (const k of AMENITY) {
    const v = p.amenities?.[k];
    if (!(v === true || v === false || v === null)) errors.push(`${at}: amenities.${k}는 true/false/null 중 하나`);
  }
  if (!p.childFriendliness || !EASE.includes(p.childFriendliness.stroller) || !EASE.includes(p.childFriendliness.meal))
    errors.push(`${at}: childFriendliness 확인`);
  if (p.location !== null) {
    const { lat, lng, precision } = p.location ?? {};
    if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) errors.push(`${at}: 좌표 확인`);
    if (!['exact', 'approximate'].includes(precision)) errors.push(`${at}: location.precision 확인`);
  }
  checkImage(p.thumbnail, at);
  p.editorReview?.photos?.forEach((ph) => checkImage(ph.url, at));
  if (p.affiliateLink && !/^https?:\/\//.test(p.affiliateLink.url)) errors.push(`${at}: affiliateLink.url 확인`);
  if (!p.isSample && p.editorReview) warnings.push(`${at}: 실제 장소에 editorReview가 있어요. 실제 경험인지 확인하세요.`);
}

// ── regions ─────────────────────────────
for (const r of regions) {
  if (typeof r.guideIsSample !== 'boolean') errors.push(`regions[${r.id}]: guideIsSample 누락`);
  for (const d of r.itinerary) {
    for (const id of d.placeIds) {
      if (!placeIds.has(id)) errors.push(`regions[${r.id}] Day${d.day}: 없는 placeId "${id}"`);
    }
  }
  r.gearRecommendations.forEach((g) => checkImage(g.image, `regions[${r.id}].gear[${g.id}]`));
}

for (const rv of reviews) {
  if (!placeIds.has(rv.placeId)) errors.push(`seed-reviews[${rv.id}]: 없는 placeId "${rv.placeId}"`);
  if (rv.tip.length > 100) errors.push(`seed-reviews[${rv.id}]: tip 100자 초과`);
}

// ── trips ───────────────────────────────
const tripsDir = join(root, 'data', 'trips');
const registry = readFileSync(join(root, 'src/lib/api/local/trips-registry.ts'), 'utf8');
const FILES = ['trip.json', 'itinerary.json', 'expenses.json', 'child-reviews.json', 'contents.json'];
const tripFolders = readdirSync(tripsDir).filter((f) => statSync(join(tripsDir, f)).isDirectory());
let tripCount = 0;

for (const folder of tripFolders) {
  const at = `trips/${folder}`;
  const missing = FILES.filter((f) => !existsSync(join(tripsDir, folder, f)));
  if (missing.length) {
    errors.push(`${at}: 파일 없음 ${missing.join(', ')}`);
    continue;
  }
  tripCount++;
  if (!registry.includes(`@data/trips/${folder}/trip.json`))
    errors.push(`${at}: src/lib/api/local/trips-registry.ts 에 등록되지 않았어요`);
  const t = readJSON('data', 'trips', folder, 'trip.json');
  const itinerary = readJSON('data', 'trips', folder, 'itinerary.json');
  const expenses = readJSON('data', 'trips', folder, 'expenses.json');
  const childReviews = readJSON('data', 'trips', folder, 'child-reviews.json');
  const contents = readJSON('data', 'trips', folder, 'contents.json');

  if (t.id !== folder) errors.push(`${at}: trip.id("${t.id}")가 폴더 이름과 달라요`);
  for (const r of t.regionIds) if (!regionIds.has(r)) errors.push(`${at}: 없는 regionId "${r}"`);
  if (!DATE.test(t.startDate) || !DATE.test(t.endDate)) errors.push(`${at}: 날짜 형식은 YYYY-MM-DD`);
  const start = new Date(`${t.startDate}T00:00:00Z`);
  const span = Math.round((new Date(`${t.endDate}T00:00:00Z`) - start) / 86400000);
  if (span !== t.nights) errors.push(`${at}: nights(${t.nights})가 기간(${span}박)과 달라요`);
  if (t.days !== t.nights + 1) errors.push(`${at}: days는 nights + 1`);
  const stayNights = t.stays.reduce((s, x) => s + x.nights, 0);
  if (t.stays.length && stayNights !== t.nights) errors.push(`${at}: stays 박수 합(${stayNights}) ≠ nights(${t.nights})`);
  for (const s of t.stays) {
    if (!regionIds.has(s.regionId)) errors.push(`${at}: stays 없는 regionId "${s.regionId}"`);
    if (s.placeId && !placeIds.has(s.placeId)) errors.push(`${at}: stays 없는 placeId "${s.placeId}"`);
  }
  if (!t.party?.adults || !Array.isArray(t.party.children)) errors.push(`${at}: party 확인`);

  // 일정
  const days = new Set();
  for (const d of itinerary) {
    if (d.tripId !== t.id) errors.push(`${at} DAY${d.day}: tripId 불일치`);
    if (days.has(d.day)) errors.push(`${at}: DAY${d.day} 중복`);
    days.add(d.day);
    if (d.day < 1 || d.day > t.days) errors.push(`${at}: DAY${d.day}는 여행 기간 밖이에요`);
    if (d.date) {
      const expected = new Date(start.getTime() + (d.day - 1) * 86400000).toISOString().slice(0, 10);
      if (d.date !== expected) errors.push(`${at} DAY${d.day}: date ${d.date} ≠ ${expected}`);
    }
    if (d.overnightRegionId && !regionIds.has(d.overnightRegionId)) errors.push(`${at} DAY${d.day}: 없는 overnightRegionId`);
    for (const it of d.items) {
      if (!ITEM_KIND.includes(it.kind)) errors.push(`${at} DAY${d.day}: 잘못된 kind "${it.kind}"`);
      if (it.placeId && !placeIds.has(it.placeId)) errors.push(`${at} DAY${d.day}: 없는 placeId "${it.placeId}"`);
    }
  }

  // 비용: 실제 결제 합계 = totalPaid, 예상 비용은 별도
  const ids = new Set();
  for (const e of expenses) {
    if (ids.has(e.id)) errors.push(`${at}: 중복 expense id "${e.id}"`);
    ids.add(e.id);
    if (e.tripId !== t.id) errors.push(`${at}: expense ${e.id} tripId 불일치`);
    if (!['actual', 'estimate'].includes(e.kind)) errors.push(`${at}: expense ${e.id} kind는 actual/estimate`);
    if (!EXP_CAT.includes(e.category)) errors.push(`${at}: expense ${e.id} 잘못된 category`);
    if (!Number.isInteger(e.amount) || e.amount < 0) errors.push(`${at}: expense ${e.id} amount는 0 이상의 정수`);
    if (e.currency !== t.currency) errors.push(`${at}: expense ${e.id} 통화(${e.currency})가 여행 통화(${t.currency})와 달라요`);
    if (e.placeId && !placeIds.has(e.placeId)) errors.push(`${at}: expense ${e.id} 없는 placeId`);
  }
  const actualSum = expenses.filter((e) => e.kind === 'actual').reduce((s, e) => s + e.amount, 0);
  if (t.totalPaid != null && expenses.some((e) => e.kind === 'actual') && actualSum !== t.totalPaid)
    errors.push(`${at}: 실제 결제 합계 ${actualSum.toLocaleString()} ≠ totalPaid ${t.totalPaid.toLocaleString()}`);

  for (const r of childReviews) {
    if (r.tripId !== t.id) errors.push(`${at}: child review ${r.id} tripId 불일치`);
    if (r.placeId && !placeIds.has(r.placeId)) errors.push(`${at}: child review ${r.id} 없는 placeId`);
    if (r.rating != null && ![1, 2, 3, 4, 5].includes(r.rating)) errors.push(`${at}: child review ${r.id} rating은 1~5 또는 null`);
  }
  for (const c of contents) {
    if (c.tripId !== t.id) errors.push(`${at}: content ${c.id} tripId 불일치`);
    if (!/^https?:\/\//.test(c.url)) errors.push(`${at}: content ${c.id} url 확인`);
    if (c.placeId && !placeIds.has(c.placeId)) errors.push(`${at}: content ${c.id} 없는 placeId`);
  }
}

warnings.forEach((w) => console.warn('⚠ ' + w));
if (errors.length) {
  console.error(`❌ 데이터 오류 ${errors.length}건\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(
  `✅ places ${places.length} (실제 ${places.filter((p) => !p.isSample).length}) · regions ${regions.length} · trips ${tripCount} · seed-reviews ${reviews.length} 이상 없음`,
);
