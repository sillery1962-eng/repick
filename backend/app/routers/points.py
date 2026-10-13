from fastapi import APIRouter, Depends

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 서경난
# 실제로는 point_transactions에서 .eq("user_id", user["id"])로 본인 것만 읽는다.
# 적립은 add_points()로만 한다 (여기에 만들지 않음).
router = APIRouter(prefix="/api/v1/points", tags=["물방울 (가짜)"])


@router.get("/balance")
def read_balance(user: dict = Depends(get_current_user)):
    """내 물방울 잔액 (거래내역 합계)"""
    return {"is_mock": True, "balance": 7}


@router.get("/history")
def read_history(user: dict = Depends(get_current_user)):
    """내 물방울 거래내역 (최신순)"""
    return {
        "is_mock": True,
        "items": [
            {"type": "scan", "amount": 1, "created_at": "2026-10-13T10:00:00+09:00"},
            {"type": "post_verify", "amount": 5, "created_at": "2026-10-12T18:30:00+09:00"},
            {"type": "attendance", "amount": 1, "created_at": "2026-10-12T09:00:00+09:00"},
        ],
    }
