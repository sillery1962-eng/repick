# [1] 파일 경로 처리
from pathlib import Path

# [2] 클래스별 탐지 개수 계산
from collections import Counter

# [3] YOLO 모델
from ultralytics import YOLO


class YOLODetector:
    """
    RePick에서 사용하는 YOLO26s 재활용품 탐지 클래스입니다.

    현재 판별 클래스:
    0 PAPER
    1 CAN
    2 PET
    3 PLASTIC
    4 VINYL
    5 BATTERY
    """

    def __init__(self):
        # [1] 현재 파일 위치
        # backend/app/ai/detectors/yolo_detector.py
        current_file = Path(__file__).resolve()

        # [2] app 폴더 위치
        #
        # parents[0] = detectors
        # parents[1] = ai
        # parents[2] = app
        app_dir = current_file.parents[2]

        # [3] 학습된 YOLO26s 모델 위치
        self.model_path = (
            app_dir
            / "ai"
            / "models"
            / "yolo"
            / "yolo26s"
            / "best_26s.pt"
        )

        # [4] 모델 파일 존재 확인
        if not self.model_path.exists():
            raise FileNotFoundError(
                f"YOLO 모델 파일을 찾을 수 없습니다: {self.model_path}"
            )

        # [5] 서버 시작 시 모델 한 번만 로드
        self.model = YOLO(str(self.model_path))

    def count_detections(self, detections: list[dict]) -> dict:
        """
        탐지 결과에서 클래스별 개수를 계산합니다.

        예:
        [
            {"class_name": "PET"},
            {"class_name": "PET"},
            {"class_name": "CAN"},
        ]

        반환:
        {
            "PET": 2,
            "CAN": 1,
        }
        """

        counter = Counter(
            item["class_name"]
            for item in detections
        )

        return dict(counter)