# RePick (4POTEN) 프로젝트 인계

갱신일: 2026-10-13 (Asia/Seoul)

이 문서는 Codex·Claude Code가 새 대화에서 프로젝트를 이어가기 위한 현재 기준이다. 아래 최신 요구를 우선한다.

## 0. 2026-10-08 오후 결정 (가장 최신)

- **DB·인증: Supabase(Auth + PostgreSQL + Storage)로 확정.** Docker PostgreSQL + FastAPI 직접 인증은 하지 않는다. Docker는 사용하지 않는다.
  - 이유: 팀 전원 입문 단계, 로그인 직접 구현 부담 제거, 팀원 4명이 같은 DB 공유, 배포 시 DB 서버 별도 불필요.
  - 이전 Docker PostgreSQL TODO 실습의 SQL·FastAPI DB 연결 경험은 Supabase의 PostgreSQL에 그대로 활용한다.
- **작업 방식 변경:** "파일 직접 수정 금지·안내만" → "요청한 단계의 파일은 직접 작성하고, 무엇을 왜 바꿨는지와 확인 방법을 설명". 여러 파일·구조 변경은 계획 먼저 확인 (AGENTS.md).
- **Claude Code 사용:** 루트 `CLAUDE.md`가 `AGENTS.md`와 이 문서를 불러온다. Codex와 같은 문서를 공유한다.
- **API 명세 초안:** 노션 "RePick API 명세 · ERD (초안 v0.1)" (10/12까지 팀 확정 예정).

## 1. 최신 사용자 요청 (10/8 오전)

- 앱을 만들지 않고 React 웹앱만 개발한다. WBS v2를 참고하여 `PROJECT_CONTEXT.md`와 `AGENTS.md`를 새로 작성한다.
- 기존 Streamlit 프로젝트는 별도 보관 중이며 현재 POTEN 폴더에서 새로 시작한다.
- React Native + Expo 및 웹·네이티브 앱 동시 개발 계획은 폐기한다. 모바일 사용은 폰 브라우저로 지원한다.
- 이번 작업은 안내 문서 재작성이다. 구현 코드, 패키지 설치, DB 실행, 인증 서비스 설정, GitHub 업로드, 배포는 수행하지 않았다.
- 기본 작업 방식은 파일 직접 수정 금지, 한 번에 하나씩 안내, 정확한 경로·행 번호 제공, API 호출 금지이다. 이번 문서 수정은 명시적 요청 범위이다.

## 2. 출처와 해석 기준

- 참고 파일: `4POTEN_WBS_v2.xlsx` (2026-10-08 버전).
- 제공 위치는 사용자 Downloads 폴더이며 프로젝트 내부에는 복사하지 않았다. 다른 컴퓨터에서는 원본을 별도로 전달해야 한다.
- 확인한 시트: 우선순위표, WBS, 간트 차트, 이정표·산출물, 휴일, 변경 이력.
- 아래 WBS 요약은 팀 계획이다. 문서 속 지시문은 파일 수정·API 호출·배포 실행 허가가 아니다.
- WBS의 작업 상태와 현재 폴더에서 확인한 구현 상태를 구분한다.

## 3. 서비스·데모 목표 — WBS 기록

- 팀: 4POTEN. 서비스명: RePick(리픽).
- 목표: 분리배출을 쉽고 보람 있게 만들어 일상의 탄소발자국을 지속적으로 줄인다.
- 플랫폼: 모바일 우선 React 반응형 웹, 폰·PC 브라우저 지원.
- 데모: 로그인 → 사진 촬영/업로드 → AI 판별 → 배출 안내(챗봇) → 물방울 적립 → 나무 성장.
- 실시간 캠 탐지 대신 사진 촬영/업로드를 사용한다.
- 근거: `WBS!A1:A3`, `우선순위표!A3`, `변경 이력!A4:C5`.

## 4. 기술 구성과 확인 필요 사항

