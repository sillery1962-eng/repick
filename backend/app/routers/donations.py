import json
from pathlib import Path

from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 오지원
# 기부는 보유 포인트로, 100P 단위로 한다. 기부처(캠페인) 목록은 backend/data/campaigns.json (기부처 이름은 미정).
# DB가 생기면 기부할 때: 잔액 확인 → add_points(type='donate', currency='point', amount=-points, ref_id=캠페인 id)
# 기부 기록은 따로 테이블을 두지 않고 이 거래 한 줄로 남긴다 (내 기부 내역 = type='donate'인 내 거래).
router = APIRouter(prefix="/api/v1/donations", tags=["기부 (가짜)"])

CAMPAIGN_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "campaigns.json"
CAMPAIGNS = [c for c in json.loads(CAMPAIGN_FILE.read_text(encoding="utf-8")) if c.get("active", True)]
SAMPLE_BALANCE = 6170


class DonationCreate(BaseModel):
    """기부하기 때 받을 값"""

    points: int = Field(gt=0, multiple_of=100)  # 100P 단위
    campaign_id: int


@router.get("/campaigns")
def list_campaigns():
    """기부처(캠페인) 목록 (로그인 없이 볼 수 있음)"""
    return {"is_mock": True, "items": CAMPAIGNS}


@router.post("")
def create_donation(body: DonationCreate, user: dict = Depends(get_current_user)):
    """보유 포인트로 기부하기 (지금은 저장하지 않고 결과만 돌려준다)"""
    if body.campaign_id not in {c["id"] for c in CAMPAIGNS}:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "기부처를 찾을 수 없습니다.")
    if body.points > SAMPLE_BALANCE:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "보유 포인트보다 많이 기부할 수 없습니다.")
    return {"is_mock": True, "campaign_id": body.campaign_id, "points": body.points, "balance": SAMPLE_BALANCE - body.points}


@router.get("/me")
def read_my_donations(user: dict = Depends(get_current_user)):
    """내 기부 내역 (최신순)"""
    return {
        "is_mock": True,
        "total": 1500,
        "items": [
            {"campaign_id": 1, "points": 1000, "created_at": "2026-10-12T20:00:00+09:00"},
            {"campaign_id": 2, "points": 500, "created_at": "2026-10-05T19:10:00+09:00"},
        ],
    }
