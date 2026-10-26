from datetime import datetime, timedelta, timezone
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from fastapi.security import HTTPAuthorizationCredentials
from pydantic import BaseModel, Field

from app.auth import bearer_scheme, get_current_user
from app.points import add_post_verify_rewards
from app.supabase_client import supabase

# 커뮤니티 API. 담당: 김선영 (명세: docs/api-spec.md 7번)
# - 글 목록·글 보기·댓글 보기는 로그인 없이 볼 수 있다. (로그인했으면 "내 좋아요"까지 알려 줌)
# - 글쓰기·삭제·좋아요·댓글 쓰기는 로그인 필요. 작성자는 항상 토큰의 user["id"]를 쓴다.
# - 사진은 글을 올릴 때만 Storage posts 보관함에 저장하고, DB에는 주소(image_url)만 넣는다.
router = APIRouter(prefix="/api/v1/posts", tags=["커뮤니티"])

# ---------- 숫자·규칙 표 (바뀌면 여기와 docs/api-spec.md만 고침) ----------
BUCKET = "posts"  # Storage 보관함 이름 (002에서 만듦: 공개, 5MB, 이미지만)
MAX_IMAGE_BYTES = 5 * 1024 * 1024  # 사진 최대 5MB
IMAGE_TYPES = {  # 받는 사진 종류 → 저장할 확장자 (보관함 허용 목록과 같게)
    "image/jpeg": ".jpg",
    "image/png": ".png",
    "image/webp": ".webp",
    "image/heic": ".heic",
}
DEFAULT_LIMIT = 10  # 목록 한 번에 가져올 글 수
MAX_LIMIT = 50
POST_VERIFY_DAILY_LIMIT = 5  # 인증 게시글 보상: 하루 5회 (💧1 + ⭐1)
KST = timezone(timedelta(hours=9))  # 하루 = 한국 시간 0시 기준 (한국은 서머타임 없음)
NO_REWARD = {"drops_awarded": 0, "points_awarded": 0}


# ---------- 로그인 확인 ----------
def get_optional_user(
    credentials: HTTPAuthorizationCredentials | None = Depends(bearer_scheme),
) -> dict | None:
    """로그인했으면 회원 정보, 아니면 None. (누구나 볼 수 있는 API에서 "내 좋아요" 표시용)

    공용 get_current_user를 그대로 불러 쓴다. 토큰이 틀리거나 만료됐으면 손님(None)으로 본다.
    """
    if credentials is None:
        return None
    try:
        return get_current_user(credentials)
    except HTTPException:
        return None


# ---------- 공통 도우미 ----------
def _nicknames(user_ids: set[str]) -> dict[str, str]:
    """회원 id 묶음 → {id: 닉네임}"""
    if not user_ids:
        return {}
    rows = supabase.table("profiles").select("id, nickname").in_("id", list(user_ids)).execute().data
    return {row["id"]: row["nickname"] for row in rows}


def _author(user_id: str, names: dict[str, str]) -> dict:
    return {"id": user_id, "nickname": names.get(user_id, "알 수 없음")}


def _to_posts(rows: list[dict], viewer_id: str | None) -> list[dict]:
    """posts 줄들을 화면에 줄 글 객체로 바꾼다 (닉네임·좋아요 수·댓글 수·내 좋아요 붙이기)"""
    if not rows:
        return []
    post_ids = [row["id"] for row in rows]
    likes = supabase.table("post_likes").select("post_id, user_id").in_("post_id", post_ids).execute().data
    comments = supabase.table("comments").select("post_id").in_("post_id", post_ids).execute().data
    names = _nicknames({row["user_id"] for row in rows})

    like_count: dict[int, int] = {}
    liked_by_me: set[int] = set()
    for like in likes:
        like_count[like["post_id"]] = like_count.get(like["post_id"], 0) + 1
        if like["user_id"] == viewer_id:
            liked_by_me.add(like["post_id"])
    comment_count: dict[int, int] = {}
    for comment in comments:
        comment_count[comment["post_id"]] = comment_count.get(comment["post_id"], 0) + 1

    return [
        {
            "id": row["id"],
            "author": _author(row["user_id"], names),
            "content": row["content"],
            "image_url": row["image_url"],
            "is_verification": row["is_verification"],
            "like_count": like_count.get(row["id"], 0),
            "liked_by_me": row["id"] in liked_by_me,
            "comment_count": comment_count.get(row["id"], 0),
            "created_at": row["created_at"],
        }
        for row in rows
    ]


