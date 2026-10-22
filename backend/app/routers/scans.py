from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.supabase_client import supabase


router = APIRouter(prefix="/api/v1/scans", tags=["AI 품목 통계"])

RECYCLE_LABELS_KO = {
    "PAPER": "종이",
    "PET": "페트병",
    "PLASTIC": "플라스틱",
    "VINYL": "비닐",
    "CAN": "캔",
    "BATTERY": "건전지",
}
PAGE_SIZE = 500


@router.get("/stats")
def read_scan_stats(user: dict = Depends(get_current_user)):
    """내가 AI 인증으로 인식한 품목의 누적 개수를 반환합니다."""
    totals = {name: 0 for name in RECYCLE_LABELS_KO}
    last_id = 0

    # Supabase의 응답 행 제한을 넘어도 내 기록을 끝까지 읽습니다.
    while True:
        result = (
            supabase.table("scan_items")
            .select("id, class, count")
            .eq("user_id", user["id"])
            .gt("id", last_id)
            .order("id")
            .limit(PAGE_SIZE)
            .execute()
        )
        rows = result.data or []
        for row in rows:
            class_name = row["class"]
            if class_name in totals:
                totals[class_name] += int(row["count"])
        if not rows or len(rows) < PAGE_SIZE:
            break
        last_id = rows[-1]["id"]

    items = [
        {"class": name, "label_ko": label, "count": totals[name]}
        for name, label in RECYCLE_LABELS_KO.items()
    ]
    return {"total": sum(totals.values()), "items": items}
