import json
import random
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
ACTIVE_QUIZZES = [q for q in ALL_QUIZZES if q.get("active") is True]  # active가 true인 문제만 낸다


def today_kst() -> date:
    """한국 날짜 기준 오늘"""
    return datetime.now(KST).date()


def user_order(user_id: str) -> list[dict]:
    """회원 id를 씨앗으로 섞은 문제 순서 (회원마다 다르고, 같은 회원은 늘 같은 순서)"""
    order = list(ACTIVE_QUIZZES)
    random.Random(user_id).shuffle(order)
    return order


def unsolved(user_id: str, solved_ids: set[str]) -> list[dict]:
    """아직 맞히지 않은 문제 (회원 순서대로). 비어 있으면 준비된 문제를 모두 맞힌 것"""
    return [q for q in user_order(user_id) if q["id"] not in solved_ids]


def pick_today(user_id: str, solved_before: set[str] = frozenset()) -> list[dict]:
    """오늘의 문제: 회원 순서에서 어제까지 맞힌 문제를 빼고 앞에서 3개.
    - 오늘 맞힌 문제는 빼지 않는다 → 같은 날에는 새로고침해도 같은 3문제
    - 다음 날(한국 0시)에는 어제 맞힌 문제가 빠져 다음 문제가 나온다. 틀리고 못 맞힌 문제는 다시 나온다
    - 남은 문제가 3개보다 적으면 남은 만큼만, 모두 맞혔으면 빈 목록"""
    return unsolved(user_id, solved_before)[:QUIZ_PER_DAY]


def public_view(quiz: dict) -> dict:
    """화면에 보낼 모양 (정답·해설 빼고)"""
    return {"id": quiz["id"], "question": quiz["question"], "options": quiz["options"]}
