from fastapi import APIRouter

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 김선영
# 글 목록·글 보기는 로그인 없이 볼 수 있게 했다. 글쓰기·좋아요·댓글은 담당자가 만든다.
router = APIRouter(prefix="/api/v1/posts", tags=["커뮤니티 (가짜)"])

SAMPLE_POSTS = [
    {
        "id": 1,
        "nickname": "새 회원",
        "content": "오늘 페트병 라벨 떼고 분리배출 완료!",
        "image_url": None,
        "like_count": 3,
        "comment_count": 1,
        "created_at": "2026-10-13T09:30:00+09:00",
    },
    {
        "id": 2,
        "nickname": "리픽러",
        "content": "우유팩은 씻어서 말린 뒤 종이팩으로!",
        "image_url": None,
        "like_count": 5,
        "comment_count": 0,
        "created_at": "2026-10-12T20:10:00+09:00",
    },
]


@router.get("")
def list_posts():
    """게시글 목록"""
    return {"is_mock": True, "items": SAMPLE_POSTS}


@router.get("/{post_id}")
def read_post(post_id: int):
    """게시글 하나 보기 (지금은 어떤 번호든 1번 예시를 돌려준다)"""
    return {"is_mock": True, **SAMPLE_POSTS[0], "id": post_id}
