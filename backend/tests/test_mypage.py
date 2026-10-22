"""마이페이지 API 테스트 (쿠폰함·내 활동) — 진짜 Supabase 대신 메모리 안의 가짜 DB를 쓴다 (키·인터넷 필요 없음, 실제 데이터 안 건드림)

실행 (backend 폴더에서):  .venv\\Scripts\\python -m unittest tests.test_mypage -v
"""
import re
import sys
import types
import unittest
from pathlib import Path

sys.path.insert(0, str(Path(__file__).resolve().parent.parent))


class FakeQuery:
    """supabase.table(이름).select(...).eq/neq/in_(...).order(...).limit(...).execute() 흉내 (읽기만)"""

    def __init__(self, rows):
        self.rows, self.filters, self.sort, self.max = rows, [], None, None

    def select(self, _cols):
        return self

    def eq(self, key, value):
        self.filters.append(lambda r, k=key, v=value: r.get(k) == v)
        return self

    def neq(self, key, value):
        self.filters.append(lambda r, k=key, v=value: r.get(k) != v)
        return self

    def in_(self, key, values):
        values = set(values)
        self.filters.append(lambda r, k=key: r.get(k) in values)
        return self

    def order(self, key, desc=False):
        self.sort = (key, desc)
        return self

    def limit(self, n):
        self.max = n
        return self

    def execute(self):
        out = [dict(r) for r in self.rows if all(f(r) for f in self.filters)]
        if self.sort:
            out.sort(key=lambda r: r[self.sort[0]], reverse=self.sort[1])
        if self.max is not None:
            out = out[: self.max]
        return types.SimpleNamespace(data=out)


class FakeSupabase:
    def __init__(self, tables):
        self.tables = tables

    def table(self, name):
        return FakeQuery(self.tables.setdefault(name, []))


fake_module = types.ModuleType("app.supabase_client")
fake_module.supabase = None
sys.modules["app.supabase_client"] = fake_module

from app.routers import mypage  # noqa: E402

ME = {"id": "me", "email": "me@example.com"}
FRIEND = "friend"
STRANGER = "stranger"


def ts(day: int, hour: int = 9) -> str:
    return f"2026-10-{day:02d}T{hour:02d}:00:00+00:00"


