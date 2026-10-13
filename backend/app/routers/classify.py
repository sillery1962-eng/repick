from fastapi import APIRouter

# ⚠️ 가짜 API (화면 연결 연습용). 담당: 서경난
# YOLO 테스트가 끝나면 사진 받기(python-multipart 필요)와 실제 판별로 바꾼다.
router = APIRouter(prefix="/api/v1/classify", tags=["AI 분류 (가짜)"])


@router.post("")
def classify():
    """사진 판별 (지금은 사진 없이 예시 결과만 돌려준다)"""
    return {
        "is_mock": True,
        "item": "페트병",
        "confidence": 0.92,
        "category": "플라스틱",
    }