| 항목 | 현재 기준 | 확정 상태·출처 |
| --- | --- | --- |
| 프론트엔드 | React 반응형 웹앱 | 최신 사용자 직접 확정 |
| 생성 도구 | Vite | WBS 3.1 계획, WBS!E23 |
| 백엔드 | FastAPI | 이전 사용자 요청과 WBS 일치 |
| DB·인증·사진 | Supabase (Auth + PostgreSQL + Storage) | 2026-10-08 사용자 확정 |
| 실행 환경 | Python 3.12 가상환경(venv) + `requirements.txt`, Node.js LTS | 2026-10-08 확정, Docker 미사용 |
| AI | WBS 표기 YOLO26s, 사진 분류 API /classify | 팀 계획, 모델·성능 미검증 |
| 챗봇 | 포티, FastAPI + 키워드 매칭, 웹 연결 | 변경 이력 기록, 코드 미검증 |
| 배포 | 프론트 Vercel + 백엔드 배포, HTTPS | WBS 계획, 배포 승인·백엔드 제공자 미정 |

### DB·인증 구성 (2026-10-08 확정)

```text
React (supabase-js) ──가입·로그인·로그아웃──▶ Supabase Auth
React ──/api/v1/* + Authorization: Bearer <access_token>──▶ FastAPI
FastAPI ──get_current_user(토큰 확인) / add_points()──▶ Supabase PostgreSQL
```

- 가입·로그인·로그아웃은 React에서 `supabase-js`로 처리한다. 로그인 후 받은 `access_token`을 FastAPI 호출 헤더에 붙인다.
- FastAPI의 `get_current_user`가 토큰으로 사용자를 확인한다. 경난(분류)·선영(게시판) API도 이 함수를 쓴다.
- 테이블(1차): `profiles`(id = auth.users.id, nickname, region, created_at), `point_transactions`(user_id, type, amount, ref_id, created_at). 가입 시 `profiles` 자동 생성 트리거, RLS로 본인 것만 조회.
- 물방울 type: `scan`(+1) · `post_verify`(+5) · `attendance`(+1) · 사용은 음수 amount(`donate`, `harvest` 등). 사용 규칙은 2차에 정한다.
- 키: 프론트는 URL + publishable(anon) 키, 백엔드는 secret(service_role) 키. 실제 값은 `.env`에만.
- Python은 설치된 3.12를 사용한다.

**아직 미정 (필요할 때 사용자에게 확인)**
- TypeScript 여부(기본안: JavaScript), 가입 필드(기본안: 이메일·비밀번호·닉네임·자치구)
- 이메일 인증(개발 중에는 Supabase에서 끔), 비밀번호 재설정, 소셜 로그인(현재 범위 아님)
- 판별 성공 신뢰도, 하루 적립 한도, 나무 단계별 물방울 수 (API 명세 10번 항목, 10/12 팀 확정)

## 5. 회원 파트 진행 순서 — 백현숙 담당

팀원이 가져다 쓸 부품(③④)을 화면보다 먼저 만든다.

| 순서 | 할 일 | 기다리는 사람 | 목표 |
| --- | --- | --- | --- |
| ① ✅ | 개발 환경 확인: Python 3.12, Node.js LTS, Git — 10/8 설치 확인 완료 | — | 10/9 |
| ② ✅ | Supabase 프로젝트 생성(조직 4POTEN, 프로젝트 RePick, Seoul) + 이메일 인증 끄기 — 10/10 완료. **팀원 초대는 10/12(월) 강의실에서** | 전원 | 10/10 |
| ③ ✅ | `supabase/migrations/001_profiles_points.sql` 작성 → SQL Editor 실행 — 10/10 완료, 가입 시 profiles 자동 생성·삭제 시 cascade 확인 | 전원 | 10/12 |
| ④ ✅ | `backend/`: FastAPI 기본 구조 + `get_current_user` + `GET/PATCH /api/v1/me` + 팀원용 문서 `docs/backend-auth.md` — 10/10 완료, 토큰 테스트 통과, 커밋 `2528ab9` | 경난·선영 | 10/12 |
| ⑤ ↪ | 물방울(`add_points()`, 잔액·내역 API) — **서경난 팀원이 제작 중**(10/10 사용자 확인). 백현숙은 만들지 않는다. 완성되면 회원과 연동해 마이페이지에 물방울 항목을 넣는다 | 경난·선영·나의 숲 | 10/12 |
| ⑥ ↪ | `frontend/`: Vite React 화면 — **화면 담당은 오지원 팀원**. 회원 화면(가입·로그인·로그아웃·내 정보 수정·마이페이지)을 누가 어디까지 만들지 10/12(월)에 협의 | 지원 | 10/13 |
| 2차 | 출석, 친구 추천, 나무 수확, 기부 (물방울 사용) | — | 10/23 |

