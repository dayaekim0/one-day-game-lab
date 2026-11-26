# 이안이와 세계지도 (가제)

아기와 함께 가기 좋은 국내외 여행지 지도 + 부모님 방문 인증 커뮤니티.

```bash
npm install
cp .env.example .env.local   # NEXT_PUBLIC_DATA_SOURCE=local
npm run dev                  # http://localhost:3000
npm run validate:data        # data/*.json 무결성 검사
```

## 구조
- `data/` — 장소·지역·시드 후기 JSON (`npm run validate:data`로 검사)
- `src/lib/types` — 데이터 모델 (Supabase 스키마와 1:1)
- `src/lib/api` — UI가 쓰는 유일한 데이터 진입점 `api`
  - `local/` — JSON + localStorage(텍스트) + IndexedDB(사진)
  - `supabase/` — 추후 구현 자리 (연동 순서는 `supabase/index.ts` 주석 참고)
- `supabase/migrations` — 테이블·RLS 초안

## ⚠️ 시드 데이터 안내
`data/`의 장소 정보, 편의시설 여부, 후기, 좌표는 **화면 확인용 데모 데이터**예요.
이름에 "(예시)"가 붙은 곳은 가상의 장소이고, 실제 관광지도 편의시설 정보는 검증되지 않았어요.
제휴·블로그 링크는 모두 `example.com` 자리표시자예요. 공개 전에 실제 정보로 바꿔 주세요.
