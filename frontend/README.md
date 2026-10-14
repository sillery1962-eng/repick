# RePick 화면 (frontend)

React (Vite, JavaScript) · 반응형 웹앱. 디자인은 claude.ai 캔버스 "POTEN 앱 첫 화면 시안"의 **v4.5 실사 비교** 페이지를 그대로 옮겼습니다.

## 실행

```text
cd frontend
npm install        (처음 한 번)
copy .env.example .env   (처음 한 번, 카카오 키는 선택)
npm run dev
```

브라우저에서 `http://localhost:5173` 을 엽니다.

## 반응형 방식

- 화면 폭 **1024px 이상 = PC 시안**, 그보다 좁으면 **모바일 시안**을 보여 줍니다 (`src/lib/useIsPc.js`).
- PC: 위 헤더(메뉴 10개) + 아래 푸터 · 모바일: 각 화면 상단 바 + 아래 메뉴 5개 · 공통: 오른쪽 아래 포티 버튼 (`src/components/Layout.jsx`)
- PC 본문은 시안 폭(1080px, 수거함 찾기 1200px)을 넘지 않고, 헤더 로고와 본문 왼쪽 끝이 맞습니다.

## 화면과 주소

| 주소 | 화면 | 파일 |
|---|---|---|
| `/` | 홈 | `src/pages/Home/` |
| `/scan` | AI 분리배출 인증 | `src/pages/Scan/` |
| `/forest` | 나의 숲 | `src/pages/Forest/` |
| `/community` | 커뮤니티 | `src/pages/Community/` |
| `/mypage` | 마이페이지 | `src/pages/MyPage/` |
| `/chat` | 포티 챗봇 · 배출 가이드 | `src/pages/Chat/` |
| `/points` | 포인트 적립 현황 | `src/pages/Points/` |
| `/donate` | 기부하기 | `src/pages/Donate/` |
| `/login` | 회원가입 · 로그인 (헤더·메뉴 없음) | `src/pages/Login/` |
| `/events` · `/events/mission` · `/events/invite` | 이벤트 · 챌린지, 오늘의 퀴즈, 친구 초대 | `src/features/events/` |
| `/map` | 수거함 찾기 (카카오맵) | `src/features/recycle-map/` |

## 폴더

```text
src/
├─ App.jsx              주소와 화면 연결
├─ index.css            색·글꼴 변수, 기본 초기화
├─ lib/
│  ├─ dc.js             시안 화면 로직을 React에서 쓰게 해 주는 도구
│  └─ useIsPc.js        PC/모바일 판단
├─ components/          공통 틀과 부품
│  ├─ Layout.jsx        PC 헤더·푸터 / 모바일 하단 메뉴 / 포티 버튼
│  ├─ PcHeader.jsx · PcFooter.jsx · BottomNav.jsx · FortyFab.jsx
│  ├─ Logo.jsx · Icons.jsx
│  └─ Button.jsx · Card.jsx · Input.jsx   (새 화면 만들 때 쓰는 기본 부품)
├─ pages/<화면>/
│  ├─ index.jsx         PC/모바일 중 하나를 골라 보여 줌
│  ├─ <화면>Pc.jsx      PC 시안
│  └─ <화면>Mobile.jsx  모바일 시안
└─ features/            기능 단위로 따로 만든 화면 (이벤트, 수거함 찾기)
public/design/          시안 사진
```

## pages 파일 고치는 법

`pages/` 아래 PC·모바일 파일은 시안에서 **자동 변환**한 코드라 스타일이 `style={{ ... }}`로 들어 있습니다.

- 문구를 바꾸려면 JSX 안의 글자를 그대로 고치면 됩니다.
- 버튼 동작·숫자는 파일 위쪽 `class Component`의 `renderVals()`에 있습니다. 여기서 돌려준 값을 화면에서 `V.이름`으로 씁니다.
- 실제 데이터(API)를 붙일 때는 `renderVals()`에서 쓰는 값을 API 결과로 바꾸면 됩니다.
- PC와 모바일 파일이 따로라서, 같은 내용을 바꿀 때는 두 파일을 모두 고쳐야 합니다.

## 지금은 가짜 데이터

물방울 12개, 포인트 6,170P, `[이름]`, 랭킹·게시글 등은 시안용 예시입니다. 로그인(Supabase)과 FastAPI가 연결되면 바꿉니다.
`[ ]`로 표시된 값은 아직 정하지 않은 값입니다.

## 비밀정보

- `frontend/.env`에는 `VITE_`로 시작하는 값만 넣고, **Supabase secret 키는 절대 넣지 않습니다** (publishable 키만 가능).
- `.env`는 Git에 올라가지 않습니다.