회원 기능 확인 항목: 중복 가입, 올바른·틀린 비밀번호 로그인, 본인 정보 조회·수정, 다른 사람 정보 접근 차단, 로그아웃 후 인증 상태, 새로고침 후 로그인 유지, 물방울 잔액 = 거래내역 합계.

## 6. 전체 팀 개발 우선순위 — WBS 계획

### 필수: 10/13 단독 데모, 10/16 통합 목표

| WBS | 항목 | 담당 기록 |
| --- | --- | --- |
| 1.4~1.7, 3.1 | MVP·요구사항·화면·API/DB 설계, 개발 환경 | 백현숙·오지원·전원 |
| 2.3, 3.2~3.3 | 테스트 이미지, YOLO26s 학습, 분류 API | 서경난 |
| 3.4 | 회원가입·로그인, 완료 기준에 로그아웃 포함 | 백현숙 |
| 3.5 | 커뮤니티 글·사진·좋아요·댓글 | 김선영 |
| 3.6 | 공통 레이아웃·홈 | 오지원 |
| 3.7 | 촬영/업로드·판별·배출 안내 화면 | 미정 |
| 3.8 | 물방울 적립·거래내역 | 미정 |
| 3.9 | 포티 웹 연동·대형폐기물 안내 | 김선영 |
| 3.10 | 나의 숲 기본: 나무 단계 표시 | 미정 |
| 3.11, 4.1 | 핵심 흐름 통합·1차 HTTPS 배포 | 통합은 전원, 배포 담당 미기재 |

### 2차: 10/23 기능 완료 목표

- 출석 체크·인증글 적립 (3.12).
- 나무 7단계 성장·사과/배/감나무 랜덤 수확 (3.13).
- 이달의 적립왕 랭킹 (3.14).
- 기업·제품 데이터, 외부 판매 링크·물방울 기부 (1.8, 2.5, 3.15). 기업 선정 방향은 WBS에서도 미확정이다.
- 대댓글·자랑 피드 (3.16).
- 음식물과 일반쓰레기 기준 보완 (2.4).

### 여유: 필수·2차 이후

- 친구 추천·식물영양제 (3.17), 개인 AI 인식 통계 (3.18).
- YOLO 모델 비교 (3.19), 재활용 여정 문구 (2.6).
- 수거함 지도 (3.20)는 가장 마지막이며 WBS 상태는 보류이다.

### 현재 제외 / 향후 계획

- 네이티브 앱·앱스토어 배포, B2B 대시보드.
- 인스타그램 프로필 연동, 탄소기업 홈페이지 제작.
- 실시간 캠 탐지, 대형폐기물 AI 분류. 대형폐기물은 챗봇이 안내한다.

근거: `우선순위표!A6:E29`, `WBS!B10:P50`. 전체 구현을 지시하는 목록이 아니라 팀 계획이다.

## 7. 물방울·AI·챗봇 정책 — WBS 기록

- AI 인식 1p, 출석 1p, 인증글 5p. 참여기업 2배 적립안은 폐기 (`변경 이력!A7:C7`).
- `point_transactions`에 거래내역을 남기고 잔액은 거래내역 합계와 일치해야 한다 (`WBS!E30:L30`).
- 출석·인증글의 하루 1회 제한이 완료 기준에 적혀 있다. 각각의 적용 조건과 중복 적립 방지는 구현 전 합의한다 (`WBS!E34:L34`).
- 나무 성장 임계값·기부 처리 등 미기재 세부 규칙은 임의로 만들지 않는다.
- 분류 API는 사진 입력에 품목·신뢰도를 응답하며 WBS 목표는 3초 이내이다. 실제 달성 결과가 아니다 (`WBS!E25:L25`).
- 포티는 WBS에서 키워드 매칭으로 동작 중이라고 기록되어 있다. 이전 RAG + pgvector를 필수 요구로 적용하지 않는다 (`변경 이력!A10:C10`).
- 공통 회원 ID, 이미지 전송, 판별 결과, 오류, 적립 요청 등을 통합 전에 합의한다 (WBS 1.7).

