"""이달의 적립왕 API 테스트 — 진짜 Supabase 대신 메모리 안의 가짜 DB를 쓴다 (키·인터넷 필요 없음, 실제 데이터 안 건드림)

실행 (backend 폴더에서):  .venv\\Scripts\\python -m unittest tests.test_ranking -v
"""
import sys
import types
import unittest
from datetime import date, datetime, time, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

KST = timezone(timedelta(hours=9))


def _dt(value: str) -> datetime:
    return datetime.fromisoformat(value.replace("Z", "+00:00"))


class FakeQuery:
    """supabase.table(...).select(...).eq/gt/gte/in_/order/range(...).execute() 흉내"""

    def __init__(self, db, name):
        self.db, self.name, self.filters, self.window = db, name, [], None

    def select(self, _cols):
        return self

    def eq(self, key, value):
        self.filters.append(lambda r, k=key, v=value: r.get(k) == v)
        return self

    def gt(self, key, value):
        self.filters.append(lambda r, k=key, v=value: r[k] > v)
        return self

    def gte(self, key, value):
        self.filters.append(lambda r, k=key, v=value: _dt(r[k]) >= _dt(v))
        return self

    def in_(self, key, values):
        self.filters.append(lambda r, k=key, v=tuple(values): r.get(k) in v)
        return self

    def order(self, key):
        self.order_key = key
        return self

    def range(self, start, end):
        self.window = (start, end)
        return self

    def execute(self):
        rows = [dict(r) for r in self.db.tables[self.name] if all(f(r) for f in self.filters)]
        if self.window:
            self.db.page_reads += 1
            rows = sorted(rows, key=lambda r: r["id"])[self.window[0]:self.window[1] + 1]
        return types.SimpleNamespace(data=rows)


class FakeSupabase:
    def __init__(self):
        self.tables = {"point_transactions": [], "profiles": []}
        self.next_id, self.page_reads, self.stages = 0, 0, {}

    def table(self, name):
        return FakeQuery(self, name)

    def rpc(self, name, params):
        assert name == "repick_forest_state"
        stage = self.stages.get(params["p_user_id"], 1)
        return types.SimpleNamespace(execute=lambda: types.SimpleNamespace(data={"stage": stage, "stage_name": f"{stage}단계"}))

    def add_user(self, uid, nickname):
        self.tables["profiles"].append({"id": uid, "nickname": nickname})

    def earn(self, uid, amount, when: datetime, currency="point"):
        self.next_id += 1
        self.tables["point_transactions"].append(
            {"id": self.next_id, "user_id": uid, "currency": currency, "amount": amount, "created_at": when.astimezone(timezone.utc).isoformat()}
        )


# 진짜 Supabase 연결(.env 필요) 대신 가짜를 끼워 넣고 순위 창구를 불러온다
fake_module = types.ModuleType("app.supabase_client")
fake_module.supabase = None
sys.modules["app.supabase_client"] = fake_module

from app.routers import ranking  # noqa: E402

TODAY = date(2026, 10, 20)
NOW = datetime.combine(TODAY, time(10, 0), KST)


def uid(n: int) -> str:
    return f"00000000-0000-0000-0000-{n:012d}"


