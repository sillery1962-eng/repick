# 2026-10-20: 공통 보상 함수·전체 품목 개수/안내·원본 좌표 크기 연결
# [1] 기본 라이브러리
from datetime import datetime, timedelta, timezone
from io import BytesIO
import time

# [2] 이미지 처리
import cv2
import numpy as np
from PIL import Image, ImageOps

# [3] FastAPI
from fastapi import (
    APIRouter,
    Depends,
    File,
    HTTPException,
    UploadFile,
    status,
)

# [4] 팀 공용 로그인 인증
from app.auth import get_current_user

# 적립·잔액은 팀 공통 함수를 사용합니다.
from app.points import add_scan_rewards, get_balance

# [5] 팀 Supabase
from app.supabase_client import supabase

# [6] YOLO26s
from app.ai.detectors.yolo_detector import YOLODetector


# ---------------------------------------------------------
# API 주소
# ---------------------------------------------------------
# 최종 주소:
# POST /api/v1/classify
router = APIRouter(
    prefix="/api/v1/classify",
    tags=["AI 분류"],
)


# ---------------------------------------------------------
# YOLO 모델
# ---------------------------------------------------------
# 요청마다 모델을 새로 로드하지 않고
# 서버 실행 시 한 번만 로드해서 재사용합니다.
detector = YOLODetector()


# ---------------------------------------------------------
# AI 클래스 한글 이름
# ---------------------------------------------------------
# v0.5 기준 6개 클래스입니다.
RECYCLE_LABELS_KO = {
    "PAPER": "종이",
    "CAN": "캔",
    "PET": "페트병",
    "PLASTIC": "플라스틱",
    "VINYL": "비닐",
    "BATTERY": "건전지",
}


# ---------------------------------------------------------
# AI 인증 보상표
# ---------------------------------------------------------
# 최신 v0.5 기준입니다.
#
# 성공한 AI 인증 1회당
# 물방울 + 포인트를 동시에 지급합니다.
AI_REWARDS = {
    "PAPER": {
        "drops": 1,
        "points": 10,
    },
    "PET": {
        "drops": 1,
        "points": 10,
    },
    "PLASTIC": {
        "drops": 1,
        "points": 10,
    },
    "VINYL": {
        "drops": 1,
        "points": 10,
    },
    "CAN": {
        "drops": 3,
        "points": 30,
    },
    "BATTERY": {
        "drops": 4,
        "points": 40,
    },
}


# ---------------------------------------------------------
# 분리배출 안내
# ---------------------------------------------------------
# 현재 AI API에서 반환할 기본 안내입니다.
#
# 나중에 챗봇 데이터와 공통화할 수 있지만
# 지금은 AI API를 먼저 완성하기 위해
# 이 파일에서 관리합니다.
RECYCLING_GUIDES = {
    "PAPER": {
        "category": "종이류",
        "disposal_method": (
            "이물질과 테이프 등을 제거하고 "
            "깨끗하게 펴서 종이류로 배출"
        ),
        "notes": (
            "영수증, 코팅지 등은 일반 종이와 "
            "분리 기준이 다를 수 있습니다."
        ),
    },

    "CAN": {
        "category": "캔류",
        "disposal_method": (
            "내용물을 비우고 헹군 뒤 "
            "가능하면 찌그러뜨려 배출"
        ),
        "notes": (
            "스프레이·부탄가스 용기는 "
            "안전하게 내용물과 가스를 제거한 뒤 배출"
        ),
    },

    "PET": {
        "category": "페트병",
        "disposal_method": (
            "내용물을 비우고 헹군 뒤 "
            "라벨과 뚜껑을 분리해 배출"
        ),
        "notes": (
            "투명 페트병은 지역 기준에 따라 "
            "별도 분리배출할 수 있습니다."
        ),
    },

    "PLASTIC": {
        "category": "플라스틱류",
        "disposal_method": (
            "내용물을 비우고 깨끗하게 헹군 뒤 "
            "플라스틱류로 배출"
        ),
        "notes": (
            "재질이 섞여 분리가 어려운 제품은 "
            "지역별 배출 기준을 확인해주세요."
        ),
    },

    "VINYL": {
        "category": "비닐류",
        "disposal_method": (
            "내용물을 제거하고 깨끗한 상태로 "
            "비닐류에 배출"
        ),
        "notes": (
            "오염이 심해 세척하기 어려운 비닐은 "
            "일반폐기물 기준을 확인해주세요."
        ),
    },

    "BATTERY": {
        "category": "폐건전지",
        "disposal_method": (
            "일반쓰레기에 버리지 말고 "
            "폐건전지 전용 수거함에 배출"
        ),
        "notes": (
            "주민센터·공동주택 등의 "
            "폐건전지 수거함을 이용해주세요."
        ),
    },
}


