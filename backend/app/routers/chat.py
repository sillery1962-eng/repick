from fastapi import APIRouter
from pydantic import BaseModel, Field

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 김선영
# 실제로는 포티(키워드 매칭)가 질문에 맞는 배출 방법을 찾아 답한다.
router = APIRouter(prefix="/api/v1/chat", tags=["챗봇 포티 (가짜)"])


class ChatRequest(BaseModel):
    """챗봇에게 보내는 질문"""

    message: str = Field(min_length=1, max_length=200)


@router.post("")
def chat(body: ChatRequest):
    """포티에게 질문하기 (지금은 질문과 상관없이 같은 답)"""
    return {
        "is_mock": True,
        "reply": "페트병은 내용물을 비우고 라벨을 뗀 뒤 찌그러뜨려 투명 페트병 수거함에 버려 주세요.",
    }
