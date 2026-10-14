# DB 변경 파일 (migrations) 번호 배정

테이블을 만들거나 바꾸는 SQL은 이 폴더에 `번호_이름.sql`로 남긴다.
같은 번호를 두 사람이 쓰지 않도록 아래처럼 미리 나눠 둔다.

| 번호 | 담당 | 내용 | 실행 |
| --- | --- | --- | --- |
| 001 | 백현숙 | 회원(`profiles`), 물방울 거래내역(`point_transactions`) | ✅ 10/10 |
| 002 | 서경난 | AI 분류·물방울 | |
| 003 | 김선영 | 커뮤니티 (게시글·댓글·좋아요) | |
| 004 | 미정 | 나의 숲 | |
| 005 | [이름] | 기부·이벤트(퀴즈·출석)·친구 초대 | |

예: `002_classify_points.sql`, `003_posts.sql`, `004_forest.sql`

## 규칙

1. **이미 실행한 파일은 고치지 않는다.** 바꿀 것이 생기면 새 번호 파일을 만든다.
   (005부터는 이 표에 먼저 한 줄 추가하고 쓴다.)
2. 실행은 Supabase 대시보드 → **SQL Editor**에 파일 내용을 붙여 넣고 Run.
   실행한 뒤 위 표의 "실행" 칸에 ✅와 날짜를 적는다.
3. 회원 ID 칸은 `user_id uuid references auth.users(id) on delete cascade`로 만든다.
   (공통 회원 ID = `auth.users.id`, `docs/backend-auth.md` 참고)
4. 새 테이블에는 RLS를 켠다 (`alter table ... enable row level security;`).
5. `point_transactions`(001)는 이미 있다. 물방울용 테이블을 새로 만들기 전에 이것을 쓸 수 있는지 먼저 확인한다.
6. 테이블 삭제(`drop table`)나 데이터 지우기는 팀에 먼저 알린다.
