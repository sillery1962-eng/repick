import json
from datetime import date, datetime, timedelta, timezone
from pathlib import Path

# 오늘의 퀴즈 문제 목록 (backend/data/quizzes.json). 담당: 오지원
# - 정답(answer)이 들어 있으므로 이 파일 내용을 통째로 화면에 보내지 않는다.
# - 이미 저장된 푼 기록(quiz_answers.quiz_id)이 id를 가리키므로, 문제를 지우거나 id를 바꾸지 않는다.
#   더 이상 내지 않을 문제는 "active": false 로 바꾼다.

QUIZ_FILE = Path(__file__).resolve().parent.parent / "data" / "quizzes.json"
QUIZ_PER_DAY = 3
QUIZ_REWARD = 10  # 정답 1개당 포인트 (point_transactions type='quiz', currency='point')
QUIZ_BONUS = 50  # 오늘 3문제를 모두 맞히면 더 받는 보너스 포인트 (하루 1번)
KST = timezone(timedelta(hours=9))

ALL_QUIZZES: list[dict] = json.loads(QUIZ_FILE.read_text(encoding="utf-8"))
QUIZZES_BY_ID = {q["id"]: q for q in ALL_QUIZZES}
ACTIVE_QUIZZES = [q for q in ALL_QUIZZES if q.get("active", True)]


def today_kst() -> date:
    """한국 날짜 기준 오늘"""
    return datetime.now(KST).date()


def pick_today(day: date | None = None) -> list[dict]:
    """날짜에 따라 3문제씩 차례로 고른다 (같은 날에는 누구나 같은 문제, 10일이면 30문제가 한 바퀴)"""
    day = day or today_kst()
    start = (day.toordinal() * QUIZ_PER_DAY) % len(ACTIVE_QUIZZES)
    return [ACTIVE_QUIZZES[(start + i) % len(ACTIVE_QUIZZES)] for i in range(QUIZ_PER_DAY)]


def public_view(quiz: dict) -> dict:
    """화면에 보낼 모양 (정답·해설 빼고)"""
    return {"id": quiz["id"], "question": quiz["question"], "options": quiz["options"]}