# ---------------------------------------------------------
# AI 설정
# ---------------------------------------------------------

# 사진 최대 크기 5MB
MAX_IMAGE_SIZE = 5 * 1024 * 1024

# 하루 AI 적립 가능 횟수
DAILY_SCAN_REWARD_LIMIT = 1000  # 테스트용: 최종 검증 후 PR 전에 반드시 5로 복원

# YOLO confidence 기준
#
# 아직 팀 문서에서 최종 confidence가 확정되지 않았으므로
# 기존 코드의 0.25를 임시 유지합니다.
YOLO_CONFIDENCE = 0.25


# ---------------------------------------------------------
# 한국 시간
# ---------------------------------------------------------

KST = timezone(
    timedelta(hours=9)
)


def get_kst_day_range_utc():
    """
    오늘 한국 날짜의 시작/끝을 UTC 시각으로 계산합니다.

    예:
    한국 2026-10-16 00:00
        ↓
    UTC 2026-10-15 15:00

    하루 적립 횟수 계산은 한국 날짜 기준이어야 합니다.
    """

    now_kst = datetime.now(KST)

    start_kst = now_kst.replace(
        hour=0,
        minute=0,
        second=0,
        microsecond=0,
    )

    end_kst = start_kst + timedelta(days=1)

    return (
        start_kst.astimezone(timezone.utc),
        end_kst.astimezone(timezone.utc),
    )


# ---------------------------------------------------------
# 오늘 AI 적립 횟수
# ---------------------------------------------------------

def get_today_scan_reward_count(
    user_id: str,
) -> int:
    """
    오늘 AI 판별로 실제 적립된 횟수를 계산합니다.

    point_transactions에서
    currency=drop
    type=scan
    거래만 세면 AI 성공 1회당 한 줄이므로
    인증 횟수를 계산할 수 있습니다.
    """

    start_utc, end_utc = (
        get_kst_day_range_utc()
    )

    result = (
        supabase
        .table("point_transactions")
        .select("id", count="exact", head=True)
        .eq("user_id", user_id)
        .eq("currency", "drop")
        .eq("type", "scan")
        .gte(
            "created_at",
            start_utc.isoformat(),
        )
        .lt(
            "created_at",
            end_utc.isoformat(),
        )
        .execute()
    )

    return int(result.count or 0)


# ---------------------------------------------------------
# scans 기록
# ---------------------------------------------------------

def save_scan(
    user_id: str,
    top_class: str | None,
    confidence: float | None,
    scan_status: str,
) -> int:
    """
    AI 판별 결과를 scans 테이블에 저장합니다.

    사진 자체는 저장하지 않습니다.
    """

    result = (
        supabase
        .table("scans")
        .insert({
            "user_id": user_id,
            "top_class": top_class,
            "confidence": confidence,
            "status": scan_status,
        })
        .execute()
    )

    if not result.data:
        raise HTTPException(
            status_code=500,
            detail="AI 판별 기록 저장에 실패했습니다.",
        )

    return result.data[0]["id"]


def select_reward_detection(detections: list[dict]) -> dict:
    """보상은 최고 포인트 품목 1건, 동점이면 신뢰도가 높은 탐지를 선택합니다.

    표시용 대표 판정(top)과 DB의 top_class는 기존 신뢰도 기준을 유지합니다.
    사진에 같은 품목이 여러 개 있어도 보상을 곱하거나 합산하지 않습니다.
    """
    return max(
        detections,
        key=lambda item: (
            AI_REWARDS.get(item["class"], {}).get("points", 0),
            item["confidence"],
        ),
    )


# ---------------------------------------------------------
# AI 보상 저장
# ---------------------------------------------------------

