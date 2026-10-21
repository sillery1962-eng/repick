import time as _time
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.auth import bearer_scheme, get_current_user
from app.quiz_bank import KST, today_kst
from app.supabase_client import supabase

# 이달의 적립왕 · 명예의 전당 API. 담당: 오지원
# - 점수 = 이번 달(한국 시간 1일 0시~)에 받은 ⭐포인트 합계. 기부로 쓴 포인트(−)는 빼지 않는다
# - 매달 1일 초기화 = 기록을 지우지 않고 "이번 달 1일 이후 줄만" 센다
# - 동점이면 그 점수에 먼저 도달한 사람(마지막 적립 시각이 빠른 사람)이 위
# - 이번 달 포인트가 0인 회원은 순위에 없음. 닉네임은 그대로, 이메일은 내보내지 않음
# - 회원 100명 규모라 DB 함수 없이 Python에서 계산: 1,000줄씩 나눠 읽고, 결과는 1분 동안 다시 씀(캐시)
#   느려지면 DB 함수(migration)로 바꾸고 응답 모양은 그대로 둔다
router = APIRouter(prefix="/api/v1/events", tags=["이벤트·순위"])

TOP_N = 10  # 화면에 보여 줄 순위 (1~3위 단상 + 4~10위 목록)
PAGE_SIZE = 1000  # Supabase가 한 번에 돌려주는 최대 줄 수
CACHE_SECONDS = 60  # 순위 계산 결과를 다시 쓰는 시간 (방금 받은 포인트는 최대 1분 늦게 반영)

_cache: dict = {"month": None, "at": 0.0, "ranked": [], "top": []}


def _optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict | None:
    """로그인했으면 회원 정보, 안 했거나 토큰이 틀리면 None (순위 목록은 로그인 없이도 보여 줌)"""
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


def _month_start_utc() -> str:
    """이번 달 1일 0시(한국) → DB 비교용 UTC 문자열"""
    first = today_kst().replace(day=1)
    return datetime.combine(first, datetime.min.time(), KST).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _month_rows(since_utc: str) -> list[dict]:
    """이번 달에 받은 포인트 줄 전부 (1,000줄씩 나눠 읽기)"""
    rows, start = [], 0
    while True:
        res = (
            supabase.table("point_transactions")
            .select("id,user_id,amount,created_at")
            .eq("currency", "point")
            .gt("amount", 0)
            .gte("created_at", since_utc)
            .order("id")
            .range(start, start + PAGE_SIZE - 1)
            .execute()
        )
        batch = res.data or []
        rows += batch
        if len(batch) < PAGE_SIZE:
            return rows
        start += PAGE_SIZE


def _rank(rows: list[dict]) -> list[tuple[str, int]]:
    """[(회원 id, 이번 달 포인트)] 1위부터. 동점이면 마지막 적립이 빠른 사람이 위"""
    totals: dict[str, int] = {}
    reached: dict[str, str] = {}
    for r in rows:
        uid = r["user_id"]
        totals[uid] = totals.get(uid, 0) + r["amount"]
        reached[uid] = max(reached.get(uid, ""), r["created_at"])
    order = sorted(totals, key=lambda uid: (-totals[uid], datetime.fromisoformat(reached[uid].replace("Z", "+00:00")), uid))
    return [(uid, totals[uid]) for uid in order]


def _nicknames(ids: list[str]) -> dict[str, str]:
    if not ids:
        return {}
    res = supabase.table("profiles").select("id,nickname").in_("id", ids).execute()
    return {r["id"]: r.get("nickname") or "회원" for r in res.data or []}


def _tree(user_id: str) -> tuple[int | None, str | None]:
    """나무 단계 (나의 숲 DB 함수 007을 읽기만 함). 못 읽으면 (None, None) → 화면은 기본 나무"""
    try:
        state = supabase.rpc("repick_forest_state", {"p_user_id": user_id}).execute().data or {}
        return state.get("stage"), state.get("stage_name")
    except Exception:
        return None, None


def _ranking(month: str) -> tuple[list[tuple[str, int]], list[dict]]:
    """(전체 순위, 1~10위 응답) — 1분 동안은 저장해 둔 결과를 다시 씀"""
    if _cache["month"] == month and _time.monotonic() - _cache["at"] < CACHE_SECONDS:
        return _cache["ranked"], _cache["top"]
    ranked = _rank(_month_rows(_month_start_utc()))
    names = _nicknames([uid for uid, _ in ranked[:TOP_N]])
    top = []
    for i, (uid, points) in enumerate(ranked[:TOP_N]):
        stage, stage_name = _tree(uid)
        top.append({"rank": i + 1, "user_id": uid, "name": names.get(uid, "회원"), "points": points, "stage": stage, "stage_name": stage_name})
    _cache.update(month=month, at=_time.monotonic(), ranked=ranked, top=top)
    return ranked, top


def _me(user_id: str, ranked: list[tuple[str, int]]) -> dict:
    """내 순위·포인트·10위까지 남은 포인트"""
    index = next((i for i, (uid, _) in enumerate(ranked) if uid == user_id), None)
    rank = index + 1 if index is not None else None
    points = ranked[index][1] if index is not None else 0
    if rank is not None and rank <= TOP_N:
        to_top10 = 0
    elif len(ranked) >= TOP_N:
        to_top10 = ranked[TOP_N - 1][1] - points + 1  # 10위와 같으면 나중에 도달한 쪽이 아래라 1P 더 필요
    else:
        to_top10 = 1  # 10명이 안 되면 1P만 받아도 순위에 들어감
    return {"rank": rank, "name": _nicknames([user_id]).get(user_id, "회원"), "points": points, "to_top10": to_top10}


@router.get("/ranking")
def read_ranking(user: dict | None = Depends(_optional_user)):
    """이달의 적립왕: 1~10위 + (로그인했으면) 내 순위"""
    month = today_kst().strftime("%Y-%m")
    ranked, top = _ranking(month)
    return {
        "month": month,
        "top": [{k: v for k, v in t.items() if k != "user_id"} for t in top],  # 회원 id는 내보내지 않음
        "me": _me(user["id"], ranked) if user else None,
    }
