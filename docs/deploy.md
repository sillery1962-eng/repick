# RePick 배포 체크리스트

갱신일: 2026-10-27 (이메일 인증·비밀번호 추가) · 담당: 현숙

배포 때 해야 할 일은 잊지 않도록 **생길 때마다 여기에 추가**한다 (사용자 요청 10/16). 끝나면 [x].
팀원은 이 파일을 읽지 않아도 된다. 지금 상태 요약은 [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).

참고 노션: "RePick 백엔드 Render 배포 기록 (10/27)" (실제 서버 주소는 여기에) · 지난 검토는 "생성형AI Web App 프로젝트 AWS 배포" → 7. 실습 기록

## 지금 구조 (10/27 배포 완료)

| 부분 | 어디 | 상태 |
| --- | --- | --- |
| 화면 | Vercel **https://repick-tau.vercel.app** | ✅ (10/19). main에 merge하면 자동 배포 |
| 백엔드 | **Render** (Singapore, 1 CPU · 2GB) `https://○○○.onrender.com` | ✅ (10/27). main에 merge하면 자동 배포 |
| DB·로그인·사진 | Supabase | 그대로 |
| 판별 모델 | YOLO26s 하나 (`best_26s.pt` 약 20MB, GitHub에 포함 — PR #58) | ✅ |

- Railway는 신규 가입이 막혀서(10/21 장애 후 가입 중지) Render로 감. AWS EC2는 너무 복잡해서 안 씀. Docker 없음
- `backend/railway.json`·`docs/deploy-railway.md`는 Render가 읽지 않음 (Railway가 열리면 예비용)

## 비용

- Render 2GB = **월 $25**지만 **켜 둔 시간만 초 단위 과금** → 하루 약 $0.83
- 테스트 안 할 때는 **Suspend** (아래 "끄고 켜기") → 그동안 과금 멈춤
- 계정(Hobby) 요금은 $0. 카드 등록함

## Render 설정값 (다시 만들 일이 생기면)

메뉴: **+ New → Web Service → GitHub → `sillery1962-eng/repick` → Connect**

| 칸 | 값 |
| --- | --- |
| Name | `repick-api` |
| Language | **Python 3** (기본값 Node로 잡히니 꼭 바꾸기) |
| Branch | `main` |
| Region | Singapore |
| Root Directory | `backend` |
| Build Command | `pip install -r requirements.txt && pip uninstall -y opencv-python && pip install --force-reinstall --no-deps opencv-python-headless` |
| Start Command | `uvicorn app.main:app --host 0.0.0.0 --port $PORT` |
| Compute | `$25 / month · 1 CPU · 2 GB RAM (1c-2g)` |
| Health Check Path (Advanced) | `/api/v1/health` |
| Auto-Deploy (Advanced) | `On Commit` |

- Build Command가 긴 이유: Render는 리눅스 부품(libGL)을 설치할 수 없어서, ultralytics가 같이 까는 일반 OpenCV를 지우고 headless만 남김 (`libGL.so.1` 에러 방지)
- PyTorch는 `requirements.txt`에서 CPU 버전으로 받음 (PR #58, GPU 버전은 수 GB)
- 로그의 `Ultralytics config directory ... not writable` 경고는 무시해도 됨

### Render 환경변수 (Environment)

값은 로컬 `backend/.env`와 같음. **채팅·Git·메신저에 붙이지 않기.** `Add from .env`로 붙여 넣은 뒤 아래를 확인

| KEY | VALUE |
| --- | --- |
| `SUPABASE_URL` | `.env`와 같음 |
| `SUPABASE_SECRET_KEY` | `.env`와 같음 |
| `FRONTEND_ORIGIN` | `https://repick-tau.vercel.app` (끝에 `/` 없이) |
| `OPENAI_API_KEY` | `.env`와 같음 (챗봇이 CSV에 없는 질문에 쓸 때, 없으면 CSV만) |
| `PYTHON_VERSION` | `3.12.10` (Render는 끝자리까지 써야 함) |

### Vercel 환경변수 (Settings → Environments → Production → Environment Variables)

| Key | Value | Type / Environments |
| --- | --- | --- |
| `VITE_API_URL` | `https://○○○.onrender.com/api/v1` | Config / Production·Preview |
| `VITE_CHATBOT_API_URL` | `https://○○○.onrender.com` (`/api/v1` 없이 — 챗봇 화면이 따로 읽음) | Config / Production·Preview |

- Environments 고를 때: 목록 → **Environments** → Production·Preview 체크 (`Preview Branches`는 건드리지 않음)
- 바꾼 뒤 **Deployments → 맨 위 ⋯ → Redeploy**

## 수정하고 나서 할 일

| 고친 것 | merge 후 할 일 |
| --- | --- |
| 화면 (`frontend/`) | 없음 — Vercel 자동 배포 (1~2분) |
| 서버 (`backend/`) | 없음 — Render 자동 배포. Render **Events**에서 `Deploy live` 확인 |
| `requirements.txt` | 없음 — 자동, 빌드가 더 오래 걸림 |
| DB (migration SQL) | 지금처럼 Supabase SQL Editor에서 실행 |
| **환경변수** | ⚠️ 자동 아님 → 바꾼 쪽(Vercel·Render)에서 **직접 Redeploy** |

- Render는 Root Directory가 `backend`라 **화면만 고친 merge에는 반응 안 함** (정상)
- main = 실제 사이트. **로컬에서 확인 후 merge**, 발표 전날부터는 꼭 필요한 수정만

## 끄고 켜기 (비용 아끼기)

- 끄기: Render 서비스 → **Settings** 맨 아래 → **Suspend Web Service**
- 켜기: 같은 자리 **Resume**
- 꺼 둔 동안 merge한 건 꺼진 동안 배포 안 됨 → 켠 뒤 Events에서 최신 커밋인지 확인, 아니면 **Manual Deploy → Deploy latest commit** (10/28: Suspend 중 merge한 PR #76이 Resume 후 자동으로 Deploy live — 그래도 확인은 매번)
- `backend/data/*.json`(기부처 등)은 서버가 켜질 때 한 번 읽음 → 이 파일만 바뀐 PR도 Render가 새로 배포돼야 반영
- 꺼져 있으면 배포 화면에서 "서버에 연결하지 못했어요"가 정상 (팀원·지인 테스트는 로컬로)

## 확인

- [x] `https://○○○.onrender.com/api/v1/health` → `{"status":"ok"}` (10/27)
- [x] 배포 화면 로그인·판별 (10/27)
- [ ] 발표 전 리허설: 전체 시연 흐름 한 번 (판별 → 물방울 → 나무 → 기부 → 챗봇 → 커뮤니티), 걸린 시간·막힌 곳은 노션 "발표·시연 자료 모음"에 — **YOLO 완성 후, 월 11/02 아침 Resume 예정** (10/29)
- [x] **OpenAI 사용 한도 $10** (Limits → Organization spend limit, Limit enforced, 알림 50·80·100%, 10/29). 넘으면 ChatGPT 답만 멈추고 CSV 답은 그대로. 매달 1일 0으로 돌아감
- [x] **시연 계정** = 팀 공용 Gmail로 가입 (10/29). 적립왕 순위는 그달 포인트만 → 11/01~11/03에 포인트 더 쌓기 (로컬 서버로 쌓아도 같은 DB)
- [ ] Render **Metrics**에서 메모리 사용량 확인 (2GB 안인지)
- [ ] **시연용 폰 "애니메이션 줄이기" 끄기** (갤럭시: 설정 → 접근성 → 애니메이션 줄이기 / 아이폰: 손쉬운 사용 → 동작 → 동작 줄이기). 켜져 있으면 `index.css` 공통 규칙 때문에 포티·홈 배너 애니메이션이 멈춤 — 고장 아님, 코드는 그대로 두기로 (10/28)

## 막히면

- Render 서비스 → **Logs** (또는 Events → 해당 배포)의 빨간 줄 + 위 10줄 정도 복사해서 Claude에게
- 화면은 되는데 데이터가 안 나오면: 브라우저 F12 → Console에 CORS 에러 → Render `FRONTEND_ORIGIN` 확인. **단, 서버가 500을 내도 브라우저에는 CORS 에러로 보임** → Render Logs에서 `500`·`Error:`로 검색해 진짜 원인 확인 (Traceback 마지막 줄 `○○Error: …`)
- Logs 검색 팁: 시간 범위(기본 Last hour)를 넓히기, 로그 시각은 UTC(한국 = +9시간)

| 증상 (Render 로그) | 원인 → 해결 |
| --- | --- |
| `YOLO 모델 파일을 찾을 수 없습니다` | `best_26s.pt`가 GitHub에 없음 → `.gitignore` 예외 줄 확인 (PR #58) |
| `ImportError: libGL.so.1` | Build Command의 OpenCV 바꾸기 부분이 빠짐 |
| 화면에서 "서버에 연결하지 못했어요" | Render가 Suspend 상태인지, Vercel `VITE_API_URL`·Redeploy 확인 |
| GET 여러 개가 한꺼번에 500, `httpx.RemoteProtocolError: Server disconnected` | Supabase 연결이 HTTP/2 하나라 끊기면 동시 요청이 모두 실패 → **PR #68에서 HTTP/1.1 연결 풀로 해결** (`backend/app/supabase_client.py`). Logs의 Supabase 줄이 `HTTP/1.1 200 OK`인지 확인 |

- 이달의 적립왕 매달 보상 예약(cron)은 **안 넣음** — 순위 화면을 처음 열 때 지급하는 안전장치가 있음

## 화면 (Vercel)

- [x] **새로고침 404 막기**: `frontend/vercel.json`(rewrites)으로 모든 주소를 `index.html`로 (PR #18, 10/19)
- [x] **대소문자**: import 경로 152개가 실제 파일 이름과 같음, `npm run build` 통과 (10/19). 새 파일이 생기면 배포 전에 다시 `npm run build`
- [x] **Supabase 주소**: Authentication → URL Configuration의 Site URL = `https://repick-tau.vercel.app`, Redirect URLs에 `http://localhost:5173/**`·**`https://repick-tau.vercel.app/**`** (10/19, 배포 주소는 10/27 추가 — 인증 메일 링크가 홈으로 돌아오려면 필요)
- [x] **서버 주소 연결**: Vercel `VITE_API_URL`·`VITE_CHATBOT_API_URL` = Render 주소, Render `FRONTEND_ORIGIN` = Vercel 주소 (10/27)
- [x] **카카오맵**: 키(`VITE_KAKAO_JS_KEY`)는 로컬 `.env`·Vercel 모두 입력함 (10/19). 카카오 개발자 사이트 → 내 앱 → 플랫폼(Web)에 배포 주소 등록 — 지원 님께 부탁해서 등록, 10/28 배포 사이트에서 지도 보임 확인. Vercel 키는 빌드 때 들어가므로 키를 바꾸면 Vercel **Redeploy** 필요
- [x] **환경변수 입력**(Git·메신저 금지): `VITE_SUPABASE_URL`·`VITE_SUPABASE_PUBLISHABLE_KEY`·`VITE_KAKAO_JS_KEY`·`VITE_API_URL`·`VITE_CHATBOT_API_URL`·`VITE_REPORT_CONTACT`(= 팀 공용 Gmail, 10/27) 모두 입력. `VITE_REPORT_CONTACT`는 수거함 지도 제보 창에만 쓰이고, 지금은 `REPORT_READY = false`(지원 `recycle-map/lib/constants.js`)라 화면에 안 보임
- [ ] **서버 꺼짐 안내 문구**: `frontend/src/api/client.js` status 0 문구 "백엔드 서버(uvicorn)가 켜져 있는지…" → 회원용 "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." (개발 중에는 원인이 보이게 지금 문구 유지 — 사용자 결정. `import.meta.env.DEV`로 나누는 방법도 있음)
- [ ] (선택) Vercel 2단계 인증 켜기

## 모델을 더 넣게 되면 (YOLO11s 앙상블·SigLIP2)

- `.pt` 파일은 `.gitignore`에 `best_26s.pt`처럼 **예외 한 줄**을 추가해야 GitHub·Render에 올라감
- 메모리가 늘어남 → Render Metrics에서 2GB를 넘으면 **Compute를 한 단계 큰 것으로** (Settings → Instance Type, 가격은 결제 전에 공식 페이지 확인)
- 처음 켤 때 모델을 읽느라 시작이 오래 걸림 → **리허설 때 시작 시간·메모리·판별 시간 기록**

## 이메일 인증·비밀번호 (Supabase Auth) — 10/27

- [x] **비밀번호 규칙**: Authentication → Sign In / Providers → **Email** 창 → Minimum password length **10**, Password requirements **Lowercase, uppercase letters, digits and symbols** (10/27, 코드 PR #64 배포 후 저장). 가입 화면 `SignupPage.jsx`의 `PASSWORD_RULES`와 같은 기준 — 바꾸면 둘 다

- [x] **Confirm email ON**: Authentication → Sign In / Providers → User Signups의 **Confirm email** (Email 제공자 창 안이 아님). 코드 준비 PR #60·#62 merge 후 켬 (10/27)
- [x] **메일 서버(SMTP)**: Authentication → Emails → SMTP Settings → **Enable Custom SMTP ON**, Host `smtp.gmail.com`·Port `587`·팀 공용 Gmail 계정 + **Google 앱 비밀번호**(Gmail 비밀번호 아님, 값은 문서·채팅 금지). 기본 메일 서비스는 Supabase 팀 멤버에게만 보내서 일반 회원이 인증 메일을 못 받음 → SMTP 필수. 발송 한도 **1시간 30통** (Rate Limits에서 조절)
  - "개인용 메일 서비스" 노란 경고는 시연 규모라 무시해도 됨
- [x] **메일 문구**: Authentication → Emails → Templates → **Confirm signup** 본문 "'이메일 인증하기'를 누르면 홈으로 이동합니다." (버튼 링크 `{{ .ConfirmationURL }}`은 그대로 둘 것)
- [x] 확인 (10/27): 팀원이 아닌 이메일로 가입 → 인증 메일 받음 → 링크 누르면 로그인된 상태로 이동
- [ ] 발표 때 관객이 한꺼번에 가입하면 1시간 30통을 넘을 수 있음 → 필요하면 Rate Limits에서 올리기 (시연 계정은 10/29 가입 ✅)
- 다시 끄고 싶으면 Confirm email만 OFF → 코드는 그대로 동작 (가입하면 바로 로그인)

## DB (Supabase)

- [x] **`011` 탈퇴 기록·30일 재가입 막기** 적용 (10/27): `withdrawn_emails` 표 + `auth.users` 가입 직전 트리거 `repick_block_rejoin_before_insert`. Supabase 프로젝트를 새로 만들면 이 트리거도 같이 실행해야 함
- [ ] **새 테이블 GRANT** (10/30 Supabase 정책 변경): 10/30 이후 만드는 테이블(`012`부터)에 `service_role` GRANT가 들어갔는지 확인 (`011`은 포함됨) → [migrations/README.md](../supabase/migrations/README.md) 규칙 7. 없으면 FastAPI가 `permission denied`
- [ ] **Supabase 프로젝트를 새로 만들 일이 생기면** (지금 계획 없음): 지금까지의 migration 파일을 다시 실행해도 GRANT가 없어 전부 막힘 → 모든 테이블 GRANT를 새 번호 파일로 추가해서 같이 실행

## 발표 전후 정리

- [ ] **시연 노트북 스마트 앱 컨트롤** (백엔드를 시연 노트북에서 직접 켤 경우만 — 지금은 Render라 해당 없음): Windows 11의 이 기능이 켜져 있으면 PyTorch 파일(`torch_python.dll`)을 막아서 **로컬 백엔드 서버가 안 켜짐** (오류 `WinError 4551`, 현숙 예전 노트북에서 10/26 발생). 상태 확인: Windows 보안 → 앱 및 브라우저 컨트롤 → 스마트 앱 컨트롤
- [ ] **테스트 계정 정리**: Supabase Auth의 test1·test2·test@test.com 등 가짜 계정 지울지 결정 (이메일 인증은 10/27에 켬 — 위 "이메일 인증")
- [ ] **발표 후 Gmail 앱 비밀번호 삭제** (Google 계정 → 보안 → 앱 비밀번호)
- [ ] (선택) 안 쓰는 파일 정리: `WelcomePage.backup.jsx`, `TreeArt.jsx`
- [ ] 수업용 EC2(`ai-study-lab`, `ai-study-lab-class`) 종료 — 수업·복습이 끝난 뒤
- [ ] **발표 후**: Render 서비스 **Delete** (Settings 맨 아래), OpenAI 키 Revoke 후 새로 발급
- [x] **1:1 문의 구글폼** (10/27, PR #66): 팀 공용 Gmail 계정으로 만든 폼 "RePick 1:1 문의"(닉네임·답변 받을 이메일·문의 유형·내용), 주소는 `components/PcFooter.jsx`의 `CONTACT_FORM_URL`. 발표 후 폼 응답 받기를 끌지 결정
  - **알림 = Apps Script** (폼 ⋮ → Apps Script, 프로젝트 "RePick 1:1 문의 알림"): 문의가 오면 RePick 메일로 `[RePick 문의] 유형 · 닉네임` 메일, **답장 받는 주소 = 문의자가 적은 이메일** → [답장]만 누르면 문의자에게 감. 구글 기본 알림(응답 탭 ⋮ → 새 응답 이메일 알림)은 **끔** (기본 알림은 noreply에서 와서 답장이 문의자에게 안 감)
  - 폼 질문 제목을 바꾸면 스크립트 위쪽 `Q_EMAIL` 등 제목도 같이 바꿀 것. 처음 설정 = `setup` 한 번 실행 + 권한 허용(트리거 생성). 여러 구글 계정이 로그인된 브라우저에서는 Apps Script가 "파일을 열 수 없습니다" → 시크릿 창에서 RePick 계정만으로
