from fastapi import APIRouter
from pydantic import BaseModel, Field

from app.routers.chatbot import (
    ChatRequest as BotChatRequest,
    generate_chat_response,
)

router = APIRouter(prefix="/api/v1/chat", tags=["챗봇 포티"])


class ChatRequest(BaseModel):
    message: str = Field(min_length=1, max_length=500)
    district: str | None = None


@router.post("")
def chat(body: ChatRequest):
    req = BotChatRequest(
        message=body.message,
        district=body.district,
    )

    return generate_chat_response(req)