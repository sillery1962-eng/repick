# 화면에서 API 부르기 (팀원용)

화면(React)에서 FastAPI를 부를 때는 **팀 공용 도구 `frontend/src/api/`**를 씁니다. (담당: 백현숙)

- 주소 앞부분 `http://localhost:8000/api/v1`을 대신 붙여 줍니다.
- 로그인한 사람이면 **토큰을 자동으로** 붙여 줍니다. → 서버의 `get_current_user`가 "누구인지" 알 수 있어요.
- 서버가 거절하면 한국어 문구가 담긴 오류(`error.message`)를 줍니다.

`fetch('http://127.0.0.1:8000/...')`를 직접 쓰지 마세요. 토큰이 안 붙어서 로그인이 필요한 API는 401로 거절됩니다.

## 1. 화면이 열릴 때 값 받아 오기 — `useApi`

```jsx
import { useApi } from '../../api/useApi'

export default function ForestMobile() {
  const { data, error, loading, reload } = useApi('/forest')

  if (loading) return <p>불러오는 중…</p>
  if (error) return <p>{error.message}</p>

  return <p>{data.stage}단계 · 물방울 {data.drops_balance}개</p>
}
```

- 주소는 `/api/v1` **뒤 부분만** 씁니다. (`/forest`, `/points`, `/me` …)
- 값이 바뀐 뒤(물 주기, 적립 등) 다시 받아 오려면 `reload()`를 부릅니다.
- 로그인 안 했을 때는 부르지 않으려면: `useApi('/me', { skip: !user })` (`user`는 `useAuth()`에서)

## 2. 버튼을 눌렀을 때 보내기 — `api`

```jsx
import { api } from '../../api/client'

async function handleWater() {
  try {
    const forest = await api.post('/forest/water', { drops: 2 })
    // 성공: forest 에 서버가 돌려준 값
  } catch (error) {
    alert(error.message) // 예: "물방울이 부족해요" (서버가 보낸 문구)
  }
}
```

| 하고 싶은 것 | 쓰는 법 |
| --- | --- |
| 조회 | `await api.get('/points')` |
| 새로 만들기 | `await api.post('/posts', 보낼값)` |
| 일부 수정 | `await api.patch('/me', { nickname: '나나' })` |
| 삭제 | `await api.delete('/posts/31')` |
| 사진 올리기 | `const fd = new FormData(); fd.append('image', file); await api.post('/classify', fd)` |

## 3. 오류는 이렇게 옵니다

| 상황 | `error.status` | `error.message` |
| --- | --- | --- |
| 서버(uvicorn)가 꺼져 있음 | 0 | 서버에 연결하지 못했어요… |
| 로그인 안 함 / 토큰 만료 | 401 | 서버 문구 또는 "로그인이 필요해요" |
| 서버가 `HTTPException(detail="…")`로 거절 | 그 번호 | **서버가 쓴 `detail` 문구 그대로** |

→ 서버(FastAPI)에서 `raise HTTPException(status_code=400, detail="물방울이 부족해요")`처럼 **한국어 detail**을 쓰면 화면에 그대로 보입니다.

## 4. 처음 한 번 확인

1. `backend`에서 서버 켜기: `.venv\Scripts\activate` → `uvicorn app.main:app --reload`
2. `frontend`에서 화면 켜기: `npm run dev`
3. 로그인한 뒤 `http://localhost:5173/login`에 들어가면 **DB에서 받아 온 닉네임·자치구**가 보입니다. (`LoginPage.jsx`에 들어 있는 예시)
4. 서버를 끄고 새로고침하면 "서버에 연결하지 못했어요" 안내가 보입니다.

배포할 때는 `frontend/.env`의 `VITE_API_URL`에 배포한 서버 주소(`…/api/v1`)를 넣습니다.