class MyPageTest(unittest.TestCase):
    def setUp(self):
        self.db = FakeSupabase({
            "profiles": [
                {"id": "me", "nickname": "김나나"},
                {"id": FRIEND, "nickname": "리픽러"},
                {"id": STRANGER, "nickname": "초록이"},
            ],
            "reward_claims": [
                {"id": 1, "user_id": "me", "tier": 1, "trees_spent": 1, "item": "친환경 쿠폰", "choice": "gift", "created_at": ts(14)},
                {"id": 2, "user_id": "me", "tier": 3, "trees_spent": 3, "item": "에코백", "choice": "gift", "created_at": ts(20)},
                {"id": 3, "user_id": FRIEND, "tier": 2, "trees_spent": 2, "item": "재활용 노트", "choice": "gift", "created_at": ts(21)},
                {"id": 4, "user_id": "me", "tier": 5, "trees_spent": 5, "item": "텀블러", "choice": "gift", "created_at": ts(21)},
            ],
            "posts": [
                {"id": 10, "user_id": "me", "content": "오늘 페트병 5개 라벨 떼고 분리배출 완료!", "image_url": None, "is_verification": True, "created_at": ts(20)},
                {"id": 11, "user_id": "me", "content": "우리 동네 수거함 위치 공유해요", "image_url": None, "is_verification": False, "created_at": ts(18)},
                {"id": 20, "user_id": FRIEND, "content": "다 쓴 건전지 어디에 버려요? " + "가" * 60, "image_url": None, "is_verification": False, "created_at": ts(19)},
            ],
            "post_likes": [{"post_id": 10}, {"post_id": 10}, {"post_id": 11}, {"post_id": 20}],
            "comments": [
                {"id": 100, "post_id": 10, "user_id": FRIEND, "content": "라벨 떼는 거 저도 해 볼게요!", "created_at": ts(20, 10)},
                {"id": 101, "post_id": 10, "user_id": "me", "content": "고마워요 (내 글에 내가 쓴 답글)", "created_at": ts(20, 11)},
                {"id": 102, "post_id": 11, "user_id": STRANGER, "content": "위치 정보 감사해요", "created_at": ts(19, 8)},
                {"id": 103, "post_id": 20, "user_id": "me", "content": "주민센터 수거함에 넣으면 돼요", "created_at": ts(19, 12)},
                {"id": 104, "post_id": 20, "user_id": STRANGER, "content": "남의 글에 남이 쓴 댓글", "created_at": ts(19, 13)},
            ],
        })
        mypage.supabase = self.db

    # ----- 쿠폰함 -----
    def test_coupons_only_mine_newest_first(self):
        items = mypage.read_my_coupons(user=ME)["items"]
        self.assertEqual([c["item"] for c in items], ["텀블러", "에코백", "친환경 쿠폰"])  # 친구 것(재활용 노트)은 없음

    def test_coupon_kind_and_trees(self):
        by_item = {c["item"]: c for c in mypage.read_my_coupons(user=ME)["items"]}
        self.assertEqual(by_item["텀블러"]["kind"], "tumbler")
        self.assertEqual(by_item["에코백"]["kind"], "bag")
        self.assertEqual(by_item["친환경 쿠폰"]["kind"], "coupon")
        self.assertEqual(by_item["에코백"]["trees_spent"], 3)

    def test_coupon_code_shape_and_stable(self):
        items = mypage.read_my_coupons(user=ME)["items"]
        for c in items:
            self.assertRegex(c["code"], r"^RP-[A-HJ-NP-Z2-9]{8}$")  # 0·O·1·I 없음
        again = mypage.read_my_coupons(user=ME)["items"]
        self.assertEqual([c["code"] for c in items], [c["code"] for c in again])  # 다시 불러도 같은 번호
        self.assertEqual(len({c["code"] for c in items}), len(items))  # 쿠폰마다 다른 번호

    def test_no_coupons_is_empty_list(self):
        self.assertEqual(mypage.read_my_coupons(user={"id": "nobody", "email": ""})["items"], [])

    # ----- 내 활동 -----
    def test_my_posts_with_counts(self):
        posts = mypage.read_my_activity(user=ME)["posts"]
        self.assertEqual([p["id"] for p in posts], [10, 11])  # 최신순, 친구 글 없음
        self.assertEqual((posts[0]["like_count"], posts[0]["comment_count"]), (2, 2))
        self.assertEqual((posts[1]["like_count"], posts[1]["comment_count"]), (1, 1))
        self.assertTrue(posts[0]["is_verification"])

    def test_received_comments_exclude_my_own(self):
        received = mypage.read_my_activity(user=ME)["received_comments"]
        self.assertEqual([c["id"] for c in received], [100, 102])  # 내 글에 남이 쓴 것만, 최신순
        self.assertEqual(received[0]["nickname"], "리픽러")
        self.assertEqual(received[0]["post_excerpt"], "오늘 페트병 5개 라벨 떼고 분리배출 완료!")

    def test_my_comments_only_on_others_posts(self):
        mine = mypage.read_my_activity(user=ME)["my_comments"]
        self.assertEqual([c["id"] for c in mine], [103])  # 내 글에 단 답글(101)은 빠짐
        self.assertEqual(mine[0]["post_author"], "리픽러")
        self.assertTrue(mine[0]["post_excerpt"].endswith("…"))  # 긴 글은 40자에서 자름
        self.assertEqual(len(mine[0]["post_excerpt"]), 41)

    def test_new_member_has_empty_activity(self):
        a = mypage.read_my_activity(user={"id": "nobody", "email": ""})
        self.assertEqual((a["posts"], a["received_comments"], a["my_comments"]), ([], [], []))


if __name__ == "__main__":
    unittest.main()
