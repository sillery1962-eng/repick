# RePick 배포 체크리스트

갱신일: 2026-10-22 · 담당: 현숙 (+ 10/23에 정할 AWS 담당)

배포 때 해야 할 일은 잊지 않도록 **생길 때마다 여기에 추가**한다 (사용자 요청 10/16). 끝나면 [x].
팀원은 이 파일을 읽지 않아도 된다. 지금 상태 요약은 [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).

참고 노션: "생성형AI Web App 프로젝트 AWS 배포" → 6. 교안 → RePick 적용 정리 · 7. 실습 기록 (막힌 곳·해결법)

## 지금 구조와 정할 것

| | 상태 |
| --- | --- |
| 화면 | ✅ Vercel **https://repick-tau.vercel.app** (10/19). main에 merge하면 자동 배포. 환경변수를 바꾸면 Deployments → ⋯ → **Redeploy** |
| 백엔드 | AWS EC2, **발표일(과 리허설)에만 켜고 끝나면 내림** (10/16 팀 결정). **10/23(금)** 첫 배포 예정 (10/22에서 하루 미룸 — 정리 후 한 번에, 크레딧 절약) |
| ⏳ 배포처 | **Railway가 유력** (10/26, 아직 확정 전). 강사 확인 완료: AWS가 아니어도 됨. 확정되면 이 파일을 Railway 기준으로 한 번에 정리. **배포: 10/27(화) 오후 2시 15분 이후** |
| 구조 (10/21) | **B안 = 화면 Vercel + 서버 EC2, Docker 없이** (10/21 결정). 교안의 Docker(화면·서버를 EC2 한 대에 묶는 A안용)는 쓰지 않고, EC2에서 FastAPI를 내 컴퓨터처럼 Python으로 직접 실행. SigLIP2를 넣게 되면 아래 "SigLIP2를 넣게 되면" |

## Railway로 정해지면 — 10/27(화) 배포 순서 (10/26 정리, 아직 확정 전)

화면(Vercel)과 DB(Supabase)는 그대로. 백엔드만 Railway에 올린다. Docker 없이 GitHub 연결(Railway가 `requirements.txt`를 보고 Python으로 알아서 빌드 — Railpack).
아래 "백엔드 (AWS EC2)" 절은 Railway로 정해지면 쓰지 않는다.

**Trial(처음 $5 무료 크레딧) 한도** (공식 문서 10/26 확인): 서비스당 **RAM 1GB**·2 vCPU, 빌드 결과(이미지) **최대 4GB**. 켜 둔 시간만큼 크레딧이 줄어듦 (RAM 1GB를 한 달 내내 켜면 약 $10 → $5는 약 2주). 크레딧이 끝나면 Hobby(월 $5)로 올려야 함

### 0단계 — Railway 가입 (10/26 미리)

- [ ] railway.com → Login → **GitHub(`sillery1962-eng`, 저장소 주인)으로 가입**. Trial = $5 크레딧, **가입일부터 30일** (11/04 발표까지 충분). 서버를 켜 둔 동안만 크레딧이 줄어듦
- [ ] **https://railway.com/verify 에서 인증(Verified) 확인** ⚠️ 인증 안 된 Limited Trial은 서버 밖으로 나가는 연결이 막혀서 Supabase·OpenAI에 못 붙음 → 우리 서버는 작동 안 함. 인증은 GitHub 계정 가입 기간·활동으로 자동 결정(요청 불가). 안 되면 Hobby(월 $5, 카드)
- 체험이 끝나면(30일 또는 $5 소진) Free 플랜(RAM 0.5GB)으로 내려가서 YOLO 서버는 못 돌림

### 1단계 — 배포 전 코드 PR (이게 없으면 서버가 안 켜짐)

- [ ] **YOLO 모델 파일을 Git에 넣기** ⚠️ 가장 중요: `backend/app/ai/models/yolo/yolo26s/best_26s.pt`(약 20MB)가 `.gitignore`의 `*.pt` 때문에 GitHub에 없음. Railway는 GitHub에서 가져가므로 이대로면 `classify.py`가 켜질 때 모델을 못 찾아 **서버 전체가 멈춤**. `.gitignore`에 `!backend/app/ai/models/yolo/yolo26s/best_26s.pt` 한 줄 추가 → 그 파일만 커밋 (GitHub 한도 100MB 안. 모델 주인 경난 님께 알리기)
- [ ] **PyTorch CPU 버전**: `requirements.txt`에 torch가 따로 없어서 `ultralytics`가 리눅스용 기본 torch(GPU용, 몇 GB)를 받음 → Trial 이미지 한도 4GB를 넘을 수 있음. `requirements.txt` 맨 위에 `--extra-index-url https://download.pytorch.org/whl/cpu`, 아래에 `torch==2.14.1+cpu`·`torchvision==0.29.1+cpu` (내 PC와 같은 버전, 10/26 확인). 내 PC는 이미 CPU 버전이라 영향 없음
- [ ] 이 PR merge 후 `main`에서 배포

