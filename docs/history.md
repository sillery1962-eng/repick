# RePick 작업 기록 (2026-10-08 ~ 10-16)

> **옛 기록 보관용입니다. 고치지 않아요.** 지금 상태는 루트 `PROJECT_CONTEXT.md`, API·보상 숫자는 `docs/api-spec.md`가 기준이에요.
> 여기 적힌 숫자·담당은 그 뒤에 바뀌었을 수 있어요 (예: 나무 10단계 → 7단계, 퀴즈 보상, 나의 숲 담당).
> 10/16 문서 정리 때 PROJECT_CONTEXT.md에 쌓여 있던 날짜별 기록을 그대로 옮겼어요. 새 기록은 맨 아래 "추가 기록"에 날짜와 함께 덧붙여요.

## 0000. 2026-10-16 결정·진행 (가장 최신 — 아래 000·00절과 다르면 이 절이 우선)

**보상 숫자 확정 (10/15 밤~10/16, 팀장)** — 팀원용 노션 "물방울·포인트 보상표 (10/15 확정)"이 기준(10/16 수정본). 명세 v0.4에도 반영.
- AI 판별: 종이·페트·플라스틱·비닐·유리 💧1 ⭐10 / 캔 💧3 ⭐30 / 건전지 💧4 ⭐40. **판별 클래스 7개**(종이·페트·플라스틱·비닐·유리·캔·건전지). **AI 판별은 제한 없음, 적립만 클래스 상관없이 하루 5회**("클래스별 1번" 제한 없음, 10/16 오후 확인).
- 가입 보너스 💧3(DB 트리거 자동) / 출석 💧1 하루 1번 / 친구 1명 💧2(제한 없음) / **친구 5명마다 ⭐1000**(보상 후 0명부터 다시) / **퀴즈 정답 1개당 ⭐10 + 3개 모두 정답이면 보너스 ⭐50**(하루 최대 ⭐80, 10/16 오후 변경) / **미션 AI 인증 5회 달성 ⭐100 — 매일 1번**(하루 적립 5회를 채우면 그날 달성, 10/16 오후 확인) / **인증 게시글 💧1 ⭐1 하루 5회**(판별 때 이미 받으므로 적게).
- **나무 7단계**(10/16 변경, 시안 그림이 7단계): 단계별 필요 💧 **3·6·7·8·9·10·12 = 55**, 1단계 이름 "새싹". 7단계 끝나면 수확(💧 차감 없음). (000절의 "10단계"는 이전 결정) 전환 **1💧 = 5⭐**. 기부 **100⭐ 단위**.
- **나무 수확 보너스 = "모아서 고르기"**(10/16, 1·3·5·10그루 단계별 1번 안에서 변경): 수확한 나무를 모아 두었다가 원할 때 받음. 1그루 친환경 쿠폰 / 2그루 재활용 노트 / 3그루 에코백 / 5그루 텀블러(최대). 받으면 모아 둔 나무 전부 사용 → 0그루부터 반복. 모아 둔 나무 = `harvested_trees` 수 − `reward_claims.trees_spent` 합.
- ⏸ 사은품 대신 포인트로 받기는 **미정**(느려진다는 의견) → DB에 `choice`·`points` 칸과 type `tree_reward`만 미리 둠(안: 쓴 나무 × 275⭐). 포인트로 사은품을 **사는** 기능은 없음. 저탄소샵은 외부 링크.
- 소셜 로그인: 회의에서 보류 → **제외**(이유: 우리 가입 화면을 건너뛰어 필수 동의 `photo_consent_at`·닉네임·자치구가 안 들어옴. 넣으려면 첫 로그인 후 추가 정보 화면 필요). 명세 v0.4 2번에 이유 명시.

**DB 메모 (퀴즈 보상 변경, 10/16 오후):** 정답 ⭐10은 `point_transactions` type `quiz` 한 줄씩. 보너스 ⭐50은 지금 있는 type으로는 `quiz`(amount 50)로 넣어 금액으로 구분 — 따로 구분하려면 `005`에서 type `quiz_bonus` 추가(필요하면 결정). 하루 1번 확인은 `quiz_answers`(같은 문제 같은 날 1번)와 그날 보너스 줄 유무로.

