# RePick (리픽)

분리배출을 쉽고 보람 있게 만드는 모바일 우선 반응형 웹 서비스입니다. 팀 4POTEN이 만듭니다.

사진을 찍으면 AI가 품목을 판별하고, 챗봇 포티가 배출 방법을 안내합니다. 분리배출을 하면 💧물방울과 ⭐포인트가 쌓이고, 물방울로 나무를 키워 수확하면 사은품 쿠폰을, 포인트로는 기부를 할 수 있습니다.

```text
로그인 → 사진 촬영/업로드 → AI 판별 → 배출 안내(챗봇) → 💧·⭐ 적립 → 나무 성장·수확 → 쿠폰·기부
```

- 배포: https://repick-tau.vercel.app (화면 Vercel + 서버 Render. 서버를 쉬게 해 둔 동안에는 로그인·화면 이동만 됩니다)
- 지금 상태·담당·할 일: [`PROJECT_CONTEXT.md`](PROJECT_CONTEXT.md)
- API·보상 숫자·DB 표(ERD): [`docs/api-spec.md`](docs/api-spec.md) — **기준 문서**

## 기술 구성

| 영역 | 사용 기술 |
| --- | --- |
| 화면 | React (Vite), 폰·PC 브라우저 |
| 서버 | FastAPI (Python 3.12) |
| 회원·DB·사진 | Supabase (Auth + PostgreSQL + Storage), 이메일 인증(Gmail SMTP) |
| AI | YOLO26s 사진 판별 (6개 품목: 종이·페트·플라스틱·비닐·캔·건전지, PyTorch CPU) |
| 챗봇 | 포티 — 서울 자치구 CSV 검색 + 규칙이 먼저, **CSV에 없는 질문만 외부 LLM(OpenAI `gpt-4o-mini`)** 이 답함 (키는 서버 `.env`의 `OPENAI_API_KEY`, 없으면 CSV만) |
| 배포 | 화면 Vercel · 서버 Render (main에 merge하면 둘 다 자동 배포) |

```text
React ──가입·로그인·로그아웃──▶ Supabase Auth
React ──/api/v1/* + Bearer 토큰──▶ FastAPI ──▶ Supabase DB·Storage
                                        ├──▶ YOLO (판별)
                                        └──▶ OpenAI (챗봇, CSV에 없는 질문만)
```

## 폴더 구조

```text
POTEN/
├─ PROJECT_CONTEXT.md   # 지금 상태 (팀원은 여기부터)
├─ AGENTS.md · CLAUDE.md  # AI 도구(Codex·Claude Code) 작업 규칙
├─ docs/
│  ├─ api-spec.md      # ⭐ API 명세·보상표·ERD (기준)
│  ├─ frontend-api.md  # 화면에서 FastAPI 부르기 (useApi, api)
│  ├─ backend-auth.md  # 서버에서 로그인 확인 (get_current_user)
│  ├─ deploy.md        # 배포 체크리스트 (Render·Vercel·Supabase 설정)
│  └─ history.md       # 지난 기록
├─ backend/            # FastAPI 서버
│  ├─ app/main.py      # 서버 시작점, 라우터 등록
│  ├─ app/auth.py      # get_current_user (팀 공용)
│  ├─ app/routers/     # API 파일 (담당별)
│  ├─ data/            # 챗봇 CSV, 퀴즈·기부 캠페인 파일
│  └─ .env.example     # 환경설정 양식 (실제 값 없음)
├─ frontend/           # React 화면
│  ├─ src/pages/       # 화면 (PC·모바일)
│  ├─ src/features/    # 기능별 화면 (chatbot, events, recycle-map, reward)
│  ├─ src/api/         # 공용 API 도구 (토큰 자동 첨부)
│  └─ .env.example
└─ supabase/migrations/  # 테이블 만드는 SQL (001~011, 008은 안 씀)
```

## 시작하기 (Windows)