POST_COLUMNS = "id, user_id, content, image_url, is_verification, created_at"


def _get_post_row(post_id: int) -> dict:
    """글 한 줄. 없으면 404"""
    rows = supabase.table("posts").select(POST_COLUMNS).eq("id", post_id).execute().data
    if not rows:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "게시글을 찾을 수 없어요.")
    return rows[0]


def _storage_path(image_url: str | None) -> str | None:
    """공개 주소에서 보관함 안의 파일 경로만 꺼낸다 (글 삭제 때 사진도 지우려고)"""
    marker = f"/object/public/{BUCKET}/"
    if not image_url or marker not in image_url:
        return None
    return image_url.split(marker, 1)[1].split("?", 1)[0]


def _remove_image(path: str | None) -> None:
    """사진 지우기. 실패해도 글 처리는 계속한다 (남은 파일은 보관함에서 정리 가능)"""
    if not path:
        return
    try:
        supabase.storage.from_(BUCKET).remove([path])
    except Exception:
        pass


def _read_image(image: UploadFile) -> tuple[bytes, str]:
    """사진 검사: 이미지 종류인지, 5MB 이하인지. 통과하면 (내용, 확장자)"""
    ext = IMAGE_TYPES.get((image.content_type or "").lower())
    if ext is None:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "사진은 JPG·PNG·WEBP·HEIC 이미지만 올릴 수 있어요.")
    data = image.file.read(MAX_IMAGE_BYTES + 1)
    if len(data) > MAX_IMAGE_BYTES:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "사진은 5MB 이하만 올릴 수 있어요.")
    if not data:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "사진 파일이 비어 있어요.")
    return data, ext


# ---------- 인증 게시글 보상 ----------
def _today_start_kst() -> str:
    now = datetime.now(KST)
    return now.replace(hour=0, minute=0, second=0, microsecond=0).isoformat()


def _check_my_scan(user_id: str, scan_id: int) -> None:
    """AI 결과 공유 글: 내 판별 기록이고 판별에 성공한 기록인지 확인. 아니면 400"""
    rows = (
        supabase.table("scans")
        .select("id")
        .eq("id", scan_id)
        .eq("user_id", user_id)
        .eq("status", "success")
        .execute()
        .data
    )
    if not rows:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "판별 기록을 찾을 수 없어요.")


def award_post_verify(user_id: str, post_id: int, scan_id: int | None = None) -> dict:
    """출처와 관계없이 모든 인증 게시글 보상 💧1 + ⭐1을 하루 5회까지 지급한다.

    AI 결과 공유 글(scan_id 있음)은 통장 ref_id를 "scan-판별번호"로 남긴다.
    → 같은 판별 결과를 여러 번(다른 날 포함) 공유해도 보상은 1번만 (005 중복 방지 규칙에는 날짜가 없음)
    """
    ref_id = f"scan-{scan_id}" if scan_id is not None else str(post_id)

    # 1) 같은 글(또는 같은 판별 결과)로 이미 받았으면 다시 주지 않음
    already = (
        supabase.table("point_transactions")
        .select("id")
        .eq("user_id", user_id)
        .eq("type", "post_verify")
        .eq("currency", "drop")
        .eq("ref_id", ref_id)
        .execute()
        .data
    )
    if already:
        return NO_REWARD

    # 2) 오늘(한국 시간) 인증글 보상을 5번 받았으면 그만
    today = (
        supabase.table("point_transactions")
        .select("id", count="exact")
        .eq("user_id", user_id)
        .eq("type", "post_verify")
        .eq("currency", "drop")
        .gte("created_at", _today_start_kst())
        .execute()
        .count
        or 0
    )
    if today >= POST_VERIFY_DAILY_LIMIT:
        return NO_REWARD

    saved = add_post_verify_rewards(user_id=user_id, ref_id=ref_id)
    return {"drops_awarded": 1, "points_awarded": 1} if saved["created"] else NO_REWARD


