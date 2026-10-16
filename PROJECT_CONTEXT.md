# RePick (4POTEN) 지금 상태

갱신일: 2026-10-16 (Asia/Seoul)

이 문서는 **지금 상태 한 장**이에요. 팀원·Codex·Claude Code가 새로 시작할 때 이것부터 읽어요.

## 문서 지도 — 어디에 무엇이 있나

| 알고 싶은 것 | 볼 곳 |
| --- | --- |
| 지금 상태·담당·할 일·배포 체크리스트 | **이 파일** |
| API 주소·응답 모양, **보상 숫자(물방울·포인트)**, 나무 단계, DB 표(ERD) | [`docs/api-spec.md`](docs/api-spec.md) — **최신 기준** (노션 명세 v0.4·보상표는 이전 기록) |
| 화면에서 FastAPI 부르기 (`useApi`, `api`) | [`docs/frontend-api.md`](docs/frontend-api.md) |
| 서버에서 로그인 확인 (`get_current_user`) | [`docs/backend-auth.md`](docs/backend-auth.md) |
| DB 파일 번호·실행 여부 | [`supabase/migrations/README.md`](supabase/migrations/README.md) |
| 작업 규칙 (AI용) | [`AGENTS.md`](AGENTS.md) |
| 지난 날짜별 기록 (10/8~10/16) | [`docs/history.md`](docs/history.md) — 고치지 않음 |

**문서 쓰는 규칙 (10/16 결정)**
- 이 파일은 **덧붙이지 않고 고쳐 쓴다.** 바뀐 내용은 그 줄을 고치고, 지난 내용이 필요하면 `docs/history.md` 맨 아래 "추가 기록"에 날짜와 한 줄.
- 숫자·API·규칙은 `docs/api-spec.md` **한 곳에만** 적는다. 여기에는 요약과 링크만.
- 회의에서 정해진 것은 `docs/api-spec.md`를 먼저 고치고(PR) 팀에 알린다.

## 서비스 한 줄

분리배출 사진 → AI 판별 → 포티 안내 → 💧물방울·⭐포인트 적립 → 나무 성장·수확 → 사은품·기부. React(Vite) 반응형 웹 + FastAPI + Supabase(Auth·DB·Storage). 앱(Expo)·Docker는 쓰지 않음.

## 담당

| 담당 | 맡은 것 |
| --- | --- |
| 현숙 (팀장) | 회원가입·로그인, Supabase DB 전체(SQL 일괄 작성), 공용 API 도구(`frontend/src/api/`), 마이페이지 로그인·로그아웃 연결 |
| 경난 | AI 판별(카메라), 물방울·포인트, 나의 숲 (10/16 선영 → 경난) |
| 지원 | 공통 화면·Layout(`App.jsx`·`components/`·`index.css` 소관), 이벤트·미션·퀴즈·출석·친구 초대, 기부, 저탄소샵(외부 링크), 수거함 지도 |
| 선영 | 챗봇 포티, 커뮤니티 |

## 지금까지 된 것 (main `c3e9b82` 기준)

