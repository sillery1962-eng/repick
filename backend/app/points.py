"""물방울·포인트 거래를 공통으로 처리하는 함수.

화면이나 각 API가 point_transactions 테이블에 직접 쓰지 않고
이 파일의 함수를 함께 사용하도록 만든다.
"""

from typing import Literal
from uuid import uuid4

from app.supabase_client import supabase


Currency = Literal["drop", "point"]


def _balance_rows(user_id: str, currency: Currency | None = None):
    """거래내역을 500개씩 읽어 Supabase 조회 상한으로 인한 합계 누락을 막는다."""
    last_id = None
    while True:
        query = (
            supabase.table("point_transactions")
            .select("id,currency,amount")
            .eq("user_id", user_id)
            .order("id")
            .limit(500)
        )
        if currency is not None:
            query = query.eq("currency", currency)
        if last_id is not None:
            query = query.gt("id", last_id)
        rows = query.execute().data or []
        if not rows:
            break
        yield from rows
        last_id = rows[-1]["id"]


def get_balance(user_id: str, currency: Currency) -> int:
    """본인의 지정 화폐 거래내역 전체를 합산한다."""
    return sum(int(row["amount"]) for row in _balance_rows(user_id, currency))


def get_balances(user_id: str) -> dict[str, int]:
    """본인의 물방울·포인트 거래내역 전체를 합산한다."""
    balances = {"drop": 0, "point": 0}
    for row in _balance_rows(user_id):
        currency = row.get("currency")
        if currency in balances:
            balances[currency] += int(row["amount"])
    return balances


def is_duplicate_transaction_error(error: Exception) -> bool:
    """DB의 중복 거래 거절(23505)인지 확인한다."""
    code = getattr(error, "code", None)
    message = str(error).lower()

    return (
        code == "23505"
        or "23505" in message
        or "duplicate key" in message
        or "point_tx_no_dup" in message
    )


def add_points(
    *,
    user_id: str,
    currency: Currency,
    transaction_type: str,
    amount: int,
    ref_id: str | int | None = None,
) -> dict:
    """물방울 또는 포인트 거래 한 줄을 기록한다.

    같은 ref_id의 동일 화폐 보상이 이미 있으면 오류를 반복하지 않고
    ``created=False``를 반환한다.
    """
    if amount == 0:
        raise ValueError("거래 금액은 0일 수 없습니다.")

    row = {
        "user_id": user_id,
        "currency": currency,
        "type": transaction_type,
        "amount": amount,
        "ref_id": str(ref_id) if ref_id is not None else None,
    }

    try:
        result = supabase.table("point_transactions").insert(row).execute()
    except Exception as error:
        if is_duplicate_transaction_error(error):
            return {
                "created": False,
                "duplicate": True,
                "transaction": None,
            }
        raise

    transaction = result.data[0] if result.data else row

    return {
        "created": True,
        "duplicate": False,
        "transaction": transaction,
    }


def add_scan_rewards(
    *,
    user_id: str,
    scan_id: str | int,
    drops: int,
    points: int,
) -> dict:
    """AI 판별 한 건의 물방울과 포인트를 함께 기록한다.

    리스트 한 번을 insert하므로 두 거래가 한 요청으로 저장된다.
    005 인덱스의 currency 구분 덕분에 같은 scan_id로 두 화폐를
    각각 한 줄씩 기록할 수 있다.
    """
    rows = [
        {
            "user_id": user_id,
            "currency": "drop",
            "type": "scan",
            "amount": drops,
            "ref_id": str(scan_id),
        },
        {
            "user_id": user_id,
            "currency": "point",
            "type": "scan",
            "amount": points,
            "ref_id": str(scan_id),
        },
    ]

    try:
        result = supabase.table("point_transactions").insert(rows).execute()
    except Exception as error:
        if is_duplicate_transaction_error(error):
            return {
                "created": False,
                "duplicate": True,
                "transactions": [],
            }
        raise

    return {
        "created": True,
        "duplicate": False,
        "transactions": result.data or rows,
    }


def add_post_verify_rewards(*, user_id: str, post_id: str | int) -> dict:
    """인증 게시글 하나의 물방울·포인트를 한 요청으로 지급한다."""
    rows = [
        {
            "user_id": user_id,
            "currency": currency,
            "type": "post_verify",
            "amount": 1,
            "ref_id": str(post_id),
        }
        for currency in ("drop", "point")
    ]
    try:
        result = supabase.table("point_transactions").insert(rows).execute()
    except Exception as error:
        if is_duplicate_transaction_error(error):
            return {"created": False, "duplicate": True, "transactions": []}
        raise
    return {"created": True, "duplicate": False, "transactions": result.data or rows}


def add_conversion(*, user_id: str, drops: int) -> dict:
    """물방울을 포인트로 전환하는 거래 두 줄을 함께 기록한다."""
    if drops <= 0:
        raise ValueError("전환할 물방울은 1개 이상이어야 합니다.")

    conversion_id = f"convert-{uuid4()}"
    rows = [
        {
            "user_id": user_id,
            "currency": "drop",
            "type": "convert",
            "amount": -drops,
            "ref_id": conversion_id,
        },
        {
            "user_id": user_id,
            "currency": "point",
            "type": "convert",
            "amount": drops * 5,
            "ref_id": conversion_id,
        },
    ]

    result = supabase.table("point_transactions").insert(rows).execute()

    return {
        "transactions": result.data or rows,
        "points_awarded": drops * 5,
    }