# ---------- 글 ----------
@router.get("")
def list_posts(
    limit: int = DEFAULT_LIMIT,
    cursor: int | None = None,
    viewer: dict | None = Depends(get_optional_user),
):
    """피드 목록 (최신순). 다음 쪽은 받은 next_cursor를 cursor로 보내면 된다"""
    limit = max(1, min(limit, MAX_LIMIT))
    query = supabase.table("posts").select(POST_COLUMNS).order("id", desc=True).limit(limit)
    if cursor is not None:
        query = query.lt("id", cursor)  # 이 번호보다 오래된 글
    rows = query.execute().data
    next_cursor = rows[-1]["id"] if len(rows) == limit else None
    return {"items": _to_posts(rows, viewer and viewer["id"]), "next_cursor": next_cursor}


@router.post("", status_code=status.HTTP_201_CREATED)
def create_post(
    content: str = Form(...),
    is_verification: bool = Form(False),
    scan_id: int | None = Form(None),  # AI 결과 공유 글만 보냄 (판별 응답의 scan_id)
    image: UploadFile | None = File(None),
    user: dict = Depends(get_current_user),
):
    """글 작성 (multipart: content, image, is_verification, scan_id). 인증글이면 보상 결과도 함께 돌려준다"""
    content = content.strip()
    if not 1 <= len(content) <= 1000:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "내용은 1~1000자로 적어 주세요.")
    if scan_id is not None:
        _check_my_scan(user["id"], scan_id)  # 사진을 올리기 전에 확인 (실패하면 아무것도 저장 안 함)

    # 1) 사진이 있으면 검사 후 보관함에 올림. 파일 이름 = 회원id/무작위.확장자 (겹치지 않음)
    image_url, image_path = None, None
    if image is not None and image.filename:
        data, ext = _read_image(image)
        image_path = f"{user['id']}/{uuid4().hex}{ext}"
        try:
            supabase.storage.from_(BUCKET).upload(
                image_path, data, {"content-type": image.content_type, "cache-control": "3600"}
            )
        except Exception:
            raise HTTPException(status.HTTP_502_BAD_GATEWAY, "사진을 올리지 못했어요. 잠시 후 다시 시도해 주세요.")
        image_url = supabase.storage.from_(BUCKET).get_public_url(image_path)

    # 2) 글 저장. 실패하면 방금 올린 사진을 지워서 남기지 않음 (보상도 주지 않음)
    try:
        row = (
            supabase.table("posts")
            .insert(
                {
                    "user_id": user["id"],
                    "content": content,
                    "image_url": image_url,
                    "is_verification": is_verification,
                }
            )
            .execute()
            .data[0]
        )
    except Exception:
        _remove_image(image_path)
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "글을 저장하지 못했어요. 잠시 후 다시 시도해 주세요.")

    # 3) 인증글이면 출처에 관계없이 같은 하루 5회 한도에서 보상
    reward = award_post_verify(user["id"], row["id"], scan_id) if is_verification else NO_REWARD
    return {**_to_posts([row], user["id"])[0], **reward}


@router.get("/{post_id}")
def read_post(post_id: int, viewer: dict | None = Depends(get_optional_user)):
    """글 상세"""
    return _to_posts([_get_post_row(post_id)], viewer and viewer["id"])[0]


class PostUpdate(BaseModel):
    content: str = Field(min_length=1, max_length=1000)


@router.patch("/{post_id}")
def update_post(post_id: int, body: PostUpdate, user: dict = Depends(get_current_user)):
    """내 글 내용 수정. 사진·인증 여부는 바꾸지 않는다 (일반 글 → 인증글로 바꿔 보상 받기 방지)"""
    row = _get_post_row(post_id)
    if row["user_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "내가 쓴 글만 고칠 수 있어요.")
    content = body.content.strip()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "내용은 1~1000자로 적어 주세요.")
    updated = (
        supabase.table("posts")
        .update({"content": content})
        .eq("id", post_id)
        .eq("user_id", user["id"])  # 본인 글만
        .execute()
        .data
    )
    return _to_posts(updated, user["id"])[0]