class RankingTest(unittest.TestCase):
    def setUp(self):
        self.db = FakeSupabase()
        ranking.supabase = self.db
        ranking.today_kst = lambda: TODAY
        ranking._cache.update(month=None, at=0.0, ranked=[], top=[])
        for n in range(1, 16):
            self.db.add_user(uid(n), f"회원{n}")

    def read(self, user_n=None):
        ranking._cache.update(month=None)  # 테스트마다 캐시 없이 새로 계산
        return ranking.read_ranking(user={"id": uid(user_n), "email": "x"} if user_n else None)

    def test_order_by_points_this_month(self):
        self.db.earn(uid(1), 100, NOW)
        self.db.earn(uid(2), 300, NOW)
        self.db.earn(uid(3), 200, NOW)
        r = self.read()
        self.assertEqual(r["month"], "2026-10")
        self.assertEqual([(t["rank"], t["name"], t["points"]) for t in r["top"]], [(1, "회원2", 300), (2, "회원3", 200), (3, "회원1", 100)])
        self.assertNotIn("user_id", r["top"][0])  # 회원 id는 내보내지 않음

    def test_last_month_not_counted(self):
        # 한국 10/1 0시 직전(= 9월 30일 23:59)은 지난달 → 매달 1일 초기화
        self.db.earn(uid(1), 999, datetime(2026, 9, 30, 23, 59, tzinfo=KST))
        self.db.earn(uid(1), 10, datetime(2026, 10, 1, 0, 0, tzinfo=KST))
        self.assertEqual(self.read()["top"][0]["points"], 10)

    def test_spending_and_drops_not_counted(self):
        self.db.earn(uid(1), 500, NOW)
        self.db.earn(uid(1), -400, NOW)  # 기부(−)는 순위에서 빼지 않음
        self.db.earn(uid(2), 900, NOW, currency="drop")  # 물방울은 포인트가 아님
        r = self.read()
        self.assertEqual([(t["name"], t["points"]) for t in r["top"]], [("회원1", 500)])

    def test_tie_first_to_reach_wins(self):
        self.db.earn(uid(1), 100, NOW + timedelta(hours=2))
        self.db.earn(uid(2), 100, NOW + timedelta(hours=1))  # 같은 100P에 먼저 도달
        self.assertEqual([t["name"] for t in self.read()["top"]], ["회원2", "회원1"])

    def test_top_10_and_my_rank_outside(self):
        for n in range(1, 13):
            self.db.earn(uid(n), 1000 - n * 10, NOW)  # 회원1 990P … 회원12 880P
        r = self.read(user_n=12)
        self.assertEqual(len(r["top"]), 10)
        self.assertEqual(r["top"][-1]["points"], 900)  # 10위 = 회원10
        self.assertEqual(r["me"], {"rank": 12, "name": "회원12", "points": 880, "to_top10": 21})

    def test_my_rank_inside_top_10(self):
        self.db.earn(uid(1), 50, NOW)
        self.db.earn(uid(2), 80, NOW)
        self.assertEqual(self.read(user_n=1)["me"], {"rank": 2, "name": "회원1", "points": 50, "to_top10": 0})

    def test_me_without_points_and_logged_out(self):
        self.db.earn(uid(1), 50, NOW)
        self.assertEqual(self.read(user_n=5)["me"], {"rank": None, "name": "회원5", "points": 0, "to_top10": 1})
        self.assertIsNone(self.read()["me"])

    def test_empty_month(self):
        r = self.read(user_n=1)
        self.assertEqual(r["top"], [])
        self.assertEqual(r["me"]["rank"], None)

    def test_reads_in_pages_of_1000(self):
        for i in range(2500):
            self.db.earn(uid(1 + i % 3), 1, NOW)
        self.db.page_reads = 0
        r = self.read()
        self.assertEqual(self.db.page_reads, 3)  # 1000 + 1000 + 500
        self.assertEqual(sum(t["points"] for t in r["top"]), 2500)  # 한 줄도 안 빠짐

    def test_tree_stage_from_forest(self):
        self.db.stages[uid(1)] = 7
        self.db.earn(uid(1), 10, NOW)
        t = self.read()["top"][0]
        self.assertEqual((t["stage"], t["stage_name"]), (7, "7단계"))

    def test_cache_reused_within_a_minute(self):
        self.db.earn(uid(1), 10, NOW)
        ranking.read_ranking(user=None)
        self.db.earn(uid(2), 999, NOW)
        self.assertEqual(ranking.read_ranking(user=None)["top"][0]["name"], "회원1")  # 1분 안에는 저장해 둔 결과


if __name__ == "__main__":
    unittest.main()
