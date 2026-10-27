# RePick (4POTEN) 지금 상태

갱신일: 2026-10-27 (Asia/Seoul) · **덧붙이지 않고 고쳐 쓴다** (지난 내용은 `docs/history.md` 맨 아래에 한 줄)

분리배출 사진 → AI 판별 → 포티 안내 → 💧물방울·⭐포인트 적립 → 나무 성장·수확 → 사은품·기부.
React(Vite) 반응형 웹 + FastAPI + Supabase(Auth·DB·Storage). 앱(Expo)은 만들지 않음.

## 담당과 내가 읽을 곳

문서를 다 읽지 않아도 된다. **내 줄만** 읽는다. 숫자·API·규칙은 [`docs/api-spec.md`](docs/api-spec.md) 한 곳이 기준.

| 담당 | 맡은 것 | 읽을 곳 |
| --- | --- | --- |
| 현숙 (팀장) | 회원가입·로그인, Supabase DB 전체, 공용 API 도구(`frontend/src/api/`), 문서 정리, 배포 | 전부 + [`docs/deploy.md`](docs/deploy.md) |
| 경난 | AI 판별(카메라), 물방울·포인트, 나의 숲 | api-spec **3·5·6번** + 9번 "통장 type 표" |
| 선영 | 챗봇 포티, 커뮤니티 | api-spec **4·7번** |
| 지원 | 공통 화면·Layout(`App.jsx`·`components/`·`index.css`), 이벤트·퀴즈·출석·친구 초대, 기부, 친환경샵, 수거함 지도, 마이페이지 | api-spec **8번** + 5번 중 출석·친구·퀴즈 줄 |

- 모두 공통: 서버 API를 만들면 [`docs/backend-auth.md`](docs/backend-auth.md), 화면에서 API를 부르면 [`docs/frontend-api.md`](docs/frontend-api.md)
- AI(Claude Code·Codex)에게는 번호만 말하면 된다. 예: "api-spec.md 5번 기준으로 `/points` 만들어 줘"
- **팀원은 문서(`docs/`·이 파일·`AGENTS.md`)를 고치지 않는다.** 바꿀 내용은 PR 설명이나 단톡에 → 현숙이 반영
- **main = 실제 사이트** (merge하면 화면 Vercel·서버 Render 자동 배포). 로컬에서 확인 후 merge

## 지금 상태 (main 기준, 10/27 — PR #64까지)