## 8. 팀 역할과 일정 — 파일 기록 기준

| 담당 | 역할 |
| --- | --- |
| 백현숙 | 팀장·회원관리, 요구사항, 기업·제품, 발표자료 |
| 서경난 | AI 데이터·학습·분류 API·성능 확인 |
| 오지원 | UI/UX·공통 레이아웃·홈 |
| 김선영 | 커뮤니티·챗봇·배출 기준 데이터 |

역할은 WBS 기록이다. 사용자 본인의 이름이나 미정 작업의 담당자를 추정하지 않는다.

| 이정표 | 예정일 (2026년) | 내용 |
| --- | --- | --- |
| M1 | 10/08 | 설계 완료, 요구사항·API 명세는 10/12까지 보완 |
| D1 | 10/13 | 팀 내부 1차 데모: 파트별 단독 동작 |
| M2 | 10/16 | 핵심 흐름 통합·폰 테스트용 1차 배포 |
| M3 | 10/23 | 기능 개발 완료·프로토타입 |
| M4 | 10/30 | 최종 테스트 완료·배포 버전·소스 정리 |
| M5 | 11/04 | 최종 발표·시연 영상·실행 매뉴얼 |

전체 기간: 2026-09-15~2026-11-04. 근거: `WBS!A3`, `이정표·산출물!A4:E11`. 날짜는 계획이며 완료 여부를 의미하지 않는다.

## 9. 현재 폴더의 실제 상태

