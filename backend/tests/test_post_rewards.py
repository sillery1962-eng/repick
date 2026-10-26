"""인증 게시글의 출처와 관계없이 하루 보상 5회를 함께 센다."""
import sys
import types
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

fake_module = types.ModuleType("app.supabase_client")
fake_module.supabase = None
sys.modules["app.supabase_client"] = fake_module

from app import points  # noqa: E402
from app.routers import posts  # noqa: E402

KST = timezone(timedelta(hours=9))


class FakeQuery:
    def __init__(self, db, name):
        self.db, self.name = db, name
        self.filters = []
        self.inserted = None
        self.count_requested = False

    def select(self, _columns, count=None):
        self.count_requested = count == "exact"
        return self

    def eq(self, key, value):
        self.filters.append(lambda row: row.get(key) == value)
        return self

    def gte(self, key, value):
        self.filters.append(lambda row: datetime.fromisoformat(row[key]) >= datetime.fromisoformat(value))
        return self

    def insert(self, rows):
        self.inserted = rows if isinstance(rows, list) else [rows]
        return self

    def execute(self):
        table = self.db.tables[self.name]
        if self.inserted is not None:
            for row in self.inserted:
                if self.name == "point_transactions" and any(
                    all(existing[key] == row[key] for key in ("user_id", "currency", "type", "ref_id"))
                    for existing in table
                ):
                    raise ValueError("23505 duplicate key")
            created = []
            for row in self.inserted:
                item = {**row, "id": len(table) + 1, "created_at": self.db.now.isoformat()}
                table.append(item)
                created.append(item)
            return types.SimpleNamespace(data=created)
        found = [row for row in table if all(condition(row) for condition in self.filters)]
        return types.SimpleNamespace(data=found, count=len(found) if self.count_requested else None)


class FakeSupabase:
    def __init__(self):
        self.now = datetime(2026, 10, 23, 12, tzinfo=KST)
        self.tables = {"posts": [], "point_transactions": []}

    def table(self, name):
        return FakeQuery(self, name)


class PostRewardsTest(unittest.TestCase):
    def setUp(self):
        self.db = FakeSupabase()
        posts.supabase = self.db
        points.supabase = self.db
        self.to_posts = posts._to_posts
        self.today_start = posts._today_start_kst
        posts._to_posts = lambda rows, _viewer: [{"id": row["id"]} for row in rows]
        posts._today_start_kst = lambda: self.db.now.replace(
            hour=0, minute=0, second=0, microsecond=0,
        ).isoformat()

    def tearDown(self):
        posts._to_posts = self.to_posts
        posts._today_start_kst = self.today_start

    def post(self, is_verification, user_id="me"):
        return posts.create_post(
            content="분리배출 실천", image=None,
            is_verification=is_verification, user={"id": user_id},
        )

    def test_ai_and_community_verification_posts_share_five_rewards(self):
        # 두 화면 모두 is_verification=True로 보내면 같은 /posts 경로에서 합산된다.
        for _ in range(3):
            self.assertEqual(self.post(True)["drops_awarded"], 1)
        self.assertEqual(self.post(False)["drops_awarded"], 0)
        for _ in range(2):
            self.assertEqual(self.post(True)["points_awarded"], 1)
        self.assertEqual(self.post(True)["drops_awarded"], 0)
        tx = self.db.tables["point_transactions"]
        self.assertEqual(len(tx), 10)
        self.assertEqual(sum(row["currency"] == "drop" for row in tx), 5)
        self.assertEqual(sum(row["currency"] == "point" for row in tx), 5)

    def test_next_day_and_other_user_have_their_own_allowance(self):
        for _ in range(5):
            self.post(True)
        self.assertEqual(self.post(True, "friend")["drops_awarded"], 1)
        self.db.now += timedelta(days=1)
        self.assertEqual(self.post(True)["drops_awarded"], 1)

    def test_same_post_cannot_receive_reward_twice(self):
        post = self.post(True)
        self.assertEqual(posts.award_post_verify("me", post["id"]), posts.NO_REWARD)
        self.assertEqual(len(self.db.tables["point_transactions"]), 2)


if __name__ == "__main__":
    unittest.main()
