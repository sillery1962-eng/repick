import hashlib

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

    1) 30일 재가입 막기용 탈퇴 기록을 남긴다 (011 withdrawn_emails) — 못 남기면 아무것도 지우지 않고 멈춤
    2) 내 커뮤니티 사진을 Storage에서 지운다 (DB가 자동으로 못 지우는 것)
    3) Supabase Auth 계정을 지운다 → profiles와 profiles에 연결된 표(통장·판별·나무·쿠폰·퀴즈·글·댓글·좋아요)는
       DB가 함께 지운다 (001~009의 on delete cascade). 나를 추천인으로 둔 친구는 referred_by가 비워짐 (003)
    """
    # 1) 이메일 원문 대신 해시만 저장. 만드는 법은 011의 DB 트리거와 같아야 함: 공백 제거 → 소문자 → SHA-256
    #    (기록 뒤 계정 삭제가 실패해도 계정은 그대로 쓸 수 있음 — 이 기록은 "새 가입"만 막는다)
    if user.get("email"):
        email_hash = hashlib.sha256(user["email"].strip().lower().encode("utf-8")).hexdigest()
        try:
            supabase.table("withdrawn_emails").insert({"email_hash": email_hash}).execute()
        except Exception:
            raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.")

    # 2) 순서가 엇갈리지 않게 posts.py의 사진 경로 함수를 그대로 씀
    from app.routers.posts import BUCKET, _storage_path

    rows = supabase.table("posts").select("image_url").eq("user_id", user["id"]).execute().data or []
    paths = [p for p in (_storage_path(r["image_url"]) for r in rows) if p]
    if paths:
        try:
            supabase.storage.from_(BUCKET).remove(paths)
        except Exception:
            pass  # 사진이 남아도 탈퇴는 계속 (보관함에서 따로 정리 가능)

    # 3)
    try:
        supabase.auth.admin.delete_user(user["id"])
    except Exception:
        raise HTTPException(status.HTTP_500_INTERNAL_SERVER_ERROR, "탈퇴하지 못했어요. 잠시 후 다시 시도해 주세요.")
    return {"deleted": True}