def award_scan_reward(
    user_id: str,
    scan_id: int,
    class_name: str,
) -> dict:
    """
    AI 판별 보상을 지급합니다.

    하루 5회까지:
        drop +N
        point +N

    6번째부터:
        판별 기록은 남음
        보상은 0
    """

    today_count = (
        get_today_scan_reward_count(
            user_id
        )
    )

    # 이미 오늘 5회 적립했다면
    # AI 판별은 허용하지만 적립은 하지 않습니다.
    if (
        today_count
        >= DAILY_SCAN_REWARD_LIMIT
    ):
        return {
            "drops_awarded": 0,
            "points_awarded": 0,
            "today_scan_count": today_count,
        }

    reward = AI_REWARDS.get(
        class_name
    )

    if reward is None:
        return {
            "drops_awarded": 0,
            "points_awarded": 0,
            "today_scan_count": today_count,
        }

    # 두 화폐를 공통 함수의 한 INSERT 요청으로 함께 저장합니다.
    # 같은 scan_id의 중복이면 추가 지급액은 0입니다.
    saved = add_scan_rewards(
        user_id=user_id,
        scan_id=scan_id,
        drops=reward["drops"],
        points=reward["points"],
    )
    created = saved["created"]
    return {
        "drops_awarded": reward["drops"] if created else 0,
        "points_awarded": reward["points"] if created else 0,
        "today_scan_count": get_today_scan_reward_count(user_id),
        "already_rewarded": saved["duplicate"],
    }


# ---------------------------------------------------------
# POST /api/v1/classify
# ---------------------------------------------------------

