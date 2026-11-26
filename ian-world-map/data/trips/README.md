# 여행 데이터 추가 방법

여행 1개 = 폴더 1개 (`data/trips/<tripId>/`). 폴더 이름이 곧 `tripId`예요.

| 파일 | 내용 | 타입 |
|---|---|---|
| `trip.json` | 여행 기본 정보 (기간, 인원, 아이 개월 수, 지역별 숙박, 실제 총 결제액) | `Trip` |
| `itinerary.json` | 일자별 일정 | `ItineraryDay[]` |
| `expenses.json` | 결제 내역(`kind: "actual"`)과 향후 예상 비용(`kind: "estimate"`) | `Expense[]` |
| `child-reviews.json` | 아이 동반 후기 (반응, 추천도, 체류 시간 등) | `ChildReview[]` |
| `contents.json` | 블로그·유튜브·인스타 등 관련 콘텐츠 | `RelatedContent[]` |

방문 장소는 `data/places.json`에 공용으로 두고 `placeId`로 참조해요. 여러 여행에서 같은 장소를 방문해도 장소는 하나예요.

## 새 여행 추가 순서
1. 이 폴더를 복사해 새 `tripId` 폴더를 만들고 5개 파일을 채워요.
2. 새 장소가 있으면 `data/places.json`에 추가해요. 새 지역이면 `data/regions.json`에도 추가해요.
3. `src/lib/api/local/trips-registry.ts`에 import 한 줄을 추가해요.
4. `npm run validate:data`로 검사해요. 실제 결제 합계와 `totalPaid` 일치, `placeId` 참조, 날짜 범위를 확인해 줘요.

## 입력 원칙
- **확인되지 않은 정보는 `null`(또는 빈 배열)로 둬요.** 편의시설, 아이 반응, 추천도, 체류 시간, 시간대, 주소가 해당돼요. 추측해서 채우지 않아요.
- 편의시설 값: `true`(있음) / `false`(없음) / `null`(미입력)
- 위치를 모르면 `location: null` → 지도에는 안 나오고 목록에만 나와요. 대표 지점 좌표라면 `"precision": "approximate"`로 적어요.
- 실제 결제(`actual`)와 예상 비용(`estimate`)은 절대 합산하지 않아요.
