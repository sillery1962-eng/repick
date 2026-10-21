from datetime import date, datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError

from app.auth import get_current_user
from app.quiz_bank import KST, today_kst
from app.supabase_client import supabase

# 출석 체크 API. 담당: 오지원 (규칙: docs/api-spec.md 5번 "출석 체크")
# - 출석 = point_transactions에 drop +1 한 줄 (type 'attendance'). 새 테이블 없음
# - 하루 1번은 DB가 막는다 (002 point_transactions_attendance_once_a_day_idx, 한국 날짜 기준) → 두 번째는 409
# - 이번 주 월~일 7일을 모두 채우면(= 일요일 7번째 출석) 보너스 drop +7 (type 'event'), 같은 주에 한 번만 (005 point_tx_no_dup)
# - 주소 앞부분은 points.py(경난)와 같은 /api/v1/points 이지만, 담당이 달라 파일을 나눴다 (points.py는 고치지 않음)
router = APIRouter(prefix="/api/v1/points", tags=["출석"])

ATTEND_DROPS = 1  # 출석 1번에 받는 물방울
WEEK_BONUS = 7  # 1주일(월~일) 모두 출석하면 더 받는 물방울
UNIQUE_VIOLATION = "23505"  # PostgreSQL "같은 값이 이미 있음" 오류 번호


def _kst_date(created_at: str) -> date:
    """DB의 created_at(UTC) → 한국 날짜"""
    return datetime.fromisoformat(created_at.replace("Z", "+00:00")).astimezone(KST).date()


def _monday(day: date) -> date:
    """그 날이 속한 주의 월요일"""
    return day - timedelta(days=day.weekday())


def _attended_days(user_id: str, since: date) -> set[date]:
    """since(한국 날짜)부터 내가 출석한 날들"""
    since_utc = datetime.combine(since, datetime.min.time(), KST).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")
    res = (
        supabase.table("point_transactions")
        .select("created_at")
        .eq("user_id", user_id)
        .eq("currency", "drop")
        .eq("type", "attendance")
        .gte("created_at", since_utc)
        .execute()
    )
    return {_kst_date(r["created_at"]) for r in res.data or []}


def _week_bonus_received(user_id: str, monday: date) -> bool:
    """이번 주 1주일 보너스 줄이 통장에 있는지"""
    res = (
        supabase.table("point_transactions")
        .select("id")
        .eq("user_id", user_id)
        .eq("currency", "drop")
        .eq("type", "event")
        .eq("ref_id", f"attend-week-{monday.isoformat()}")
        .execute()
    )
    return bool(res.data)


def _drops_balance(user_id: str) -> int:
    """내 물방울 잔액 = drop 줄 합계"""
    res = supabase.table("point_transactions").select("amount").eq("user_id", user_id).eq("currency", "drop").execute()
    return sum(r["amount"] for r in res.data or [])


def _insert_drop(user_id: str, type_: str, amount: int, ref_id: str) -> bool:
    """물방울 한 줄. 새로 들어가면 True, 중복이라 DB가 거절하면 False"""
    try:
        supabase.table("point_transactions").insert(
            {"user_id": user_id, "currency": "drop", "type": type_, "amount": amount, "ref_id": ref_id}
        ).execute()
        return True
    except APIError as e:
        if e.code == UNIQUE_VIOLATION:
            return False
        raise


def _status(user_id: str, today: date) -> dict:
    """이번 주 출석 칸·연속 출석 등 (GET 응답 모양)"""
    monday = _monday(today)
    days = _attended_days(user_id, monday)  # 이번 주(월~) 기록만 → 연속 출석도 월요일마다 0부터
    checked_today = today in days
    streak = 0
    day = today if checked_today else today - timedelta(days=1)  # 오늘 안 했으면 어제부터 센다
    while day >= monday and day in days:
        streak += 1
        day -= timedelta(days=1)
    week = [monday + timedelta(days=i) in days for i in range(7)]
    return {
        "today": today.isoformat(),
        "today_index": today.weekday(),  # 월=0 … 일=6
        "week": week,
        "checked_today": checked_today,
        "streak": streak,
        "week_bonus": WEEK_BONUS,
        "week_bonus_received": _week_bonus_received(user_id, monday),
    }


@router.get("/attendance")
def read_attendance(user: dict = Depends(get_current_user)):
    """이번 주(월~일) 출석 칸, 오늘 출석 여부, 연속 출석 일수"""
    return _status(user["id"], today_kst())


@router.post("/attendance")
def check_attendance(user: dict = Depends(get_current_user)):
    """오늘 출석 → 💧+1. 이번 주 7일을 모두 채웠으면 보너스 💧+7. 오늘 이미 했으면 409"""
    user_id = user["id"]
    today = today_kst()
    if not _insert_drop(user_id, "attendance", ATTEND_DROPS, f"attend-{today.isoformat()}"):
        raise HTTPException(status.HTTP_409_CONFLICT, "오늘은 이미 출석했어요.")

    # 이 출석으로 이번 주 월~일이 모두 찼으면 보너스 (같은 주에 한 번만)
    week_bonus = 0
    monday = _monday(today)
    if today.weekday() == 6 and len(_attended_days(user_id, monday)) == 7:
        if _insert_drop(user_id, "event", WEEK_BONUS, f"attend-week-{monday.isoformat()}"):
            week_bonus = WEEK_BONUS

    return {"drops_awarded": ATTEND_DROPS, "week_bonus": week_bonus, "drops_balance": _drops_balance(user_id)}
