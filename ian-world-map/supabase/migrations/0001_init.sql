-- 이안이와 세계지도 · Supabase 초기 스키마 (초안)
-- src/lib/types 의 TypeScript 타입과 1:1로 대응합니다.
-- 시드 데이터(places.json/regions.json)는 별도 스크립트로 upsert 예정.

create type place_category as enum ('restaurant', 'activity', 'stay');
create type review_status  as enum ('published', 'hidden', 'reported');
create type submission_status as enum ('pending', 'approved', 'rejected');

create table regions (
  id           text primary key,
  name         text not null,
  country      text not null,
  "order"      int  not null default 0,
  center_lat   double precision not null,
  center_lng   double precision not null,
  zoom         int  not null default 12,
  summary      text not null,
  highlights   text[] not null default '{}',
  itinerary    jsonb not null default '[]',          -- ItineraryDay[]
  clothing_guide jsonb not null default '{}',        -- Partial<Record<Season, ClothingTip>>
  gear_recommendations jsonb not null default '[]'   -- GearItem[]
);

create table places (
  id            text primary key,
  region_id     text not null references regions(id),
  name          text not null,
  name_local    text,
  category      place_category not null,
  lat           double precision not null,
  lng           double precision not null,
  address       text not null,
  thumbnail     text not null,
  short_description text not null,
  age_ranges    text[] not null,
  seasons       text[] not null default '{}',
  amenities     jsonb not null,                      -- Amenities
  tags          text[] not null default '{}',
  editor_review jsonb not null,                      -- EditorReview
  affiliate_link jsonb,                              -- AffiliateLink | null
  price_level   smallint,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);
create index places_region_idx on places(region_id);

create table profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  nickname   text not null,
  avatar_url text,
  created_at timestamptz not null default now()
);

create table user_reviews (
  id              uuid primary key default gen_random_uuid(),
  place_id        text not null references places(id) on delete cascade,
  author_id       uuid not null references auth.users(id) on delete cascade,
  nickname        text not null,
  baby_age_months smallint not null check (baby_age_months between 0 and 72),
  age_range       text generated always as (
                    case when baby_age_months <= 12 then '6-12'
                         when baby_age_months <= 24 then '13-24'
                         else '24+' end) stored,
  tip             text not null check (char_length(tip) between 1 and 100),
  body            text,
  photos          jsonb not null default '[]',       -- Photo[] (Storage 'review-photos' 버킷 URL)
  visited_at      text,
  status          review_status not null default 'published',
  like_count      int not null default 0,
  created_at      timestamptz not null default now()
);
create index user_reviews_place_idx on user_reviews(place_id, created_at desc);

create table place_submissions (
  id           uuid primary key default gen_random_uuid(),
  submitter_id uuid references auth.users(id) on delete set null,
  nickname     text not null,
  name         text not null,
  category     place_category not null,
  region_id    text references regions(id),
  address      text not null,
  lat          double precision,
  lng          double precision,
  reason       text not null,
  link         text,
  status       submission_status not null default 'pending',
  created_at   timestamptz not null default now()
);

-- RLS
alter table regions           enable row level security;
alter table places            enable row level security;
alter table profiles          enable row level security;
alter table user_reviews      enable row level security;
alter table place_submissions enable row level security;

create policy "regions read"  on regions for select using (true);
create policy "places read"   on places  for select using (true);

create policy "profiles read"   on profiles for select using (true);
create policy "profiles upsert" on profiles for insert with check (auth.uid() = id);
create policy "profiles update" on profiles for update using (auth.uid() = id);

create policy "reviews read published" on user_reviews for select
  using (status = 'published' or author_id = auth.uid());
create policy "reviews insert own" on user_reviews for insert
  with check (auth.uid() = author_id and status = 'published');
create policy "reviews delete own" on user_reviews for delete
  using (auth.uid() = author_id);

create policy "submissions insert" on place_submissions for insert
  with check (auth.uid() = submitter_id);
create policy "submissions read own" on place_submissions for select
  using (auth.uid() = submitter_id);

-- Storage: 'review-photos' 공개 버킷, 경로 규칙 {auth.uid()}/{reviewId}/{photoId}.jpg
-- create policy "review photos upload own folder" on storage.objects for insert
--   with check (bucket_id = 'review-photos' and (storage.foldername(name))[1] = auth.uid()::text);
