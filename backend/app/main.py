from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.routers import me

app = FastAPI(title="RePick API", version="0.1.0")

# 웹 화면(프론트엔드) 주소에서 오는 요청을 허락한다
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],
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
