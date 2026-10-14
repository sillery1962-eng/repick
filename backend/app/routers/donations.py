from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: [이름]
# 기부처 목록, 기부 단위(물방울 또는 포인트), 최소·최대 기부량은 팀에서 아직 정하지 않았다.
# 실제로는 기부도 물방울 차감이라 add_points(type="donate", 음수)로만 처리한다 (여기서 직접 쓰지 않음).
router = APIRouter(prefix="/api/v1/donations", tags=["기부 (가짜)"])

SAMPLE_PLACES = [
    {
        "id": "ocean-cleanup",
        "title": "해양 정화 활동 지원",
        "org": "[기부처 이름]",
        "tags": ["해양 환경", "상시 모금"],
        "raised": 1250000,
    },
]


class DonationCreate(BaseModel):
    """기부하기 때 받을 값"""

    place_id: str
    amount: int = Field(gt=0)


@router.get("/places")
def list_places():
    """기부처 목록 (로그인 없이 볼 수 있음)"""
    return {"is_mock": True, "items": SAMPLE_PLACES}


@router.post("")
def create_donation(body: DonationCreate, user: dict = Depends(get_current_user)):
    """기부하기 (지금은 저장하지 않고 결과만 돌려준다)"""
    if body.place_id not in {p["id"] for p in SAMPLE_PLACES}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "기부처를 찾을 수 없습니다.")
    return {"is_mock": True, "place_id": body.place_id, "amount": body.amount, "balance": 6170 - body.amount}


@router.get("/me")
def read_my_donations(user: dict = Depends(get_current_user)):
    """내 기부 내역 (최신순)"""
    return {
        "is_mock": True,
        "total": 1500,
        "items": [
            {"place_id": "ocean-cleanup", "amount": 1000, "created_at": "2026-10-12T20:00:00+09:00"},
            {"place_id": "ocean-cleanup", "amount": 500, "created_at": "2026-10-05T19:10:00+09:00"},
        ],
    }