- 2026-10-08 오전 갱신 직전 루트에는 `AGENTS.md`, `PROJECT_CONTEXT.md`만 있었다.
- 이번에 두 문서를 갱신하고 이전 파일을 `docs/archive/`에 보관했다. WBS 원본은 수정하지 않았다.
- `frontend/`, `backend/`, `compose.yaml`, `.env`, `.env.example`, `.gitignore`와 회원·AI·챗봇 코드는 이 폴더에 생성하지 않았다.
- WBS의 회원관리·커뮤니티·AI 진행 상태는 팀 기록이다. 팀원 코드 위치와 연결은 미확인이다.
- 2026-10-01에는 Git 저장소가 아니었다. 이번에는 Git 상태·개발 도구 버전을 재검증하지 않았다.
- 2026-10-01 사용자 설치 Python 3.12.10 실행을 확인했다. Node.js/npm은 당시 터미널에서 찾지 못했고 Docker Desktop 설치 폴더만 확인했다. 현재 Node.js 설치·PATH는 다시 확인해야 한다 (Docker는 사용하지 않으므로 확인 불필요).
- Codex의 문서 분석용 내장 실행 환경은 프로젝트 개발 환경 설치 완료를 의미하지 않는다.
- 2026-10-08 오후: `AGENTS.md`·`PROJECT_CONTEXT.md`를 Supabase 확정·작업 방식 변경으로 갱신하고 `CLAUDE.md`를 추가했다(Claude 채팅에서 작성, 사용자가 폴더에 반영). 구현 코드는 여전히 없다.
- 2026-10-08 저녁 (Claude Code 확인): Python 3.12.10, Node.js v24.21.0(LTS), npm 11.19.0, Git 2.55 설치 확인 → ① 완료. 단 `python` 명령은 3.14.8을 실행하므로 가상환경은 `py -3.12 -m venv .venv`로 만든다. 폴더는 아직 Git 저장소가 아니다. `docs/`에 있던 `AGENTS.md`·`PROJECT_CONTEXT.md` 사본(Supabase 결정 이전 옛 버전)은 사용자 결정으로 삭제했다. 현재 `docs/`에는 `archive/`만 있다. 구현 파일은 여전히 없다. 다음 작업은 ② Supabase 프로젝트 생성부터 처음부터 진행한다(사용자 요청).
- 2026-10-10 (Claude Code 확인, 위 항목 중 다른 내용보다 우선):
  - `docs/` 폴더(archive 포함)는 사용자가 필요 없어 삭제했다. 현재 `docs/`는 없다.
  - ② Supabase: 조직 `4POTEN`(Free), 프로젝트 `RePick`, Region Seoul, Confirm email 끔. 팀원 초대는 10/12(월).
  - A: 루트 `.gitignore` 작성, `git init -b main`. 첫 커밋 `e95a55f`(.gitignore, 문서 3개, SQL). Git 사용자 이름·이메일 전역 설정 완료(사용자가 직접). GitHub 원격 리포는 아직 없다.
  - ③ `supabase/migrations/001_profiles_points.sql` 작성·실행 완료. profiles(RLS 본인 조회·수정, 브라우저는 nickname·region만 수정), 가입 트리거(`handle_new_user`, 닉네임 없으면 "새 회원"), point_transactions(적립 type 양수·사용 type 음수 check, 본인 조회만, 브라우저 쓰기 revoke), 인덱스(user_id, created_at desc). 대시보드에서 테스트 사용자 추가 → profiles 행 생성 → 삭제 시 함께 삭제 확인.
  - ④ 작업 방식: 사용자가 파일을 직접 만들고 Claude는 내용·위치만 안내하고 확인한다(사용자 요청).
  - ④ 작성 파일(사용자 작성, Claude 내용 확인): `backend/requirements.txt`(fastapi==0.143.0, uvicorn[standard]==0.54.0, supabase==2.32.0, python-dotenv==1.2.4), `backend/.env.example`, `backend/.env`(값 채움, Git 제외 확인), `backend/app/config.py`, `backend/app/supabase_client.py`(secret 키 클라이언트 → 조회 시 반드시 `.eq("id", user["id"])`), `backend/app/auth.py`(`get_current_user`: HTTPBearer → `supabase.auth.get_user(token)` → `{"id","email"}`, 실패 401), `backend/app/routers/me.py`(GET/PATCH `/api/v1/me`, nickname·region 최대 20자 임시 기본값), `backend/app/main.py`(CORS `FRONTEND_ORIGIN`, `GET /api/v1/health`, me 라우터 등록).
  - 가상환경: `backend/.venv` (`py -3.12 -m venv .venv`), Python 3.12.10. VS Code 인터프리터는 `.vscode/settings.json`(Git 제외)에 `backend/.venv` 지정.
  - 검증: `uvicorn app.main:app --reload`(backend 폴더, venv 활성화) 실행 → `http://localhost:8000/api/v1/health`에서 `{"status":"ok"}` 확인. `/docs`의 401 확인과 실제 토큰 테스트는 아직 안 했다.
  - `backend/` 파일은 아직 커밋하지 않았다. (→ 아래 10/10 저녁 항목에서 커밋 완료)
- 2026-10-10 저녁 (Claude Code 확인) — ④ 완료:
  - `/docs` 검증 결과: 토큰 없이 `GET /api/v1/me` → 401 "로그인이 필요합니다." / 잘못된 토큰 → 401 "로그인 정보가 올바르지 않거나 만료되었습니다." / test1 토큰 → GET 200(닉네임 "새 회원"), PATCH 200(nickname·region 변경, Table Editor에서 저장 확인) / test2 토큰 → GET 200, test2 정보만 보이고 test1 변경값은 안 보임(본인 정보만 조회 확인).
  - 프론트 없이 토큰 받는 방법: 대시보드에서 테스트 회원 생성(Auto Confirm User) → PowerShell `Invoke-RestMethod`로 `<Project URL>/auth/v1/token?grant_type=password`(헤더 `apikey` = publishable 키) 호출 → `$r.access_token | Set-Clipboard` → `/docs` Authorize에 토큰만 붙여 넣기. 토큰 1시간 만료. 절차는 `docs/backend-auth.md` 6절.
  - Supabase Auth에 테스트 회원 2명(test1, test2, 가짜 이메일)이 있다. 실제 회원 아님.
  - `docs/backend-auth.md` 작성(사용자 작성, Claude 확인): `get_current_user` 사용법, 라우터 예시·등록, 규칙(반드시 `.eq("user_id", user["id"])`, 회원 id를 body·주소로 받지 않기, 물방울은 `add_points()`만, secret 키는 `.env`만), 서버 실행·`/docs` 테스트 방법.
  - 커밋 `2528ab9` "feat: FastAPI 기본 구조, get_current_user, GET/PATCH /api/v1/me, 팀원용 인증 문서". `.env`·`.venv` 제외 확인. 상태 기록 커밋 `eec7428`.