### 2단계 — Railway 화면에서 (브라우저)

- [ ] GitHub 로그인 → New Project → **Deploy from GitHub repo** → `sillery1962-eng/repick`
- [ ] Settings → **Root Directory** = `/backend` (우리 저장소는 화면·서버가 한 저장소에 있어서)
- [ ] Settings → **Custom Start Command** = `uvicorn app.main:app --host 0.0.0.0 --port $PORT` (Railway 기본값은 `main:app`이라 우리 폴더 구조와 다름. 포트는 Railway가 정해 주는 `$PORT`)
- [ ] Settings → **Healthcheck Path** = `/api/v1/health`
- [ ] Variables (Git·메신저 금지, Railway 화면에만): `SUPABASE_URL` · `SUPABASE_SECRET_KEY` · `FRONTEND_ORIGIN` = **`https://repick-tau.vercel.app`** (끝에 `/` 없이) · `OPENAI_API_KEY`(누구 키인지 정한 뒤, 없으면 챗봇은 CSV만) · **`RAILPACK_PYTHON_VERSION` = `3.12`** (내 PC와 같게. 안 넣으면 Railway 기본 3.13)
- [ ] Settings → Networking → **Generate Domain** → `https://○○○.up.railway.app` 주소가 생김 (HTTPS 자동 — EC2 때의 Duck DNS·Caddy 필요 없음)

### 3단계 — 화면(Vercel) 연결

- [ ] Vercel 환경변수 `VITE_API_URL` = `https://○○○.up.railway.app/api/v1`
- [ ] Vercel 환경변수 `VITE_CHATBOT_API_URL` = `https://○○○.up.railway.app` (`/api/v1` 없이 — 챗봇 화면이 따로 읽음)
- [ ] Deployments → ⋯ → **Redeploy** (환경변수는 다시 빌드해야 반영)

### 4단계 — 확인

- [ ] 브라우저로 `https://○○○.up.railway.app/api/v1/health` → `{"status":"ok"}`
- [ ] https://repick-tau.vercel.app 에서 로그인 → 포인트·나의 숲 → **AI 판별 1번** → 챗봇 → 커뮤니티 글 순서로
- [ ] Railway → Metrics에서 **메모리** 확인. 판별할 때 1GB 가까이 가거나 서버가 재시작되면(로그에 `OOM`·`Killed`) Trial로는 부족 → Hobby로
- [ ] 걸린 시간·막힌 곳 기록 (노션 "발표·시연 자료 모음")

### 막히면

| 증상 (Railway 로그) | 원인 → 해결 |
| --- | --- |
| `YOLO 모델 파일을 찾을 수 없습니다` | 1단계 모델 파일 커밋이 안 됨 |
| 빌드가 이미지 크기 초과로 실패 | torch가 GPU 버전으로 설치됨 → 1단계 CPU 버전 확인 |
| `ImportError: libGL.so.1` | OpenCV에 필요한 리눅스 부품이 없음 → Variables에 `RAILPACK_DEPLOY_APT_PACKAGES` = `libgl1 libglib2.0-0` 넣고 다시 배포 |
| 화면에서 "서버에 연결하지 못했어요" | `VITE_API_URL` 주소·Redeploy 확인, 또는 `FRONTEND_ORIGIN` 오타(CORS) |
| `Application failed to respond` | 시작 명령의 `--port $PORT`·`--host 0.0.0.0` 확인 |

- 이달의 적립왕 매달 보상 예약(cron)은 **안 넣음** — 순위 화면을 처음 열 때 지급하는 안전장치가 있음. Railway cron은 UTC 기준이고 따로 서비스를 하나 더 만들어야 함
- 발표 후: Railway 프로젝트 삭제 (크레딧·요금 정리), OpenAI 키 삭제

## 화면 (Vercel)

