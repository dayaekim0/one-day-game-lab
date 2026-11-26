// data/*.json 무결성 검사: npm run validate:data
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('..', import.meta.url).pathname;
const load = (f) => JSON.parse(readFileSync(join(root, 'data', f), 'utf8'));
const places = load('places.json');
const regions = load('regions.json');
const reviews = load('seed-reviews.json');

const errors = [];
const AGE = ['6-12', '13-24', '24+'];
const CAT = ['restaurant', 'activity', 'stay'];
const SEASON = ['spring', 'summer', 'autumn', 'winter'];
const AMENITY = ['highChair', 'strollerAccess', 'diaperStation', 'nursingRoom', 'babyMenu'];

const dupes = (arr, label) => {
  const seen = new Set();
  for (const x of arr) {
    if (seen.has(x.id)) errors.push(`${label}: 중복 id "${x.id}"`);
    seen.add(x.id);
  }
  return seen;
};
const regionIds = dupes(regions, 'regions');
const placeIds = dupes(places, 'places');
dupes(reviews, 'seed-reviews');

const checkImage = (url, where) => {
  if (url.startsWith('/') && !existsSync(join(root, 'public', url))) {
    errors.push(`${where}: 이미지 파일 없음 ${url}`);
  }
};

for (const p of places) {
  const at = `places[${p.id}]`;
  if (!regionIds.has(p.regionId)) errors.push(`${at}: 없는 regionId "${p.regionId}"`);
  if (!CAT.includes(p.category)) errors.push(`${at}: 잘못된 category "${p.category}"`);
  if (!p.ageRanges?.length || p.ageRanges.some((a) => !AGE.includes(a))) errors.push(`${at}: ageRanges 확인`);
  if (p.seasons?.some((s) => !SEASON.includes(s))) errors.push(`${at}: seasons 확인`);
  for (const k of AMENITY) if (typeof p.amenities?.[k] !== 'boolean') errors.push(`${at}: amenities.${k} 누락`);
  const { lat, lng } = p.location ?? {};
  if (!(lat >= -90 && lat <= 90 && lng >= -180 && lng <= 180)) errors.push(`${at}: 좌표 확인`);
  if (!p.editorReview?.photos?.length) errors.push(`${at}: 에디터 후기 사진이 없음`);
  checkImage(p.thumbnail, at);
  p.editorReview?.photos?.forEach((ph) => checkImage(ph.url, at));
  if (p.affiliateLink && !/^https?:\/\//.test(p.affiliateLink.url)) errors.push(`${at}: affiliateLink.url 확인`);
}

for (const r of regions) {
  for (const d of r.itinerary) {
    for (const id of d.placeIds) {
      if (!placeIds.has(id)) errors.push(`regions[${r.id}] Day${d.day}: 없는 placeId "${id}"`);
      else if (places.find((p) => p.id === id).regionId !== r.id)
        errors.push(`regions[${r.id}] Day${d.day}: 다른 지역 장소 "${id}"`);
    }
  }
  r.gearRecommendations.forEach((g) => checkImage(g.image, `regions[${r.id}].gear[${g.id}]`));
}

for (const rv of reviews) {
  if (!placeIds.has(rv.placeId)) errors.push(`seed-reviews[${rv.id}]: 없는 placeId "${rv.placeId}"`);
  if (rv.tip.length > 100) errors.push(`seed-reviews[${rv.id}]: tip 100자 초과`);
}

if (errors.length) {
  console.error(`❌ 데이터 오류 ${errors.length}건\n` + errors.map((e) => ' - ' + e).join('\n'));
  process.exit(1);
}
console.log(`✅ places ${places.length} · regions ${regions.length} · seed-reviews ${reviews.length} 이상 없음`);
