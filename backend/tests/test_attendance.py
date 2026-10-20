"""출석 체크 API 테스트 — 진짜 Supabase 대신 메모리 안의 가짜 DB를 쓴다 (키·인터넷 필요 없음, 실제 데이터 안 건드림)

실행 (backend 폴더에서):  .venv\\Scripts\\python -m unittest tests.test_attendance -v
"""
import sys
import types
import unittest
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

from postgrest.exceptions import APIError

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

KST = timezone(timedelta(hours=9))


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


class FakeQuery:
    """supabase.table("point_transactions").select/insert(...).eq/gte(...).execute() 흉내"""

    def __init__(self, db):
        self.db, self.action, self.payload, self.filters = db, None, None, []

    def select(self, _cols):
        self.action = "select"
        return self

    def insert(self, row):
        self.action, self.payload = "insert", row
        return self

    def eq(self, key, value):
        self.filters.append(lambda r, k=key, v=value: r.get(k) == v)
        return self

    def gte(self, key, value):
        self.filters.append(lambda r, k=key, v=value: _dt(r[k]) >= _dt(v))
        return self

    def execute(self):
        rows = self.db.rows
        if self.action == "select":
            return types.SimpleNamespace(data=[dict(r) for r in rows if all(f(r) for f in self.filters)])
        new = dict(self.payload)
        new["created_at"] = self.db.now().astimezone(timezone.utc).isoformat()  # DB 기본값 now() (UTC)
        for r in rows:
            same_user = r["user_id"] == new["user_id"] and r["currency"] == new["currency"]
            # 002: 출석은 (회원, 화폐, 한국 날짜) 하루 1번
            if same_user and r["type"] == new["type"] == "attendance" and \
                    _dt(r["created_at"]).astimezone(KST).date() == _dt(new["created_at"]).astimezone(KST).date():
                raise APIError({"code": "23505", "message": "point_transactions_attendance_once_a_day_idx"})
            # 005: (회원, 화폐, type, ref_id) 한 번
            if same_user and new.get("ref_id") is not None and r["type"] == new["type"] and r.get("ref_id") == new["ref_id"]:
                raise APIError({"code": "23505", "message": "point_tx_no_dup"})
        self.db.next_id += 1
        new["id"] = self.db.next_id
        rows.append(new)
        return types.SimpleNamespace(data=[dict(new)])


class FakeSupabase:
    def __init__(self, now):
        self.rows, self.next_id, self.now = [], 0, now

    def table(self, name):
        assert name == "point_transactions"
        return FakeQuery(self)


# 진짜 Supabase 연결(.env 필요) 대신 가짜를 끼워 넣고 출석 창구를 불러온다
fake_module = types.ModuleType("app.supabase_client")
fake_module.supabase = None
sys.modules["app.supabase_client"] = fake_module

from fastapi import HTTPException  # noqa: E402

from app.routers import attendance  # noqa: E402

ME = {"id": "11111111-2222-3333-4444-555555555555", "email": "me@example.com"}
OTHER = {"id": "99999999-8888-7777-6666-555555555555", "email": "other@example.com"}
MONDAY = date(2026, 10, 19)  # 2026-10-19는 월요일