| 영역 | 상태 |
| --- | --- |
| 배포 | ✅ **10/27 완료** — 화면 Vercel https://repick-tau.vercel.app + 서버 **Render**(Singapore, 2GB, 켜 둔 시간만 과금 → 안 쓸 때 Suspend). Railway는 신규 가입 중지, AWS EC2는 복잡해서 안 씀. 판별 모델 = **YOLO26s 하나**(Git에 포함, PR #58). 설정·끄고 켜기는 [deploy.md](docs/deploy.md) |
| 회원 | ✅ 가입(자치구·사진 공개 동의·추천인 코드)·로그인·로그아웃·로그인 유지·`RequireAuth`, 가입 시 💧3, `GET/PATCH /me`. **10/27**: 이메일 인증 ON(팀 Gmail로 발송, 링크 → 홈, PR #60·#62), 추천인 코드는 첫 로그인 때 등록, 비밀번호 **10자 + 영문 대·소문자·숫자·특수문자**(Supabase가 검사, PR #64) |
| DB | ✅ `001`~`007`·`009`·`010` 적용. `008`은 사용 안 함, 다음 새 번호 `011` ([migrations/README.md](supabase/migrations/README.md)). **10/30부터 새 테이블은 GRANT를 직접 써야 함** (README 규칙 7) |
| 판별·물방울·포인트·나의 숲 | ✅ 실제 연결 (경난) — YOLO 판별·적립 하루 5회, 잔액·내역·그래프, 물 주기·수확·컬렉션·보상, 품목별 통계, AI 결과 공유 = 인증글(같은 판별 결과당 보상 1번, PR #52·#53) |
| 커뮤니티·챗봇 | ✅ 실제 연결 (선영) — 글·사진·좋아요·댓글, 인증글 💧1·⭐1(하루 5회), 프로필 = 작성자 나무 사진 / 챗봇 CSV + 없으면 ChatGPT, 로그인 중 대화 유지 (PR #56) |
| 이벤트·기부·마이페이지 | ✅ 실제 연결 (지원) — 퀴즈·출석·적립왕(순위 보상)·친구 초대, 기부 1P 단위, 친환경샵 쇼핑몰, 마이페이지(쿠폰함·내 활동, 프로필 편집·로그아웃 버튼 위로 PR #61), 헤더 💧·⭐ 바로 갱신 |
| 아직 안 된 것 | 배포 사이트로 **전체 시연 흐름 리허설**, Render 메모리 확인, 카카오맵 도메인 등록, 모바일 공통 상단 바(지원) |

## 이번 주 (10/26~10/30, 발표 11/04)

| 날짜 | 할 일 |
| --- | --- |
| 월 10/26 | ✅ PR #52·#53(AI 결과 공유 = 인증글)·#56(선영: 작성자 나무 사진·헤더 잔액·챗봇 대화 유지) merge, 노트북 옮김(새 노트북은 백엔드 정상) |
| 화 10/27 | ✅ Railway 준비 PR #58(YOLO26s 모델·CPU torch) → Railway 가입 중지 → **Render 배포**(#59 문서) · 이메일 인증 #60·#62·#63 · 마이페이지 #61 · 비밀번호 강화 #64 |
| 수~금 | 배포 사이트 리허설(판별 → 물방울 → 나무 → 기부 → 챗봇 → 커뮤니티), 막힌 곳은 노션 "발표·시연 자료 모음" |

## 할 일

**현숙**
- [ ] 리허설 날짜 정하기 → 그날 Render **Resume**, 끝나면 **Suspend** ([deploy.md](docs/deploy.md) "끄고 켜기")
- [ ] 챗봇 ChatGPT 키: Render에 넣은 키에 **사용 한도** 걸기, 발표 후 삭제
- [ ] 발표 때 가입이 몰리면 인증 메일 1시간 30통 한도 → 필요하면 Supabase Rate Limits 올리기 / 시연 계정 미리 만들기
- [ ] Vercel 2단계 인증 켜기, 팀 단톡에 문서 읽는 법 안내(보낼지 결정)
- [ ] 팀원 PR 검토·merge, DB 질문 대응 (새 테이블은 `011_…sql`, README 표에 먼저 한 줄, **`service_role` GRANT 포함**)
- [ ] 발표 후: Render Delete, OpenAI 키·Gmail 앱 비밀번호 삭제

**경난** — 남은 것은 api-spec 10번(confidence 기준·물방울 전환)

**지원** — 모바일 공통 상단 바 `MobileHeader`, 카카오맵 도메인 등록(앱이 지원 님 계정이면)

**팀 결정**: (10/19) 사은품 = 쿠폰 발행 · 기부 캠페인 = 시연용 가짜 · 잔액 = 헤더·마이페이지 · 물방울→포인트 전환 = 맨 마지막 단계 · 판별 신뢰도 = YOLO 테스트 후 / (10/20) 5그루째 수확 = 텀블러 자동 · 출석 7일 연속(월~일) 💧7 · 쿠폰 = 바코드 카드(시연용) / (10/21) 수확 보너스 = 필요한 나무만 사용(`010`) · 쿠폰 번호 = DB 없이 계산 / (10/22) 쿠폰 용어 정리(api-spec 6번) · 미션 ⭐100 삭제 · 모바일 공통 상단 바 = 1단계 후(지원) / (10/23) 기부 = 1P 단위 · 챗봇 = CSV에 없는 질문만 ChatGPT / (10/27) **배포 = Vercel + Render**(전: EC2 B안 → Railway 유력) · 판별 모델 = YOLO26s 하나 · 이메일 인증 ON · 비밀번호 10자 + 대·소문자·숫자·특수문자. 남은 것은 api-spec 10번

## 실행 방법 (Windows, 터미널 2개)

| 무엇 | 어디서 | 명령 |
| --- | --- | --- |
| 화면 | `frontend` | `npm install`(처음·패키지 바뀌면) → `npm run dev` → http://localhost:5173 |
| 서버 | `backend` | `.venv\Scripts\activate` → `python -m uvicorn app.main:app --reload` → http://localhost:8000/docs |
| 패키지 | `backend` | `python -m pip install -r requirements.txt` |

- 키: `frontend/.env`(URL·publishable 키만), `backend/.env`(secret 키). `.env.example`을 복사해서 만들고 Git·메신저에 올리지 않음.
- 로그인 상태에서 빨간 "서버에 연결하지 못했어요"가 뜨면 백엔드가 꺼진 것 (로컬: uvicorn, 배포: Render Suspend 상태).

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
| 배포(Render·Vercel)·이메일 인증·비밀번호 설정 | [`docs/deploy.md`](docs/deploy.md) |
| 화면에서 API 부르기 / 서버에서 로그인 확인 | [`docs/frontend-api.md`](docs/frontend-api.md) / [`docs/backend-auth.md`](docs/backend-auth.md) |
| DB 파일 번호 | [`supabase/migrations/README.md`](supabase/migrations/README.md) |
| AI 작업 규칙 | [`AGENTS.md`](AGENTS.md) |
| 지난 기록 | [`docs/history.md`](docs/history.md) — 고치지 않음 |

다음 대화 시작 문장: "AGENTS.md와 PROJECT_CONTEXT.md를 읽고 RePick을 이어가 줘. 오늘 할 일을 알려 줄게."
