-- 003_events.sql  (10/15 · 백현숙)
-- 이벤트용 테이블 (지원 님 요청). 002 다음에 실행한다.
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (한 번만 실행)
--
-- 이 파일에 넣지 않은 것
--   · 출석 기록: 새 테이블 없음. point_transactions의 type = 'attendance' 줄이 출석 기록이고,
--     하루 1번 제한은 002에서 DB가 이미 막는다
--   · 퀴즈 문제: DB가 아니라 backend/data의 파일
--   · 저탄소샵: 외부 상품 링크로 연결 → 구매 내역 테이블 필요 없음 (10/15 지원)
--
-- 공통 약속 (002와 같음)
--   · 새 테이블은 RLS를 켜고 정책을 만들지 않는다 → FastAPI(secret 키)만 읽고 쓴다
--   · FastAPI에서 내 데이터를 다룰 때는 반드시 .eq("user_id", user["id"])

-- =========================================================
-- 1. profiles: 초대 코드 · 나를 초대한 사람
--    · invite_code: 회원마다 자동으로 만들어지는 8자리 코드 (겹치지 않음)
--    · referred_by: 친구의 초대 코드를 입력하면 그 친구의 id가 들어감 (한 번만)
--    · 친구 수 = referred_by가 내 id인 회원 수 → 1명당 물방울 2, 5명이면 포인트 10 (코드에서 처리)
-- =========================================================
alter table public.profiles
  add column invite_code text not null unique
    default upper(substr(md5(gen_random_uuid()::text), 1, 8)),
  add column referred_by uuid references public.profiles (id) on delete set null,
  add constraint profiles_not_self_referral check (referred_by is null or referred_by <> id);

create index profiles_referred_by_idx on public.profiles (referred_by);

-- =========================================================
-- 2. quiz_answers: 퀴즈 푼 기록
--    · quiz_id는 backend/data 퀴즈 파일의 문제 번호
--    · 틀린 답도 기록 → 하루 3개 제한은 오늘(한국 날짜) 줄 수로 센다 (코드에서 처리)
--    · 같은 문제를 같은 날 두 번 풀면 DB가 거부
--    · 정답 보상은 point_transactions에 type = 'quiz' 줄로 남긴다
-- =========================================================
create table public.quiz_answers (
  id          bigint generated always as identity primary key,
  user_id     uuid not null references public.profiles (id) on delete cascade,
  quiz_id     text not null,                        -- 퀴즈 파일의 문제 번호 (예: Q07)
  answer      text not null,                        -- 사용자가 고른 답
  is_correct  boolean not null,
  created_at  timestamptz not null default now()
);

create unique index quiz_answers_once_a_day_idx
  on public.quiz_answers (user_id, quiz_id, ((created_at at time zone 'Asia/Seoul')::date));

create index quiz_answers_user_id_created_at_idx
  on public.quiz_answers (user_id, created_at desc);

alter table public.quiz_answers enable row level security;
