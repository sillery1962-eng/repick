# 2026-10-20: 내역의 일별·월별 조회·기간 합계 추가. DB 테이블 변경 없음.
"""물방울·포인트 잔액, 내역, 출석, 전환 API."""

from datetime import date as Date, datetime, timedelta, timezone
import re
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.points import add_points, get_balances
from app.supabase_client import supabase


router = APIRouter(prefix="/api/v1/points", tags=["물방울·포인트"])

KST = timezone(timedelta(hours=9))
DAILY_SCAN_LIMIT = 5
ATTENDANCE_DROP_REWARD = 1


class ConvertRequest(BaseModel):
    """포인트를 물방울로 전환할 때 받는 값 (POST /convert-to-drops)."""

    drops: int = Field(gt=0)


def _today_utc_range() -> tuple[str, str]:
    """오늘 한국 날짜의 시작과 끝을 UTC 문자열로 반환한다."""
    now_kst = datetime.now(KST)
    start_kst = now_kst.replace(hour=0, minute=0, second=0, microsecond=0)
    end_kst = start_kst + timedelta(days=1)

    return (
        start_kst.astimezone(timezone.utc).isoformat(),
        end_kst.astimezone(timezone.utc).isoformat(),
    )


def _today_scan_count(user_id: str) -> int:
    """오늘 보상을 받은 AI 판별 횟수를 센다."""
    start_utc, end_utc = _today_utc_range()
    result = (
        supabase.table("point_transactions")
        .select("id")
        .eq("user_id", user_id)
        .eq("currency", "drop")
        .eq("type", "scan")
        .gte("created_at", start_utc)
        .lt("created_at", end_utc)
        .execute()
    )

    return len(result.data or [])


@router.get("")
def read_points(user: dict = Depends(get_current_user)):
    """내 물방울·포인트 잔액과 오늘 AI 적립 횟수를 조회한다."""
    balances = get_balances(user["id"])

    return {
        "drops_balance": balances["drop"],
        "points_balance": balances["point"],
        "today_scan_count": _today_scan_count(user["id"]),
        "daily_scan_limit": DAILY_SCAN_LIMIT,
    }


def _history_period(day: str | None, month: str | None):
    """한국 날짜의 시작(포함)·끝(제외)을 UTC로 바꿉니다."""
    if day and month:
        raise HTTPException(status_code=400, detail="날짜와 월 중 하나만 선택해 주세요.")
    try:
        if day:
            if not re.fullmatch(r"\d{4}-\d{2}-\d{2}", day):
                raise ValueError
            selected = Date.fromisoformat(day)
            start = datetime(selected.year, selected.month, selected.day, tzinfo=KST)
            end = start + timedelta(days=1)
        elif month:
            if not re.fullmatch(r"\d{4}-\d{2}", month):
                raise ValueError
            year, number = map(int, month.split("-"))
            start = datetime(year, number, 1, tzinfo=KST)
            end = datetime(year + 1, 1, 1, tzinfo=KST) if number == 12 else datetime(year, number + 1, 1, tzinfo=KST)
        else:
            return None
        return start.astimezone(timezone.utc).isoformat(), end.astimezone(timezone.utc).isoformat()
    except (ValueError, OverflowError) as error:
        raise HTTPException(status_code=400, detail="올바른 날짜 또는 월을 선택해 주세요.") from error


def _history_query(user_id, columns, currency, period, snapshot_id=None):
    """모든 페이지·합계에 동일한 회원·기간 조건을 사용합니다."""
    query = supabase.table("point_transactions").select(columns).eq("user_id", user_id)
    if currency:
        query = query.eq("currency", currency)
    if period:
        query = query.gte("created_at", period[0]).lt("created_at", period[1])
    if snapshot_id is not None:
        query = query.lte("id", snapshot_id)
    return query


