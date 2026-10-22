import logging
import time as _time
from datetime import date, datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app.auth import bearer_scheme, get_current_user
from app.points import is_duplicate_transaction_error
from app.quiz_bank import KST, today_kst
from app.supabase_client import supabase

# 이달의 적립왕 · 명예의 전당 API. 담당: 오지원
# - 점수 = 이번 달(한국 시간 1일 0시~)에 받은 ⭐포인트 합계. 기부로 쓴 포인트(−)는 빼지 않는다
# - 매달 1일 초기화 = 기록을 지우지 않고 "이번 달 1일 이후 줄만" 센다
# - 동점이면 그 점수에 먼저 도달한 사람(마지막 적립 시각이 빠른 사람)이 위
# - 이번 달 포인트가 0인 회원은 순위에 없음. 닉네임은 그대로, 이메일은 내보내지 않음
# - 회원 100명 규모라 DB 함수 없이 Python에서 계산: 1,000줄씩 나눠 읽고, 결과는 1분 동안 다시 씀(캐시)
#   느려지면 DB 함수(migration)로 바꾸고 응답 모양은 그대로 둔다
# - 순위 보상 (10/22): 지난달 최종 1~10위에게 ⭐ 지급 (배지 없음). 통장 point / type 'event' / ref_id 'rank-YYYY-MM'
#   → 005 중복 방지 규칙으로 한 사람이 같은 달 보상을 두 번 못 받음. 보상 포인트는 다음 달 순위 점수에 넣지 않음
#   지급: 매월 1일 예약(app/jobs/monthly_ranking_reward.py, EC2 cron) + 안전장치(새 달 첫 순위 조회 때 한 번 확인)
router = APIRouter(prefix="/api/v1/events", tags=["이벤트·순위"])

TOP_N = 10  # 화면에 보여 줄 순위 (1~3위 단상 + 4~10위 목록)
PAGE_SIZE = 1000  # Supabase가 한 번에 돌려주는 최대 줄 수
CACHE_SECONDS = 60  # 순위 계산 결과를 다시 쓰는 시간 (방금 받은 포인트는 최대 1분 늦게 반영)
RANK_REWARDS = {1: 500, 2: 300, 3: 200}  # 순위 보상 ⭐ — 여기 없는 4~10위는 아래 값
RANK_REWARD_OTHERS = 100
REWARD_TYPE = "event"
REWARD_PREFIX = "rank-"  # ref_id = rank-2026-10 (그 달 보상)

logger = logging.getLogger(__name__)
_cache: dict = {"month": None, "at": 0.0, "ranked": [], "top": []}
_paid_checked: dict = {"month": None}  # 안전장치가 이 달 보상을 이미 확인했는지 (서버가 기억, 한 달에 한 번만 확인)


def _optional_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme)) -> dict | None:
    """로그인했으면 회원 정보, 안 했거나 토큰이 틀리면 None (순위 목록은 로그인 없이도 보여 줌)"""
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


def _utc(day: date) -> str:
    """그 날 0시(한국) → DB 비교용 UTC 문자열"""
    return datetime.combine(day, datetime.min.time(), KST).astimezone(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ")


def _month_start_utc() -> str:
    """이번 달 1일 0시(한국) → DB 비교용 UTC 문자열"""
    return _utc(today_kst().replace(day=1))


def _last_month_first() -> date:
    """지난달 1일 (한국 날짜)"""
    this_first = today_kst().replace(day=1)
    return (this_first.replace(year=this_first.year - 1, month=12) if this_first.month == 1
            else this_first.replace(month=this_first.month - 1))


def _month_rows(since_utc: str, until_utc: str | None = None) -> list[dict]:
    """그 달에 받은 포인트 줄 전부 (1,000줄씩 나눠 읽기). 순위 보상 줄은 점수에서 뺌"""
    rows, start = [], 0
    while True:
        query = (
            supabase.table("point_transactions")
            .select("id,user_id,amount,created_at,ref_id")
            .eq("currency", "point")
            .gt("amount", 0)
            .gte("created_at", since_utc)
        )
        if until_utc:
            query = query.lt("created_at", until_utc)
        res = query.order("id").range(start, start + PAGE_SIZE - 1).execute()
        batch = res.data or []
        rows += [r for r in batch if not str(r.get("ref_id") or "").startswith(REWARD_PREFIX)]
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


def _reward(rank: int) -> int:
    return RANK_REWARDS.get(rank, RANK_REWARD_OTHERS)


def pay_last_month_rewards() -> dict:
    """지난달 최종 1~10위에게 순위 보상 지급. 여러 번 불러도 안전 (이미 받은 사람은 DB가 거부 → 건너뜀)"""
    first = _last_month_first()
    month = first.strftime("%Y-%m")
    next_first = today_kst().replace(day=1)
    ranked = _rank(_month_rows(_utc(first), _utc(next_first)))
    paid, skipped = [], 0
    for i, (uid, _) in enumerate(ranked[:TOP_N]):
        row = {"user_id": uid, "currency": "point", "type": REWARD_TYPE, "amount": _reward(i + 1), "ref_id": f"{REWARD_PREFIX}{month}"}
        try:
            supabase.table("point_transactions").insert(row).execute()
            paid.append({"rank": i + 1, "points": row["amount"]})
        except Exception as error:
            if not is_duplicate_transaction_error(error):
                raise
            skipped += 1
    return {"month": month, "paid": paid, "already_paid": skipped}


def _ensure_last_month_paid() -> None:
    """안전장치: 예약이 안 돌았어도 새 달 첫 순위 조회 때 지난달 보상을 지급. 지급 줄이 하나라도 있으면 계산 안 함"""
    month = today_kst().strftime("%Y-%m")
    if _paid_checked["month"] == month:
        return
    try:
        ref_id = f"{REWARD_PREFIX}{_last_month_first().strftime('%Y-%m')}"
        found = (
            supabase.table("point_transactions").select("id")
            .eq("currency", "point").eq("type", REWARD_TYPE).eq("ref_id", ref_id)
            .limit(1).execute().data
        )
        if not found:
            pay_last_month_rewards()
        _paid_checked["month"] = month
    except Exception:
        logger.exception("지난달 순위 보상 지급 실패 — 다음 조회 때 다시 시도")  # 순위 화면은 그대로 보여 줌


@router.get("/ranking")
def read_ranking(user: dict | None = Depends(_optional_user)):
    """이달의 적립왕: 1~10위 + (로그인했으면) 내 순위"""
    _ensure_last_month_paid()
    month = today_kst().strftime("%Y-%m")
    ranked, top = _ranking(month)
    return {
        "month": month,
        "top": [{k: v for k, v in t.items() if k != "user_id"} for t in top],  # 회원 id는 내보내지 않음
        "me": _me(user["id"], ranked) if user else None,
    }