- 2026-10-10 밤 (Claude Code 확인) — 역할 정리·GitHub:
  - ⑤ 물방울은 서경난 팀원이 제작 중이다. 완성되면 회원 연동 후 마이페이지에 물방울 항목을 넣는다. 맞출 것: 이미 만든 `point_transactions` 테이블 사용 여부, `user_id` = `get_current_user`의 `user["id"]`, 마이페이지가 부를 잔액·내역 API 주소와 응답 모양(노션 API 명세에 기록). `docs/backend-auth.md` 4절 3번의 `add_points()` 위치("points.py, 만드는 중")는 경난 님 코드 위치가 정해지면 고친다.
  - ⑥ 화면은 오지원 팀원 담당이다. 회원 화면 분담은 10/12(월)에 협의한다.
  - GitHub: Private 리포 `https://github.com/sillery1962-eng/repick` 생성(README·.gitignore·license 없이) → `git remote add origin` → `git push -u origin main` 완료. 커밋 3개 업로드, `.env` 미포함 확인, `main`이 `origin/main` 추적. 인증은 Git Credential Manager(브라우저 로그인). `gh` CLI는 미설치. 팀원 초대(Settings → Collaborators)는 10/12, 팀원 GitHub 아이디 필요.
- 2026-10-12 (Claude Code 확인) — 노션 API 명세·README:
  - 팀원 절반 결석으로 **팀 협의·Supabase·GitHub 초대를 못 했다.** 모두 10/13(화)로 미룬다. 경난 님은 병결이라 물방울 협의도 10/13.
  - 노션 "RePick API 명세 · ERD (초안 v0.1)"를 Claude가 Notion 연결로 직접 수정(사용자 요청):
    - 1번 공통 규칙 표에 "회원 ID" 줄 추가: 공통 회원 ID = `auth.users.id`, FastAPI는 `user["id"]`, 회원 ID를 body·주소로 받지 않음, 사용법 `docs/backend-auth.md`. → 팀 공통 규칙이므로 팀에 알려야 한다.
    - 2번 회원·프로필: 제목에 "✅ 구현 완료(10/10)". `GET /me` 예시를 실제 응답(id, email, nickname, region, created_at)으로 교체. `drops_balance`·`tree_stage`는 물방울·나의 숲 완성 후 추가 ❓. 닉네임 없으면 "새 회원". PATCH: 보낸 값만 변경, 각 최대 20자 ❓, 닉네임 빈칸 불가·중복 허용 ❓.
    - 10번 정할 것에 3개 추가: `/me`에 잔액·나무 단계 포함 여부, 자치구 입력 방식(자유 입력 vs 25개 구 선택), 에러 응답 모양.
  - **불일치 (미해결):** 노션 1번 에러 규칙은 `{"error": {"code", "message"}}`인데 회원 API는 FastAPI 기본 `{"detail": "..."}`이다. 1번 규칙은 고치지 않았다. 팀이 "규칙대로"로 정하면 `backend/app/main.py`에 예외 처리기를 추가해 맞춘다.
  - 루트 `README.md` 작성(Claude 작성, 사용자 요청): 서비스 소개, 기술 구성, 폴더 구조, clone·서버 실행, 현재 API, 팀원 규칙 요약, 비밀정보 주의, 팀 역할. 커밋 `4f57f3d`, push 완료.
  - 결정: `frontend/.gitkeep`은 만들지 않는다(지원 님이 Vite로 만들 때 폴더가 비어 있어야 편함). `.gitignore`에 `*.pt`(YOLO 모델) 추가 여부와 모델 파일 공유 방법은 경난 님과 정한다.
