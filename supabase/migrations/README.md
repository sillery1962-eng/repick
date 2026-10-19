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
