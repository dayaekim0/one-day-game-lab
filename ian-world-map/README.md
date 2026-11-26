# 이안이와 세계지도 (가제)

아기와 함께 가기 좋은 국내외 여행지 지도 + 부모님 방문 인증 커뮤니티.

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_DATA_SOURCE=local
npm run dev                  # http://localhost:3000
npm run validate:data        # data/*.json 무결성 검사
```

## 구조
- `data/places.json` — 장소 (실제 방문 장소 + `isSample: true` 샘플)
- `data/regions.json` — 지역 (가이드가 샘플이면 `guideIsSample: true`)
- `data/trips/<tripId>/` — 실제 가족여행 1건 = 폴더 1개 (여행·일정·결제·아이 동반 후기·관련 콘텐츠). 추가 방법은 `data/trips/README.md`
- `data/seed-reviews.json` — 샘플 커뮤니티 후기
- `src/lib/types` — 데이터 모델 (Supabase 스키마와 1:1)
- `src/lib/api` — UI가 쓰는 유일한 데이터 진입점 `api`
  - `local/` — JSON + localStorage(텍스트) + IndexedDB(사진)
  - `supabase/` — 추후 구현 자리 (연동 순서는 `supabase/index.ts` 주석 참고)
- `supabase/migrations` — 테이블·RLS 초안

## 검색·필터 (URL 쿼리로 공유 가능)
| 조건 | 쿼리 | 기준 |
|---|---|---|
| 여행지 | `region` | 장소의 지역 / 여행의 방문 지역 |
| 아이 개월 수 | `age` | 장소의 추천 개월 수 **또는** 실제 여행에서 방문한 아이 개월 수 |
| 장소 유형 | `cat` | 아기식당 / 놀이·활동 / 숙소·편의시설 / 교통·공항 |
| 여행 예산 | `budget` | 실제 총 결제액(없으면 예상 비용) 구간. 장소는 그 예산대 여행에서 방문한 곳 |
| 유모차 편의 | `stroller=1` | 확인된 평가가 '편해요' 또는 유모차 진입 확인 |
| 식사 편의 | `meal=1` | 확인된 평가가 '편해요' 또는 아기메뉴·유아의자 확인 |
| 실제 방문만 | `real=1` | 샘플 데이터 제외 |
| 검색어 | `q` | 이름·현지명·태그·지역명·장소 유형 |

미입력(`null`) 값은 '확인됨'으로 취급하지 않기 때문에 편의 필터에서 빠져요.

## ⚠️ 샘플 데이터 안내
`isSample: true`인 장소·후기와 `guideIsSample: true`인 지역 가이드는 **화면 확인용 데모 데이터**예요. 화면에는 '샘플' 배지가 붙어요.
이름에 "(예시)"가 붙은 곳은 가상의 장소이고, 제휴·블로그 링크는 `example.com` 자리표시자예요.
실제 여행 데이터(`data/trips/`, `isSample: false` 장소)에서 확인되지 않은 값은 모두 `null`이에요. 지도 좌표는 대표 지점 기준 대략 위치(`precision: "approximate"`)예요.
