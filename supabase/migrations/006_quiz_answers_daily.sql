-- 006_quiz_answers_daily.sql  (10/19 · 오지원)
-- 퀴즈 기록(quiz_answers)에 "푼 날짜(한국 시간)" 칸과 하루 한 줄 규칙을 더한다. 005 다음.
-- ⚠️ 오지원이 Supabase SQL Editor에서 이미 실행했다 → 이 파일은 "기록용"이다. 아래 SQL은 실행한 그대로다.
--
-- 무엇을 하나
--   · answered_on: 푼 날짜 (한국 날짜). 다시 풀면 새 줄 없이 그 줄을 고친다(update) → 문제마다 하루 한 줄
--   · quiz_answers_once_per_day: (회원, 날짜, 문제) 한 줄만
--   · "내 퀴즈 기록 보기": 본인 기록만 읽기 허용 (쓰기는 FastAPI만)
--
-- 참고 (10/19 확인)
--   · point_tx_no_dup은 005에서 (user_id, currency, type, ref_id)로 이미 만들어져 있었다.
--     아래 줄은 "if not exists"라서 실제로는 건너뛰었다 → DB에는 005의 4칸 규칙이 그대로 남아 있다 (그게 맞음)
--   · 003의 quiz_answers_once_a_day_idx(created_at 날짜 기준)도 그대로 있다. 둘 다 같은 규칙이라 충돌하지 않는다
--   · README 규칙 4번(정책 없이 브라우저 접근 막기)과 달리 읽기 정책을 하나 만들었다. 쓰기는 여전히 FastAPI만

alter table quiz_answers
  add column if not exists answered_on date not null
  default ((now() at time zone 'Asia/Seoul')::date);
create unique index if not exists quiz_answers_once_per_day
  on quiz_answers (user_id, answered_on, quiz_id);
create unique index if not exists point_tx_no_dup
  on point_transactions (user_id, type, ref_id) where ref_id is not null;
alter table quiz_answers enable row level security;
drop policy if exists "내 퀴즈 기록 보기" on quiz_answers;
create policy "내 퀴즈 기록 보기" on quiz_answers
  for select using (auth.uid() = user_id);
