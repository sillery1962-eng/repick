import hashlib

from fastapi import APIRouter, Depends

from app.auth import get_current_user
from app.supabase_client import supabase

# 마이페이지 API (읽기 전용). 담당: 오지원
# - 쿠폰함: 나무 수확 보너스로 받은 사은품(reward_claims) = 쿠폰 (10/19 팀 결정 "사은품 = 쿠폰 발행")
#   쿠폰 번호 칸(008)은 아직 없다. 그때까지 받은 기록 번호로 "RP-" + 8자리를 만들어 보여 준다 (시연용, 매장 사용 없음).
#   008이 생기면 _coupon_code()를 DB 값으로 바꾸기만 하면 된다.
# - 내 활동: 내 글, 내 글에 달린 남의 댓글, 내가 남의 글에 쓴 댓글 (커뮤니티 표 posts·comments를 읽기만 한다)
# - 회원 정보·잔액·나무 단계는 이미 있는 API를 쓴다: GET/PATCH /me, GET /points, GET /forest
router = APIRouter(prefix="/api/v1/me", tags=["마이페이지"])

GIFT_KINDS = {"친환경 쿠폰": "coupon", "재활용 노트": "notebook", "에코백": "bag", "텀블러": "tumbler"}
COUPON_CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789"  # 헷갈리는 0·O·1·I 빼고
ACTIVITY_LIMIT = 20  # 탭마다 최근 몇 개까지 보여 줄지
EXCERPT = 40  # 댓글이 달린 글을 몇 글자까지 보여 줄지


def _coupon_code(claim_id: int) -> str:
    """받은 기록 번호 → "RP-" + 8자리 (같은 기록은 늘 같은 번호). 008의 쿠폰 번호 칸이 생기면 그 값으로 바꾼다"""
    digest = hashlib.sha256(f"repick-coupon-{claim_id}".encode()).digest()
    return "RP-" + "".join(COUPON_CHARS[b % len(COUPON_CHARS)] for b in digest[:8])


def _excerpt(text: str | None) -> str:
    text = (text or "").replace("\n", " ").strip()
    return text if len(text) <= EXCERPT else text[:EXCERPT] + "…"


def _nicknames(user_ids: set[str]) -> dict[str, str]:
    if not user_ids:
        return {}
    res = supabase.table("profiles").select("id, nickname").in_("id", list(user_ids)).execute()
    return {r["id"]: r["nickname"] for r in res.data or []}


@router.get("/coupons")
def read_my_coupons(user: dict = Depends(get_current_user)):
    """내 쿠폰함 (최신순): 사은품 이름, 쓴 나무 수, 쿠폰 번호, 받은 날짜"""
    res = (
        supabase.table("reward_claims")
        .select("id, tier, trees_spent, item, created_at")
        .eq("user_id", user["id"])  # 본인 것만
        .eq("choice", "gift")
        .order("created_at", desc=True)
        .execute()
    )
    items = [
        {
            "id": r["id"],
            "item": r["item"],
            "kind": GIFT_KINDS.get(r["item"], "coupon"),
            "tier": r["tier"],
            "trees_spent": r["trees_spent"],
            "code": _coupon_code(r["id"]),
            "created_at": r["created_at"],
        }
        for r in res.data or []
    ]
    return {"items": items}


@router.get("/activity")
def read_my_activity(user: dict = Depends(get_current_user)):
    """내 활동: 내 글(좋아요·댓글 수), 받은 댓글(내 글에 남이 쓴 것), 내가 쓴 댓글(남의 글에). 각각 최근 20개"""
    me = user["id"]

    # 1) 내 글
    posts = (
        supabase.table("posts")
        .select("id, content, image_url, is_verification, created_at")
        .eq("user_id", me)
        .order("created_at", desc=True)
        .limit(ACTIVITY_LIMIT)
        .execute()
        .data
        or []
    )
    post_ids = [p["id"] for p in posts]
    likes: dict[int, int] = {}
    comment_counts: dict[int, int] = {}
    if post_ids:
        for r in supabase.table("post_likes").select("post_id").in_("post_id", post_ids).execute().data or []:
            likes[r["post_id"]] = likes.get(r["post_id"], 0) + 1
        for r in supabase.table("comments").select("post_id").in_("post_id", post_ids).execute().data or []:
            comment_counts[r["post_id"]] = comment_counts.get(r["post_id"], 0) + 1

    # 2) 받은 댓글: 내 모든 글에 남이 쓴 댓글
    my_post_rows = supabase.table("posts").select("id, content").eq("user_id", me).execute().data or []
    my_post_text = {p["id"]: p["content"] for p in my_post_rows}
    received = []
    if my_post_text:
        received = (
            supabase.table("comments")
            .select("id, post_id, user_id, content, created_at")
            .in_("post_id", list(my_post_text))
            .neq("user_id", me)
            .order("created_at", desc=True)
            .limit(ACTIVITY_LIMIT)
            .execute()
            .data
            or []
        )

    # 3) 내가 쓴 댓글: 남의 글에 쓴 것
    written = (
        supabase.table("comments")
        .select("id, post_id, content, created_at")
        .eq("user_id", me)
        .order("created_at", desc=True)
        .limit(ACTIVITY_LIMIT * 2)
        .execute()
        .data
        or []
    )
    written = [c for c in written if c["post_id"] not in my_post_text][:ACTIVITY_LIMIT]
    other_posts = {}
    if written:
        rows = supabase.table("posts").select("id, user_id, content").in_("id", list({c["post_id"] for c in written})).execute().data or []
        other_posts = {p["id"]: p for p in rows}

    names = _nicknames({c["user_id"] for c in received} | {p["user_id"] for p in other_posts.values()})

    return {
        "posts": [
            {**p, "like_count": likes.get(p["id"], 0), "comment_count": comment_counts.get(p["id"], 0)} for p in posts
        ],
        "received_comments": [
            {
                "id": c["id"],
                "post_id": c["post_id"],
                "nickname": names.get(c["user_id"], "알 수 없음"),
                "content": c["content"],
                "post_excerpt": _excerpt(my_post_text.get(c["post_id"])),
                "created_at": c["created_at"],
            }
            for c in received
        ],
        "my_comments": [
            {
                "id": c["id"],
                "post_id": c["post_id"],
                "content": c["content"],
                "post_author": names.get(other_posts.get(c["post_id"], {}).get("user_id"), "알 수 없음"),
                "post_excerpt": _excerpt(other_posts.get(c["post_id"], {}).get("content")),
                "created_at": c["created_at"],
            }
            for c in written
        ],
    }
