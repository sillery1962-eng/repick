# RePick (4POTEN) 지금 상태

갱신일: 2026-10-21 (Asia/Seoul) · **덧붙이지 않고 고쳐 쓴다** (지난 내용은 `docs/history.md` 맨 아래에 한 줄)

분리배출 사진 → AI 판별 → 포티 안내 → 💧물방울·⭐포인트 적립 → 나무 성장·수확 → 사은품·기부.
React(Vite) 반응형 웹 + FastAPI + Supabase(Auth·DB·Storage). 앱(Expo)은 만들지 않음.

## 담당과 내가 읽을 곳

문서를 다 읽지 않아도 된다. **내 줄만** 읽는다. 숫자·API·규칙은 [`docs/api-spec.md`](docs/api-spec.md) 한 곳이 기준.

| 담당 | 맡은 것 | 읽을 곳 |
| --- | --- | --- |
| 현숙 (팀장) | 회원가입·로그인, Supabase DB 전체, 공용 API 도구(`frontend/src/api/`), 문서 정리, 배포 | 전부 + [`docs/deploy.md`](docs/deploy.md) |
| 경난 | AI 판별(카메라), 물방울·포인트, 나의 숲 | api-spec **3·5·6번** + 9번 "통장 type 표" |
| 선영 | 챗봇 포티, 커뮤니티 | api-spec **4·7번** |
| 지원 | 공통 화면·Layout(`App.jsx`·`components/`·`index.css`), 이벤트·퀴즈·출석·친구 초대, 기부, 저탄소샵, 수거함 지도 | api-spec **8번** + 5번 중 출석·친구·퀴즈 줄 |

- 모두 공통: 서버 API를 만들면 [`docs/backend-auth.md`](docs/backend-auth.md), 화면에서 API를 부르면 [`docs/frontend-api.md`](docs/frontend-api.md)
- AI(Claude Code·Codex)에게는 번호만 말하면 된다. 예: "api-spec.md 5번 기준으로 `/points` 만들어 줘"
- **팀원은 문서(`docs/`·이 파일·`AGENTS.md`)를 고치지 않는다.** 바꿀 내용은 PR 설명이나 단톡에 → 현숙이 반영

## 지금 상태 (main 기준, 10/20)

