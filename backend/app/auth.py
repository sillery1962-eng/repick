from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.supabase_client import supabase

# 요청 헤더의 "Authorization: Bearer <토큰>"에서 토큰을 꺼내 준다
bearer_scheme = HTTPBearer(auto_error=False)


def get_current_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict:
    """로그인한 사용자를 확인한다. (팀 공용)

    사용법: def 내API(user: dict = Depends(get_current_user)):
    성공하면 {"id": "회원 id", "email": "이메일"}을 돌려준다.
    토큰이 없거나 틀리면 401 오류를 돌려준다.
    """
    # 1) 입장권(토큰)을 안 가져왔으면 돌려보낸다
    if credentials is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인이 필요합니다.",
        )

    # 2) Supabase에 "이 토큰 진짜예요?"라고 물어본다
    try:
        response = supabase.auth.get_user(credentials.credentials)
    except Exception:
        response = None

    # 3) 가짜이거나 기한이 지났으면 돌려보낸다
    if response is None or response.user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="로그인 정보가 올바르지 않거나 만료되었습니다.",
        )

    # 4) 진짜면 "이 손님은 누구"인지 알려 준다
    return {"id": response.user.id, "email": response.user.email}
