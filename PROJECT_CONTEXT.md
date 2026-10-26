# RePick (4POTEN) 지금 상태

갱신일: 2026-10-26 (Asia/Seoul) · **덧붙이지 않고 고쳐 쓴다** (지난 내용은 `docs/history.md` 맨 아래에 한 줄)

분리배출 사진 → AI 판별 → 포티 안내 → 💧물방울·⭐포인트 적립 → 나무 성장·수확 → 사은품·기부.
React(Vite) 반응형 웹 + FastAPI + Supabase(Auth·DB·Storage). 앱(Expo)은 만들지 않음.

## 담당과 내가 읽을 곳

문서를 다 읽지 않아도 된다. **내 줄만** 읽는다. 숫자·API·규칙은 [`docs/api-spec.md`](docs/api-spec.md) 한 곳이 기준.

| 담당 | 맡은 것 | 읽을 곳 |
| --- | --- | --- |
| 현숙 (팀장) | 회원가입·로그인, Supabase DB 전체, 공용 API 도구(`frontend/src/api/`), 문서 정리, 배포 | 전부 + [`docs/deploy.md`](docs/deploy.md) |
| 경난 | AI 판별(카메라), 물방울·포인트, 나의 숲 | api-spec **3·5·6번** + 9번 "통장 type 표" |
| 선영 | 챗봇 포티, 커뮤니티 | api-spec **4·7번** |
| 지원 | 공통 화면·Layout(`App.jsx`·`components/`·`index.css`), 이벤트·퀴즈·출석·친구 초대, 기부, 친환경샵, 수거함 지도 | api-spec **8번** + 5번 중 출석·친구·퀴즈 줄 |

- 모두 공통: 서버 API를 만들면 [`docs/backend-auth.md`](docs/backend-auth.md), 화면에서 API를 부르면 [`docs/frontend-api.md`](docs/frontend-api.md)
- AI(Claude Code·Codex)에게는 번호만 말하면 된다. 예: "api-spec.md 5번 기준으로 `/points` 만들어 줘"
- **팀원은 문서(`docs/`·이 파일·`AGENTS.md`)를 고치지 않는다.** 바꿀 내용은 PR 설명이나 단톡에 → 현숙이 반영

## 지금 상태 (main 기준, 10/26 — PR #53까지)

