from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.config import FRONTEND_ORIGIN
from app.routers import chat, classify, donations, events, forest, friends, me, points, posts
from app.routers import attendance  # 출석 체크 (지원)
from app.routers import ranking  # 이달의 적립왕 (지원)

app = FastAPI(title="RePick API", version="0.1.0")

# 웹 화면(프론트엔드) 주소에서 오는 요청을 허락한다
app.add_middleware(
    CORSMiddleware,
    allow_origins=[FRONTEND_ORIGIN],  # 배포한 화면 주소 (.env의 FRONTEND_ORIGIN) — 배포 때 꼭 필요
    allow_origin_regex=r"^http://(localhost|127\.0\.0\.1)(:\d+)?$",  # 개발 중: 내 컴퓨터(localhost)의 모든 포트
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
app.include_router(attendance.router)  # 출석 체크 (진짜, 지원)
app.include_router(posts.router)
app.include_router(chat.router)
app.include_router(forest.router)
app.include_router(donations.router)
app.include_router(events.router)
app.include_router(ranking.router)  # 이달의 적립왕 (진짜, 지원)
app.include_router(friends.router)
