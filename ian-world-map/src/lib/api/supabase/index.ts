/**
 * Supabase 구현 자리 (추후).
 *
 * 연동 순서
 * 1. npm i @supabase/supabase-js
 * 2. supabase/migrations/0001_init.sql 적용, Storage에 'review-photos' 공개 버킷 생성
 * 3. Supabase 대시보드 > Authentication > Providers 에서 Kakao, Google 활성화
 * 4. 이 폴더에 client.ts / places.ts / reviews.ts / auth.ts 를 contracts.ts 인터페이스대로 구현
 *    - places.listPlaces  → from('places').select()
 *    - reviews.createReview → storage.from('review-photos').upload() 후 from('user_reviews').insert()
 *    - reviews.subscribe  → channel('user_reviews').on('postgres_changes', ...)
 *    - auth.signIn        → auth.signInWithOAuth({ provider })
 * 5. .env.local 에 NEXT_PUBLIC_DATA_SOURCE=supabase
 */
import type { DataSource } from '../contracts';

export function createSupabaseDataSource(): DataSource {
  throw new Error(
    'Supabase 데이터 소스는 아직 구현되지 않았어요. NEXT_PUBLIC_DATA_SOURCE=local 로 실행해 주세요.',
  );
}
