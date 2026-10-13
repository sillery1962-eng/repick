from fastapi import APIRouter, Depends

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 미정
# 나무 단계별 필요 물방울 수는 팀에서 정하지 않았다. 아래 숫자는 예시일 뿐이다.
router = APIRouter(prefix="/api/v1/forest", tags=["나의 숲 (가짜)"])


@router.get("")
def read_forest(user: dict = Depends(get_current_user)):
    """내 나무 상태"""
    return {"is_mock": True, "stage": 2, "drops": 7}
