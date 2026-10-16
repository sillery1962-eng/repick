-- 002_all_tables.sql  (10/15 · 백현숙)
-- RePick 나머지 테이블을 한 번에 만든다. 001 다음에 실행한다.
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (한 번만 실행)
-- 기준 문서: 노션 "RePick API 명세 · ERD (v0.4 - 10/15 회의 반영)"
--
-- 공통 약속
--   · 회원 칸은 user_id → profiles(id) 참조 (profiles.id = auth.users.id)
--     → 회원이 탈퇴하면 그 회원의 기록도 함께 지워진다 (on delete cascade)
--     → FastAPI에서 select("*, profiles(nickname)") 처럼 닉네임을 같이 가져올 수 있다
--   · 새 테이블은 RLS를 켜고 정책(policy)을 만들지 않는다
--     → 브라우저에서는 읽기·쓰기 모두 막히고, FastAPI(secret 키)만 읽고 쓴다
--   · FastAPI에서 내 데이터를 다룰 때는 반드시 .eq("user_id", user["id"])

-- =========================================================
-- 1. profiles: 사진 공개 동의 시각 추가
--    가입 화면에서 필수 동의 → 동의한 시각을 남긴다
--    signUp(..., { options: { data: { nickname, region, photo_consent: true } } })
-- =========================================================
alter table public.profiles
  add column photo_consent_at timestamptz;          -- 사진 공개 동의 시각 (동의 안 했으면 비어 있음)

-- 가입 트리거 함수 교체: 닉네임·자치구 + 동의 시각까지 저장
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname, region, photo_consent_at)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), '새 회원'),
    nullif(trim(new.raw_user_meta_data ->> 'region'), ''),
    case when (new.raw_user_meta_data ->> 'photo_consent') = 'true' then now() end
  );
  return new;
end;
$$;
-- (트리거 on_auth_user_created는 001에서 만들었고, 함수만 바꾸면 그대로 새 함수를 쓴다)

-- =========================================================
-- 2. point_transactions: 물방울·포인트 통장으로 바꾸기 (10/15 분리 결정)
--    · currency 칸 추가: 'drop'(물방울) / 'point'(포인트). 이미 있는 줄은 모두 'drop'
--    · 개수·비율·횟수는 DB가 아니라 코드의 표에 둔다 → 나중에 정해도 테이블은 그대로
--    · 종류(type) 이름은 쓸 가능성이 있는 것을 미리 다 넣어 둔다 (안 써도 문제없음)
--    · harvest 삭제 — 10단계 끝나면 수확, 물방울은 더 빼지 않음
--    · watering = 나무에 물 주기 — 경난 님 코드 이름 그대로
-- =========================================================
alter table public.point_transactions
  add column currency text not null default 'drop'
    check (currency in ('drop', 'point'));

alter table public.point_transactions
  drop constraint point_transactions_type_amount_check;

alter table public.point_transactions
  add constraint point_transactions_type_amount_check check (
    -- 적립(+): 물방울·포인트 공통
    (type in ('scan',            -- AI 판별 성공
              'attendance',      -- 출석 체크
              'referral',        -- 친구 1명 추가
              'referral_bonus',  -- 친구 5명 달성
              'mission',         -- 미션 달성 (예: AI 인증 5회)
              'quiz',            -- 퀴즈 정답
              'post_verify',     -- 인증 게시글
              'signup_bonus',    -- 가입 보너스
              'event')           -- 그 밖의 이벤트
       and amount > 0)
    -- 물방울 사용(−)
    or (currency = 'drop'  and type in ('watering',   -- 나무에 물 주기
                                        'convert')    -- 포인트로 전환 (물방울에서 빠짐)
        and amount < 0)
    -- 포인트 적립(+): 물방울에서 전환되어 들어옴
    or (currency = 'point' and type = 'convert' and amount > 0)
    -- 포인트 사용(−)
    or (currency = 'point' and type in ('reward',     -- 사은품 교환
                                        'shop',       -- 저탄소샵 구매
                                        'donate')     -- 기부
        and amount < 0)
  );

