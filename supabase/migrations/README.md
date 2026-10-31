# DB 변경 파일 (migrations) 번호 배정

테이블을 만들거나 바꾸는 SQL은 이 폴더에 `번호_이름.sql`로 남긴다.
DB(SQL) 파일은 **백현숙이 한꺼번에 작성**한다 (10/15 팀 결정). 팀원은 FastAPI로 읽고 쓰기만 한다.

| 번호 | 담당 | 내용 | 실행 |
| --- | --- | --- | --- |
| 001 | 백현숙 | 회원(`profiles`), 물방울 거래내역(`point_transactions`) | ✅ 10/10 |
| 002 | 백현숙 | 나머지 전체 테이블: 판별 기록(`scans`), 커뮤니티(`posts`·`comments`·`post_likes` + 사진 보관함 `posts`), 수확한 나무(`harvested_trees`), 사진 공개 동의 칸, 물방울·포인트 통장(`currency` 칸, 종류 목록, `harvest` 삭제), 출석 하루 1번 | ✅ 10/15 |
| 003 | 백현숙 | 이벤트: 초대 코드·초대한 사람(`profiles` 칸 2개), 퀴즈 기록(`quiz_answers`) | ✅ 10/15 |
| 004 | 백현숙 | 나무 수확 보너스 기록(`reward_claims`, 모아서 고르기 1·2·3·5그루), 통장 type `tree_reward` 미리 추가, 가입 보너스 물방울 3개 자동 지급(가입 트리거) | ✅ 10/16 |
| 005 | 백현숙 | 통장 중복 지급 방지 `point_tx_no_dup` = `(user_id, currency, type, ref_id)` — 판별 1번에 물방울·포인트 두 줄이 같이 들어가도록 `currency` 추가. **기록용**: 경난 님이 SQL Editor에서 먼저 적용 | ✅ 10/16 (경난, 직접 적용) |
| 006 | 오지원 | 퀴즈 기록 `quiz_answers`에 푼 날짜(`answered_on`, 한국 날짜) + 문제마다 하루 한 줄 규칙, 본인 기록 읽기 정책. **기록용**: 오지원이 SQL Editor에서 먼저 적용 (`point_tx_no_dup` 줄은 005가 있어 건너뜀) | ✅ 10/19 (지원, 직접 적용) |
| 007 | 백현숙 | 나의 숲 DB 함수(경난 님 검토안 기반): 물 주기·수확·수확 보너스를 회원별 잠금으로 한 번에 처리(`repick_forest_state`·`repick_forest_action`), 통장 차감 시 잔액 검사 트리거(기부·전환에도 적용), 5그루째 수확하면 텀블러 자동 지급. 새 테이블 없음 | ✅ 10/20 |
| 008 | — | (사용 안 함) 쿠폰 번호 칸으로 예약했다가 취소 — 쿠폰 번호는 DB 없이 계산 (10/21, api-spec 6번). 번호는 비워 둔다 | — |
| 009 | 백현숙 | AI 판별 품목별 기록(`scan_items`, 판별 1번에 품목 수만큼 줄 · 같은 판별 같은 품목 한 줄) — 통계용, 보상과 무관. RLS(브라우저 차단) + `service_role` GRANT. 경난 님 검토안(노션 10/20) 반영 | ✅ 10/21 |
| 010 | 백현숙 | 나무 수확 보너스를 "고른 사은품에 필요한 나무만 사용"으로 변경(쿠폰 1·노트 2·에코백 3그루, 나머지는 남김) — `repick_forest_action` 다시 만들기, 007과 rewards 두 줄만 다름. 경난 님 검토안(노션 10/20) | ✅ 10/21 |
| 011 | 백현숙 | 회원 탈퇴 후 **30일 재가입 막기**: 탈퇴 기록 `withdrawn_emails`(이메일 원문 대신 SHA-256 해시·탈퇴 시각, RLS + `service_role` GRANT) + 가입 직전 검사 트리거(`auth.users`, 30일 안이면 가입 거절). 탈퇴 기록은 `DELETE /me`(PR #69)가 넣음 | ✅ 10/27 |
| 012 | 백현숙 | 전환을 **포인트 → 물방울 한 방향**으로(`convert`: point −, drop +). 통장 금액 규칙만 변경, 예전 줄은 그대로 둠(`not valid`), 새 테이블 없음 | ✅ 10/31 |

## 규칙

1. **이미 실행한 파일은 고치지 않는다.** 바꿀 것이 생기면 새 번호 파일을 만든다.
   (새 번호는 이 표에 먼저 한 줄 추가하고 쓴다.)
2. 실행은 Supabase 대시보드 → **SQL Editor**에 파일 내용을 붙여 넣고 Run. **한 사람이 한 번만** 실행한다.
   실행한 뒤 위 표의 "실행" 칸에 ✅와 날짜를 적는다.
3. 회원 칸은 `user_id uuid references public.profiles(id) on delete cascade`로 만든다.
   (`profiles.id` = `auth.users.id`, `docs/backend-auth.md` 참고)
4. 새 테이블에는 RLS를 켠다 (`alter table ... enable row level security;`).
   정책은 만들지 않아 브라우저 접근을 막고, FastAPI(secret 키)만 읽고 쓴다.
5. 물방울·포인트는 `point_transactions` 하나를 같이 쓴다 (`currency` = `drop` / `point`). 새로 만들지 않는다.
6. 테이블 삭제(`drop table`)나 데이터 지우기는 팀에 먼저 알린다.
7. **새 테이블에는 GRANT를 직접 쓴다** (Supabase 정책 변경, **10/30부터**). 그 뒤 public에 만든 테이블은
   권한이 자동으로 붙지 않아 FastAPI도 `permission denied`가 난다. `001`~`007` 테이블은 영향 없음.
   GRANT = 테이블 출입증, RLS 정책 = 들어온 뒤 볼 수 있는 행. 둘 다 필요하다.

   ```sql
   create table public.새테이블 (...);
   alter table public.새테이블 enable row level security;

   -- FastAPI(secret 키)는 항상
   grant select, insert, update, delete on public.새테이블 to service_role;

   -- 브라우저에서 본인 행을 직접 읽는 정책을 만들 때만 (예: 001 profiles·point_transactions, 006 quiz_answers)
   -- grant select on public.새테이블 to authenticated;

   -- anon(로그인 안 한 사람)에게는 주지 않는다
   ```

   확인: SQL Editor에서
   `select table_name, grantee, string_agg(privilege_type, ', ') from information_schema.role_table_grants where table_schema = 'public' and grantee in ('anon','authenticated','service_role') group by 1, 2 order by 1, 2;`
