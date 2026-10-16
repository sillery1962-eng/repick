from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.quiz_bank import QUIZ_BONUS, QUIZ_PER_DAY, QUIZ_REWARD, QUIZZES_BY_ID, pick_today, public_view, today_kst

# ⚠️ 반쯤 가짜 API. 담당: 오지원
# 문제 고르기·정답 확인은 진짜(backend/data/quizzes.json)이고, 저장과 보상은 아직 없다 (공통 DB 준비 중).
# DB가 생기면 답 제출 때 할 일:
#   1. quiz_answers에 (user_id, quiz_id, answer, is_correct) 저장 — 틀린 답도 저장
#      · 오늘 저장된 줄이 3개면 거절 (하루 3개 제한)
#      · 같은 날 같은 문제는 DB가 거부한다
#   2. 정답이면 add_points(type='quiz', currency='point', amount=10)
#   3. 오늘 3번째 답까지 저장했고 3개 모두 정답이면 보너스 add_points(type='quiz', currency='point', amount=50) — 하루 1번
#   4. 다시 풀기(retry=true): 틀린 문제를 다시 풀어 맞히면 10P, 보너스는 없음
#      ⚠️ quiz_answers는 같은 날 같은 문제를 한 줄만 저장하므로(003), 다시 푼 기록을 어디에 남길지 현숙 님과 정하기
#         (안: quiz_answers는 첫 답 그대로, 다시 맞힌 10P는 point_transactions에만 ref_id=quiz_id로)
# 출석은 포인트 API(POST /api/v1/points/attendance, 경난)에서 처리한다.
router = APIRouter(prefix="/api/v1/events", tags=["이벤트·퀴즈 (가짜)"])


class QuizAnswer(BaseModel):
    """퀴즈 답 제출 때 받을 값"""

    quiz_id: str
    answer: str = Field(pattern="^[A-D]$")
    retry: bool = False  # 틀린 문제를 다시 푸는 중이면 true (맞히면 10P, 보너스 없음)


@router.get("/quiz/today")
def read_today_quiz(user: dict = Depends(get_current_user)):
    """오늘의 퀴즈 3문제 (정답·해설 없이). answered: 오늘 이미 푼 문제 결과 (DB 연결 후 채움)"""
    return {
        "is_mock": True,
        "date": today_kst().isoformat(),
        "reward": QUIZ_REWARD,
        "bonus": QUIZ_BONUS,
        "limit": QUIZ_PER_DAY,
        "items": [public_view(q) for q in pick_today()],
        "answered": {},
    }


@router.post("/quiz/answer")
def answer_quiz(body: QuizAnswer, user: dict = Depends(get_current_user)):
    """퀴즈 답 제출 → 정답 여부, 정답, 해설, 받은 포인트(reward), 3문제 모두 정답 보너스(bonus, 마지막 답에서만 50)"""
    quiz = QUIZZES_BY_ID.get(body.quiz_id)
    if quiz is None:
        raise HTTPException(status.HTTP_404_NOT_FOUND, "문제를 찾을 수 없습니다.")
    if quiz["id"] not in {q["id"] for q in pick_today()}:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "오늘의 퀴즈가 아닙니다.")

    is_correct = body.answer == quiz["answer"]
    return {
        "is_mock": True,
        "quiz_id": quiz["id"],
        "answer": body.answer,
        "is_correct": is_correct,
        "correct_answer": quiz["answer"],
        "explain": quiz["explain"],
        "reward": QUIZ_REWARD if is_correct else 0,
        # 가짜 API는 앞의 답을 저장하지 않아 "모두 정답"을 알 수 없으므로 0. DB 연결 후 계산한다.
        "bonus": 0,
    }