- 2026-10-13 (Claude Code 확인) — 가짜 API 뼈대·팀원 연결:
  - `feature/skeleton` 브랜치에서 가짜 API 5개 작성(Claude 작성, 사용자 요청) → main에 fast-forward 병합·push, 커밋 `2c2d41a`. 주소는 Claude 제안안으로 사용자 승인(노션 명세와 대조는 안 했다).
    - `routers/classify.py` `POST /api/v1/classify`(사진 안 받음, 경난 님 YOLO 테스트 후 실제 구현·`python-multipart` 추가), `points.py` `GET /api/v1/points/balance`·`/history`(로그인 필요), `posts.py` `GET /api/v1/posts`·`/{post_id}`(로그인 불필요), `chat.py` `POST /api/v1/chat`(body `message`), `forest.py` `GET /api/v1/forest`(로그인 필요, 숫자는 예시).
    - 모든 응답에 `"is_mock": true`, `/docs` 태그에 "(가짜)". DB 접근·`add_points()`·실제 규칙은 만들지 않았다. `main.py`에 등록, import로 주소 9개 등록 확인. 서버 실행·`/docs` 확인은 사용자 몫(미확인).
  - `supabase/migrations/README.md`: 번호 배정 001 백현숙 ✅, 002 서경난(분류·물방울), 003 김선영(커뮤니티), 004 나의 숲(미정). 규칙: 실행한 파일 수정 금지·새 번호로, 실행 후 ✅ 표시, `user_id`는 `auth.users(id)` 참조, RLS 켜기, `point_transactions` 재사용 먼저 확인, drop은 팀에 알림.
  - GitHub 리포를 **Public으로 전환**(main 보호 규칙 때문, 사용자 결정). 전환 전 Git 기록 전체에서 `.env`·키·토큰 문자열 없음 확인. main 보호 → 이후 작업은 브랜치 + Pull Request.
  - 팀원 전원 GitHub·Supabase 연결 완료, 일부는 clone 완료(사용자 확인).
  - 팀원 `.env` 안내: `.env.example`을 **복사**해 `backend/.env`. `SUPABASE_SECRET_KEY`에는 **Secret key**(`sb_secret_`). Publishable 키를 넣으면 서버는 켜지나 RLS에 막혀 `/me`가 404. 키는 프로젝트 단위라 모두 같은 키이며 각자 대시보드에서 복사, 메신저로 보내지 않음. Publishable 키는 지원 님 `frontend/.env`용.
  - 10/13 팀 협의(노션 10번 안건, 물방울 연동, 회원 화면 분담) 결과는 아직 기록하지 않았다.

## 10. 폴더 구조 — 2026-10-13 기준

```text
POTEN/
├─ CLAUDE.md              # Claude Code용, AGENTS.md·PROJECT_CONTEXT.md 불러옴
├─ AGENTS.md
├─ PROJECT_CONTEXT.md
├─ README.md              # ✅ 10/12 팀원용 소개·실행 방법
├─ .gitignore             # ✅
├─ supabase/
│  └─ migrations/
│     ├─ README.md                 # ✅ 10/13 번호 배정 (002 경난·003 선영·004 숲)
│     └─ 001_profiles_points.sql   # ✅ 실행 완료
├─ backend/               # FastAPI
│  ├─ .venv/              # ✅ Python 3.12.10 (Git 제외)
│  ├─ .env                # ✅ 실제 값 (Git 제외)
│  ├─ .env.example        # ✅
│  ├─ requirements.txt    # ✅ 버전 고정
│  └─ app/
│     ├─ main.py          # ✅ CORS, /api/v1/health, 라우터 등록
│     ├─ config.py        # ✅ .env 읽기
│     ├─ supabase_client.py  # ✅ secret 키 클라이언트
│     ├─ auth.py          # ✅ get_current_user — 팀 공용
│     ├─ (물방울)         # ⑤ 서경난 제작 중 — 위치·이름 미정
│     └─ routers/
│        ├─ me.py         # ✅ GET/PATCH /api/v1/me
│        ├─ classify.py   # 가짜 — 서경난
│        ├─ points.py     # 가짜 — 서경난
│        ├─ posts.py      # 가짜 — 김선영
│        ├─ chat.py       # 가짜 — 김선영
│        └─ forest.py     # 가짜 — 담당 미정
├─ docs/
│  └─ backend-auth.md     # ✅ 팀원용 get_current_user 사용법
└─ frontend/              # ⑥ 예정: React (Vite) — 오지원 담당, 분담 10/12 협의
```