- [x] **새로고침 404 막기**: `frontend/vercel.json`(rewrites)으로 모든 주소를 `index.html`로 (PR #18, 10/19)
- [x] **대소문자**: import 경로 152개가 실제 파일 이름과 같음, `npm run build` 통과 (10/19). 새 파일이 생기면 배포 전에 다시 `npm run build`
- [x] **Supabase 주소**: Authentication → URL Configuration의 Site URL = `https://repick-tau.vercel.app`, Redirect URLs에 `http://localhost:5173/**` (10/19)
- [ ] **카카오맵**: 키(`VITE_KAKAO_JS_KEY`)는 로컬 `.env`·Vercel 모두 입력함 (10/19). 남은 것: 카카오 개발자 사이트 → 내 앱 → 플랫폼(Web)에 **`https://repick-tau.vercel.app`** 등록. **로컬 `http://localhost:5173`도 같이 등록** (10/20 기준 미등록이라 내 컴퓨터 크롬에서도 지도가 안 나옴 — 담당과 배포 후 한꺼번에 하기로 함). 앱이 지원 님 계정에 있으면 지원 님께 부탁
- [ ] **환경변수 입력**(Git·메신저 금지): 프론트 `VITE_SUPABASE_URL`·`VITE_SUPABASE_PUBLISHABLE_KEY`·`VITE_KAKAO_JS_KEY`(✅ 이 셋은 Vercel 입력 10/19)·`VITE_REPORT_CONTACT`·`VITE_API_URL` / 백엔드 `backend/.env.example`의 값(secret 키는 백엔드에만)
- [ ] **서버 꺼짐 안내 문구**: `frontend/src/api/client.js` status 0 문구 "백엔드 서버(uvicorn)가 켜져 있는지…" → 회원용 "서버에 연결하지 못했어요. 잠시 후 다시 시도해 주세요." (개발 중에는 원인이 보이게 지금 문구 유지 — 사용자 결정. `import.meta.env.DEV`로 나누는 방법도 있음)

## 서버 주소 연결 (화면 Vercel ↔ 서버 EC2)

- [ ] **프론트 주소**: Vercel 환경변수 `VITE_API_URL` = 실제 백엔드 주소 + `/api/v1` (비우면 localhost:8000)
- [ ] **챗봇 서버 주소**: 챗봇 화면(`pages/Chat/ChatPc.jsx`)은 `VITE_CHATBOT_API_URL`(없으면 `http://localhost:8000`)을 따로 읽음 → 실제 백엔드 주소(`/api/v1` 빼고). `.env.example`에는 아직 없음 (PR #17). 공용 `VITE_API_URL`로 합치는 것도 방법
- [ ] **CORS**: 백엔드 환경변수 `FRONTEND_ORIGIN` = `https://repick-tau.vercel.app` (`main.py`의 localhost 주소는 그대로 둬도 됨)

## 백엔드 (AWS EC2)

- [ ] **실행 방법 (Docker 없이)**: EC2 접속 → `git clone` → `python3 -m venv .venv` → `pip install -r requirements.txt` → `.env` 작성 → uvicorn을 **systemd 서비스**로 등록(서버가 재시작돼도 자동 실행) → Caddy가 HTTPS로 uvicorn(8000)에 연결. 내 컴퓨터 실행 방법과 거의 같음
- [ ] **HTTPS**: Duck DNS 무료 주소 + Caddy 인증서 자동 발급 (10/18 집 실습에서 성공). 백엔드가 `http://`면 `https://` 화면에서 브라우저가 막음
- [ ] **주소 고정**: EC2를 껐다 켜면 IP가 바뀜 → Duck DNS에서 IP만 수정 (화면 재빌드 불필요). 장소가 바뀌면 보안 그룹 SSH 소스를 "내 IP"로 다시
- [ ] **서버 크기**: 무료 플랜이라 **`t3.medium`은 못 씀** → `t3.small`(2GB) / `c7i-flex.large`(4GB) / `m7i-flex.large`(8GB) 중에서 (인스턴스 유형 칸에서 "프리 티어 사용 가능" 표시 확인). 모델 `.pt` 약 21MB, 판정은 **YOLO26s + YOLO11s 앙상블** 예정, SigLIP2는 정확도·판별 시간을 비교한 뒤 결정 (경난, 10/19). SigLIP2를 넣으면 8GB (아래 "SigLIP2를 넣게 되면"). 큰 서버일수록 크레딧이 빨리 줄어듦. PyTorch는 CPU 전용 버전으로. 리허설 때 실제 메모리 확인
- [ ] **이달의 적립왕 순위 보상 예약** (PR #41): EC2 cron `5 0 1 * * cd /경로/backend && .venv/bin/python -m app.jobs.monthly_ranking_reward >> logs/ranking_reward.log 2>&1` (서버 시간대 `Asia/Seoul`로: `sudo timedatectl set-timezone Asia/Seoul`). 서버를 발표일에만 켜면 cron은 거의 안 돌지만, 순위 화면을 처음 열 때 지급하는 안전장치가 있어서 **안 넣어도 됨** (넣으면 더 확실)
- [ ] **파일 포함**: `backend/data/`(CSV·퀴즈·기부처 JSON), YOLO 모델 `.pt`(Git에 없으면 경난 님께 받는 방법 확인). 서버 `.env`는 EC2에서 heredoc으로 직접 작성
- [ ] **리허설**: 발표 전에 최소 1번 켜기 → 전체 시연 → 내리기 (순서·걸리는 시간 기록). **날짜·AWS 담당은 10/23(금)** 진도 보고 정함
- [ ] **과금 안전장치**: 무료 플랜(크레딧)이라 예산 알림은 보류 → Billing → 크레딧 잔액을 가끔 확인. 리허설~발표 사이는 **중지**, 발표 후 **종료**. 중지해도 디스크(EBS) 요금은 붙음. 고정 IP(Elastic IP)를 만들었으면 같이 정리
- [ ] 발표일 외에는 백엔드가 꺼져 있으므로 배포 화면에서 판별·포인트 등은 "서버에 연결하지 못했어요"가 정상 (팀원·지인 테스트는 로컬로)

## SigLIP2를 넣게 되면 (경난 - 정확도·판별 시간 비교 후 결정)

메모리가 커지므로 위에서부터 차례로 시도한다. 화면(Vercel)과 DB(Supabase)는 어느 안이든 그대로.

| 순서 | 방법 | 바뀌는 것 | 주의 |
| --- | --- | --- | --- |
| 1차 | **같은 EC2, 유형만 `m7i-flex.large`(8GB)** | 인스턴스 유형만. 코드·실행 방법 그대로 | "프리 티어 사용 가능" 표시 확인, 크레딧이 빨리 줄어듦. **스왑 2~4GB** 추가(메모리가 모자랄 때 서버가 죽지 않고 느려지게). 디스크(EBS)는 모델 파일까지 들어가게 넉넉히 |
| 2차 | 8GB로도 모자라면 **백엔드를 Hugging Face Spaces로** (무료 하드웨어 2 vCPU·16GB) | `Dockerfile` 1개 추가, Vercel `VITE_API_URL`·챗봇 주소, `FRONTEND_ORIGIN` | Docker Space는 **PRO 월 $9** 필요. 안 쓰면 잠들어서 발표 전에 미리 열어 깨우기. 디스크가 유지되지 않아 모델은 시작할 때마다 다시 읽음. 강사 확인 완료(AWS 아니어도 됨, 10/26) |
| 3차 | **Railway** (Docker 없이 GitHub 연결) — 10/26 유력 배포처 | 2차와 같은 주소 변경 | **처음 $5 크레딧 무료**, 그 뒤 Hobby 월 $5(사용료 포함) + 쓴 만큼(RAM 1GB를 한 달 켜면 약 $10). 강사 확인 완료(AWS 아니어도 됨, 10/26) |

- 공통: 처음 켤 때 모델을 읽느라 시작이 오래 걸림 → **리허설 때 시작 시간·메모리·판별 시간 기록**
- 가격은 자주 바뀌므로 결제 전에 공식 가격 페이지 확인

## DB (Supabase)

- [ ] **새 테이블 GRANT** (10/30 Supabase 정책 변경): 10/30 이후 만드는 테이블(`011`부터)에 `service_role` GRANT가 들어갔는지 확인 → [migrations/README.md](../supabase/migrations/README.md) 규칙 7. 없으면 FastAPI가 `permission denied`
- [ ] **Supabase 프로젝트를 새로 만들 일이 생기면** (지금 계획 없음): 지금까지의 migration 파일을 다시 실행해도 GRANT가 없어 전부 막힘 → 모든 테이블 GRANT를 새 번호 파일로 추가해서 같이 실행

## 발표 전후 정리

- [ ] **시연 노트북 스마트 앱 컨트롤** (10/26, 백엔드를 시연 노트북에서 직접 켤 경우): Windows 11의 이 기능이 켜져 있으면 PyTorch 파일(`torch_python.dll`)을 막아서 **백엔드 서버가 아예 안 켜짐** (오류 `WinError 4551 애플리케이션 제어 정책에서 이 파일을 차단했습니다`, 현숙 노트북에서 10/26 발생). 평가 모드였다가 며칠 사이에 저절로 켜질 수 있음
  - 상태 확인: Windows 보안 → 앱 및 브라우저 컨트롤 → 스마트 앱 컨트롤 (켬·평가·끄기)
  - 학원 노트북이면 **먼저 학원 허락** (관리 PC는 잠겨 있을 수 있음) → 끄기. 끄면 Windows를 다시 설치하기 전까지 다시 켤 수 없음 → 시연 후 초기화하면 원래대로
  - **리허설 때 서버가 켜지는지 확인 + 시연 전날 한 번 더**
- [ ] **테스트 계정 정리**: Supabase Auth의 test1·test2 등 가짜 계정 지울지 결정 / 이메일 인증(Confirm email) 계속 끌지 결정
- [ ] (선택) 안 쓰는 파일 정리: `WelcomePage.backup.jsx`, `TreeArt.jsx`
- [ ] 수업용 EC2(`ai-study-lab`, `ai-study-lab-class`) 종료 — 수업·복습이 끝난 뒤
