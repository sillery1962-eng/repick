-- 012_point_to_drop_convert.sql  (10/31 · 백현숙)
-- 전환 방향을 "포인트 → 물방울" 한 방향으로 바꾼다 (5⭐ = 1💧, 10/31 결정).
--
-- 왜 필요한가
--   · 지금 규칙은 물방울 → 포인트만 받아서 POST /points/convert-to-drops 가 23514 오류(화면 500)로 실패한다
--   · 두 방향을 모두 열면 1💧 → 5⭐ → 1💧 반복으로 잔액은 그대로인데 적립왕 점수만 올라간다
--
-- 무엇을 하나
--   · convert 줄의 부호를 반대로: point 는 빼기(−), drop 은 더하기(+)
--   · 다른 type 규칙은 004 그대로. 잔액 검사 트리거(007)도 그대로 → 포인트가 모자라면 DB가 거부
--
-- 왜 not valid 인가
--   · 예전 방향으로 이미 저장된 줄이 있어도 지우거나 고치지 않고 그대로 둔다 (잔액이 바뀌지 않게)
--   · 앞으로 들어오는 줄만 새 규칙으로 검사한다
alter table public.point_transactions
  drop constraint point_transactions_type_amount_check;

alter table public.point_transactions
  add constraint point_transactions_type_amount_check check (
    -- 적립(+): 물방울·포인트 공통
    (type in ('scan', 'attendance', 'referral', 'referral_bonus', 'mission',
              'quiz', 'post_verify', 'signup_bonus', 'event')
       and amount > 0)
    -- 물방울 사용(−)
    or (currency = 'drop'  and type = 'watering' and amount < 0)
    -- 물방울 적립(+): 포인트에서 전환
    or (currency = 'drop'  and type = 'convert' and amount > 0)
    -- 포인트 적립(+): 나무 수확 보너스를 포인트로
    or (currency = 'point' and type = 'tree_reward' and amount > 0)
    -- 포인트 사용(−): 물방울로 전환 포함
    or (currency = 'point' and type in ('convert', 'reward', 'shop', 'donate') and amount < 0)
  ) not valid;
