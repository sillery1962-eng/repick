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
