"""친구 초대 API 테스트 — 진짜 Supabase 대신 메모리 안의 가짜 DB를 쓴다 (키·인터넷 필요 없음, 실제 데이터 안 건드림)

실행 (backend 폴더에서):  .venv\\Scripts\\python -m unittest tests.test_friends -v
"""
import sys
import types
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))

from fastapi import HTTPException  # noqa: E402
from postgrest.exceptions import APIError  # noqa: E402


class FakeQuery:
    """select / update / insert + eq / is_ / order 흉내"""

    def __init__(self, db, name):
        self.db, self.name, self.rows = db, name, db.tables.setdefault(name, [])
        self.filters, self.sort, self.patch, self.new = [], None, None, None

    def select(self, _cols):
        return self

    def update(self, patch):
        self.patch = patch
        return self

    def insert(self, row):
        self.new = row
        return self

    def eq(self, key, value):
        self.filters.append(lambda r, k=key, v=value: r.get(k) == v)
        return self

    def is_(self, key, value):
        assert value == "null"
        self.filters.append(lambda r, k=key: r.get(k) is None)
        return self

    def order(self, key, desc=False):
        self.sort = (key, desc)
        return self

    def execute(self):
        if self.new is not None:
            if self.name == "point_transactions":  # 005 point_tx_no_dup
                key = lambda r: (r["user_id"], r["currency"], r["type"], r["ref_id"])  # noqa: E731
                if any(key(r) == key(self.new) for r in self.rows):
                    raise APIError({"code": "23505", "message": "duplicate"})
            self.rows.append(dict(self.new))
            return types.SimpleNamespace(data=[self.new])
        hits = [r for r in self.rows if all(f(r) for f in self.filters)]
        if self.patch is not None:
            for r in hits:
                r.update(self.patch)
            return types.SimpleNamespace(data=[dict(r) for r in hits])
        out = [dict(r) for r in hits]
        if self.sort:
            out.sort(key=lambda r: r[self.sort[0]], reverse=self.sort[1])
        return types.SimpleNamespace(data=out)


class FakeSupabase:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return FakeQuery(self, name)


fake_module = types.ModuleType("app.supabase_client")
fake_module.supabase = None
sys.modules["app.supabase_client"] = fake_module

from app.routers import friends  # noqa: E402


def profile(uid, code, referred_by=None, day=1):
    return {"id": uid, "nickname": f"닉-{uid}", "invite_code": code, "referred_by": referred_by, "created_at": f"2026-10-{day:02d}T00:00:00+00:00"}


class FriendsTest(unittest.TestCase):
    def setUp(self):
        self.db = FakeSupabase({
            "profiles": [profile("host", "AAAA1111"), profile("me", "BBBB2222")],
            "point_transactions": [],
        })
        friends.supabase = self.db

    def tx(self, user_id):
        return [(r["currency"], r["type"], r["amount"], r["ref_id"]) for r in self.db.tables["point_transactions"] if r["user_id"] == user_id]

    def add(self, uid, code):
        return friends.add_friend(friends.FriendCode(invite_code=code), {"id": uid})

    def test_my_status(self):
        self.db.tables["profiles"].append(profile("f1", "CCCC3333", referred_by="host", day=5))
        res = friends.read_my_friends({"id": "host"})
        self.assertEqual(res["invite_code"], "AAAA1111")
        self.assertEqual(res["friend_count"], 1)
        self.assertEqual(res["earned_drops"], 2)
        self.assertEqual(res["friends"], [{"nickname": "닉-f1", "joined_at": "2026-10-05T00:00:00+00:00"}])
        self.assertFalse(res["referred"])

    def test_enter_code_rewards_inviter(self):
        res = self.add("me", " aaaa1111 ")  # 소문자·빈칸도 받아 줌
        self.assertEqual(res["referrer_nickname"], "닉-host")
        self.assertEqual(self.tx("host"), [("drop", "referral", 2, "friend-me")])
        self.assertEqual(self.tx("me"), [])  # 입력한 사람은 보상 없음 (api-spec 5번)
        mine = friends.read_my_friends({"id": "me"})
        self.assertTrue(mine["referred"])
        self.assertEqual(mine["referrer_nickname"], "닉-host")

    def test_only_once(self):
        self.add("me", "AAAA1111")
        with self.assertRaises(HTTPException) as e:
            self.add("me", "AAAA1111")
        self.assertEqual(e.exception.status_code, 409)
        self.assertEqual(len(self.tx("host")), 1)

    def test_own_code(self):
        with self.assertRaises(HTTPException) as e:
            self.add("me", "BBBB2222")
        self.assertEqual(e.exception.status_code, 400)

    def test_unknown_code(self):
        with self.assertRaises(HTTPException) as e:
            self.add("me", "ZZZZ9999")
        self.assertEqual(e.exception.status_code, 404)

    def test_bonus_every_five(self):
        for i in range(1, 11):
            self.db.tables["profiles"].append(profile(f"f{i}", f"F{i:07d}"))
            self.add(f"f{i}", "AAAA1111")
        host = self.tx("host")
        self.assertEqual(sum(1 for t in host if t[1] == "referral"), 10)
        self.assertEqual([t for t in host if t[1] == "referral_bonus"],
                         [("point", "referral_bonus", 1000, "friends-5"), ("point", "referral_bonus", 1000, "friends-10")])
        res = friends.read_my_friends({"id": "host"})
        self.assertEqual((res["friend_count"], res["bonus_count"], res["progress"]), (10, 2, 0))


if __name__ == "__main__":
    unittest.main()
