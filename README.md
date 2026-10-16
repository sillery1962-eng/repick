# RePick (리픽)

분리배출을 쉽고 보람 있게 만드는 모바일 우선 반응형 웹 서비스입니다. 팀 4POTEN이 만듭니다.

사진을 찍으면 AI가 품목을 판별하고, 챗봇 포티가 배출 방법을 안내합니다. 분리배출을 하면 물방울이 쌓이고 나무가 자랍니다.

```text
로그인 → 사진 촬영/업로드 → AI 판별 → 배출 안내(챗봇) → 물방울 적립 → 나무 성장
```

## 기술 구성

| 영역 | 사용 기술 |
| --- | --- |
| 화면 | React (Vite), 폰·PC 브라우저 |
| 서버 | FastAPI (Python 3.12) |
| 회원·DB·사진 | Supabase (Auth + PostgreSQL + Storage) |
| AI | YOLO 사진 분류 |

```text
React ──가입·로그인·로그아웃──▶ Supabase Auth
React ──/api/v1/* + Bearer 토큰──▶ FastAPI ──▶ Supabase DB
```

## 폴더 구조

```text
repick/
├─ backend/          # FastAPI 서버
│  ├─ app/
│  │  ├─ main.py     # 서버 시작점, 라우터 등록
│  │  ├─ auth.py     # get_current_user (로그인 확인, 팀 공용)
│  │  └─ routers/    # API 파일 (me.py = 내 정보)
│  ├─ requirements.txt
│  └─ .env.example   # 환경설정 양식 (실제 값 없음)
├─ supabase/
│  └─ migrations/    # 테이블 만드는 SQL
├─ docs/
│  ├─ api-spec.md      # ⭐ API 명세·보상표·ERD (최신 기준)
│  ├─ frontend-api.md  # 화면에서 FastAPI 부르기 (useApi)
│  ├─ backend-auth.md  # 팀원용 로그인 확인 함수 사용법
│  └─ history.md       # 지난 작업 기록
└─ frontend/         # React 화면 (예정)
```

## 시작하기

### 1. 코드 받기

```text
git clone https://github.com/sillery1962-eng/repick.git
cd repick
```

### 2. 서버 준비 (처음 한 번)

Python 3.12가 필요합니다. Windows 명령 프롬프트 기준입니다.

```text
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

`backend/.env.example`을 복사해서 `backend/.env`를 만들고 값을 채웁니다.
값은 Supabase 대시보드 → RePick 프로젝트 → Project Settings → API Keys에서 각자 확인합니다.

### 3. 서버 켜기 (매번)

```text
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

- `http://localhost:8000/api/v1/health` → `{"status":"ok"}`가 보이면 정상입니다.
- `http://localhost:8000/docs`에서 API를 직접 눌러 볼 수 있습니다. 로그인이 필요한 API 테스트 방법은 [docs/backend-auth.md](docs/backend-auth.md) 6절에 있습니다.

## 지금 있는 API

| 메서드 | 주소 | 설명 | 로그인 |
| --- | --- | --- | --- |
| GET | `/api/v1/health` | 서버 상태 확인 | 불필요 |
| GET | `/api/v1/me` | 내 정보 보기 | 필요 |
| PATCH | `/api/v1/me` | 닉네임·자치구 수정 | 필요 |

전체 API 약속은 노션 "RePick API 명세 · ERD"를 기준으로 합니다.

## 팀원이 API를 만들 때

[docs/backend-auth.md](docs/backend-auth.md)를 먼저 읽어 주세요. 꼭 지킬 것만 요약합니다.

- 로그인이 필요한 API에는 `user: dict = Depends(get_current_user)`를 붙입니다.
- DB를 조회할 때 `.eq("user_id", user["id"])`로 **본인 것만** 가져옵니다.
- 회원 ID를 요청 body나 주소로 받지 않습니다.
- 물방울은 `point_transactions`에 직접 쓰지 않고 정해진 적립 함수로만 처리합니다.

## 비밀정보 주의

- `.env` 파일과 Supabase secret 키는 **절대 Git에 올리거나 메신저로 보내지 않습니다.** (`.gitignore`로 막혀 있습니다.)
- 프론트엔드에는 Project URL과 publishable 키만 넣습니다.

## 팀

| 이름 | 담당 |
| --- | --- |
| 백현숙 | 팀장, 회원관리 |
| 서경난 | AI 분류, 물방울 |
| 오지원 | UI/UX, 화면 |
| 김선영 | 커뮤니티, 챗봇 포티 |
