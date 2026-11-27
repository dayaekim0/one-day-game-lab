# Supabase 연동 준비 가이드

2순위 작업(후기·사진을 모든 사용자에게 공유)을 위해 **계정 소유자가 직접 해야 하는 준비**예요.
아래 1~4를 끝내고 결과물(URL과 공개 키)만 알려 주시면 코드 연동을 진행할게요.

> 화면 메뉴 이름은 서비스 업데이트로 바뀔 수 있어요. 찾기 어려우면 각 서비스 공식 문서의 "Login with Kakao / Google" 안내를 참고하세요.

## 1. Supabase 프로젝트 만들기
1. https://supabase.com 에 가입하고 **New project**를 만들어요.
   - 리전: 한국·일본 사용자가 많으면 **Northeast Asia (Seoul 또는 Tokyo)**
   - DB 비밀번호는 안전한 곳에 따로 보관하세요. 채팅에 붙여 넣지 마세요.
2. **Project Settings → API**에서 두 값을 확인해요.
   - `Project URL` (예: `https://abcd.supabase.co`)
   - `anon public` 키 → 브라우저에서 써도 되는 공개 키예요.
   - ⚠️ `service_role` 키는 **절대 공유하지 마세요.**

## 2. 테이블 만들기
**SQL Editor**에서 아래 파일 내용을 순서대로 실행해요. 제가 대신 실행해도 돼요.
1. `supabase/migrations/0001_init.sql`
2. `supabase/migrations/0002_trips.sql`

## 3. 사진 저장소 만들기
**Storage → New bucket**
- 이름: `review-photos`
- Public bucket: 켜기 (피드에서 사진을 보여 주기 위해)
- 업로드 권한 정책은 연동할 때 SQL로 함께 넣을게요. 로그인한 본인 폴더에만 업로드할 수 있게 해요.

## 4. 소셜 로그인
Supabase의 **Authentication → Providers**에 콜백 주소가 표시돼요.
`https://<프로젝트>.supabase.co/auth/v1/callback`
이 주소를 아래 두 서비스에 등록해요.

### 카카오
1. https://developers.kakao.com → 내 애플리케이션 → 애플리케이션 추가
2. 카카오 로그인 활성화 → Redirect URI에 위 콜백 주소 등록
3. 보안 메뉴에서 Client Secret 발급 및 활성화
4. 동의항목: 닉네임, 프로필 사진
   - 이메일 동의항목은 앱 종류(비즈 앱 여부)에 따라 조건이 달라요. 설정 화면에서 확인해 주세요.
5. Supabase Providers → **Kakao**에 `REST API 키`(Client ID)와 `Client Secret` 입력

### 구글
1. https://console.cloud.google.com → API 및 서비스 → OAuth 동의 화면 설정
2. 사용자 인증 정보 → OAuth 클라이언트 ID(웹 애플리케이션) 생성
   - 승인된 리디렉션 URI에 위 콜백 주소 등록
3. Supabase Providers → **Google**에 Client ID와 Client Secret 입력

### 사이트 주소
**Authentication → URL Configuration**
- Site URL: 배포 주소 (아직 없으면 `http://localhost:3000`)
- Redirect URLs: `http://localhost:3000/**` 와 이후 배포 주소

## 5. 알려 주실 것
- `Project URL`
- `anon public` 키
  - 공개 키지만 채팅 대신 환경 설정의 시크릿으로 넣는 방법을 안내해 드릴 수 있어요.
- 카카오와 구글 중 먼저 붙일 로그인

Client Secret, DB 비밀번호, `service_role` 키는 Supabase 대시보드에만 입력하고 **누구에게도 보내지 마세요.**