@router.get("/history")
def read_history(
    currency: Literal["drop", "point"] | None = None,
    limit: int = Query(default=20, ge=1, le=100),
    cursor: int | None = Query(default=None, ge=1),
    day: str | None = Query(default=None, alias="date"),
    month: str | None = Query(default=None),
    snapshot_id: int | None = Query(default=None, ge=0),
    include_summary: bool = Query(default=False),
    user: dict = Depends(get_current_user),
):
    """기존 커서 조회를 유지하면서 일별·월별 조회와 선택 기간 합계를 제공합니다.

    snapshot_id는 조회 시작 시 가장 최신 ID입니다. 다음 페이지에도 넘겨
    조회 중 새 적립이 생겨도 페이지와 합계가 서로 달라지지 않게 합니다.
    """
    period = _history_period(day, month)
    if snapshot_id is None:
        newest = (_history_query(user["id"], "id", currency, period)
                  .order("id", desc=True).limit(1).execute().data or [])
        snapshot_id = int(newest[0]["id"]) if newest else 0
    query = _history_query(user["id"], "id, currency, type, amount, ref_id, created_at", currency, period, snapshot_id)
    if cursor is not None:
        query = query.lt("id", cursor)
    rows = query.order("id", desc=True).limit(limit + 1).execute().data or []
    items = rows[:limit]
    response = {
        "items": items,
        "next_cursor": items[-1]["id"] if len(rows) > limit and items else None,
        "snapshot_id": snapshot_id,
    }
    if include_summary:
        # 페이지에 보이는 5개가 아닌 선택 기간 전체를 합산합니다.
        # Supabase 기본 행 수 제한을 피하도록 ID 기준으로 나누어 읽습니다.
        summary = {"drop": {"earned": 0, "spent": 0}, "point": {"earned": 0, "spent": 0}}
        after = 0
        while snapshot_id > 0:
            batch = (_history_query(user["id"], "id, currency, amount", currency, period, snapshot_id)
                     .gt("id", after).order("id").limit(500).execute().data or [])
            if not batch:
                break
            for row in batch:
                if row["currency"] not in summary:
                    continue
                amount = int(row["amount"])
                summary[row["currency"]]["earned" if amount >= 0 else "spent"] += abs(amount)
            after = int(batch[-1]["id"])
        response["summary"] = summary
    return response

def _activity_period(mode, month, year, window):
    """일별은 7일 구간, 주별은 월요일~일요일 기준, 월별은 연도 12개월입니다."""
    now = datetime.now(KST)
    selected_month = month or now.strftime("%Y-%m")
    if mode == "month":
        selected_year = year or now.year
        try:
            start = datetime(selected_year, 1, 1, tzinfo=KST)
            end = datetime(selected_year + 1, 1, 1, tzinfo=KST)
        except ValueError as error:
            raise HTTPException(status_code=400, detail="조회 연도를 확인해 주세요.") from error
        buckets = [{"key": f"{selected_year}-{n:02d}", "label": f"{n}월", "value": 0} for n in range(1, 13)]
        return start, end, buckets
    utc = _history_period(None, selected_month)
    first = datetime.fromisoformat(utc[0]).astimezone(KST)
    end = datetime.fromisoformat(utc[1]).astimezone(KST)
    days = (end - first).days
    if mode == "day":
        if window * 7 >= days:
            raise HTTPException(status_code=400, detail="선택한 달에 없는 날짜 구간입니다.")
        start = first + timedelta(days=window * 7)
        end = min(start + timedelta(days=7), end)
        buckets = [{"key": (start + timedelta(days=n)).date().isoformat(), "label": f"{start.day+n}일", "value": 0} for n in range((end-start).days)]
        return start, end, buckets
    # 월요일~일요일 기준으로 나누되, 선택한 달에 포함된 날짜만 합산합니다.
    buckets = []
    cursor_day = first
    while cursor_day < end:
        next_monday = cursor_day + timedelta(days=7 - cursor_day.weekday())
        stop = min(next_monday, end)
        buckets.append({"key": str(len(buckets)), "label": f"{len(buckets)+1}주",
                        "detail": f"{cursor_day.month}/{cursor_day.day}~{(stop-timedelta(days=1)).month}/{(stop-timedelta(days=1)).day}",
                        "value": 0, "start": cursor_day.date().isoformat(),
                        "end": (stop-timedelta(days=1)).date().isoformat()})
        cursor_day = stop
    return first, end, buckets


