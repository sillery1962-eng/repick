from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 오지원
# 친구 추가는 초대 코드 방식이다.
#   profiles.invite_code: 회원마다 8자리 코드 (자동 생성, 겹치지 않음)
#   profiles.referred_by: 친구 코드를 넣으면 그 친구 id (자기 자신은 안 됨, 한 번만)
#   친구 수 = referred_by가 내 id인 회원 수
# 보상: 친구 1명당 물방울 2 (type='referral', currency='drop')
#       5명 달성 시 포인트 500 (type='referral_bonus', currency='point', 한 번만)
router = APIRouter(prefix="/api/v1/friends", tags=["친구 초대 (가짜)"])

DROPS_PER_FRIEND = 2
GOAL_FRIENDS = 5
GOAL_REWARD = 500
SAMPLE_MY_CODE = "RP7K2Q9M"


class FriendCode(BaseModel):
    """친구 초대 코드 입력 때 받을 값"""

    invite_code: str = Field(pattern="^[A-Z0-9]{8}$")


def invite_status(friend_count: int) -> dict:
    """친구 수로 보상 현황을 계산한다"""
    return {
        "friend_count": friend_count,
        "goal": GOAL_FRIENDS,
        "drops_per_friend": DROPS_PER_FRIEND,
        "goal_reward": GOAL_REWARD,
        "earned_drops": friend_count * DROPS_PER_FRIEND,
        "bonus_received": friend_count >= GOAL_FRIENDS,
    }


@router.get("/me")
def read_my_friends(user: dict = Depends(get_current_user)):
    """내 초대 코드와 초대한 친구 현황"""
    return {
        "is_mock": True,
        "invite_code": SAMPLE_MY_CODE,
        **invite_status(2),
        "friends": [
            {"nickname": "리픽러", "joined_at": "2026-10-11T14:00:00+09:00"},
            {"nickname": "새 회원", "joined_at": "2026-10-13T09:20:00+09:00"},
        ],
    }


@router.post("")
def add_friend(body: FriendCode, user: dict = Depends(get_current_user)):
    """친구의 초대 코드 입력 (가입할 때 한 번). 실제로는 코드 주인을 찾아 referred_by에 저장하고 그 친구에게 물방울 2"""
    if body.invite_code == SAMPLE_MY_CODE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "내 초대 코드는 입력할 수 없습니다.")
    return {"is_mock": True, "invite_code": body.invite_code, "referrer_nickname": "리픽러"}
