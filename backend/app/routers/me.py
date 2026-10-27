from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.supabase_client import supabase

# 이 파일의 주소는 모두 /api/v1/me 로 시작한다
router = APIRouter(prefix="/api/v1/me", tags=["내 정보"])


class ProfileUpdate(BaseModel):
    """내 정보 수정 때 받을 수 있는 값 (보낸 것만 바꾼다)"""

    nickname: str | None = Field(default=None, max_length=20)
    region: str | None = Field(default=None, max_length=20)


@router.get("")
def read_me(user: dict = Depends(get_current_user)):
    """내 정보 보기"""
    result = (
        supabase.table("profiles")
        .select("id, nickname, region, created_at")
        .eq("id", user["id"])  # 본인 것만
        .execute()
    )
    if not result.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "회원 정보를 찾을 수 없습니다.")
    return {**result.data[0], "email": user["email"]}


@router.patch("")
def update_me(body: ProfileUpdate, user: dict = Depends(get_current_user)):
    """내 정보 고치기 (닉네임, 자치구)"""
    changes = body.model_dump(exclude_unset=True)  # 실제로 보낸 값만 꺼낸다

    if not changes:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "바꿀 값을 보내 주세요.")

    if "nickname" in changes:
        nickname = (changes["nickname"] or "").strip()
        if not nickname:
            raise HTTPException(status.HTTP_400_BAD_REQUEST, "닉네임을 입력해 주세요.")
        changes["nickname"] = nickname

    result = (
        supabase.table("profiles")
        .update(changes)
        .eq("id", user["id"])  # 본인 것만
        .execute()
    )
    if not result.data:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "회원 정보를 찾을 수 없습니다.")
    return {**result.data[0], "email": user["email"]}


@router.delete("")
def delete_me(user: dict = Depends(get_current_user)):
    """회원 탈퇴 (되돌릴 수 없음)

    1) 내 커뮤니티 사진을 Storage에서 지운다 (DB가 자동으로 못 지우는 것)
    2) Supabase Auth 계정을 지운다 → profiles와 profiles에 연결된 표(통장·판별·나무·쿠폰·퀴즈·글·댓글·좋아요)는
       DB가 함께 지운다 (001~009의 on delete cascade). 나를 추천인으로 둔 친구는 referred_by가 비워짐 (003)
    """
    # 순서가 엇갈리지 않게 posts.py의 사진 경로 함수를 그대로 씀
    from app.routers.posts import BUCKET, _storage_path

    rows = supabase.table("posts").select("image_url").eq("user_id", user["id"]).execute().data or []
    paths = [p for p in (_storage_path(r["image_url"]) for r in rows) if p]
    if paths:
        try:
            supabase.storage.from_(BUCKET).remove(paths)
        except Exception:
            pass  # 사진이 남아도 탈퇴는 계속 (보관함에서 따로 정리 가능)

    try:
        supabase.auth.admin.delete_user(user["id"])
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.")
    return {"deleted": True}