@router.delete("/{post_id}")
def delete_post(post_id: int, user: dict = Depends(get_current_user)):
    """내 글 삭제 (댓글·좋아요는 DB가 함께 지움, 사진은 보관함에서 지움)"""
    row = _get_post_row(post_id)
    if row["user_id"] != user["id"]:
        raise HTTPException(status.HTTP_403_FORBIDDEN, "내가 쓴 글만 지울 수 있어요.")
    supabase.table("posts").delete().eq("id", post_id).eq("user_id", user["id"]).execute()
    _remove_image(_storage_path(row["image_url"]))
    return {"id": post_id, "deleted": True}


# ---------- 좋아요 ----------
@router.post("/{post_id}/like")
def toggle_like(post_id: int, user: dict = Depends(get_current_user)):
    """좋아요 토글: 안 눌렀으면 누르고, 눌렀으면 취소"""
    _get_post_row(post_id)
    mine = (
        supabase.table("post_likes")
        .select("post_id")
        .eq("post_id", post_id)
        .eq("user_id", user["id"])
        .execute()
        .data
    )
    if mine:
        supabase.table("post_likes").delete().eq("post_id", post_id).eq("user_id", user["id"]).execute()
        liked = False
    else:
        try:
            supabase.table("post_likes").insert({"post_id": post_id, "user_id": user["id"]}).execute()
        except Exception:
            pass  # 동시에 두 번 눌러 이미 들어간 경우 (post_id+user_id 중복은 DB가 거부)
        liked = True
    like_count = (
        supabase.table("post_likes").select("post_id", count="exact").eq("post_id", post_id).execute().count or 0
    )
    return {"liked": liked, "like_count": like_count}


# ---------- 댓글 ----------
class CommentCreate(BaseModel):
    content: str = Field(min_length=1, max_length=500)
    parent_id: int | None = None  # 대댓글이면 원래 댓글 id


def _to_comments(rows: list[dict]) -> list[dict]:
    names = _nicknames({row["user_id"] for row in rows})
    return [
        {
            "id": row["id"],
            "post_id": row["post_id"],
            "parent_id": row["parent_id"],
            "author": _author(row["user_id"], names),
            "content": row["content"],
            "created_at": row["created_at"],
        }
        for row in rows
    ]


COMMENT_COLUMNS = "id, post_id, user_id, parent_id, content, created_at"


@router.get("/{post_id}/comments")
def list_comments(post_id: int):
    """댓글 목록 (오래된 순). 대댓글은 parent_id로 원래 댓글을 가리킨다"""
    _get_post_row(post_id)
    rows = (
        supabase.table("comments")
        .select(COMMENT_COLUMNS)
        .eq("post_id", post_id)
        .order("created_at")
        .order("id")
        .execute()
        .data
    )
    return {"items": _to_comments(rows)}


@router.post("/{post_id}/comments", status_code=status.HTTP_201_CREATED)
def create_comment(post_id: int, body: CommentCreate, user: dict = Depends(get_current_user)):
    """댓글·대댓글 쓰기. 대댓글의 대댓글은 맨 위 댓글 아래로 모은다 (한 단계만)"""
    _get_post_row(post_id)
    content = body.content.strip()
    if not content:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "댓글 내용을 적어 주세요.")

    parent_id = body.parent_id
    if parent_id is not None:
        parents = (
            supabase.table("comments")
            .select("id, parent_id")
            .eq("id", parent_id)
            .eq("post_id", post_id)  # 같은 글의 댓글에만 답글 가능
            .execute()
            .data
        )
        if not parents:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "답글을 달 댓글을 찾을 수 없어요.")
        parent_id = parents[0]["parent_id"] or parents[0]["id"]

    row = (
        supabase.table("comments")
        .insert({"post_id": post_id, "user_id": user["id"], "parent_id": parent_id, "content": content})
        .execute()
        .data[0]
    )
    return _to_comments([row])[0]
