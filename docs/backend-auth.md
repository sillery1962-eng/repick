# 로그인 확인 함수 `get_current_user` 사용법 (팀 공용)

작성: 백현숙 · 2026-10-10 · 대상: RePick FastAPI API를 만드는 팀원

## 1. 한 줄 요약

API 함수에 `user: dict = Depends(get_current_user)`를 붙이면 **로그인한 사람만** 그 API를 쓸 수 있다.
로그인한 사람의 정보는 `user["id"]`, `user["email"]`로 꺼낸다.

## 2. 동작 순서

```text
React(로그인 후) ──Authorization: Bearer <access_token>──▶ FastAPI
FastAPI: get_current_user가 Supabase에 "이 토큰 진짜?" 확인
  ├─ 토큰 없음        → 401 "로그인이 필요합니다."
  ├─ 가짜·만료 토큰    → 401 "로그인 정보가 올바르지 않거나 만료되었습니다."
  └─ 진짜             → {"id": "회원 id(uuid)", "email": "이메일"} 를 API 함수에 넘겨 줌
```

- 회원 id는 `auth.users.id` = `profiles.id`와 같은 값이다. **팀 공통 회원 ID로 쓴다.**
- 코드 위치: `backend/app/auth.py`

## 3. 사용 예시

`backend/app/routers/` 안에 내 파일을 만든다. (예: `posts.py`)

```python
from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.supabase_client import supabase

router = APIRouter(prefix="/api/v1/posts", tags=["게시판"])


@router.get("/mine")
def my_posts(user: dict = Depends(get_current_user)):
    """내가 쓴 글 목록 (로그인 필요)"""
    result = (
        supabase.table("posts")
        .select("*")
        .eq("user_id", user["id"])  # ⚠️ 반드시 본인 것만
        .execute()
    )
    return result.data
```

`backend/app/main.py`에 등록한다.

```python
from app.routers import me, posts   # posts 추가

app.include_router(posts.router)    # 아래쪽에 추가
```

로그인 없이 누구나 써도 되는 API(예: 게시글 전체 목록)에는 `Depends(get_current_user)`를 붙이지 않는다.

## 4. 꼭 지킬 규칙

1. **`.eq("user_id", user["id"])`를 빼먹지 않는다.**
   백엔드의 `supabase`는 secret 키로 연결되어 RLS(본인만 보기 규칙)를 건너뛴다.
   조건을 빼면 **모든 회원의 데이터**가 나온다.
2. **회원 id를 요청 body·주소로 받지 않는다.** 항상 `user["id"]`(토큰에서 나온 값)를 쓴다.
   body로 받으면 남의 id를 넣어 흉내 낼 수 있다.
3. **물방울은 직접 쓰지 않는다.** `point_transactions`에 insert하지 말고
   `add_points()`를 쓴다. (`backend/app/points.py`, 만드는 중)
4. **secret 키는 `backend/.env`에만.** 코드·Git·메신저에 넣지 않는다.
   각자 Supabase 대시보드 → Project Settings → API Keys에서 확인한다.

## 5. 내 컴퓨터에서 서버 켜기

처음 한 번:

```text
cd backend
py -3.12 -m venv .venv
.venv\Scripts\activate
pip install -r requirements.txt
```

`backend/.env.example`을 복사해 `backend/.env`를 만들고 값을 채운다.

매번:

```text
cd backend
.venv\Scripts\activate
uvicorn app.main:app --reload
```

`http://localhost:8000/api/v1/health` → `{"status":"ok"}`면 정상.

## 6. `/docs`에서 테스트하기

1. Supabase → Authentication → Users → Add user (Auto Confirm User 체크)로 테스트 회원을 만든다.
2. PowerShell에서 토큰을 받는다. (`< >`는 내 값으로)

   ```powershell
   $body = @{ email = "<테스트 이메일>"; password = "<비밀번호>" } | ConvertTo-Json
   $r = Invoke-RestMethod -Method Post -Uri "<Project URL>/auth/v1/token?grant_type=password" -Headers @{ apikey = "<publishable 키>" } -ContentType "application/json" -Body $body
   $r.access_token | Set-Clipboard
   ```

3. `http://localhost:8000/docs` → 오른쪽 위 **Authorize** → Ctrl+V (앞에 `Bearer` 붙이지 않음) → Authorize.
4. 내 API를 Try it out → Execute.

- 토큰은 **1시간** 뒤 만료된다. 401이 나오면 2번을 다시 한다.
- 토큰은 저장·공유하지 않는다.
- Authorize 칸에 `eyJ`로 시작하는 값이 들어갔는지 확인한다. 명령어 글자가 들어가면 401이 나온다.

## 7. 프론트엔드에서 부를 때 (참고)

```js
const { data } = await supabase.auth.getSession();
const res = await fetch("http://localhost:8000/api/v1/me", {
  headers: { Authorization: `Bearer ${data.session.access_token}` },
});
```

## 8. 참고 API

| 메서드 | 주소 | 설명 |
| --- | --- | --- |
| GET | `/api/v1/health` | 서버 상태 (로그인 불필요) |
| GET | `/api/v1/me` | 내 정보 (id, nickname, region, created_at, email) |
| PATCH | `/api/v1/me` | 닉네임·자치구 수정, 각 최대 20자 |
