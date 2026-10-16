-- 004_tree_rewards.sql  (10/16 · 백현숙)
-- 나무 수확 보너스 기록(모아서 고르기) + 가입 보너스. 003 다음에 실행한다.
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (한 번만 실행)
-- 기준 문서: 노션 "물방울·포인트 보상표 (10/15 확정)", "API 명세 v0.4" 6번
--
-- 공통 약속 (002와 같음)
--   · 새 테이블은 RLS를 켜고 정책을 만들지 않는다 → FastAPI(secret 키)만 읽고 쓴다
--   · FastAPI에서 내 데이터를 다룰 때는 반드시 .eq("user_id", user["id"])

-- =========================================================
-- 1. reward_claims: 나무 수확 보너스를 받은 기록 ("모아서 고르기", 10/16 결정)
--    · 수확한 나무를 모아 두었다가 원할 때 사은품을 받는다
--        1그루 친환경 쿠폰 / 2그루 재활용 노트 / 3그루 에코백 / 5그루 텀블러 (최대 5그루)
--    · 받으면 모아 둔 나무를 모두 쓰고 0그루부터 다시 (예: 4그루일 때 에코백을 받으면 4그루 모두 사용)
--    · 지금 모아 둔 나무 = 내 harvested_trees 줄 수 − 내 reward_claims의 trees_spent 합계 (계산)
--    · 단계별 사은품 이름은 코드의 표에 둔다
--    · 포인트로 받기(choice = 'points')는 아직 미정. 나중에 켜기 쉽게 칸만 만들어 둠
--      → 쓰게 되면 point_transactions에 type = 'tree_reward' 한 줄 (ref_id = 이 표의 id)
-- =========================================================
create table public.reward_claims (
  id           bigint generated always as identity primary key,
  user_id      uuid not null references public.profiles (id) on delete cascade,
  tier         integer not null check (tier in (1, 2, 3, 5)),  -- 받은 단계 (몇 그루짜리 사은품인지)
  trees_spent  integer not null,                     -- 이번에 쓴 나무 수 (모아 둔 나무 전부)
  item         text not null,                        -- 받은 사은품 이름 (예: 에코백)
  choice       text not null default 'gift'
               check (choice in ('gift', 'points')), -- 지금은 'gift'만 사용
  points       integer,                              -- 포인트로 받았을 때만 (지금은 비어 있음)
  created_at   timestamptz not null default now(),

  constraint reward_claims_trees_check check (trees_spent >= tier),
  constraint reward_claims_choice_points_check check (
    (choice = 'gift' and points is null)
    or (choice = 'points' and points is not null and points > 0)
  )
);

create index reward_claims_user_id_idx on public.reward_claims (user_id);

alter table public.reward_claims enable row level security;

-- =========================================================
-- 2. point_transactions: 포인트 적립 type에 tree_reward 추가
--    002의 규칙을 그대로 두고 tree_reward(포인트 +)만 더한다
--    (사은품 대신 포인트를 나중에 넣을 때 DB를 다시 고치지 않도록 미리 추가. 안 쓰면 그냥 남아 있음)
-- =========================================================
alter table public.point_transactions
  drop constraint point_transactions_type_amount_check;

alter table public.point_transactions
  add constraint point_transactions_type_amount_check check (
    -- 적립(+): 물방울·포인트 공통
    (type in ('scan', 'attendance', 'referral', 'referral_bonus', 'mission',
              'quiz', 'post_verify', 'signup_bonus', 'event')
       and amount > 0)
    -- 물방울 사용(−)
    or (currency = 'drop'  and type in ('watering', 'convert') and amount < 0)
    -- 포인트 적립(+): 물방울에서 전환 / 나무 수확 보너스를 포인트로
    or (currency = 'point' and type in ('convert', 'tree_reward') and amount > 0)
    -- 포인트 사용(−)
    or (currency = 'point' and type in ('reward', 'shop', 'donate') and amount < 0)
  );

-- =========================================================
-- 3. 가입 보너스: 가입하면 물방울 3개 자동 지급
--    가입 트리거 함수에 signup_bonus 한 줄을 추가한다 (002의 함수 + 이 한 줄)
--    · 이미 가입한 회원(테스트 계정)에게는 주지 않는다
--    · 개수를 바꾸려면 새 번호 파일로 함수를 다시 바꾼다
-- =========================================================
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

  insert into public.point_transactions (user_id, currency, type, amount)
  values (new.id, 'drop', 'signup_bonus', 3);

  return new;
end;
$$;