| 영역 | 상태 |
| --- | --- |
| DB | ✅ `001`~`007`·`009`(품목별 기록 `scan_items`)·`010`(수확 보너스 필요한 나무만) 적용. `008`은 쿠폰 번호 칸 예약, 다음 새 번호 `011` ([migrations/README.md](supabase/migrations/README.md)). **10/30부터 새 테이블은 GRANT를 직접 써야 함** (README 규칙 7, 기존 테이블은 영향 없음) |
| 나의 숲 DB | ✅ `007` DB 함수(물 주기·수확·보너스, 5그루째 텀블러 자동) 적용 (api-spec 6번) |
| 판별·물방울·포인트·나의 숲 | ✅ 실제 연결 — YOLO 판별·적립 하루 5회, 잔액·내역·그래프, 물 주기·수확·컬렉션·보상 신청 (경난, PR #23). 쿠폰 발급은 아직 (api-spec 10번) |
| 기부 | ✅ 실제 DB 연결 — 100P 단위, 기부처 5개(시연용 가짜), 잔액 부족 → 400 (지원, PR #24) |
| 퀴즈 | ✅ 실제 DB 연결 — 회원별 하루 3문제, 정답 +10P·모두 정답 +50P, 맞힌 문제는 다시 안 나옴 (지원, PR #19) |
| 출석·적립왕 | ✅ 실제 DB 연결 — 출석 💧1·7일 연속(월~일) 💧7 (PR #21), 이달의 적립왕 1~10위 (PR #22) (지원) |
| 커뮤니티 | ✅ 실제 DB 연결 — 글·사진(WEBP 압축)·수정·삭제·좋아요·댓글 (선영, PR #20). 인증글 보상은 공용 적립 함수 생기면 |
| 회원 | ✅ 가입(자치구·사진 공개 동의)·로그인·로그아웃·로그인 유지·`RequireAuth`, 가입 시 💧3, `GET/PATCH /me` |
| 공용 API 도구 | ✅ `api/client.js`·`useApi.js` (토큰 자동 첨부, 한국어 오류) |
| 챗봇 포티 | ✅ PC·폰 실제 연결 |
| 화면 | ✅ 전체 화면. 친구 초대는 아직 가짜 API |
| 화면 배포 | ✅ Vercel https://repick-tau.vercel.app — 서버가 없어서 로그인·화면 이동만 됨 |
| 친구 초대 DB 연결 | ⏳ 지원 진행 중 |

## 이번 주 (10/19~10/23, 1단계 마감 10/23)

| 날짜 | 할 일 |
| --- | --- |
| 월 10/19 | ✅ Vercel 화면 배포, 문서 정리, 퀴즈 PR #19·커뮤니티 PR #20 merge |
| 화 10/20 | ✅ 나의 숲 DB `007` 적용, 출석 PR #21·적립왕 PR #22 merge, 쿠폰함·출석 보너스 규칙 문서화 |
| 수 10/21 오전 | ✅ 현숙 AWS 수업 → 배포 B안(화면 Vercel + 서버 EC2, Docker 없음) |
| 수 10/21 | ✅ 현숙: 품목별 누적 통계 DB `009_scan_items.sql` 적용 → 경난: `/classify` 저장 + `GET /scans/stats` |
| 수 10/21 오후 | ✅ 판별·포인트·나의 숲 PR #23(경난)·기부 PR #24(지원) merge |
| 목 10/22 | 현숙: RePick 백엔드 AWS 첫 배포 ([deploy.md](docs/deploy.md)) |
| 금 10/23 | 1단계 마감, 리허설 날짜·AWS 담당 정하기 |

## 할 일

**현숙**
- [ ] 회의에서 **마이페이지 담당 정하기** (아직 미정) — 할 일: 회원 정보(닉네임·자치구 보기·수정)·로그아웃(→ 홈) 연결, 경난 파트가 붙으면 잔액·나무·통계 숫자, 쿠폰함 (api-spec 10번)
- [ ] 팀 단톡에 문서 읽는 법 안내 (담당별 "읽을 곳", 문서는 팀장만 수정, `git pull` 습관) — 보낼지 결정
- [ ] 배포 B안 확정 → Vercel 2단계 인증 켜기, SigLIP2를 넣게 되면 [deploy.md](docs/deploy.md) "SigLIP2를 넣게 되면" 순서대로
- [ ] 경난과 쿠폰 발급 합의 (쿠폰 번호 모양·저장 칸 `008`·목록 API — api-spec 10번)
- [ ] 팀원 PR 검토·merge, DB 질문 대응 (새 테이블은 `008_…sql`, README 표에 먼저 한 줄, **`service_role` GRANT 포함**)

**팀 결정**: (10/19) 사은품 = 쿠폰 발행 · 기부 캠페인 = 시연용 가짜(3개 + 2개 추가) · 잔액 = 헤더·마이페이지 · 물방울→포인트 전환 = 맨 마지막 단계 · 판별 신뢰도 = YOLO 테스트 후 / (10/20) 5그루째 수확 = 텀블러 자동 · 나무 컬렉션(전부)과 보상용 모아 둔 나무(최대 5)는 따로 · 출석 7일 연속(월~일) 💧7 · 쿠폰 = 바코드 카드(시연용) · 카카오맵 도메인(localhost 포함)은 배포 후 등록 / (10/21) 수확 보너스 = 필요한 나무만 사용(쿠폰 1·노트 2·에코백 3, `010`) · 배포 = **B안(화면 Vercel + 서버 EC2), Docker 없음**. 남은 것은 api-spec 10번

## 실행 방법 (Windows, 터미널 2개)

| 무엇 | 어디서 | 명령 |
| --- | --- | --- |
| 화면 | `frontend` | `npm install`(처음·패키지 바뀌면) → `npm run dev` → http://localhost:5173 |
| 서버 | `backend` | `.venv\Scripts\activate` → `python -m uvicorn app.main:app --reload` → http://localhost:8000/docs |
| 패키지 | `backend` | `python -m pip install -r requirements.txt` |

- 키: `frontend/.env`(URL·publishable 키만), `backend/.env`(secret 키). `.env.example`을 복사해서 만들고 Git·메신저에 올리지 않음.
- 로그인 상태에서 빨간 "서버에 연결하지 못했어요"가 뜨면 백엔드가 꺼진 것 (정상).

## Git 작업 흐름 (충돌 줄이기)

`git switch main` → `git pull origin main` → `git switch -c feature/작업명` → 작업·커밋 → `git push -u origin feature/작업명` → GitHub PR → merge → `git switch main` → `git pull origin main`

- **작업 시작 전 + PR 올리기 전에 꼭 `git pull origin main`.** PR은 작게, 자주
- 남의 파일은 먼저 말하고 고치기. `main.py`·`App.jsx`·`requirements.txt`는 **내 줄만 추가**
- 커밋 전 `git status` — 문서 파일이 들어 있으면 빼기(`git restore 파일이름`). `git push --force` 금지
- Git 명령은 프로젝트 맨 위 폴더(`POTEN`)에서 (하위 폴더에서는 경로가 달라짐)

## 문서 지도

| 알고 싶은 것 | 볼 곳 |
| --- | --- |
| API·보상 숫자·나무 단계·DB 표(ERD) | [`docs/api-spec.md`](docs/api-spec.md) — 기준 |
| 배포 체크리스트 (현숙·AWS 담당) | [`docs/deploy.md`](docs/deploy.md) |
| 화면에서 API 부르기 / 서버에서 로그인 확인 | [`docs/frontend-api.md`](docs/frontend-api.md) / [`docs/backend-auth.md`](docs/backend-auth.md) |
| DB 파일 번호 | [`supabase/migrations/README.md`](supabase/migrations/README.md) |
| AI 작업 규칙 | [`AGENTS.md`](AGENTS.md) |
| 지난 기록 | [`docs/history.md`](docs/history.md) — 고치지 않음 |

다음 대화 시작 문장: "AGENTS.md와 PROJECT_CONTEXT.md를 읽고 RePick을 이어가 줘. 오늘 할 일을 알려 줄게."