class AttendanceTest(unittest.TestCase):
    def setUp(self):
        self.clock = datetime.combine(MONDAY, time(10, 0), KST)  # 테스트 안의 "지금" (한국 시간)
        self.db = FakeSupabase(lambda: self.clock)
        attendance.supabase = self.db
        attendance.today_kst = lambda: self.clock.date()

    def go_to(self, day: date, at: time = time(10, 0)):
        self.clock = datetime.combine(day, at, KST)

    def attend(self, user=ME):
        return attendance.check_attendance(user=user)

    def status(self, user=ME):
        return attendance.read_attendance(user=user)

    def attend_days(self, days, user=ME):
        for d in days:
            self.go_to(d)
            self.attend(user)

    def test_first_attend_gives_one_drop(self):
        r = self.attend()
        self.assertEqual(r, {"drops_awarded": 1, "week_bonus": 0, "drops_balance": 1})
        row = self.db.rows[0]
        self.assertEqual((row["currency"], row["type"], row["amount"], row["ref_id"]), ("drop", "attendance", 1, "attend-2026-10-19"))

    def test_second_attend_same_day_is_409(self):
        self.attend()
        self.go_to(MONDAY, time(23, 59))
        with self.assertRaises(HTTPException) as ctx:
            self.attend()
        self.assertEqual(ctx.exception.status_code, 409)
        self.assertEqual(ctx.exception.detail, "오늘은 이미 출석했어요.")
        self.assertEqual(len(self.db.rows), 1)

    def test_next_day_can_attend_again(self):
        self.attend()
        self.go_to(MONDAY + timedelta(days=1))
        self.assertEqual(self.attend()["drops_balance"], 2)

    def test_after_midnight_kst_counts_as_new_day(self):
        # 한국 0시 30분 = UTC 전날 15시 30분 → 한국 날짜 기준으로 화요일 출석이어야 함
        self.attend()
        self.go_to(MONDAY + timedelta(days=1), time(0, 30))
        self.attend()
        self.assertEqual(self.status()["week"][:2], [True, True])

    def test_status_week_today_index_streak(self):
        self.attend_days([MONDAY, MONDAY + timedelta(days=1)])  # 월·화 출석
        self.go_to(MONDAY + timedelta(days=2))  # 수요일, 아직 안 함
        s = self.status()
        self.assertEqual(s["today"], "2026-10-21")
        self.assertEqual(s["today_index"], 2)
        self.assertEqual(s["week"], [True, True, False, False, False, False, False])
        self.assertFalse(s["checked_today"])
        self.assertEqual(s["streak"], 2)  # 오늘 안 했으면 어제부터
        self.attend()
        s = self.status()
        self.assertTrue(s["checked_today"])
        self.assertEqual(s["streak"], 3)

    def test_streak_resets_on_monday(self):
        last_sat, last_sun = MONDAY - timedelta(days=2), MONDAY - timedelta(days=1)
        self.attend_days([last_sat, last_sun])  # 지난주 토·일
        self.go_to(MONDAY)
        s = self.status()  # 월요일, 아직 안 함
        self.assertEqual(s["streak"], 0)  # 지난주 기록은 세지 않음 (월요일마다 0부터)
        self.attend()
        s = self.status()
        self.assertEqual(s["streak"], 1)  # 월요일 출석 = 1일째
        self.assertEqual(s["week"], [True] + [False] * 6)  # 이번 주는 월요일만

    def test_streak_breaks_on_missed_day(self):
        self.attend_days([MONDAY, MONDAY + timedelta(days=2), MONDAY + timedelta(days=3)])  # 월 X화 수 목
        self.assertEqual(self.status()["streak"], 2)  # 수·목 (화요일이 빠져서 끊김)

    def test_other_users_rows_not_counted(self):
        self.attend(OTHER)
        s = self.status(ME)
        self.assertEqual(s["week"], [False] * 7)
        self.assertEqual(s["streak"], 0)
        self.assertEqual(self.attend(ME)["drops_balance"], 1)  # 다른 사람 물방울은 내 잔액에 안 들어감

    def test_full_week_gives_bonus(self):
        self.attend_days([MONDAY + timedelta(days=i) for i in range(6)])  # 월~토
        self.go_to(MONDAY + timedelta(days=6))  # 일요일
        r = self.attend()
        self.assertEqual(r["week_bonus"], 7)
        self.assertEqual(r["drops_balance"], 7 + 7)  # 출석 7번 + 보너스 7
        bonus = [x for x in self.db.rows if x["type"] == "event"]
        self.assertEqual(len(bonus), 1)
        self.assertEqual((bonus[0]["currency"], bonus[0]["amount"], bonus[0]["ref_id"]), ("drop", 7, "attend-week-2026-10-19"))
        s = self.status()
        self.assertEqual(s["week"], [True] * 7)
        self.assertTrue(s["week_bonus_received"])

    def test_missed_day_no_bonus(self):
        self.attend_days([MONDAY + timedelta(days=i) for i in (0, 1, 2, 4, 5)])  # 목요일 빠짐
        self.go_to(MONDAY + timedelta(days=6))
        r = self.attend()
        self.assertEqual(r["week_bonus"], 0)
        self.assertFalse(self.status()["week_bonus_received"])

    def test_bonus_only_once_per_week(self):
        # 이번 주 보너스 줄이 이미 있으면(예: 두 번 눌림) 0으로 처리하고 오류 없음
        self.db.rows.append({"id": 0, "user_id": ME["id"], "currency": "drop", "type": "event", "amount": 7,
                             "ref_id": "attend-week-2026-10-19", "created_at": "2026-10-19T00:00:00+00:00"})
        self.attend_days([MONDAY + timedelta(days=i) for i in range(6)])
        self.go_to(MONDAY + timedelta(days=6))
        self.assertEqual(self.attend()["week_bonus"], 0)
        self.assertEqual(len([x for x in self.db.rows if x["type"] == "event"]), 1)

    def test_next_week_bonus_again(self):
        for week in range(2):
            start = MONDAY + timedelta(days=7 * week)
            self.attend_days([start + timedelta(days=i) for i in range(6)])
            self.go_to(start + timedelta(days=6))
            self.assertEqual(self.attend()["week_bonus"], 7)  # 다음 주에는 또 받을 수 있음


if __name__ == "__main__":
    unittest.main()
