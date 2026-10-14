from fastapi import APIRouter, Depends

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: [이름]
# 친구 초대: 내 초대 코드와 초대 현황. 친구가 가입할 때 코드를 넣는 부분은 회원가입(백현숙)과 맞춘다.
# 친구가 첫 분리배출 인증을 마치면 둘 다 적립, 5명마다 식물영양제 1개 (보상 개수는 미정).
router = APIRouter(prefix="/api/v1/invites", tags=["친구 초대 (가짜)"])


@router.get("/me")
def read_my_invites(user: dict = Depends(get_current_user)):
    """내 초대 코드와 초대한 친구 현황"""
    return {
        "is_mock": True,
        "code": "REPICK-7K2Q",
        "invited_count": 2,
        "goal": 5,
        "friends": [
            {"nickname": "리픽러", "status": "done", "joined_at": "2026-10-11T14:00:00+09:00"},
            {"nickname": "새 회원", "status": "joined", "joined_at": "2026-10-13T09:20:00+09:00"},
        ],
    }
