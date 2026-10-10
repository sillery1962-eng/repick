-- 001_profiles_points.sql
-- RePick 회원 정보(profiles)와 물방울 거래내역(point_transactions)
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run (한 번만 실행)

-- =========================================================
-- 1. profiles: 회원 정보 (id = auth.users.id)
-- =========================================================
create table public.profiles (
  id         uuid primary key references auth.users (id) on delete cascade,
  nickname   text not null,
  region     text,                                  -- 자치구 (예: 강남구)
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;

-- 본인 정보만 조회
create policy "profiles_select_own"
  on public.profiles for select
  to authenticated
  using ((select auth.uid()) = id);

-- 본인 정보만 수정
create policy "profiles_update_own"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- 브라우저에서는 nickname, region만 수정 가능 (id, created_at 변경 차단)
revoke update on public.profiles from anon, authenticated;
grant update (nickname, region) on public.profiles to authenticated;

-- 추가·삭제는 브라우저에서 하지 않음 (가입 트리거 / 회원 삭제 시 자동 삭제)
revoke insert, delete on public.profiles from anon, authenticated;

-- =========================================================
-- 2. 가입 시 profiles 자동 생성
--    supabase.auth.signUp({ email, password,
--      options: { data: { nickname, region } } }) 의 data 값을 사용
-- =========================================================
create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, nickname, region)
  values (
    new.id,
    coalesce(nullif(trim(new.raw_user_meta_data ->> 'nickname'), ''), '새 회원'),
    nullif(trim(new.raw_user_meta_data ->> 'region'), '')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- =========================================================
-- 3. point_transactions: 물방울 거래내역
--    잔액은 저장하지 않고 sum(amount)로 계산
--    쓰기는 백엔드 add_points() (service_role)만
-- =========================================================
create table public.point_transactions (
  id         bigint generated always as identity primary key,
  user_id    uuid not null references public.profiles (id) on delete cascade,
  type       text not null,
  amount     integer not null,
  ref_id     text,                                  -- 관련 대상 (예: 분류 결과·게시글 id)
  created_at timestamptz not null default now(),

  -- 적립 type은 양수, 사용 type은 음수
  constraint point_transactions_type_amount_check check (
    (type in ('scan', 'post_verify', 'attendance') and amount > 0)
    or (type in ('donate', 'harvest') and amount < 0)
  )
);

create index point_transactions_user_id_created_at_idx
  on public.point_transactions (user_id, created_at desc);

alter table public.point_transactions enable row level security;

-- 본인 거래내역만 조회
create policy "point_transactions_select_own"
  on public.point_transactions for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- 브라우저에서 직접 쓰기 금지 (service_role은 RLS를 우회하므로 백엔드는 가능)
revoke insert, update, delete on public.point_transactions from anon, authenticated;
