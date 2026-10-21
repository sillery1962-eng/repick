# RePick 배포 체크리스트

갱신일: 2026-10-21 · 담당: 현숙 (+ 10/23에 정할 AWS 담당)

배포 때 해야 할 일은 잊지 않도록 **생길 때마다 여기에 추가**한다 (사용자 요청 10/16). 끝나면 [x].
팀원은 이 파일을 읽지 않아도 된다. 지금 상태 요약은 [`PROJECT_CONTEXT.md`](../PROJECT_CONTEXT.md).

참고 노션: "생성형AI Web App 프로젝트 AWS 배포" → 6. 교안 → RePick 적용 정리 · 7. 실습 기록 (막힌 곳·해결법)

## 지금 구조와 정할 것

| | 상태 |
| --- | --- |
| 화면 | ✅ Vercel **https://repick-tau.vercel.app** (10/19). main에 merge하면 자동 배포. 환경변수를 바꾸면 Deployments → ⋯ → **Redeploy** |
| 백엔드 | AWS EC2, **발표일(과 리허설)에만 켜고 끝나면 내림** (10/16 팀 결정). **10/22(목)** 첫 배포 예정 |
| ✅ 구조 | **B안 = 화면 Vercel + 서버 EC2, Docker 없이** (10/21 결정). 교안의 Docker(화면·서버를 EC2 한 대에 묶는 A안용)는 쓰지 않고, EC2에서 FastAPI를 내 컴퓨터처럼 Python으로 직접 실행. SigLIP2를 넣게 되면 아래 "SigLIP2를 넣게 되면" |

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
- [ ] **파일 포함**: `backend/data/`(CSV·퀴즈·기부처 JSON), YOLO 모델 `.pt`(Git에 없으면 경난 님께 받는 방법 확인). 서버 `.env`는 EC2에서 heredoc으로 직접 작성
- [ ] **리허설**: 발표 전에 최소 1번 켜기 → 전체 시연 → 내리기 (순서·걸리는 시간 기록). **날짜·AWS 담당은 10/23(금)** 진도 보고 정함
- [ ] **과금 안전장치**: 무료 플랜(크레딧)이라 예산 알림은 보류 → Billing → 크레딧 잔액을 가끔 확인. 리허설~발표 사이는 **중지**, 발표 후 **종료**. 중지해도 디스크(EBS) 요금은 붙음. 고정 IP(Elastic IP)를 만들었으면 같이 정리
- [ ] 발표일 외에는 백엔드가 꺼져 있으므로 배포 화면에서 판별·포인트 등은 "서버에 연결하지 못했어요"가 정상 (팀원·지인 테스트는 로컬로)

## SigLIP2를 넣게 되면 (경난이 정확도·판별 시간 비교 후 결정)

메모리가 커지므로 위에서부터 차례로 시도한다. 화면(Vercel)과 DB(Supabase)는 어느 안이든 그대로.

| 순서 | 방법 | 바뀌는 것 | 주의 |
| --- | --- | --- | --- |
| 1차 | **같은 EC2, 유형만 `m7i-flex.large`(8GB)** | 인스턴스 유형만. 코드·실행 방법 그대로 | "프리 티어 사용 가능" 표시 확인, 크레딧이 빨리 줄어듦. **스왑 2~4GB** 추가(메모리가 모자랄 때 서버가 죽지 않고 느려지게). 디스크(EBS)는 모델 파일까지 들어가게 넉넉히 |
| 2차 | 8GB로도 모자라면 **백엔드를 Hugging Face Spaces로** (무료 하드웨어 2 vCPU·16GB) | `Dockerfile` 1개 추가, Vercel `VITE_API_URL`·챗봇 주소, `FRONTEND_ORIGIN` | Docker Space는 **PRO 월 $9** 필요. 안 쓰면 잠들어서 발표 전에 미리 열어 깨우기. 디스크가 유지되지 않아 모델은 시작할 때마다 다시 읽음. **강사 확인 필요**(배포처 AWS 지정) |
| 3차 | **Railway** (Docker 없이 GitHub 연결) | 2차와 같은 주소 변경 | Hobby 월 $5(사용료 포함) + 쓴 만큼(RAM 1GB를 한 달 켜면 약 $10). **강사 확인 필요** |

- 공통: 처음 켤 때 모델을 읽느라 시작이 오래 걸림 → **리허설 때 시작 시간·메모리·판별 시간 기록**
- 가격은 자주 바뀌므로 결제 전에 공식 가격 페이지 확인

## DB (Supabase)

- [ ] **새 테이블 GRANT** (10/30 Supabase 정책 변경): 10/30 이후 만드는 테이블(`008` 쿠폰 등)에 `service_role` GRANT가 들어갔는지 확인 → [migrations/README.md](../supabase/migrations/README.md) 규칙 7. 없으면 FastAPI가 `permission denied`
- [ ] **Supabase 프로젝트를 새로 만들 일이 생기면** (지금 계획 없음): 지금까지의 migration 파일을 다시 실행해도 GRANT가 없어 전부 막힘 → 모든 테이블 GRANT를 새 번호 파일로 추가해서 같이 실행

## 발표 전후 정리

- [ ] **테스트 계정 정리**: Supabase Auth의 test1·test2 등 가짜 계정 지울지 결정 / 이메일 인증(Confirm email) 계속 끌지 결정
- [ ] (선택) 안 쓰는 파일 정리: `WelcomePage.backup.jsx`, `TreeArt.jsx`
- [ ] 수업용 EC2(`ai-study-lab`, `ai-study-lab-class`) 종료 — 수업·복습이 끝난 뒤