create index point_transactions_user_id_currency_idx
  on public.point_transactions (user_id, currency);

-- 출석은 한국 날짜 기준 하루 1번만 (같은 날 두 번 적립되면 DB가 거부)
create unique index point_transactions_attendance_once_a_day_idx
  on public.point_transactions (user_id, currency, ((created_at at time zone 'Asia/Seoul')::date))
  where type = 'attendance';

-- =========================================================
-- 3. scans: AI 판별 기록
--    사진은 서버에 저장하지 않는다 (찍은 사람 기기에만 저장, 10/15 확인)
--    물방울 적립 줄은 point_transactions.ref_id에 이 표의 id를 넣어 연결한다
-- =========================================================
create table public.scans (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  top_class   text not null,                        -- 판별 결과 클래스 (예: CAN, PET)
  confidence  real not null check (confidence between 0 and 1),  -- 신뢰도 0~1
  status      text not null check (status in ('success', 'uncertain')),
  created_at  timestamptz not null default now()
);

create index scans_user_id_created_at_idx
  on public.scans (user_id, created_at desc);

alter table public.scans enable row level security;

-- =========================================================
-- 4. 커뮤니티: posts(글) · comments(댓글·대댓글) · post_likes(좋아요)
-- =========================================================
create table public.posts (
  id               bigint generated always as identity primary key,
  user_id          uuid not null references public.profiles (id) on delete cascade,
  content          text not null check (char_length(content) between 1 and 1000),
  image_url        text,                            -- Storage posts 보관함의 사진 주소 (없으면 비어 있음)
  is_verification  boolean not null default false,  -- 분리배출 인증글인지
  created_at       timestamptz not null default now()
);

create index posts_created_at_idx on public.posts (created_at desc);
create index posts_user_id_idx on public.posts (user_id);

alter table public.posts enable row level security;

create table public.comments (
  id          bigint generated always as identity primary key,
  post_id     bigint not null references public.posts (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  parent_id   bigint references public.comments (id) on delete cascade,  -- 대댓글이면 원래 댓글 id
  content     text not null check (char_length(content) between 1 and 500),
  created_at  timestamptz not null default now()
);

create index comments_post_id_created_at_idx on public.comments (post_id, created_at);

alter table public.comments enable row level security;

-- 좋아요: 한 사람이 한 글에 1번만 (post_id + user_id 짝이 겹치면 DB가 거부)
create table public.post_likes (
  post_id     bigint not null references public.posts (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  primary key (post_id, user_id)
);

alter table public.post_likes enable row level security;

-- =========================================================
-- 5. Storage posts 보관함: 커뮤니티 사진
--    공개(주소만 알면 누구나 보기) · 최대 5MB · 이미지 파일만
--    업로드는 FastAPI(secret 키)가 한다
-- =========================================================
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'posts', 'posts', true,
  5242880,                                          -- 5MB
  array['image/jpeg', 'image/png', 'image/webp', 'image/heic']
);

-- =========================================================
-- 6. harvested_trees: 다 키운(수확한) 나무
--    나무 단계는 저장하지 않고 watering 내역으로 계산한다 (10단계)
-- =========================================================
create table public.harvested_trees (
  id            bigint generated always as identity primary key,
  user_id       uuid not null references public.profiles (id) on delete cascade,
  tree_type     text not null check (tree_type in ('apple', 'pear', 'persimmon')),  -- 사과·배·감
  harvested_at  timestamptz not null default now()
);

create index harvested_trees_user_id_idx on public.harvested_trees (user_id);

alter table public.harvested_trees enable row level security;

-- =========================================================
-- 7. 이 파일에 넣지 않은 것 (나중에 003~ 파일로)
--    - 친구 관계, 저탄소샵 상품·주문, 기부 캠페인, 사은품 신청 테이블
--      → 지원 님 화면이 정해지면 추가
--    - 퀴즈 문제는 DB가 아니라 backend/data의 파일. 하루 3개 제한은 통장의 quiz 줄 수로 센다
--    - 보상 개수·전환 비율·나무 단계별 물방울 수는 코드의 표에 둔다
-- =========================================================