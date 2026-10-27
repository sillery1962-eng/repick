-- 011_withdrawn_emails.sql  (10/27 · 백현숙)
-- 회원 탈퇴 후 30일 동안 같은 이메일로 다시 가입하지 못하게 한다.
--
-- 왜 필요한가
--   · 탈퇴(DELETE /me, PR #69)하면 Supabase 계정이 완전히 지워져 같은 이메일로 바로 다시 가입할 수 있었다
--   · 탈퇴 → 재가입을 반복하면 가입 보너스 💧3, 친구 초대 보상(코드 주인 💧2, 5명마다 ⭐1000)을 계속 받을 수 있음
--
-- 무엇을 하나
--   1) withdrawn_emails: 탈퇴한 이메일의 SHA-256 해시와 탈퇴 시각 (이메일 원문은 저장하지 않음)
--      · 쓰기는 FastAPI만: DELETE /me 가 계정을 지우기 전에 한 줄 넣는다 (backend/app/routers/me.py)
--      · 해시 만드는 법은 양쪽이 같아야 한다: 앞뒤 공백 제거 → 소문자 → UTF-8 → SHA-256 → 16진수 글자
--   2) 가입 직전 검사 트리거 (auth.users, before insert)
--      · 30일 안에 탈퇴한 이메일이면 가입을 거절 → Supabase는 화면에 "Database error saving new user"만 보냄
--        (거절 이유는 넘어가지 않음 → 가입 화면 SignupPage.jsx 가 "30일이 지나지 않았을 수 있어요"로 안내)
--      · 기존 가입 트리거(001 handle_new_user, after insert)는 그대로
--
-- 실행: Supabase 대시보드 → SQL Editor → 이 파일 내용 붙여 넣기 → Run (한 사람이 한 번만)
--       코드 PR(me.py·SignupPage.jsx)보다 먼저 실행한다

-- =========================================================
-- 1. 탈퇴 기록 표
-- =========================================================
create table public.withdrawn_emails (
  id            bigint generated always as identity primary key,
  email_hash    text not null check (email_hash ~ '^[0-9a-f]{64}$'),  -- SHA-256 16진수 64글자
  withdrawn_at  timestamptz not null default now()
);
-- 회원과 연결하지 않는다 (탈퇴하면 profiles 줄이 지워지므로 user_id를 둘 수 없음)
-- 같은 이메일이 여러 번 탈퇴할 수 있어 email_hash는 겹쳐도 됨 → 가장 최근 탈퇴 시각으로 판단

-- "이 이메일이 최근에 탈퇴했나"를 빨리 찾기 위한 색인
create index withdrawn_emails_hash_at_idx
  on public.withdrawn_emails (email_hash, withdrawn_at desc);

-- README 규칙 4: RLS를 켜고 정책은 만들지 않음 → 브라우저 접근 차단, FastAPI(secret 키)만
alter table public.withdrawn_emails enable row level security;

-- README 규칙 7: 테이블 출입증 (10/30 Supabase 정책 변경)
grant select, insert, update, delete on public.withdrawn_emails to service_role;

-- =========================================================
-- 2. 가입 직전 검사 (30일)
-- =========================================================
create or replace function public.repick_block_rejoin()
returns trigger language plpgsql security definer set search_path = '' as $$
begin
  if new.email is not null and exists (
    select 1 from public.withdrawn_emails
    where email_hash = encode(sha256(convert_to(lower(btrim(new.email)), 'UTF8')), 'hex')
      and withdrawn_at > now() - interval '30 days'
  ) then
    raise exception '탈퇴 후 30일이 지나야 다시 가입할 수 있어요.';
  end if;
  return new;
end $$;

-- 브라우저(RPC)에서 부를 수 없게 막기 (트리거는 권한과 관계없이 동작)
revoke all on function public.repick_block_rejoin() from public, anon, authenticated;

drop trigger if exists repick_block_rejoin_before_insert on auth.users;
create trigger repick_block_rejoin_before_insert
before insert on auth.users
for each row execute function public.repick_block_rejoin();
