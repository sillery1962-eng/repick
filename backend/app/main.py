from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.routers import chat, classify, forest, me, points, posts

app = FastAPI(title="RePick API", version="0.1.0")

# 웹 화면(프론트엔드) 주소에서 오는 요청을 허락한다
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN,
    "http://localhost:5173",
    "http://127.0.0.1:5173",
    "http://localhost:5174",
    "http://127.0.0.1:5174",
    ], 

    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/api/v1/health", tags=["상태 확인"])
def health():
    """서버가 켜져 있는지 확인"""
    return {"status": "ok"}


# 창구 등록
app.include_router(me.router)

# ⚠️ 아래는 가짜 API (각 담당자가 실제 코드로 바꾼다)
app.include_router(classify.router)
app.include_router(points.router)
app.include_router(posts.router)
app.include_router(chat.router)
app.include_router(forest.router)