@router.get("/activity")
def read_point_activity(
    flow: Literal["earned", "spent"],
    mode: Literal["day", "week", "month"] = "day",
    month: str | None = None,
    year: int | None = Query(default=None, ge=2000, le=9998),
    window: int = Query(default=0, ge=0, le=4),
    cursor: int | None = Query(default=None, ge=1),
    snapshot_id: int | None = Query(default=None, ge=0),
    selected_key: str | None = None,
    include_records: bool = False,
    user: dict = Depends(get_current_user),
):
    """포인트 전용 적립·사용 그래프 및 해당 기간 5개씩 상세 내역. DB 쓰기 없음."""
    start, end, buckets = _activity_period(mode, month, year, window)
    # 모든 막대에 상세 조회용 시작일·종료일을 함께 전달합니다.
    for bucket in buckets:
        if mode == "day":
            bucket["start"] = bucket["end"] = bucket["key"]
        elif mode == "month":
            n = int(bucket["key"][-2:])
            bucket_start = datetime(start.year, n, 1, tzinfo=KST)
            bucket_end = datetime(start.year+1, 1, 1, tzinfo=KST) if n == 12 else datetime(start.year, n+1, 1, tzinfo=KST)
            bucket["start"] = bucket_start.date().isoformat()
            bucket["end"] = (bucket_end-timedelta(days=1)).date().isoformat()
    selected = next((bucket for bucket in buckets if bucket["key"] == selected_key), None)
    if selected_key is not None and selected is None:
        raise HTTPException(status_code=400, detail="선택한 그래프 구간을 확인해 주세요.")
    period = (start.astimezone(timezone.utc).isoformat(), end.astimezone(timezone.utc).isoformat())
    if snapshot_id is None:
        newest = (_history_query(user["id"], "id", "point", period)
                  .order("id", desc=True).limit(1).execute().data or [])
        snapshot_id = int(newest[0]["id"]) if newest else 0
    total = 0
    after = 0
    while snapshot_id > 0:
        batch = (_history_query(user["id"], "id, amount, created_at", "point", period, snapshot_id)
                 .gt("id", after).order("id").limit(500).execute().data or [])
        if not batch:
            break
        for row in batch:
            amount = int(row["amount"])
            if (flow == "earned" and amount <= 0) or (flow == "spent" and amount >= 0):
                continue
            value = abs(amount)
            occurred = datetime.fromisoformat(row["created_at"].replace("Z", "+00:00")).astimezone(KST)
            index = occurred.month - 1 if mode == "month" else next(i for i, bucket in enumerate(buckets) if bucket["start"] <= occurred.date().isoformat() <= bucket["end"]) if mode == "week" else (occurred.date() - start.date()).days
            buckets[index]["value"] += value
            total += value
        after = int(batch[-1]["id"])
    records, more = [], False
    # 상세내역은 막대를 선택하고 펼쳤을 때만 조회합니다.
    if include_records and selected is not None:
        detail_start = datetime.fromisoformat(selected["start"]).replace(tzinfo=KST)
        detail_end = datetime.fromisoformat(selected["end"]).replace(tzinfo=KST) + timedelta(days=1)
        detail_period = (detail_start.astimezone(timezone.utc).isoformat(), detail_end.astimezone(timezone.utc).isoformat())
        query = _history_query(user["id"], "id, currency, type, amount, ref_id, created_at", "point", detail_period, snapshot_id)
        query = query.gt("amount", 0) if flow == "earned" else query.lt("amount", 0)
        if cursor is not None:
            query = query.lt("id", cursor)
        rows = query.order("id", desc=True).limit(6).execute().data or []
        records, more = rows[:5], len(rows) > 5
    return {
        "items": buckets, "total": total, "records": records,
        "next_cursor": records[-1]["id"] if more else None,
        "snapshot_id": snapshot_id,
        "range": f"{start.date().isoformat()} ~ {(end-timedelta(days=1)).date().isoformat()}",
    }