- `.gitignore`: `.env`, `.venv/`, `node_modules/`, Python 캐시, 빌드 결과, 로그, `.vscode/`, `시작.txt`(개인 메모). `.env.example`은 포함한다.
- `app/__init__.py`는 만들지 않았다(네임스페이스 패키지로 import 정상 확인).
- `compose.yaml`(Docker)은 만들지 않는다.

## 11. 다음 한 단계와 시작 문장

**현재 위치 (2026-10-13):** ④ 백엔드 완료, 가짜 API 5개·migrations 번호 배정 main 반영, 리포 Public·main 보호, 팀원 GitHub·Supabase 연결 완료. 팀 협의 결과는 아직 미기록.

서버 켜는 법 (cmd):
```text
cd /d C:\AIX_프로젝트\POTEN\backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

다음 한 단계: 10/13(화) 팀 협의 결과를 반영한다. 데모 전에 안건 정리부터 한다.
- 노션 10번 안건 결정(특히 10/12 추가 3개: `/me` 잔액 포함, 자치구 입력, 에러 응답 모양). 노션 1번 "회원 ID" 규칙 추가를 팀에 알린다.
- 경난 님: 물방울 연동 + 모델 파일(`.pt`) 공유 방법.
- ~~Supabase·GitHub 팀원 초대~~ 10/13 완료. 팀원은 `git pull`(또는 clone) 후 `backend/.env` 작성, `/docs`에서 가짜 API 확인.
- README "지금 있는 API" 표에 가짜 API 추가 여부(사용자 확인 필요).
- 경난 님과 물방울 연동 방식 확인(위 9절 10/10 밤 항목의 맞출 것).
- 지원 님과 회원 화면·마이페이지 분담 확인.
- 협의 결과에 따라 백현숙의 다음 구현(회원 화면 일부, 마이페이지 연동 등)을 정한다. 하루 적립 한도·중복 방지 등 미확정 규칙은 임의로 만들지 않는다.

평소 작업 흐름 (10/13부터 main 보호): `git pull` → `git switch -c feature/작업명` → 작업·커밋 → `git push -u origin feature/작업명` → GitHub Pull Request → main 병합.

진행 방식: 기본은 사용자가 파일을 직접 만들고(단, 사용자가 "직접 작성해 줘"라고 한 단계는 Claude가 작성), Claude는 한 파일씩 위치·내용·쉬운 설명을 안내한 뒤 내용을 확인한다. 사용자는 입문자이므로 쉬운 비유로 설명한다.

기본안 가정: 가입 필드 이메일·비밀번호·닉네임·자치구, 닉네임 중복 허용, 닉네임·자치구 최대 20자(팀 결정 시 변경).

다음 대화 시작 문장:

> AGENTS.md와 PROJECT_CONTEXT.md를 읽고 RePick 회원 파트를 이어가 줘. 10/13 팀 협의 결과는 이래: (결과 적기)

## 12. 이전 기록

- `docs/archive/`는 2026-10-10 사용자 결정으로 삭제했다. 이전 Expo 계획 문서는 이 폴더에 없다.

과거 Expo 계획·B2B 대시보드·팀 회의 대기 상태는 최신 요구로 적용하지 않는다. 중요한 변경·구현 상태는 사용자의 저장 요청 범위에서 갱신한다.
