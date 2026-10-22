from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.supabase_client import supabase

# 친구 초대 API. 담당: 오지원 (규칙: docs/api-spec.md 5번 "친구"·8번 "친구 초대")
# 친구 추가는 초대 코드 방식이다. 새 테이블 없음 (003 profiles 칸 사용)
#   profiles.invite_code: 회원마다 8자리 코드 (DB가 자동 생성, 겹치지 않음)
#   profiles.referred_by: 친구 코드를 넣으면 그 친구 id (자기 자신은 DB가 거부, 한 번만)
#   친구 수 = referred_by가 내 id인 회원 수
# 보상은 코드 주인(초대한 사람)에게:
#   친구 1명당 물방울 2 (type='referral', currency='drop', ref_id='friend-친구id' → 같은 친구로 두 번 못 받음)
#   5명마다 포인트 1000 (type='referral_bonus', currency='point', ref_id='friends-5'·'friends-10'… → 5·10·15명마다 한 번)
router = APIRouter(prefix="/api/v1/friends", tags=["친구 초대"])

DROPS_PER_FRIEND = 2
GOAL_FRIENDS = 5
GOAL_REWARD = 1000
FRIEND_LIST_SIZE = 50  # 화면에 보여 줄 친구 수 (최근 가입순)
UNIQUE_VIOLATION = "23505"  # PostgreSQL "같은 값이 이미 있음" 오류 번호


class FriendCode(BaseModel):
    """친구 초대 코드 입력 때 받을 값 (소문자·앞뒤 빈칸은 서버가 고쳐 줌)"""

    invite_code: str = Field(min_length=8, max_length=12)


def invite_status(friend_count: int) -> dict:
    """친구 수로 보상 현황을 계산한다"""
    return {
        "friend_count": friend_count,
        "goal": GOAL_FRIENDS,
        "drops_per_friend": DROPS_PER_FRIEND,
        "goal_reward": GOAL_REWARD,
        "earned_drops": friend_count * DROPS_PER_FRIEND,
        "bonus_count": friend_count // GOAL_FRIENDS,  # 지금까지 받은 5명 보상 횟수
        "progress": friend_count % GOAL_FRIENDS,  # 다음 보상까지 모은 친구 수 (보상 후 0명부터 다시)
    }


def _profile(user_id: str) -> dict:
    """내 프로필 (초대 코드·나를 초대한 사람)"""
    res = supabase.table("profiles").select("id, nickname, invite_code, referred_by").eq("id", user_id).execute()
    if not res.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "회원 정보를 찾을 수 없습니다.")
    return res.data[0]


def _friends(user_id: str) -> list[dict]:
    """내 코드를 입력한 회원들 (최근 가입순)"""
    res = (
        supabase.table("profiles")
        .select("nickname, created_at")
        .eq("referred_by", user_id)
        .order("created_at", desc=True)
        .execute()
    )
    return res.data or []


def _nickname(user_id: str | None) -> str | None:
    if not user_id:
        return None
    res = supabase.table("profiles").select("nickname").eq("id", user_id).execute()
    return res.data[0]["nickname"] if res.data else None


def _insert_tx(user_id: str, currency: str, type_: str, amount: int, ref_id: str) -> bool:
    """통장 한 줄. 새로 들어가면 True, 중복이라 DB가 거절하면 False (005 point_tx_no_dup)"""
    try:
        supabase.table("point_transactions").insert(
            {"user_id": user_id, "currency": currency, "type": type_, "amount": amount, "ref_id": ref_id}
        ).execute()
        return True
    except APIError as e:
        if e.code == UNIQUE_VIOLATION:
            return False
        raise


@router.get("/me")
def read_my_friends(user: dict = Depends(get_current_user)):
    """내 초대 코드, 초대한 친구 현황, 내가 친구 코드를 입력했는지"""
    me = _profile(user["id"])
    friends = _friends(user["id"])
    return {
        "invite_code": me["invite_code"],
        **invite_status(len(friends)),
        "friends": [{"nickname": f["nickname"], "joined_at": f["created_at"]} for f in friends[:FRIEND_LIST_SIZE]],
        "referred": me["referred_by"] is not None,  # 이미 친구 코드를 입력했으면 True (입력 칸 숨김)
        "referrer_nickname": _nickname(me["referred_by"]),
    }


@router.post("")
def add_friend(body: FriendCode, user: dict = Depends(get_current_user)):
    """친구의 초대 코드 입력 (회원마다 한 번). 코드 주인에게 💧2, 그 친구가 5·10·15명째면 ⭐1000 더"""
    code = body.invite_code.strip().upper()
    me = _profile(user["id"])
    if me["referred_by"]:
        raise HTTPException(status.HTTP_409_CONFLICT, "이미 친구 코드를 입력했어요.")
    if code == me["invite_code"]:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "내 초대 코드는 입력할 수 없어요.")

    owner = supabase.table("profiles").select("id, nickname").eq("invite_code", code).execute()
    if not owner.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "없는 초대 코드예요. 다시 확인해 주세요.")
    inviter = owner.data[0]

    # 아직 비어 있을 때만 저장 (두 번 눌러도 한 번만 들어감)
    saved = (
        supabase.table("profiles")
        .update({"referred_by": inviter["id"]})
        .eq("id", user["id"])
        .is_("referred_by", "null")
        .execute()
    )
    if not saved.data:
        raise HTTPException(status.HTTP_409_CONFLICT, "이미 친구 코드를 입력했어요.")

    # 보상은 코드 주인에게
    _insert_tx(inviter["id"], "drop", "referral", DROPS_PER_FRIEND, f"friend-{user['id']}")
    friend_count = len(_friends(inviter["id"]))
    if friend_count % GOAL_FRIENDS == 0:
        _insert_tx(inviter["id"], "point", "referral_bonus", GOAL_REWARD, f"friends-{friend_count}")

    return {"invite_code": code, "referrer_nickname": inviter["nickname"]}
