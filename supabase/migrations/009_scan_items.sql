-- 009_scan_items.sql  (10/21 · 백현숙)
-- AI 판별 1번에 찍힌 품목을 "품목마다 한 줄"로 남기는 통계용 표. 경난 님 검토안(노션 10/20) 반영.
-- 008은 쿠폰 번호 칸용으로 비워 둔다 (api-spec 10번).
--
-- 무엇을 하나
--   · scans에는 대표 품목 하나(top_class)만 있어서 "페트병 몇 개·캔 몇 개" 누적 통계를 못 낸다
--   · 사진 한 장에 페트병 2개 + 캔 1개 → scan_items 두 줄 (PET 2, CAN 1)
--   · 보상은 그대로 (대표 품목 기준, 하루 5회). 이 표는 통계용 기록만 한다
--   · 쓰기·읽기는 FastAPI만 (/classify에서 저장, GET /scans/stats에서 조회 — 경난)
--   · 지난 판별은 복원할 수 없다 (scans에 대표 품목만 남아 있음). 이 파일 실행 뒤 판별부터 쌓인다

create table public.scan_items (
  id          bigint generated always as identity primary key,
  scan_id     bigint not null references public.scans (id) on delete cascade,
  user_id     uuid not null references public.profiles (id) on delete cascade,  -- 회원별 통계를 scans와 합치지 않고 바로 세려고 둠
  class       text not null check (class in ('PAPER', 'PET', 'PLASTIC', 'VINYL', 'CAN', 'BATTERY')),  -- 판별 클래스 6개 (api-spec 5번)
  count       int not null check (count > 0),              -- 그 사진에서 찾은 개수
  created_at  timestamptz not null default now(),
  constraint scan_items_once_per_class unique (scan_id, class)  -- 같은 판별에 같은 품목은 한 줄만
);

-- "내 품목 통계"를 빨리 세기 위한 색인 (회원 + 날짜)
create index scan_items_user_id_created_at_idx
  on public.scan_items (user_id, created_at desc);

-- README 규칙 4: RLS를 켜고 정책은 만들지 않음 → 브라우저 접근 차단, FastAPI(secret 키)만
alter table public.scan_items enable row level security;

-- README 규칙 7: 테이블 출입증. 10/30 Supabase 정책 변경 대비로 미리 씀 (그 전에 실행해도 문제없음)
grant select, insert, update, delete on public.scan_items to service_role;
