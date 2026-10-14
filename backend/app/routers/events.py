from fastapi import APIRouter, Depends
from pydantic import BaseModel, Field

from app.auth import get_current_user

# ⚠️ 가짜 API (화면 연결 연습용). 담당: [이름]
# 오늘의 퀴즈(하루 3문제, 맞히면 문제마다 보상)와 출석.
# 정답은 화면에 내려주지 않고, 답을 받은 뒤 서버에서 맞는지 판단한다.
# 보상 단위(물방울 또는 포인트)와 개수는 팀에서 아직 정하지 않았다. 적립은 add_points()로만 한다.
router = APIRouter(prefix="/api/v1/events", tags=["이벤트·퀴즈 (가짜)"])

SAMPLE_QUIZZES = [
    {
        "id": "q-pet-bin",
        "question": "다음 중 '투명 페트병 전용 수거함'에 넣을 수 있는 것은?",
        "options": [
            {"key": "A", "text": "라벨을 뗀 초록색 사이다 페트병"},
            {"key": "B", "text": "깨끗이 씻은 투명 플라스틱 일회용 컵"},
            {"key": "C", "text": "라벨을 떼고 찌그러뜨린 투명 생수병"},
            {"key": "D", "text": "투명한 플라스틱 과일 용기"},
        ],
        "answer": "C",
        "explain": "전용 수거함은 투명한 생수병과 음료 페트병만 받습니다.",
    },
    {
        "id": "q-coated-paper",
        "question": "다음 중 종이류로 배출하면 '안 되는' 것은?",
        "options": [
            {"key": "A", "text": "스프링을 뺀 노트"},
            {"key": "B", "text": "비닐 코팅된 광고 전단지"},
            {"key": "C", "text": "펼친 과자 상자"},
            {"key": "D", "text": "다 읽은 신문지"},
        ],
        "answer": "B",
        "explain": "코팅된 종이는 물에 잘 풀리지 않아 종이 재활용을 방해합니다.",
    },
    {
        "id": "q-paper-cup",
        "question": "다 쓴 종이컵을 버리는 올바른 방법은?",
        "options": [
            {"key": "A", "text": "일반 종이류와 함께 섞어서 버린다"},
            {"key": "B", "text": "플라스틱류로 배출한다"},
            {"key": "C", "text": "헹군 뒤 따로 모아 묶거나 종이팩과 함께 배출한다"},
            {"key": "D", "text": "코팅이 있으니 무조건 종량제 봉투에 버린다"},
        ],
        "answer": "C",
        "explain": "종이컵은 안쪽이 코팅되어 있어 일반 종이와 재활용 공정이 다릅니다.",
    },
]
QUIZ_REWARD = 50


class QuizAnswer(BaseModel):
    """퀴즈 답 제출 때 받을 값"""

    choice: str = Field(pattern="^[A-D]$")


@router.get("/quiz/today")
def read_today_quiz(user: dict = Depends(get_current_user)):
    """오늘의 퀴즈 3문제 (정답·해설 없이)"""
    items = [{k: q[k] for k in ("id", "question", "options")} for q in SAMPLE_QUIZZES]
    return {"is_mock": True, "reward": QUIZ_REWARD, "items": items, "answered": {}}


@router.post("/quiz/{quiz_id}/answer")
def answer_quiz(quiz_id: str, body: QuizAnswer, user: dict = Depends(get_current_user)):
    """퀴즈 답 제출 → 정답 여부, 정답, 해설, 받은 보상"""
    quiz = next((q for q in SAMPLE_QUIZZES if q["id"] == quiz_id), SAMPLE_QUIZZES[0])
    correct = body.choice == quiz["answer"]
    return {
        "is_mock": True,
        "quiz_id": quiz_id,
        "correct": correct,
        "answer": quiz["answer"],
        "explain": quiz["explain"],
        "reward": QUIZ_REWARD if correct else 0,
    }


@router.get("/attendance")
def read_attendance(user: dict = Depends(get_current_user)):
    """이번 주 출석 (월~일)"""
    return {"is_mock": True, "week": [True, True, True, True, True, False, False], "attended_today": False}


@router.post("/attendance")
def attend(user: dict = Depends(get_current_user)):
    """오늘 출석하기 (실제로는 하루 한 번만, attendance 적립은 add_points()로)"""
    return {"is_mock": True, "attended_today": True, "streak": 6}