| 영역 | 상태 |
| --- | --- |
| DB | ✅ `001`~`004` Supabase 실행 완료. 다음 번호 `005` |
| 회원 | ✅ 이메일 가입(자치구·사진 공개 필수 동의)·로그인·로그아웃·로그인 유지·문지기(`RequireAuth`). 가입 시 💧3 자동. `GET/PATCH /me` |
| 회원 화면 | ✅ PC 왼쪽에 숲 애니메이션(`GrowScene`, 9초 반복). 시작 화면(`/welcome`)은 안 씀 → `/login`으로 (원본 `WelcomePage.backup.jsx`). 가입 버튼 항상 진하게 + 동의 안내 |
| 공용 API 도구 | ✅ `api/client.js`·`useApi.js` — 토큰 자동 첨부, 오류 한국어 안내 (PR #11) |
| 챗봇 포티 | ✅ PC·폰 화면 모두 실제 연결 (PR #17) |
| 이벤트·친구·기부 | ✅ 화면 + 가짜 API (퀴즈 30문제 파일 `backend/data/quizzes.json`, 기부처 `campaigns.json`) — 저장·보상은 DB 연결 후 (PR #15) |
| 글꼴 | ✅ Noto Sans KR, 모든 화면이 `var(--font-base)` (PR #16) |
| 화면 | ✅ 지원 님 전체 화면(가짜 데이터) |
| 판별·물방울·포인트·숲·커뮤니티·이벤트 API | ⏳ 가짜 API → 팀원들이 DB 연결 중 |

## 확정 규칙 요약 (자세한 숫자는 `docs/api-spec.md`)

- 쓰기는 모두 FastAPI(secret 키)로만. 내 데이터는 반드시 `.eq("user_id", user["id"])`
- 💧·⭐는 `point_transactions`에 한 줄씩(`currency` = drop/point), 잔액은 합계로 계산
- 판별 클래스 6개(종이·페트·플라스틱·비닐·캔·건전지, 유리는 학습에서 빠져 제외), **판별 무제한·적립은 클래스 상관없이 하루 5회**
- 퀴즈 정답당 ⭐10 + 3개 모두 정답 보너스 ⭐50 / 미션(AI 인증 5회) ⭐100 매일 1번
- 나무 7단계(3·6·7·8·9·10·12 = 55💧), 수확한 나무를 모아 1·2·3·5그루에서 사은품 고르기
- 판별 사진은 서버에 저장 안 함. 커뮤니티 사진만 Storage `posts`
- 소셜 로그인 제외(필수 동의·닉네임·자치구 때문)
- 하루 = 한국 시간 0시 기준

## 할 일

**현숙 (회원 파트)**
- [ ] 마이페이지 로그인·로그아웃·회원 정보 연결 — **물방울·포인트 완성 후** (헤더에 연결이 모여 있음)
- [ ] 팀원 PR 검토·merge, DB 질문 대응 (새 테이블은 `005_…sql`, README 표에 먼저 한 줄)

**팀이 정할 것** → `docs/api-spec.md` 10번 (전환 최소 단위, 사은품 수령 방식, 기부 캠페인, 신뢰도, 잔액 표시 위치 등)

## 배포 체크리스트 (배포 때 할 일 — 생길 때마다 여기에 추가)

사용자 요청(10/16): 배포 때 해야 할 일은 잊지 않도록 이 목록에 계속 추가한다. 하나씩 끝나면 [x].

- [ ] **서버 꺼짐 안내 문구**: `frontend/src/api/client.js` status 0 문구 "백엔드 서버(uvicorn)가 켜져 있는지…" → 회원용 "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." (개발 중에는 원인이 보이게 지금 문구 유지 — 사용자 결정. `import.meta.env.DEV`로 나누는 방법도 있음)
- [ ] **프론트 주소**: 배포 사이트 환경변수 `VITE_API_URL` = 실제 백엔드 주소 + `/api/v1` (비우면 localhost:8000)
- [ ] **백엔드 주소**: 백엔드 환경변수 `FRONTEND_ORIGIN` = 실제 화면 주소 (CORS. `main.py`의 localhost 주소는 그대로 둬도 됨)
- [ ] **Supabase**: Authentication → URL Configuration의 Site URL = 실제 화면 주소. 비밀번호 찾기를 만들었으면 Redirect URLs에도 추가
- [ ] **챗봇 서버 주소**: 챗봇 화면(`pages/Chat/ChatPc.jsx`)은 `VITE_CHATBOT_API_URL`(없으면 `http://localhost:8000`)을 따로 읽음 → 배포 때 실제 백엔드 주소(`/api/v1` 빼고) 넣기. `.env.example`에는 아직 없음 (PR #17, 10/16). 공용 `VITE_API_URL`로 합치는 것도 방법
- [ ] **환경변수 입력**(Git·메신저 금지): 프론트 `VITE_SUPABASE_URL`·`VITE_SUPABASE_PUBLISHABLE_KEY`·`VITE_KAKAO_JS_KEY`·`VITE_REPORT_CONTACT`·`VITE_API_URL` / 백엔드 `backend/.env.example`의 값(secret 키는 백엔드에만)
- [ ] **새로고침 404 막기**: Vercel에서 `/login` 같은 주소를 새로고침하면 404 → `frontend/vercel.json`에 모든 주소를 `index.html`로 보내는 설정(rewrites) 추가
- [ ] **카카오맵**: 카카오 개발자 사이트 → 내 앱 → 플랫폼(Web)에 실제 화면 주소 등록 (안 하면 지도 안 뜸)
- [ ] **대소문자**: import 경로 대소문자가 실제 폴더와 같은지 (Windows는 통과해도 Vercel은 실패). `npm run build`로 미리 확인
- [ ] **백엔드 배포처 결정**(미정) + HTTPS, `backend/data/` CSV 포함 확인
- [ ] **테스트 계정 정리**: Supabase Auth의 test1·test2 등 가짜 계정 지울지 결정 / 이메일 인증(Confirm email) 계속 끌지 결정
- [ ] (선택) 안 쓰는 파일 정리: `WelcomePage.backup.jsx`, `TreeArt.jsx`

## 실행 방법 (Windows)

| 무엇 | 어디서 | 명령 |
| --- | --- | --- |
| 화면 | `frontend` | `npm install`(처음·패키지 바뀌면) → `npm run dev` → http://localhost:5173 |
| 서버 | `backend` | `.venv\Scripts\activate` → `python -m uvicorn app.main:app --reload` → http://localhost:8000/docs |
| 패키지 | `backend` | `python -m pip install -r requirements.txt` |

- 화면과 서버는 **터미널 2개**. `uvicorn.exe`가 앱 제어로 막히면 위처럼 `python -m`으로.
- 키: `frontend/.env`(URL·publishable 키만), `backend/.env`(secret 키). `.env.example`을 복사해서 만들고 Git·메신저에 올리지 않음.
- 로그인 상태에서 `/login`에 빨간 "서버에 연결하지 못했어요"가 뜨면 백엔드가 꺼진 것 (정상 동작).

## Git 작업 흐름

`git switch main` → `git pull origin main` → `git switch -c feature/작업명` → 작업·커밋 → `git push -u origin feature/작업명` → GitHub PR → merge → `git switch main` → `git pull origin main`
- main은 보호됨(문서는 팀장이 main에 바로 push하기도 함). 팀원은 기능 브랜치를 merge 후에도 계속 써도 되고, 작업 전 `git pull origin main` 필수.
- `git push --force` 금지. 커밋 전 `git status`로 저장·추가 확인.

## 폴더 구조 (요약)

```text
POTEN/
├─ PROJECT_CONTEXT.md · AGENTS.md · CLAUDE.md · README.md
├─ docs/            api-spec.md(기준) · frontend-api.md · backend-auth.md · history.md
├─ supabase/migrations/   001~004 ✅ · README.md(번호표)
├─ backend/app/     main.py · auth.py(get_current_user) · supabase_client.py · routers/(me ✅, chat·chatbot ✅, classify·points·posts·forest = 가짜)
│  └─ data/         포티 CSV (퀴즈 파일도 여기 예정)
└─ frontend/src/    App.jsx·components·index.css(지원) · api/(현숙) · lib/(supabase.js, AuthContext) · pages/auth/(현숙) · pages/*, features/*(각 담당)
```

## 다음 대화 시작 문장

> AGENTS.md와 PROJECT_CONTEXT.md를 읽고 RePick을 이어가 줘. 오늘 할 일을 알려 줄게.
