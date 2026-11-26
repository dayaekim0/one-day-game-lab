-- 실제 가족여행 데이터 (여행 / 일정 / 결제 / 아이 동반 후기 / 관련 콘텐츠)
-- src/lib/types/trip.ts 와 1:1 대응. 미입력 값은 NULL로 저장 (임의 기본값 금지)

-- places: 미입력 허용 + 세부 유형 + 샘플 구분
alter type place_category add value if not exists 'transport';
alter table places
  alter column lat drop not null,
  alter column lng drop not null,
  alter column address drop not null,
  alter column thumbnail drop not null,
  alter column short_description drop not null,
  alter column editor_review drop not null,
  add column place_type text not null default 'other',
  add column location_precision text check (location_precision in ('exact', 'approximate')),
  add column child_friendliness jsonb not null default '{"stroller": null, "meal": null, "note": null}',
  add column is_sample boolean not null default false;
-- amenities jsonb 값은 true/false/null(미입력)

alter table regions
  alter column summary drop not null,
  add column guide_is_sample boolean not null default false;

create type trip_status as enum ('planned', 'completed');
create type expense_kind as enum ('actual', 'estimate');
create type expense_category as enum ('lodging', 'flight', 'shopping', 'food', 'transport', 'etc');
create type ease_level as enum ('good', 'fair', 'poor');

create table trips (
  id           text primary key,
  owner_id     uuid references auth.users(id) on delete set null,
  title        text not null,
  country      text not null,
  region_ids   text[] not null,
  start_date   date not null,
  end_date     date not null,
  nights       smallint not null,
  days         smallint not null,
  adults       smallint not null,
  children     jsonb not null default '[]',       -- TripChild[]: [{ "ageMonths": 28 }]
  stays        jsonb not null default '[]',       -- TripStay[]
  currency     text not null default 'KRW',
  total_paid   bigint,                            -- 실제 총 결제액
  status       trip_status not null,
  summary      text,
  cover_image  text,
  source_url   text,
  is_sample    boolean not null default false,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  check (end_date >= start_date)
);
-- 아이 개월 수 검색용
create index trips_children_idx on trips using gin (children jsonb_path_ops);
create index trips_region_idx   on trips using gin (region_ids);

create table trip_itinerary_items (
  id           bigint generated always as identity primary key,
  trip_id      text not null references trips(id) on delete cascade,
  day          smallint not null,
  date         date,
  overnight_region_id text references regions(id),
  item_order   smallint not null,
  kind         text not null,
  place_id     text references places(id),
  title        text not null,
  time         text,
  stay_minutes smallint,
  note         text,
  unique (trip_id, day, item_order)
);
create index itinerary_place_idx on trip_itinerary_items(place_id);

create table trip_expenses (
  id           text primary key,
  trip_id      text not null references trips(id) on delete cascade,
  kind         expense_kind not null,          -- actual(실제 결제) / estimate(예상 비용) 분리
  category     expense_category not null,
  label        text not null,
  amount       bigint not null check (amount >= 0),
  currency     text not null,
  granularity  text not null check (granularity in ('category-total', 'item')),
  date         date,
  place_id     text references places(id),
  note         text
);
create index expenses_trip_idx on trip_expenses(trip_id, kind);

create table child_reviews (
  id               text primary key,
  trip_id          text not null references trips(id) on delete cascade,
  place_id         text references places(id),
  child_age_months smallint not null,
  reaction         text,
  rating           smallint check (rating between 1 and 5),
  stay_minutes     smallint,
  stroller         ease_level,
  meal             ease_level,
  text             text,
  photos           jsonb not null default '[]',
  created_at       timestamptz not null default now()
);

create table trip_contents (
  id           text primary key,
  trip_id      text not null references trips(id) on delete cascade,
  place_id     text references places(id),
  type         text not null check (type in ('blog', 'youtube', 'instagram', 'web')),
  title        text not null,
  url          text not null,
  published_at date
);

-- 예산 필터용: 여행별 실제 결제 합계 / 예상 비용 합계
create view trip_cost_summary as
select t.id as trip_id,
       coalesce(t.total_paid, sum(e.amount) filter (where e.kind = 'actual')) as actual_total,
       sum(e.amount) filter (where e.kind = 'estimate') as estimate_total
from trips t left join trip_expenses e on e.trip_id = t.id
group by t.id;

alter table trips                enable row level security;
alter table trip_itinerary_items enable row level security;
alter table trip_expenses        enable row level security;
alter table child_reviews        enable row level security;
alter table trip_contents        enable row level security;

create policy "trips read"       on trips                for select using (true);
create policy "itinerary read"   on trip_itinerary_items for select using (true);
create policy "expenses read"    on trip_expenses        for select using (true);
create policy "child reviews read" on child_reviews      for select using (true);
create policy "contents read"    on trip_contents        for select using (true);
create policy "trips write own"  on trips for all using (auth.uid() = owner_id) with check (auth.uid() = owner_id);
