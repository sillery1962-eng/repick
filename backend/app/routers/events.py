from fastapi import APIRouter, Depends, HTTPException, status
from postgrest.exceptions import APIError
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.quiz_bank import QUIZ_BONUS, QUIZ_PER_DAY, QUIZ_REWARD, QUIZZES_BY_ID, pick_today, public_view, today_kst
from app.supabase_client import supabase

# 오늘의 퀴즈 API. 담당: 오지원 (규칙: docs/api-spec.md 5번·8번)
# - 문제는 backend/data/quizzes.json, 푼 기록은 quiz_answers (문제마다 하루 한 줄), 포인트는 point_transactions
# - 첫 답은 맞든 틀리든 INSERT 한 줄. 다시 푼 답은 그 줄을 UPDATE (틀린 문제는 맞힐 때까지 몇 번이든)
# - +10P는 문제마다 한 번만: 첫 답이 정답일 때, 또는 is_correct가 false → true로 실제 바뀌었을 때만
# - +50P 보너스: 오늘 3줄이 모두 정답이 된 순간 하루 한 번
# - 중복 지급은 DB(point_tx_no_dup)가 막는다 → 거절되면 오류가 아니라 "이미 지급됨"으로 처리
# 출석은 포인트 API(POST /api/v1/points/attendance, 경난)에서 처리한다.
router = APIRouter(prefix="/api/v1/events", tags=["이벤트·퀴즈"])

UNIQUE_VIOLATION = "23505"  # PostgreSQL "같은 값이 이미 있음" 오류 번호


class QuizAnswer(BaseModel):
    """퀴즈 답 제출 때 받을 값"""

    quiz_id: str
    answer: str = Field(pattern="^[A-D]$")
    retry: bool = False  # 화면 호환용으로만 받는다. 다시 풀기인지는 서버가 DB 기록으로 판단한다


def _today_rows(user_id: str, day_iso: str) -> list[dict]:
    """오늘(한국 날짜) 내가 푼 퀴즈 기록"""
    res = (
        supabase.table("quiz_answers")
        .select("id, quiz_id, answer, is_correct")
        .eq("user_id", user_id)
        .eq("answered_on", day_iso)
        .execute()
    )
    return res.data or []


def _give_points(user_id: str, amount: int, ref_id: str) -> bool:
    """포인트 적립 한 줄. 새로 들어가면 True, 이미 지급된 줄이라 DB가 거절하면 False"""
    try:
        supabase.table("point_transactions").insert(
            {"user_id": user_id, "currency": "point", "type": "quiz", "amount": amount, "ref_id": ref_id}
        ).execute()
        return True
    except APIError as e:
        if e.code == UNIQUE_VIOLATION:
            return False  # 이미 지급됨
        raise


def _result(quiz: dict, answer: str, is_correct: bool, reward: int = 0, bonus: int = 0) -> dict:
    """답을 낸 뒤 화면에 보낼 모양 (이때부터 정답·해설을 보여 준다)"""
    return {
        "quiz_id": quiz["id"],
        "answer": answer,
        "is_correct": is_correct,
        "correct_answer": quiz["answer"],
        "explain": quiz["explain"],
        "reward": reward,
        "bonus": bonus,
    }


@router.get("/quiz/today")
def read_today_quiz(user: dict = Depends(get_current_user)):
    """오늘의 퀴즈 3문제 (정답·해설 없이) + answered: 오늘 이미 푼 문제의 결과"""
    day = today_kst()
    quizzes = pick_today(user["id"], day)
    today_ids = {q["id"] for q in quizzes}
    answered = {
        row["quiz_id"]: _result(QUIZZES_BY_ID[row["quiz_id"]], row["answer"], row["is_correct"])
        for row in _today_rows(user["id"], day.isoformat())
        if row["quiz_id"] in today_ids
    }
    return {
        "date": day.isoformat(),
        "reward": QUIZ_REWARD,
        "bonus": QUIZ_BONUS,
        "limit": QUIZ_PER_DAY,
        "items": [public_view(q) for q in quizzes],
        "answered": answered,
    }


@router.post("/quiz/answer")
def answer_quiz(body: QuizAnswer, user: dict = Depends(get_current_user)):
    """퀴즈 답 제출 → 정답 여부, 정답, 해설, 받은 포인트(reward 10 또는 0), 보너스(bonus 50 또는 0)"""
    user_id = user["id"]
    day = today_kst()
    day_iso = day.isoformat()
    today_ids = {q["id"] for q in pick_today(user_id, day)}

    # 1) 오늘 나에게 나온 3문제가 아니면 거절
    if body.quiz_id not in today_ids:
        raise HTTPException(status.HTTP_400_BAD_REQUEST, "오늘의 퀴즈가 아닙니다.")
    quiz = QUIZZES_BY_ID[body.quiz_id]
    is_correct = body.answer == quiz["answer"]  # key 글자("A"~"D")로 비교

    # 2) 오늘 이 문제를 처음 푸는지 확인
    rows = _today_rows(user_id, day_iso)
    row = next((r for r in rows if r["quiz_id"] == quiz["id"]), None)

    newly_correct = False
    retrying = row is not None
    if not retrying:
        # 첫 답: 맞든 틀리든 한 줄 저장
        try:
            res = supabase.table("quiz_answers").insert(
                {"user_id": user_id, "quiz_id": quiz["id"], "answer": body.answer,
                 "is_correct": is_correct, "answered_on": day_iso}
            ).execute()
            row = res.data[0]
            newly_correct = is_correct
        except APIError as e:
            if e.code != UNIQUE_VIOLATION:
                raise
            # 동시에 두 번 눌러 다른 요청이 먼저 저장함 → 그 줄로 다시 풀기 처리
            rows = _today_rows(user_id, day_iso)
            row = next(r for r in rows if r["quiz_id"] == quiz["id"])
            retrying = True

    if retrying:
        # 다시 풀기: 이미 맞힌 문제는 기록을 바꾸지 않는다 (맞힌 기록을 틀림으로 덮지 않음)
        if not row["is_correct"]:
            if is_correct:
                # false → true로 실제 바뀐 줄이 있을 때만 +10 (두 번 눌러도 한 번만)
                res = (
                    supabase.table("quiz_answers")
                    .update({"answer": body.answer, "is_correct": True})
                    .eq("id", row["id"])
                    .eq("is_correct", False)
                    .execute()
                )
                newly_correct = bool(res.data)
            else:
                supabase.table("quiz_answers").update({"answer": body.answer}).eq("id", row["id"]).execute()

    # 3) +10P (문제마다 한 번, ref_id = quiz_answers.id)
    reward = QUIZ_REWARD if newly_correct and _give_points(user_id, QUIZ_REWARD, str(row["id"])) else 0

    # 4) 오늘 3문제가 모두 정답이 됐으면 보너스 +50P (하루 한 번, ref_id = bonus-YYYY-MM-DD)
    bonus = 0
    if newly_correct:
        today_rows = [r for r in _today_rows(user_id, day_iso) if r["quiz_id"] in today_ids]
        if len(today_rows) == QUIZ_PER_DAY and all(r["is_correct"] for r in today_rows):
            if _give_points(user_id, QUIZ_BONUS, f"bonus-{day_iso}"):
                bonus = QUIZ_BONUS

    return _result(quiz, body.answer, is_correct, reward, bonus)