### 1. 코드 받기

```text
git clone https://github.com/sillery1962-eng/repick.git
```

### 2. 처음 한 번

```text
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt

cd ..\frontend
npm install
```

`backend/.env.example` → `backend/.env`, `frontend/.env.example` → `frontend/.env`로 복사해서 값을 채웁니다.
값은 Supabase 대시보드 → RePick 프로젝트 → Project Settings → API Keys에서 각자 확인합니다.

### 3. 켜기 (매번, 터미널 2개)

| 무엇 | 어디서 | 명령 |
| --- | --- | --- |
| 서버 | `backend` | `.venv\Scripts\activate` → `python -m uvicorn app.main:app --reload` |
| 화면 | `frontend` | `npm run dev` → http://localhost:5173 |

- `http://localhost:8000/api/v1/health` → `{"status":"ok"}`이면 서버 정상
- `http://localhost:8000/docs`에서 API를 직접 눌러 볼 수 있습니다. 로그인이 필요한 API 테스트 방법은 [docs/backend-auth.md](docs/backend-auth.md) 6절

## API (주소 앞에 `/api/v1`)

| 주소 | 기능 | 담당 | 상태 |
| --- | --- | --- | --- |
| `/me` | 내 정보 보기·수정·**회원 탈퇴**(탈퇴 후 30일 재가입 불가) | 현숙 | ✅ |
| `/me/coupons` · `/me/activity` | 마이페이지 쿠폰함·내 활동 | 지원 | ✅ |
| `/chat` | 챗봇 포티 (CSV + 없으면 ChatGPT) | 선영 | ✅ |
| `/classify` · `/scans/stats` | AI 판별·적립, 품목별 통계 | 경난 | ✅ |
| `/points` · `/points/history` · `/points/attendance` | 물방울·포인트 잔액·내역, 출석 | 경난·지원 | ✅ |
| `/forest` | 나의 숲 (물 주기·수확·사은품) | 경난 | ✅ |
| `/posts` | 커뮤니티 (글·사진·댓글·좋아요·인증글 보상) | 선영 | ✅ |
| `/events/quiz` · `/events/ranking` | 오늘의 퀴즈, 이달의 적립왕 | 지원 | ✅ |
| `/friends` · `/donations` | 친구 초대 · 기부 | 지원 | ✅ |

요청·응답 모양과 규칙은 [docs/api-spec.md](docs/api-spec.md)를 기준으로 합니다.

## 팀원이 API를 만들 때

[docs/backend-auth.md](docs/backend-auth.md)를 먼저 읽어 주세요. 꼭 지킬 것만 요약합니다.

- 로그인이 필요한 API에는 `user: dict = Depends(get_current_user)`를 붙입니다.
- DB를 조회할 때 `.eq("user_id", user["id"])`로 **본인 것만** 가져옵니다.
- 회원 ID를 요청 body나 주소로 받지 않습니다.
- 💧·⭐는 `point_transactions`에 한 줄씩 기록하고, 잔액은 합계로 계산합니다.
- 작업 시작 전과 PR 올리기 전에 `git pull origin main`. 문서는 팀장이 정리하므로 바꿀 내용은 PR 설명에 적습니다.

## 비밀정보 주의

- `.env` 파일과 Supabase secret 키, OpenAI 키는 **절대 Git에 올리거나 메신저로 보내지 않습니다.** (`.gitignore`로 막혀 있습니다.)
- 프론트엔드에는 Project URL과 publishable 키만 넣습니다.

## 팀

| 이름 | 담당 |
| --- | --- |
| 백현숙 | 팀장, 회원·DB, 배포 |
| 서경난 | AI 판별, 물방울·포인트, 나의 숲 |
| 오지원 | UI/UX·공통 화면, 이벤트·퀴즈, 기부, 수거함 지도 |
| 김선영 | 챗봇 포티, 커뮤니티 |