| 영역 | 상태 |
| --- | --- |
| DB | ✅ `001`~`007`·`009`(품목별 기록 `scan_items`)·`010`(수확 보너스 필요한 나무만) 적용. `008`은 사용 안 함, 다음 새 번호 `011` ([migrations/README.md](supabase/migrations/README.md)). **10/30부터 새 테이블은 GRANT를 직접 써야 함** (README 규칙 7, 기존 테이블은 영향 없음) |
| 나의 숲 DB | ✅ `007` DB 함수(물 주기·수확·보너스, 5그루째 텀블러 자동) 적용 (api-spec 6번) |
| 판별·물방울·포인트·나의 숲 | ✅ 실제 연결 — YOLO 판별·적립 하루 5회, 잔액·내역·그래프, 물 주기·수확·컬렉션·보상 신청 (경난, PR #23). 인식 실패는 저장 안 함(500 해결)·품목별 통계 `GET /scans/stats`·포인트 화면 품목 막대·나무/AI 사진 커뮤니티 공유·나의 숲 문구 정리 (PR #43). AI 인증 결과 "커뮤니티 업로드" → 사진·글 팝업에서 바로 게시 (경난, PR #48) → **인증글로, 보상은 같은 판별 결과당 1번** (PR #52·#53, 10/26) |
| 기부 | ✅ 실제 DB 연결 — **1P 단위·1P부터** (10/23 변경, PR #46), 기부처 5개(시연용 가짜), 잔액 부족 → 400 (지원, PR #24), 로그아웃 상태 둘러보기 (PR #35) |
| 친구 초대 | ✅ 실제 DB 연결 — 내 코드·친구 수·링크 복사, 코드 주인에게 💧2·5명마다 ⭐1000 (지원, PR #35). 코드 입력 = 가입 화면 추천인 코드 (현숙, PR #36) |
| 퀴즈 | ✅ 실제 DB 연결 — 회원별 하루 3문제, 정답 +10P·모두 정답 +50P, 맞힌 문제는 다시 안 나옴 (지원, PR #19) |
| 출석·적립왕 | ✅ 실제 DB 연결 — 출석 💧1·7일 연속(월~일) 💧7 (PR #21), 이달의 적립왕 1~10위 (PR #22)·지난달 순위 보상 ⭐500~100 (PR #41) (지원) |
| 커뮤니티 | ✅ 실제 DB 연결 — 글·사진(WEBP 압축)·수정·삭제·좋아요·댓글 (선영, PR #20) · 인증글 보상 💧1·⭐1은 **PR #52(10/26)부터 실제 지급** (AI 결과 공유 글과 합쳐 하루 5회), 글 전문 팝업 (PR #29) |
| 회원 | ✅ 가입(자치구·사진 공개 동의·추천인 코드 선택)·로그인·로그아웃·로그인 유지·`RequireAuth`, 가입 시 💧3, `GET/PATCH /me` |
| 공용 API 도구 | ✅ `api/client.js`·`useApi.js` (토큰 자동 첨부, 한국어 오류) |
| 챗봇 포티 | ✅ PC·폰 실제 연결, CSV에 없는 질문은 ChatGPT가 답함 (키는 백엔드 `.env`, 선영 PR #49) |
| 홈 | ✅ 나의 숲·자랑 피드·적립왕 실제 연결, 리워크 준비 중 팝업 (선영, PR #29), 친구 초대 카드·나의 숲 카드 정리, 커뮤니티 내 프로필 = 내 나무 사진, 저탄소샵 → 친환경샵, PC 메뉴바 정리 (PR #38). 홈 "친환경 기업 추천" = 친환경샵 쇼핑몰 3곳(무료 사진), PC 헤더 이름 앞 새싹 (선영 PR #49·지원 PR #47) |
| 마이페이지 | ✅ 실제 연결 (지원, PR #30 10/22 merge) — 회원 정보 수정·로그아웃·잔액·나무·쿠폰함(`GET /me/coupons`, 번호 DB 없이 계산)·내 활동, 나의 기부 내역은 기부하기 화면 아래로, 빈 쿠폰함 안내 (PR #32) |
| 헤더 잔액 | ✅ PC 헤더·모바일 홈 위 막대의 💧·⭐·닉네임 실제 연결, 퀴즈 포인트도 서버 잔액 (지원, PR #33). 판별·물 주기·기부 직후 PC 헤더 숫자는 새로고침 전까지 그대로. 커뮤니티·나의 숲 모바일 위 막대는 아직 가짜 → 1단계 후 모바일 공통 상단 바로. PC 헤더 알림 종 = 내 글에 새 댓글 (지원, PR #47) |
| 화면 배포 | ✅ Vercel https://repick-tau.vercel.app — 서버가 없어서 로그인·화면 이동만 됨 |
| 아직 안 된 것 | 1단계 기능은 모두 연결됨. 남은 것: 백엔드 배포(배포처 정해지면 deploy.md 한 번에 정리), 실제 서버로 전체 흐름 확인 |

## 이번 주 (10/19~10/23, 1단계 마감 10/23)

| 날짜 | 할 일 |
| --- | --- |
| 월 10/19 | ✅ Vercel 화면 배포, 문서 정리, 퀴즈 PR #19·커뮤니티 PR #20 merge |
| 화 10/20 | ✅ 나의 숲 DB `007` 적용, 출석 PR #21·적립왕 PR #22 merge, 쿠폰함·출석 보너스 규칙 문서화 |
| 수 10/21 오전 | ✅ 현숙 AWS 수업 → 배포 B안(화면 Vercel + 서버 EC2, Docker 없음) |
| 수 10/21 | ✅ 현숙: 품목별 누적 통계 DB `009_scan_items.sql` 적용 → 경난: `/classify` 저장 + `GET /scans/stats` |
| 수 10/21 오후 | ✅ PR #23(경난 판별·포인트·숲)·#24(지원 기부)·#25~#28(문서)·#29(선영 홈) merge, DB `010` 적용, 노션 "배포까지 남은 일" 10/21 기준으로 고침 |
| 목 10/22 | ✅ 현숙: 쿠폰 용어 정리(api-spec 6번)·경난에게 문구 수정 전달, 노션 "배포까지 남은 일" 10/22 기준 · PR #30(지원 마이페이지)·#31(문서)·#32(빈 쿠폰함)·#33(헤더 잔액)·#35(친구 초대·기부 둘러보기)·#36(가입 추천인 코드)·#38(선영 홈·친환경샵)·#41(친환경샵 쇼핑몰·적립왕 보상)·#43(경난 판별 통계·나의 숲·포인트) merge, 미션 ⭐100 삭제 |
| 금 10/23 | ✅ 1단계 마감 · PR #46(기부 1P 단위)·#47(지원 알림 종·사진 교체)·#48(경난 AI 인증 커뮤니티 팝업)·#49(선영 챗봇 ChatGPT·홈 쇼핑몰)·#50(문서) merge · 백엔드 배포는 배포처 정해지면 |

## 할 일

**현숙**
- [ ] 팀 단톡에 문서 읽는 법 안내 (담당별 "읽을 곳", 문서는 팀장만 수정, `git pull` 습관) — 보낼지 결정
- [ ] 배포처 정하기 → [deploy.md](docs/deploy.md) 한 번에 정리 (지금 내 PC의 deploy.md 수정 1줄도 그때 같이), 리허설 날짜·AWS 담당
- [ ] 챗봇 ChatGPT 키: **누구의 OpenAI 키**(팀원 키 / 전용 키)를 배포 서버에 넣을지 정하기 → 사용 한도 걸기, 발표 후 삭제 (노션 "배포까지 남은 일" 3단계)
- [ ] 테스트 배포 직전: 내 PC `classify.py` 하루 적립 한도 1000(테스트용, 커밋 안 함) → 5로 되돌리기 (`git restore backend/app/routers/classify.py`)
- [ ] Vercel 2단계 인증 켜기, SigLIP2를 넣게 되면 [deploy.md](docs/deploy.md) "SigLIP2를 넣게 되면" 순서대로
- [ ] 팀원 PR 검토·merge, DB 질문 대응 (새 테이블은 `011_…sql`, README 표에 먼저 한 줄, **`service_role` GRANT 포함**)

**경난** — 1단계 할 일 완료 (PR #43). 남은 것은 api-spec 10번(confidence 기준·물방울 전환)

**지원** — (1단계 후) 모바일 공통 상단 바 `MobileHeader`

**팀 결정**: (10/19) 사은품 = 쿠폰 발행 · 기부 캠페인 = 시연용 가짜(3개 + 2개 추가) · 잔액 = 헤더·마이페이지 · 물방울→포인트 전환 = 맨 마지막 단계 · 판별 신뢰도 = YOLO 테스트 후 / (10/20) 5그루째 수확 = 텀블러 자동 · 나무 컬렉션(전부)과 보상용 모아 둔 나무(최대 5)는 따로 · 출석 7일 연속(월~일) 💧7 · 쿠폰 = 바코드 카드(시연용) · 카카오맵 도메인(localhost 포함)은 배포 후 등록 / (10/21) 수확 보너스 = 필요한 나무만 사용(쿠폰 1·노트 2·에코백 3, `010`) · 마이페이지 = 지원 · 쿠폰 번호 = DB 없이 계산(`008` 안 만듦) · 배포 = **B안(화면 Vercel + 서버 EC2), Docker 없음** / (10/23) 기부 = 1P 단위·1P부터 · 챗봇 = CSV에 없는 질문만 ChatGPT / (10/22) 쿠폰 용어: 사은품 4가지 모두 "쿠폰 카드"로 발행, "친환경 쿠폰"은 1그루 사은품 이름 (api-spec 6번) · 미션 "AI 인증 5회 ⭐100" 삭제 · 모바일 공통 상단 바 = 1단계 후(지원), 그 전까지 새 화면에 위 막대를 따로 만들지 않기. 남은 것은 api-spec 10번

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