**DB**
- `004_tree_rewards.sql` 작성·로컬 검증(001→004)·**Supabase 실행 ✅ 10/16**(사용자, 커밋 `20fbecc`·README ✅ `adf26ef`): `reward_claims`(tier 1·2·3·5, trees_spent ≥ tier, item, choice 기본 gift, points — gift면 null·points면 >0, 반복 가능), point type에 `tree_reward`(+) 추가, 가입 트리거에 `signup_bonus` 💧3 한 줄 추가(기존 가입자에는 없음). 다음 번호 005.

**회원 화면**
- PR #10 `feature/welcome-cleanup` merge(`c106011`): WelcomePage에서 카카오·네이버·Apple 버튼과 "준비 중" 안내·`.auth-notice`·소셜 스타일 삭제. 남은 것: 이메일 가입·로그인 링크·둘러보기. AuthLayout 문구 "잘 버리는 습관이".
- `/welcome`은 로그인 상태면 홈으로 보냄 → 확인은 시크릿 창에서.

**담당 변경 (10/16):** 나의 숲 선영 → **경난**. 마이페이지 로그인·로그아웃 연결은 **현숙**(헤더에 연결이 모여 있음) — **물방울·포인트 완성 후** 연결.

**공용 API 도구 (PR #11 `feature/api-client`, 현숙 소관 `frontend/src/api/`)**
- `api/client.js`: `api.get/post/patch/delete(path, body)` — Supabase 세션 토큰을 `Authorization: Bearer`로 자동 첨부, 주소 앞은 `VITE_API_URL`(없으면 `http://localhost:8000/api/v1`), 실패 시 `ApiError`(FastAPI `detail` 문구 또는 상태별 한국어 기본 문구, 서버 꺼짐 = status 0 "서버에 연결하지 못했어요…").
- `api/useApi.js`: `useApi(path, { skip })` → `{ data, error, loading, reload }`. 사용법 `docs/frontend-api.md`.
- 예시: LoginPage "이미 로그인돼 있어요"에서 `/me`로 닉네임·자치구 표시(백엔드 꺼져 있으면 빨간 안내 — 정상). `frontend/.env.example`에 `VITE_API_URL=` 추가.

**회원 화면 (10/16 오후, PR #12~#14)**
- 숲 애니메이션 `pages/auth/GrowScene.jsx` + `grow-scene.css`: 원본은 아티팩트 "RePick 성장 스플래시"(framer-motion) → 추가 설치 없이 **CSS 애니메이션**으로 옮김. 물방울 → 새싹 → 소나무 → 사과나무, **9초마다 무한 반복**(`key` 재마운트), '동작 줄이기' 사용자는 정지 그림.
- `AuthLayout.jsx`: PC 왼쪽 그림 기본값 = GrowScene(가입·로그인·시작 공통, `art` prop으로 교체 가능). 큰 문구 "잘 버리는 습관이 / 나만의 숲이 돼요" + 설명 "분리배출 · 물방울 모으기 · 과일나무 수확 · 친환경 제품 받기"는 `BrandCopy`로 분리. 모바일 가입·로그인에는 애니메이션 없음(입력칸 우선). `TreeArt.jsx`는 이제 안 쓰임(삭제 안 함).
- **시작 화면(/welcome) 안 씀**(10/16 결정: 주소 클릭 → 홈에서 둘러보다 가입): 원본은 `WelcomePage.backup.jsx`에 보관, `WelcomePage.jsx`는 `/login`으로 보냄(홈·마이페이지의 `/welcome` 링크 5곳 = 지원 파일, 손대지 않음).
- `SignupPage.jsx`: 가입하기 버튼 **항상 진하게**, 사진 공개 동의 안 하고 누르면 체크박스 아래 빨간 안내(체크하면 사라짐).
- Supabase Redirect URLs는 **지금 필요 없음**(이메일 인증 끔·비밀번호 재설정 없음·소셜 제외 → Supabase가 사람을 돌려보낼 일 없음). 비밀번호 찾기 만들 때 추가.

**팀 안내 (10/16)**
- 단톡방 공지가 어렵다는 의견 → 팀원별 **Claude Code에 붙여 넣을 프롬프트**로 안내(사용자 전송). 경난 님께 나무 7단계 안내 전송.
- Windows 앱 제어가 `uvicorn.exe`를 막으면 `python -m uvicorn app.main:app --reload`, 패키지는 `python -m pip install -r requirements.txt`. 화면(`npm run dev`, frontend)과 서버(backend)는 **터미널 2개**.

**할 일 (회원 파트)**
- [x] ~~시작 화면 버튼 색·물방울 3개 문구~~ (10/16 반영 후 시작 화면 자체를 백업)
- [x] ~~Redirect URLs~~ (지금 불필요, 위 참고)
- [ ] ⑧ 마이페이지 로그인·로그아웃·회원 정보 연결 — 현숙, 물방울·포인트 완성 후
- [ ] 배포 때 할 일 → 위 "배포 체크리스트"

**미정 (❓):** 전환 최소 단위, 사은품 대신 포인트 여부, 사은품 수령 방식, 기부 캠페인 목록, 잔액 표시 위치·마이페이지 구성·담당, 에러 응답 모양, 판별 신뢰도·클래스 영문 이름(코드값), 시연용 적립 없는 미리보기 주소.

## 000. 2026-10-15 결정·진행

근거: 팀원 노션 "TEAM 4POTEN_APP 개발 → [2026.10.15] RePick 기능 개발 협의"(수정본) + 사용자(팀장) 결정. 기준 API 문서는 노션 **"RePick API 명세 · ERD (v0.4 - 10/15 회의 반영)"**이다(v0.3은 이전 기록, 수정하지 않음). 그날 결정 메모는 Claude Doc "RePick 현재 상황 (10/14 밤)".

**담당 (✅ 재배정)**
- 현숙: 회원가입·로그인, **Supabase DB 전체(SQL 일괄 작성)**. 팀원은 FastAPI로 읽고 쓰기만 한다.
- 경난: 카메라(AI 판별), 물방울, 포인트 / 지원: 기부, 이벤트·미션(퀴즈·출석·친구 초대), 저탄소샵, 수거함 지도 / 선영: 챗봇 포티, 커뮤니티, **나의 숲**
- 마이페이지 담당은 아직 미정.

**확정 (✅)**
- **물방울과 포인트 분리.** AI 판별 성공 시 둘 다 지급, 클래스별 개수 다름(개수 ❓). 물방울 = 나무 성장용, 포인트로 전환 가능(비율 ❓). 포인트 = 사은품 교환·기부.
- 적립 하루 최대 5회(AI 판별). 출석 하루 1회(출석은 나의 숲 → 이벤트 페이지로 이동). 퀴즈 하루 3개(문제 30개 정도, DB 아닌 `backend/data` 파일).
- 친구: 1명당 물방울 2, 5명 달성 시 포인트 10(식물영양제 대체, 영양제 삭제). 방식은 **초대 코드**.
- 미션: AI 인증 5회 달성 시 포인트 100 — **매일 1번**(10/16 확인, 0000절).
- 나무 **10단계**, 물 주기 = 물방울 차감(type **`watering`**, 경난 님 코드 이름 그대로). **10단계 끝나면 수확, 수확 때 물방울 차감 없음**(`harvest` type 삭제). 단계별 필요 물방울 수 ❓(코드의 표에 둠).
- **판별 사진은 서버·DB에 저장하지 않음.** 찍은 사람 기기에 저장(저장 버튼 → 다운로드 폴더). 커뮤니티 글 올릴 때만 Storage `posts`(공개, 5MB, 이미지만)에 저장.
- 회원가입: **이메일만**(SNS 제외), 자치구 25개 구 목록, **사진 공개 필수 동의**(동의 안 하면 가입 불가). 이용약관·데이터 활용 동의 문구 완료(회의록).
  - 개인정보 메모(사용자 요청으로 남김): 실제 서비스라면 꼭 필요하지 않은 동의를 필수로 받으면 안 된다는 개인정보 규칙이 있다. 그래서 동의 문구를 "커뮤니티에 직접 올린 사진은 다른 회원에게 공개됩니다"처럼 쓰는 게 좋다. 이러면 서비스 이용 약관 성격이 돼서 자연스럽다.
- `/scan`도 로그인 필요(물방울 적립 때문). 마이페이지·나의 숲 로그인 연결(로그아웃 버튼 등)은 DB 연결 후.
- 쓰기는 모두 FastAPI(secret 키)로만. 새 테이블은 RLS 켜고 정책 없음 → 브라우저 직접 접근 차단.
- 저탄소샵은 **외부 상품 링크**(구매 내역 테이블·서버 API·포인트 차감 없음). 상품 목록은 화면 코드 안 배열.
- 커뮤니티: 인스타그램 연동 없이 링크만 제공.
- 경난 님 기존 SQL은 MySQL용 → Supabase에 맞춰 경난 님이 코드 수정하기로 함.

**DB (✅ 10/15 Supabase SQL Editor 실행·확인 완료, 사용자)**
- `002_all_tables.sql`(커밋 `d1fad8d`, main 직접 push): profiles에 `photo_consent_at` + 가입 트리거 교체(`photo_consent: true` → 동의 시각), point_transactions에 **`currency`('drop'/'point', 기존 줄은 drop)** + type check 교체(적립 `scan` `attendance` `referral` `referral_bonus` `mission` `quiz` `post_verify` `signup_bonus` `event` / 물방울 사용 `watering` `convert` / 포인트 적립 `convert` / 포인트 사용 `reward` `shop` `donate`) + 출석 한국 날짜 하루 1번 unique index, `scans`(사진 칸 없음), `posts`·`comments`(parent_id)·`post_likes`(PK post_id+user_id), Storage `posts` 버킷, `harvested_trees`.
- `003_events.sql`(커밋 `ec11ab5`): profiles에 `invite_code`(8자리 자동·unique)·`referred_by`(자기 자신 불가), `quiz_answers`(같은 문제 같은 날 1번). `orders`는 저탄소샵이 외부 링크라 제외.
- 새 테이블의 회원 칸은 `profiles(id)` 참조(on delete cascade). 001·002·003 모두 로컬 PostgreSQL 16으로 순서대로 실행·제약 동작 확인(Claude).
- `supabase/migrations/README.md`: DB 파일은 현숙 일괄 작성, 001 ✅10/10 · 002 ✅10/15 · 003 ✅10/15. 다음 번호는 004.
- 아직 안 만든 것: 기부 캠페인, 사은품 신청(화면 확정 후 004~).

**GitHub (10/15)**
- PR #5 `feature/auth-pages` merge(`ba2def9`, 지원 님 사전 확인 없이 사용자 결정). `/scan` RequireAuth 추가 커밋 `3b81361` 포함.
- PR #7 선영 `sy`(포티 챗봇 백엔드·프론트) merge(`53ba942`): `routers/chatbot.py`(pandas CSV 검색, 모듈 import 시 CSV 로드), `chat.py`가 이를 호출(`POST /api/v1/chat`, body `message`·`district`), `backend/data/*.csv`, `features/chatbot/*`, `pages/Chat/ChatPc.jsx` 연결(폰 `ChatMobile`은 아직 가짜). `requirements.txt`에 `pandas>=2.2.0,<3.0.0`, `main.py` CORS에 localhost 5173/5174 추가(선영, 공용 파일).
- PR #8·#9 `feature/photo-consent`: SignupPage 사진 공개 필수 동의 체크박스(체크 안 하면 가입 버튼 비활성, `photo_consent: true` 전송).
- 팀원들은 기능 브랜치를 merge 후에도 지우지 않고 계속 쓰기로 함 → 작업 전 `git pull origin main` 필수(단톡방 안내).
- 단톡방 공지 완료(실행 여부 미확인): PR #5 후 `npm install` + `frontend/.env` Supabase 키, PR #7 후 `pip install -r requirements.txt`.
- Supabase Site URL `http://localhost:3000` → **`http://localhost:5173`** 변경(사용자). Redirect URLs `http://localhost:5173/**` 추가 권장(확인 필요). 배포 시 Vercel 주소로 다시 바꿈.

**미정 (❓) — 10/15 기준. 보상 숫자는 10/16 0000절에서 확정됨.**

## 00. 2026-10-13~14 결정·진행

근거: 팀원 노션 "TEAM 4POTEN_APP 개발 → [2026.10.13] 회의록" + 사용자(팀장) 메모(10/14). 기준 API 문서는 노션 **"RePick API 명세 · ERD (v0.3 - 10/14 회의 반영)"**이다. v0.2 페이지는 이전 기록으로 그대로 둔다.

**확정 (✅)**
- 물방울 담당: **서경난**. AI 판별 성공 시 클래스별 1개, **캔 3개, 건전지 4개**. 로그인 후 **출석 체크 1개**.
- 적립 한도: AI 판별 **하루 최대 5회**, 출석 **하루 1회**. 하루 = **한국 시간 0:00:00~23:59:59 (24시간 단위 초기화)**. 회의록의 "12시간"은 기록 오류(사용자 확인). DB는 UTC 저장이므로 한도 계산은 `Asia/Seoul` 날짜 기준.
- 나무: **모은 물방울을 나무에 줘야 자람**(물 주기 = 잔액 차감, type 예 `tree_water`, 음수 amount).
- 사진 최대 업로드 **5MB**.
- 챗봇 포티: 엔드포인트를 `POST /api/v1/chat`으로 수정 완료. HTML 화면 → React 전환 예정(김선영).
- 커뮤니티: 외부 SNS 연동 없이 **RePick 자체 커뮤니티**. 인증 게시글에 보상 물방울 적용(개수 미정).
- 실시간 캠: **시연 때만 사용**, 코드는 남겨 둔다. 웹 기본 흐름은 사진 촬영/업로드.
- AI: 웹캠 바운딩 박스 과다 생성 개선 중, YOLO 중심 + SigLIP2 보조 방향(서경난, 테스트 중).

**미정 (❓, 다음 회의) — 임의로 구현하지 않는다**
- 판별 성공 신뢰도 / ~~클래스 목록·클래스별 1번 제한~~ → 10/16 확정: 7개, 클래스 상관없이 적립 하루 5회만, 판별 무제한 (0000절)
- 가입 보너스 개수, 친구 초대·추천 보상, 인증글 개수, 초기·후기 차등 지급
- 물방울 잔액을 화면 어디에 보여 줄지(`/me` 포함 여부 포함), 나무 단계별 물방울 수
- 나의 숲·마이페이지 상세 구성과 **담당자**, 퀴즈 도입, 기부 설계, 포인트 적립 현황 대시보드
- FastAPI 1개 vs AI 서버 분리(추천 1개), 에러 응답 모양(팀장 의견: FastAPI 기본 `{"detail": ...}` 유지), 자치구 입력 방식(추천: 25개 구 목록)

**진행 (10/14)**
- 오지원 팀원 PR #2 `feat: frontend v4.5 실사 시안 반응형 화면 추가` → main 병합(커밋 `142a6aa`, 병합 `3b0617f`). 사용자가 pull 후 `npm install`·`npm run dev`로 화면 확인.
  - Vite + React(JavaScript), react-router-dom, react-kakao-maps-sdk. 공통 Layout(PC 헤더·푸터 1024px 이상 / 모바일 하단 메뉴 5개 + 포티 버튼), 부품 `Button·Card·Input`, 색·글꼴 변수 `index.css`.
  - 화면(가짜 데이터): Home, Scan, Forest, Community, MyPage, Chat, Points, Donate, `features/events`(퀴즈·친구 초대), `features/recycle-map`(수거함 지도, 카카오맵 키 없으면 기본 지도). Firebase는 쓰지 않음(빈 연결 자리).
  - `/welcome`, `/signup`, `/login`은 **현숙 담당**이라 `App.jsx`에 Layout 바깥 자리로 **주석 처리**되어 있다(`./pages/auth/WelcomePage` 등).
  - 페이지 폴더는 대문자(`Home` 등)지만 auth는 **소문자 `pages/auth`**로 만든다(App.jsx 주석과 일치, 사용자 결정). import 경로 대소문자는 정확히 맞춘다(Vercel은 대소문자 구분).
- 회원 화면 시안(시작 화면: 카카오·네이버·Apple·이메일 가입 버튼, 로그인 링크, 둘러보기)을 받았다. **이메일 가입·로그인부터** 구현하고 소셜 버튼은 "준비 중" 안내만 둔다(카카오는 비즈 앱 이메일 동의, 네이버는 Supabase 기본 미지원, Apple은 유료 개발자 계정 문제). 소셜은 시간 남으면 카카오만 2차.
- 시안의 "물방울 [N]개" 가입 보너스 문구는 N이 미정이므로 숫자 없이 둔다.
- 가입 트리거는 이미 `signUp(..., { options: { data: { nickname, region } } })` 값을 `profiles`에 넣는다.
- Supabase Authentication → URL Configuration의 Site URL을 `http://localhost:5173`으로 바꾸기를 권장(사용자 확인 필요).
- README 수정본(폴더 구조 최신화 + "역할 나누기: 기능별로 세로로" 절)을 Claude 채팅에서 만들어 사용자에게 전달했다. `docs/readme-roles` 브랜치로 PR 예정(아직 미반영일 수 있음, `git log`로 확인).
- 팀원용 노션 문서: "GitHub 협업 가이드(팀원용)", "기능별 개발 방식", "공통 디자인 가이드(지원·선영)", 지원 님께 App.jsx 요청 문서(md) 전달.

**진행 (10/14 오후~밤, Claude Code) — ⑦ 회원 화면 완료, PR #5 리뷰 대기**
- 경난 PR #4 `feature/ai-classify` → main 병합(`995a6da`, 사용자가 GitHub 웹에서). `frontend/src/features/reward/RewardPage.*` 추가, `pages/Scan/index.jsx`가 RewardPage를 부름(`backendReady={false}`), 지원 님 `ScanMobile/ScanPc.jsx` 삭제. 충돌·비밀정보 없음 확인.
  - 주의: RewardPage가 부르는 `/point-history`, `/point-result`, `/estimate-points`, `/confirm-points`는 아직 없는 주소이고 `/api/v1` 접두사가 없어 명세와 다름 → 경난 님 물방울 API 만들 때 맞추기. oxlint 경고 4개(경난 파일, 손대지 않음).
  - 선영 `sy` 브랜치(챗봇 백엔드·프론트 연동)는 PR 없음 → 10/15 PR 예정.
- ⑦ `feature/auth-pages` 커밋 4개(`7fa903f`, `c15fd29`, `d55a8da`, `9584260`) push → **PR #5** 생성(사용자). 지원 님 확인 후 merge 권장.
  - `lib/supabase.js`(VITE_SUPABASE_URL·VITE_SUPABASE_PUBLISHABLE_KEY, 없으면 오류), `lib/AuthContext.jsx`(`useAuth()` → `{ session, user, loading }`, onAuthStateChange), `main.jsx`를 `<AuthProvider>`로 감쌈.
  - `pages/auth/`: `AuthLayout.jsx`(PC 좌측 그라데이션+로고+나무 / 모바일 로고), `auth.css`(index.css 변수 사용), `TreeArt.jsx`(나무 3그루 **임시 SVG**, 그림 파일 오면 교체), `WelcomePage.jsx`(소셜 3개 "준비 중", 로그인 상태면 홈으로), `SignupPage.jsx`(이메일·비밀번호 6자+·확인·닉네임 최대 20자·**자치구 서울 25개 구 목록 선택** — 사용자 결정), `LoginPage.jsx`(이미 로그인 시 안내 + **임시 로그아웃 버튼**, 로그인 후 원래 가려던 페이지로), `RequireAuth.jsx`(문지기).
  - `App.jsx`: auth 주석 3쌍 해제, `/forest`·`/mypage`·`/points`·`/donate`를 `<Route element={<RequireAuth />}>`로 감쌈. **`/scan`은 열어 둠(팀 결정 필요).** `.env.example`에 Supabase 키 이름 2개, `@supabase/supabase-js` ^2.117.3 설치.
  - 검증(사용자, 로컬·가짜 테스트 계정): 가입 입력 오류, 가입 → profiles 닉네임·자치구 저장, 중복 이메일 차단, 틀린 비밀번호, 로그인 → 홈, 새로고침 후 유지, 로그아웃, 막힌 페이지 → /login → 원래 페이지 복귀, 열린 페이지 정상, welcome 소셜 안내·PC/모바일 레이아웃. oxlint 회원 파일 오류 0, vite build 성공.
  - 남은 결정: 마이페이지 "로그아웃"(지금은 `/welcome` 링크만) 실제 연결 위치·담당, `/scan` 로그인 필요 여부, 나무 그림 파일.
- DB 일괄 설계 제안: 팀원들이 Supabase·DB를 어려워해 **현숙이 필요한 테이블 SQL을 한꺼번에 작성**하는 안. 노션 API 명세 v0.3 하위에 **"DB 테이블 정리 (초안, 10/14) — 회의 안건"** 페이지 작성(Claude, 사용자 요청). 아직 테이블은 만들지 않음.
  - 새 테이블 안: `scans`(002), `posts`·`comments`·`post_likes` + Storage `posts` 버킷(003), `harvested_trees`(004). 잔액·나무 단계·랭킹·좋아요 수는 계산.
  - ⚠️ 001 `point_transactions` check에 **`tree_water`(−) 없음** → 새 번호 파일로 추가 필요. `harvest`(−) 유지 여부 ❓. `signup_bonus`·`referral`은 개수 정해지면.
  - ✅ **판별 사진도 저장**(외부 조언: Supabase Storage 업로드 + `scans`에 사진 칸). Storage `scans` 버킷, 5MB·이미지만 제한. ❓ **공개(`image_url`) vs 비공개(`image_path` + signed URL)** — 현숙 의견 비공개 추천, 회의에서 결정.
  - 제안: 모든 쓰기는 FastAPI(secret 키)로만, 새 테이블 RLS는 켜고 브라우저 직접 접근 차단 → 팀원은 RLS 몰라도 됨.

## 0. 2026-10-08 오후 결정

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
| ⑥ ✅ | `frontend/` 기본 틀·공통 Layout·화면 — **오지원 팀원** PR #2로 main 병합(10/14) | 지원 | 10/14 |
| ⑦ ✅ | **회원 화면** `frontend/src/pages/auth/` (현숙): supabase.js → AuthContext → `/signup` → `/login` → `/welcome` → 로그인 필요 페이지 막기 — 10/14 완료, **10/15 PR #5 merge** + 사진 공개 필수 동의(PR #8·#9) | 전원 | 10/16 |
| ⑦-2 ✅ | **공통 DB** `002_all_tables.sql`·`003_events.sql` 작성·실행 — 10/15 완료(000절) | 전원 | 10/16 |
| ⑧ | 마이페이지 회원 정보 연결(`GET/PATCH /me`), 로그아웃 버튼, 물방울·포인트 잔액 연결(경난 API 완성 후) — DB 연결 후 진행, 마이페이지 담당 미정 | — | 10/23 |
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

## 10. 폴더 구조 — 2026-10-16 기준

```text
POTEN/
├─ CLAUDE.md              # Claude Code용, AGENTS.md·PROJECT_CONTEXT.md 불러옴
├─ AGENTS.md
├─ PROJECT_CONTEXT.md
├─ README.md              # ✅ 10/12 팀원용 소개·실행 방법
├─ .gitignore             # ✅
├─ supabase/
│  └─ migrations/
│     ├─ README.md                 # ✅ DB 파일은 현숙 일괄 작성, 다음 번호 004
│     ├─ 001_profiles_points.sql   # ✅ 실행 10/10
│     ├─ 002_all_tables.sql        # ✅ 실행 10/15 (통장 currency, scans, 커뮤니티, posts 버킷, harvested_trees, 사진 동의)
│     ├─ 003_events.sql            # ✅ 실행 10/15 (invite_code·referred_by, quiz_answers)
│     └─ 004_tree_rewards.sql      # ✅ 실행 10/16 (reward_claims, tree_reward, 가입 보너스 💧3)
├─ backend/               # FastAPI
│  ├─ .venv/              # ✅ Python 3.12.10 (Git 제외)
│  ├─ .env                # ✅ 실제 값 (Git 제외)
│  ├─ .env.example        # ✅
│  ├─ requirements.txt    # ✅ 버전 고정 + pandas (PR #7)
│  ├─ data/               # ✅ 포티 CSV (general_waste, large_waste) — 퀴즈 파일도 여기 예정
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
│        ├─ chat.py       # ✅ 포티 연결 (PR #7) — 김선영
│        ├─ chatbot.py    # ✅ 포티 본체 (pandas CSV 검색) — 김선영
│        └─ forest.py     # 가짜 — 김선영(나의 숲)
├─ docs/
│  ├─ backend-auth.md     # ✅ 팀원용 get_current_user 사용법
│  └─ frontend-api.md     # ✅ 팀원용 useApi·api 사용법 (PR #11)
└─ frontend/              # ✅ 10/14 PR #2 (오지원) — React (Vite)
   ├─ .env                # 실제 값 (Git 제외) — VITE_SUPABASE_URL·PUBLISHABLE_KEY
   ├─ .env.example        # VITE_KAKAO_JS_KEY, VITE_SUPABASE_* 이름
   ├─ package.json        # + @supabase/supabase-js
   └─ src/
      ├─ main.jsx         # <AuthProvider>로 App 감쌈 (⑦)
      ├─ App.jsx          # 주소 → 화면 (지원 소관). auth 3개 연결 + RequireAuth 묶음 (⑦)
      ├─ index.css        # 색·글꼴 변수
      ├─ components/      # Layout, Button, Card, Input, Logo … (지원 소관)
      ├─ api/             # ✅ 현숙 — client.js(api·ApiError), useApi.js (PR #11)
      ├─ lib/             # dc.js, useIsPc.js, supabase.js ✅, AuthContext.jsx ✅ (useAuth)
      ├─ pages/           # Home, Scan(→RewardPage), Forest, Community, MyPage, Chat, Points, Donate
      │  └─ auth/         # ✅ 현숙 — AuthLayout(+BrandCopy), auth.css, GrowScene(+grow-scene.css, 숲 애니메이션), Signup/LoginPage, WelcomePage(→/login), WelcomePage.backup.jsx, RequireAuth, TreeArt(안 쓰임)
      └─ features/        # events, recycle-map, reward(경난, 판별·보상 화면), chatbot(선영)
```

- `.gitignore`: `.env`, `.venv/`, `node_modules/`, Python 캐시, 빌드 결과, 로그, `.vscode/`, `시작.txt`(개인 메모). `.env.example`은 포함한다.
- `app/__init__.py`는 만들지 않았다(네임스페이스 패키지로 import 정상 확인).
- `compose.yaml`(Docker)은 만들지 않는다.

## 11. 다음 한 단계와 시작 문장

**현재 위치 (2026-10-16 오후):** 공통 DB 001~004 실행 완료, 보상 숫자 확정(노션 보상표, 나무 7단계), 공용 API 도구(PR #11), 회원 화면 숲 애니메이션·시작 화면 백업·가입 버튼(PR #12~#14). main 최신 `2a899d6`. 노션 명세 v0.4가 기준. 팀원들은 가짜 API를 진짜(DB 연결)로 바꾸는 단계.

**다음 한 단계:**
1. 0000절 "할 일 (회원 파트)" — 마이페이지 연결은 물방울·포인트 완성 후. 팀원 화면은 `useApi`·`api`로 FastAPI 호출(`docs/frontend-api.md`).
2. 팀원 DB 연동 질문 대응: 물방울·포인트는 `point_transactions` 한 줄씩(`currency` 'drop'/'point'), 조회는 `.eq("user_id", user["id"])`, 칸 이름은 노션 v0.4 9번 ERD, 숫자는 보상표.
3. 기부 캠페인·사은품 수령 등 새 테이블은 화면이 정해지면 `005_…sql`(README 표에 먼저 한 줄).

다음 대화 시작 문장:

> AGENTS.md와 PROJECT_CONTEXT.md를 읽고 RePick을 이어가 줘. 0000절(10/16)부터 확인하고, 오늘 할 일을 알려 줄게.

(아래는 10/16 이전 기록)

**현재 위치 (2026-10-15 오후, 지난 기록):** ⑦ 회원 화면 merge, 공통 DB(002·003) 실행 완료, 포티 merge.

**현재 위치 (2026-10-14 밤, 지난 기록):** ⑦ 회원 화면 완료 → PR #5 리뷰 대기. DB 일괄 설계 초안을 노션 "DB 테이블 정리 (초안, 10/14)"에 올림.

서버 켜는 법 (cmd):
```text
cd /d C:\AIX_프로젝트\POTEN\backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

다음 한 단계: **⑦ 회원 화면** — `git switch main` → `git pull` → `git switch -c feature/auth-pages` → `frontend/src/lib/supabase.js`부터 한 단계씩.
- 필요한 값: `frontend/.env`에 `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`(Supabase → Project Settings → API Keys, 또는 상단 Connect → React). secret 키는 넣지 않는다. `frontend/.env.example`에 키 이름 추가는 지원 님과 공유.
- 화면 서버: `cd frontend` → `npm install`(처음) → `npm run dev` → `http://localhost:5173`

(아래는 10/13 이전에 적어 둔 할 일. 처리된 것은 00절 참고)
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

> AGENTS.md와 PROJECT_CONTEXT.md를 읽고 RePick 회원 파트를 이어가 줘. 00절과 5장 ⑦부터, 먼저 `frontend/src/lib/supabase.js` 계획을 보여 줘.

## 12. 이전 기록

- `docs/archive/`는 2026-10-10 사용자 결정으로 삭제했다. 이전 Expo 계획 문서는 이 폴더에 없다.

과거 Expo 계획·B2B 대시보드·팀 회의 대기 상태는 최신 요구로 적용하지 않는다. 중요한 변경·구현 상태는 사용자의 저장 요청 범위에서 갱신한다.


## 추가 기록

- 2026-10-16: 문서 정리 — 지금 상태는 `PROJECT_CONTEXT.md`, API·보상은 `docs/api-spec.md`(v0.5, 노션 v0.4에서 옮김), 날짜별 기록은 이 파일로 분리.
- 2026-10-19: 문서 구조 정리 — 배포 체크리스트를 `docs/deploy.md`로 분리, `PROJECT_CONTEXT.md`를 한 화면으로 줄이고 담당별 "읽을 곳" 추가, 문서는 팀장 작업에서만 고치기로 함(충돌 방지). Vercel 화면 배포 https://repick-tau.vercel.app (PR #18).
