"""나의 숲 API — 팀 DB 007 함수에 조회·물주기·수확·보상을 위임합니다.

성장 비용·상품표·수확 종류 결정은 DB에서 관리합니다.
회원 ID는 팀 공용 로그인 확인 결과에서만 가져옵니다.
"""

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.supabase_client import supabase

router = APIRouter(prefix="/api/v1/forest", tags=["나의 숲"])


class WaterRequest(BaseModel):
    """양의 정수만 받고, 잔액·초과 물주기는 DB가 최종 확인합니다."""

    drops: int = Field(strict=True, gt=0)


class RewardRequest(BaseModel):
    """교환 단계의 허용 여부와 필요 나무 수는 DB가 확인합니다."""

    tier: int = Field(strict=True)


def _forest_rpc(function: str, params: dict) -> dict:
    """RPC를 한 번 호출하고 DB의 한국어 오류를 HTTP 오류로 전달합니다.

    결과를 모르는 변경 요청은 자동으로 재시도하지 않습니다.
    DB 함수가 없을 때 Python 계산이나 직접 INSERT로 우회하지 않습니다.
    """
    try:
        result = supabase.rpc(function, params).execute().data
    except Exception as error:
        code = str(getattr(error, "code", ""))
        status_by_code = {"PT400": 400, "PT404": 404, "PT409": 409, "PT500": 500}
        if code in status_by_code:
            message = getattr(error, "message", None)
            raise HTTPException(
                status_code=status_by_code[code],
                detail=message or "나무 요청을 처리하지 못했어요.",
            ) from error
        if code == "PGRST202":
            raise HTTPException(
                status_code=503,
                detail="나의 숲 DB 함수 연결을 확인해 주세요. 담당자 확인이 필요합니다.",
            ) from error
        raise HTTPException(
            status_code=503,
            detail="처리 결과를 확인하지 못했어요. 새로고침해 상태를 먼저 확인해 주세요.",
        ) from error

    if not isinstance(result, dict):
        raise HTTPException(
            status_code=503,
            detail="나의 숲 응답을 확인하지 못했어요. 새로고침해 상태를 먼저 확인해 주세요.",
        )
    return result


@router.get("")
def read_forest(user: dict = Depends(get_current_user)):
    """잔액·성장·수확 컬렉션을 DB가 같은 시점 기준으로 계산합니다."""
    return _forest_rpc("repick_forest_state", {"p_user_id": user["id"]})


def mutate(user_id: str, action: str, value: int = 0) -> dict:
    """DB에서 같은 회원의 변경을 잠금·트랜잭션으로 처리합니다."""
    return _forest_rpc(
        "repick_forest_action",
        {"p_user_id": user_id, "p_action": action, "p_value": value},
    )


@router.post("/water")
def water(body: WaterRequest, user: dict = Depends(get_current_user)):
    return mutate(user["id"], "water", body.drops)


@router.post("/harvest")
def harvest(user: dict = Depends(get_current_user)):
    """5그루 자동 보상이 있으면 auto_reward를 포함해 그대로 반환합니다."""
    return mutate(user["id"], "harvest")


@router.post("/rewards")
def rewards(body: RewardRequest, user: dict = Depends(get_current_user)):
    """직접 선택은 DB 기준 tier 1·2·3만, tier 5는 수확 시 자동 처리입니다."""
    return mutate(user["id"], "rewards", body.tier)
