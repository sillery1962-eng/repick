import json
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.supabase_client import supabase

# 기부 API. 담당: 오지원 (규칙: docs/api-spec.md 8번 "기부하기")
# - 기부는 보유 포인트로, 1P 단위. 기부처(캠페인) 목록은 backend/data/campaigns.json (시연용 가짜 캠페인, 새 테이블 없음)
# - 기부 = point_transactions에 point −N 한 줄 (type 'donate'). 기부 기록 테이블은 따로 두지 않는다
# - 잔액이 모자라면 DB가 거부한다 (007 잔액 검사 트리거, 오류 코드 PT400 "잔액이 부족해요.") → 400
# - ref_id = "캠페인번호-임의값" (매번 다르게). 캠페인 번호만 넣으면 005 중복 방지 규칙 때문에 같은 캠페인 두 번째 기부가 막힌다
router = APIRouter(prefix="/api/v1/donations", tags=["기부"])

CAMPAIGN_FILE = Path(__file__).resolve().parent.parent.parent / "data" / "campaigns.json"
CAMPAIGNS = [c for c in json.loads(CAMPAIGN_FILE.read_text(encoding="utf-8")) if c.get("active", True)]
CAMPAIGN_TITLES = {c["id"]: c["title"] for c in CAMPAIGNS}
NOT_ENOUGH = "PT400"  # 007 잔액 검사 트리거의 오류 번호
PAGE_SIZE = 1000  # Supabase가 한 번에 돌려주는 최대 줄 수


class DonationCreate(BaseModel):
    """기부하기 때 받을 값"""

    points: int = Field(gt=0)  # 1P 단위 (10/23 변경 — 전: 100P 단위)
    campaign_id: int


def _points_balance(user_id: str) -> int:
    """내 포인트 잔액 = point 줄 합계"""
    res = supabase.table("point_transactions").select("amount").eq("user_id", user_id).eq("currency", "point").execute()
    return sum(r["amount"] for r in res.data or [])


def _campaign_id(ref_id: str | None) -> int | None:
    """ref_id "3-ab12cd34ef56" → 3"""
    try:
        return int((ref_id or "").split("-")[0])
    except ValueError:
        return None


def _raised_by_campaign() -> dict[int, int]:
    """모든 회원이 기부처마다 기부한 포인트 합계 (1,000줄씩 나눠 읽기)"""
    raised: dict[int, int] = {}
    start = 0
    while True:
        res = (
            supabase.table("point_transactions")
            .select("amount, ref_id")
            .eq("currency", "point")
            .eq("type", "donate")
            .order("id")
            .range(start, start + PAGE_SIZE - 1)
            .execute()
        )
        batch = res.data or []
        for r in batch:
            cid = _campaign_id(r["ref_id"])
            raised[cid] = raised.get(cid, 0) - r["amount"]
        if len(batch) < PAGE_SIZE:
            return raised
        start += PAGE_SIZE


@router.get("/campaigns")
def list_campaigns():
    """기부처(캠페인) 목록 + 지금까지 모인 포인트(raised) (로그인 없이 볼 수 있음)
    raised = 시연용 기본 금액(campaigns.json의 demo_raised) + 실제 기부 합계. 시연이 끝나면 demo_raised만 지우면 된다"""
    raised = _raised_by_campaign()
    items = []
    for c in CAMPAIGNS:
        item = {k: v for k, v in c.items() if k != "demo_raised"}
        item["raised"] = c.get("demo_raised", 0) + raised.get(c["id"], 0)
        items.append(item)
    return {"items": items}


@router.post("")
def create_donation(body: DonationCreate, user: dict = Depends(get_current_user)):
    """보유 포인트로 기부하기 → 통장에 point −N 한 줄. 포인트가 모자라면 400"""
    if body.campaign_id not in CAMPAIGN_TITLES:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "기부처를 찾을 수 없어요.")
    user_id = user["id"]
    try:
        supabase.table("point_transactions").insert(
            {
                "user_id": user_id,
                "currency": "point",
                "type": "donate",
                "amount": -body.points,
                "ref_id": f"{body.campaign_id}-{uuid4().hex[:12]}",
            }
        ).execute()
    except APIError as e:
        if e.code == NOT_ENOUGH:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "포인트가 부족해요.")
        raise
    return {"campaign_id": body.campaign_id, "points": body.points, "points_balance": _points_balance(user_id)}


@router.get("/me")
def read_my_donations(user: dict = Depends(get_current_user)):
    """내 기부 내역 (최신순), 지금까지 기부한 포인트 합계, 지금 포인트 잔액"""
    res = (
        supabase.table("point_transactions")
        .select("amount, ref_id, created_at")
        .eq("user_id", user["id"])
        .eq("currency", "point")
        .eq("type", "donate")
        .order("created_at", desc=True)
        .execute()
    )
    items = []
    for r in res.data or []:
        cid = _campaign_id(r["ref_id"])
        items.append(
            {"campaign_id": cid, "title": CAMPAIGN_TITLES.get(cid), "points": -r["amount"], "created_at": r["created_at"]}
        )
    return {"total": sum(i["points"] for i in items), "items": items, "points_balance": _points_balance(user["id"])}
