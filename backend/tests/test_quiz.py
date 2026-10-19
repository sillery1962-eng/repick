"""퀴즈 API 규칙 테스트 — 진짜 Supabase 대신 메모리 안의 가짜 DB를 쓴다 (키·인터넷 필요 없음, 실제 데이터 안 건드림)

실행 (backend 폴더에서):  .venv\\Scripts\\python -m unittest tests.test_quiz -v
"""
import sys
import types
import unittest
from pathlib import Path

from postgrest.exceptions import APIError

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class FakeQuery:
    """supabase.table(...).select/insert/update(...).eq(...).execute() 흉내"""

    def __init__(self, db, name):
        self.db, self.name, self.action, self.payload, self.filters = db, name, None, None, []

    def select(self, _cols):
        self.action = "select"
        return self

    def insert(self, row):
        self.action, self.payload = "insert", row
        return self

    def update(self, values):
        self.action, self.payload = "update", values
        return self

    def eq(self, key, value):
        self.filters.append((key, value))
        return self

    def execute(self):
        rows = self.db.tables[self.name]
        match = [r for r in rows if all(r.get(k) == v for k, v in self.filters)]
        if self.action == "select":
            return types.SimpleNamespace(data=[dict(r) for r in match])
        if self.action == "update":
            for r in match:
                r.update(self.payload)
            return types.SimpleNamespace(data=[dict(r) for r in match])
        # insert: DB의 unique 규칙 흉내 (006 quiz_answers_once_per_day, 005 point_tx_no_dup)
        new = dict(self.payload)
        keys = self.db.unique[self.name]
        if new.get("ref_id", "") is not None and any(all(r.get(k) == new.get(k) for k in keys) for r in rows):
            raise APIError({"code": "23505", "message": "duplicate key value violates unique constraint"})
        self.db.next_id += 1
        new["id"] = self.db.next_id
        rows.append(new)
        return types.SimpleNamespace(data=[dict(new)])


class FakeSupabase:
    def __init__(self):
        self.tables = {"quiz_answers": [], "point_transactions": []}
        self.unique = {
            "quiz_answers": ("user_id", "answered_on", "quiz_id"),
            "point_transactions": ("user_id", "currency", "type", "ref_id"),
        }
        self.next_id = 0

    def table(self, name):
        return FakeQuery(self, name)


# 진짜 Supabase 연결(.env 필요) 대신 가짜를 끼워 넣고 퀴즈 창구를 불러온다
fake_module = types.ModuleType("app.supabase_client")
fake_module.supabase = FakeSupabase()
sys.modules["app.supabase_client"] = fake_module

from fastapi import HTTPException  # noqa: E402

from app import quiz_bank  # noqa: E402
from app.routers import events  # noqa: E402

USER = {"id": "11111111-2222-3333-4444-555555555555", "email": "test@example.com"}


def wrong_key(quiz):
    return next(o["key"] for o in quiz["options"] if o["key"] != quiz["answer"])


class QuizRulesTest(unittest.TestCase):
    def setUp(self):
        self.db = FakeSupabase()
        events.supabase = self.db
        self.quizzes = quiz_bank.pick_today(USER["id"])

    def answer(self, quiz, key):
        return events.answer_quiz(events.QuizAnswer(quiz_id=quiz["id"], answer=key), user=USER)

    def points(self):
        return [t for t in self.db.tables["point_transactions"] if t["user_id"] == USER["id"]]

    def test_today_hides_answer_and_explain(self):
        data = events.read_today_quiz(user=USER)
        self.assertEqual(len(data["items"]), 3)
        for item in data["items"]:
            self.assertNotIn("answer", item)
            self.assertNotIn("explain", item)

    def test_same_quizzes_same_day_and_per_user(self):
        self.assertEqual(self.quizzes, quiz_bank.pick_today(USER["id"]))  # 새로고침해도 같은 3문제
        self.assertEqual(len({q["id"] for q in self.quizzes}), 3)  # 서로 다른 3문제
        self.assertTrue(all(q["active"] is True for q in self.quizzes))

    def test_correct_gives_10_then_again_0(self):
        q = self.quizzes[0]
        self.assertEqual(self.answer(q, q["answer"])["reward"], 10)  # 정답 → +10
        self.assertEqual(self.answer(q, q["answer"])["reward"], 0)  # 같은 문제 또 정답 → 0
        self.assertEqual(sum(t["amount"] for t in self.points()), 10)
        self.assertEqual(len(self.db.tables["quiz_answers"]), 1)  # 줄은 하나

    def test_wrong_then_retry_correct_gives_10(self):
        q = self.quizzes[0]
        first = self.answer(q, wrong_key(q))
        self.assertFalse(first["is_correct"])
        self.assertEqual(first["reward"], 0)  # 틀림 → 0
        self.assertEqual(self.answer(q, wrong_key(q))["reward"], 0)  # 또 틀려도 다시 풀 수 있음
        self.assertEqual(self.answer(q, q["answer"])["reward"], 10)  # 다시 풀어 정답 → +10
        self.assertEqual(self.answer(q, q["answer"])["reward"], 0)  # 그 뒤 또 정답 → 0
        self.assertEqual(len(self.db.tables["quiz_answers"]), 1)  # 새 줄이 아니라 같은 줄을 고침
        self.assertEqual(self.points()[0]["ref_id"], str(self.db.tables["quiz_answers"][0]["id"]))

    def test_correct_answer_not_overwritten_by_wrong(self):
        q = self.quizzes[0]
        self.answer(q, q["answer"])
        self.answer(q, wrong_key(q))
        self.assertTrue(self.db.tables["quiz_answers"][0]["is_correct"])

    def test_all_three_correct_gives_bonus_once(self):
        q1, q2, q3 = self.quizzes
        self.assertEqual(self.answer(q1, q1["answer"])["bonus"], 0)
        self.answer(q2, wrong_key(q2))
        self.assertEqual(self.answer(q3, q3["answer"])["bonus"], 0)  # 아직 하나 틀림
        self.assertEqual(self.answer(q2, q2["answer"])["bonus"], 50)  # 다시 풀어 3개 다 정답 → +50
        self.assertEqual(self.answer(q2, q2["answer"])["bonus"], 0)  # 한 번만
        bonus = [t for t in self.points() if t["amount"] == 50]
        self.assertEqual(len(bonus), 1)
        self.assertTrue(bonus[0]["ref_id"].startswith("bonus-"))
        self.assertEqual(sum(t["amount"] for t in self.points()), 80)  # 10×3 + 50
        self.assertTrue(all(t["currency"] == "point" and t["type"] == "quiz" for t in self.points()))

    def test_not_today_quiz_rejected(self):
        today_ids = {q["id"] for q in self.quizzes}
        other = next(q for q in quiz_bank.ACTIVE_QUIZZES if q["id"] not in today_ids)
        for quiz_id in (other["id"], "no-such-quiz"):
            with self.assertRaises(HTTPException) as ctx:
                events.answer_quiz(events.QuizAnswer(quiz_id=quiz_id, answer="A"), user=USER)
            self.assertEqual(ctx.exception.status_code, 400)
        self.assertEqual(self.db.tables["quiz_answers"], [])

    def test_today_shows_answered_after_answer(self):
        q = self.quizzes[0]
        self.answer(q, wrong_key(q))
        answered = events.read_today_quiz(user=USER)["answered"]
        self.assertEqual(list(answered), [q["id"]])
        self.assertFalse(answered[q["id"]]["is_correct"])
        self.assertIn("explain", answered[q["id"]])  # 답을 낸 뒤에는 해설을 보여 줌


if __name__ == "__main__":
    unittest.main()
