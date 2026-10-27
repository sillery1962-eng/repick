# RePick 백엔드 Railway 배포 준비 (EC2 대신 쓸 경우)

작성 2026-10-23 · 상태: **준비만 함, 아직 배포 안 함** (Railway로 갈지 EC2로 갈지 미정)
화면(Vercel)·DB(Supabase)는 그대로. 백엔드(FastAPI + YOLO)만 Railway에 올리는 안.

## 이번에 준비한 파일

| 파일 | 하는 일 |
| --- | --- |
| `backend/requirements.txt` | PyTorch를 **CPU 전용**으로 받도록 `--extra-index-url` + `torch`·`torchvision` 추가 (GPU 버전은 수 GB라 Trial 이미지 상한 4GB를 넘김) |
| `backend/.python-version` | Python **3.12**로 고정 (안 쓰면 Railway 기본 3.13) |
| `backend/railway.json` | 실행 명령 `uvicorn app.main:app --host 0.0.0.0 --port $PORT`, 상태 확인 주소 `/api/v1/health`, 죽으면 자동 재시작 |
| `.gitignore` | `*.pt`는 계속 막되 **`best_26s.pt` 1개만 예외**로 Git에 올라가게 함 |

## ⚠️ 배포 전에 꼭 할 것: 모델 파일

`classify.py`가 서버를 켤 때 바로 `best_26s.pt`를 읽는다. 파일이 없으면 **서버가 아예 안 켜짐**.
지금은 `.gitignore`의 `*.pt` 때문에 GitHub에 없으므로 Railway도 못 받는다.

1. 경난 님께 받은 `best_26s.pt`를 `backend/app/ai/models/yolo/yolo26s/`에 넣기
2. commit → main에 merge (약 21MB, GitHub 제한 100MB 이하라 Git LFS 불필요)
3. YOLO11s 앙상블을 넣게 되면 그 `.pt`도 같은 방식으로 `.gitignore`에 예외 한 줄 추가

## Railway 화면에서 할 설정 (배포할 때)

1. railway.com → GitHub로 로그인 (GitHub 연결 = 계정 인증 → Full Trial)
2. New Project → Deploy from GitHub repo → `repick`
3. 서비스 **Settings**
   - **Root Directory**: `/backend`
   - **Config-as-code 파일 경로**: `/backend/railway.json`
   - **Networking → Generate Domain** → `https://○○○.up.railway.app` 주소 받기
4. 서비스 **Variables**에 입력 (Git·메신저 금지)

| 이름 | 값 |
| --- | --- |
| `SUPABASE_URL` | 로컬 `backend/.env`와 같은 값 |
| `SUPABASE_SECRET_KEY` | 로컬 `backend/.env`와 같은 값 |
| `FRONTEND_ORIGIN` | `https://repick-tau.vercel.app` |
| `RAILPACK_DEPLOY_APT_PACKAGES` | `... libgl1 libglib2.0-0` (앞의 `...`까지 그대로. ultralytics가 일반 OpenCV를 같이 깔면 나는 `libGL.so.1` 에러 방지) |

5. Vercel 환경변수 → Redeploy
   - `VITE_API_URL` = `https://○○○.up.railway.app/api/v1`
   - `VITE_CHATBOT_API_URL` = `https://○○○.up.railway.app`

## 배포 후 확인

- [ ] `https://○○○.up.railway.app/api/v1/health` → `{"status":"ok"}`
- [ ] 배포 화면에서 사진 판별 1번 성공
- [ ] Railway **Metrics**에서 메모리 확인 — **Trial 상한 1GB**, Trial 끝난 뒤 Free는 0.5GB. 넘으면 서버가 꺼짐 (YOLO11s 앙상블·SigLIP2를 넣으면 특히 확인)
- [ ] 서버 시작에 걸린 시간 기록 (모델 읽느라 느릴 수 있음)

## 비용·끄고 켜기

- Trial: 가입 시 $5 크레딧, **가입일부터 30일** (서버를 꺼 둬도 날짜는 흐름) → 발표(11/4)가 30일 안에 들어오게 가입
- 켜져 있는 동안만 분 단위 과금, 빌드는 무료. RAM 1GB 기준 하루 약 $0.4
- 끌 때: 배포(Deployment) → **Remove**. 켤 때: **Redeploy** (다시 빌드, 무료)
- 카드 등록 없는 Trial이라 크레딧이 떨어지면 청구가 아니라 서버가 멈춤
- 가격은 바뀔 수 있으니 결제·가입 전에 공식 페이지 확인: https://docs.railway.com/pricing/plans

## 막히면

Railway 서비스 → **Deployments → 해당 배포 → Build Logs / Deploy Logs**의 빨간 에러를 복사해서 Claude에게 붙이기.
