-- 005_point_tx_no_dup.sql  (10/17 · 백현숙)
-- 통장(point_transactions) 중복 지급 방지 규칙을 파일로 남긴다. 004 다음.
-- ⚠️ 10/16 경난 님이 Supabase SQL Editor에서 이미 같은 내용을 적용했다 (10/17 pg_indexes로 확인).
--    → 이 파일은 "기록용"이다. 다시 실행해도 결과는 같다 (있으면 지우고 같은 규칙으로 다시 만든다).
-- 실행: Supabase 대시보드 → SQL Editor → 전체 붙여넣기 → Run
--
-- 왜 필요한가
--   · 판별 1번 성공 = 통장에 화폐마다 한 줄씩 (예: 캔 → drop +3 한 줄 + point +30 한 줄, ref_id = 같은 scans.id)
--   · 예전 규칙 (user_id, type, ref_id)은 두 줄을 "같은 거래"로 보고 두 번째 줄을 막았다
--     → 오류: duplicate key value violates unique constraint "point_tx_no_dup" (409 → 화면 500)
--   · 새 규칙 (user_id, currency, type, ref_id)
--       같은 사용자 + drop  + scan + 같은 scan_id → ✅
--       같은 사용자 + point + scan + 같은 scan_id → ✅ (화폐가 달라서 다른 거래)
--       같은 사용자 + drop  + scan + 같은 scan_id 를 또 → ❌ 진짜 중복이라 DB가 거부
--   · ref_id가 비어 있는 줄(가입 보너스, 물 주기 등)은 이 규칙과 상관없다
--
-- FastAPI에서 지킬 것
--   · 판별·인증글처럼 "한 번만 주는 보상"은 ref_id에 대상 id(문자열)를 꼭 넣는다
--   · 중복으로 거부되면(409/23505) 이미 지급된 것이므로 오류 대신 "이미 적립됨"으로 처리한다

drop index if exists public.point_tx_no_dup;

create unique index point_tx_no_dup
  on public.point_transactions (user_id, currency, type, ref_id)
  where ref_id is not null;