@router.post("")
async def classify_image(
    image: UploadFile = File(...),
    user: dict = Depends(
        get_current_user
    ),
):
    """
    로그인한 사용자가 사진을 보내면
    YOLO26s로 재활용품을 판별합니다.

    처리 순서:

    사진
      ↓
    파일 검사
      ↓
    EXIF 방향 보정
      ↓
    YOLO26s 분석
      ↓
    bbox / class / confidence
      ↓
    scans 저장
      ↓
    하루 5회 여부 확인
      ↓
    물방울 + 포인트 적립
      ↓
    최종 JSON 반환
    """

    start_time = (
        time.perf_counter()
    )

    # -----------------------------------------------------
    # 1. 이미지 파일 형식 확인
    # -----------------------------------------------------

    if (
        not image.content_type
        or not image.content_type.startswith(
            "image/"
        )
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일만 업로드할 수 있습니다.",
        )

    # -----------------------------------------------------
    # 2. 이미지 읽기
    # -----------------------------------------------------

    image_bytes = await image.read()

    if not image_bytes:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="이미지 파일이 비어 있습니다.",
        )

    # -----------------------------------------------------
    # 3. 최대 5MB 제한
    # -----------------------------------------------------

    if (
        len(image_bytes)
        > MAX_IMAGE_SIZE
    ):
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail="이미지는 최대 5MB까지 업로드할 수 있습니다.",
        )

    # -----------------------------------------------------
    # 4. Pillow 이미지 변환 + EXIF 방향 보정
    # -----------------------------------------------------

    try:
        pil_image = Image.open(
            BytesIO(image_bytes)
        )

        # 휴대폰 사진 회전 보정
        pil_image = (
            ImageOps.exif_transpose(
                pil_image
            )
        )

        # YOLO 입력을 RGB로 통일
        pil_image = pil_image.convert(
            "RGB"
        )

    except Exception:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="올바른 이미지 파일이 아닙니다.",
        )

    # -----------------------------------------------------
    # 5. Pillow → OpenCV
    # -----------------------------------------------------

    frame_rgb = np.array(
        pil_image
    )

    frame = cv2.cvtColor(
        frame_rgb,
        cv2.COLOR_RGB2BGR,
    )

    # -----------------------------------------------------
    # 6. YOLO26s 분석
    # -----------------------------------------------------

    try:
        results = (
            detector.model.predict(
                source=frame,
                conf=YOLO_CONFIDENCE,
                verbose=False,
            )
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="AI 이미지 분석 중 오류가 발생했습니다.",
        )

    # -----------------------------------------------------
    # 7. 탐지 결과 정리
    # -----------------------------------------------------

    detections = []

    for box in results[0].boxes:
        class_id = int(
            box.cls[0]
        )

        class_name = str(
            detector.model.names[
                class_id
            ]
        ).upper()

        # v0.5의 6개 클래스 외에는
        # 보상 가능한 탐지로 사용하지 않습니다.
        if (
            class_name
            not in RECYCLE_LABELS_KO
        ):
            continue

        confidence = float(
            box.conf[0]
        )

        x1, y1, x2, y2 = (
            box.xyxy[0].tolist()
        )

        detections.append({
            "class": class_name,
            "label_ko": (
                RECYCLE_LABELS_KO[
                    class_name
                ]
            ),
            "confidence": round(
                confidence,
                4,
            ),
            "bbox": [
                round(x1, 2),
                round(y1, 2),
                round(x2, 2),
                round(y2, 2),
            ],
        })

    # -----------------------------------------------------
    # 8. 탐지 실패
    # -----------------------------------------------------

    if not detections:
        # 실패한 판별도 scans 기록은 남깁니다.
        scan_id = save_scan(
            user_id=user["id"],
            top_class=None,
            confidence=None,
            scan_status="uncertain",
        )

        elapsed_ms = round(
            (
                time.perf_counter()
                - start_time
            ) * 1000
        )

        return {
            "status": "uncertain",
            "scan_id": scan_id,
            "top": None,
            "detections": [],
            "counts": {},
            "total_count": 0,
            "guides": [],
            "image_width": pil_image.width,
            "image_height": pil_image.height,
            "guide": None,
            "drops_awarded": 0,
            "points_awarded": 0,
            "drops_balance": get_balance(
                user["id"],
                "drop",
            ),
            "points_balance": get_balance(
                user["id"],
                "point",
            ),
            "today_scan_count": (
                get_today_scan_reward_count(
                    user["id"]
                )
            ),
            "elapsed_ms": elapsed_ms,
            "message": (
                "다시 찍어 주세요"
            ),
        }

    # 탐지 개수와 안내는 모든 품목을 표시하고, 같은 품목 안내는 한 번만 제공합니다.
    # 보상은 포인트가 가장 높은 품목 1건 기준이며 개수만큼 곱하거나 합산하지 않습니다.
    counts = {}
    for detection in detections:
        name = detection["class"]
        counts[name] = counts.get(name, 0) + 1
    guides = [
        {"class": name, "label_ko": RECYCLE_LABELS_KO[name], **RECYCLING_GUIDES[name]}
        for name in counts
    ]

    # -----------------------------------------------------
    # 9. confidence가 가장 높은 대표 판정
    # -----------------------------------------------------

    top_detection = max(
        detections,
        key=lambda item: (
            item["confidence"]
        ),
    )

    # -----------------------------------------------------
    # 10. 분리배출 안내
    # -----------------------------------------------------

    guide = (
        RECYCLING_GUIDES.get(
            top_detection["class"]
        )
    )

    # -----------------------------------------------------
    # 11. scans 기록
    # -----------------------------------------------------

    scan_id = save_scan(
        user_id=user["id"],
        top_class=(
            top_detection["class"]
        ),
        confidence=(
            top_detection[
                "confidence"
            ]
        ),
        scan_status="success",
    )

    # -----------------------------------------------------
    # 12. 보상 지급
    # -----------------------------------------------------

    # 신뢰도 대표 판정과 별도로, 지급액이 가장 높은 품목을 선택합니다.
    reward_detection = select_reward_detection(detections)

    reward_result = (
        award_scan_reward(
            user_id=user["id"],
            scan_id=scan_id,
            class_name=reward_detection["class"],
        )
    )

    # -----------------------------------------------------
    # 13. 현재 잔액
    # -----------------------------------------------------

    drops_balance = get_balance(
        user["id"],
        "drop",
    )

    points_balance = get_balance(
        user["id"],
        "point",
    )

    # -----------------------------------------------------
    # 14. 처리 시간
    # -----------------------------------------------------

    elapsed_ms = round(
        (
            time.perf_counter()
            - start_time
        ) * 1000
    )

    # -----------------------------------------------------
    # 15. 최종 응답
    # -----------------------------------------------------

    return {
        "status": "success",

        "scan_id": scan_id,

        "top": {
            "class": (
                top_detection[
                    "class"
                ]
            ),
            "label_ko": (
                top_detection[
                    "label_ko"
                ]
            ),
            "confidence": (
                top_detection[
                    "confidence"
                ]
            ),
        },

        "detections": detections,
        "counts": counts,
        "total_count": len(detections),
        "guides": guides,
        "image_width": pil_image.width,
        "image_height": pil_image.height,
        "already_rewarded": reward_result.get("already_rewarded", False),

        "guide": guide,

        "drops_awarded": (
            reward_result[
                "drops_awarded"
            ]
        ),

        "points_awarded": (
            reward_result[
                "points_awarded"
            ]
        ),

        "drops_balance": (
            drops_balance
        ),

        "points_balance": (
            points_balance
        ),

        "today_scan_count": (
            reward_result[
                "today_scan_count"
            ]
        ),

        "elapsed_ms": elapsed_ms,
    }