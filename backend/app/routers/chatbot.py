"""
POTEN (Potential · Environment) - 분리배출 / 대형폐기물 수수료 안내 챗봇 API

외부 LLM 없이 Pandas 검색 + 규칙 기반으로 답변을 조립한다.
  1순위: data/large_waste.csv   (대형폐기물 품목명 + 규격 교차 매칭 → 수수료/접수처)
  2순위: data/general_waste.csv (품목명 매칭 → 배출 유형/방법/주의사항)
  3순위: 캐릭터 말투의 재질문(Fallback)

엔드포인트:
  - POST /chat     (프론트엔드 연동용 명세서 규격)
  - POST /api/chat (기존 테스트 및 이전 규격 호환용)

실행:  python main.py
"""

from __future__ import annotations

import logging
import re
from contextlib import asynccontextmanager
from pathlib import Path
from typing import Literal, Optional

import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse, JSONResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel, Field

logger = logging.getLogger("poten")
logging.basicConfig(level=logging.INFO, format="%(asctime)s [%(levelname)s] %(message)s")

BASE_DIR = Path(__file__).resolve().parents[2]
DATA_DIR = BASE_DIR / "data"
GENERAL_CSV = DATA_DIR / "general_waste.csv"
LARGE_CSV = DATA_DIR / "large_waste.csv"
STATIC_DIR = BASE_DIR / "static"
CHAT_PAGE = STATIC_DIR / "index.html"

# ---------------------------------------------------------------------------
# 캐릭터 페르소나
# ---------------------------------------------------------------------------
CHARACTER_NAME = "포티"
GREETING = "🌱 안녕하세요, POTEN의 분리배출 도우미 **포티**예요!"
FREE_COLLECTION_TIP = (
    "💡 폐가전은 **무상 방문수거(☎ 1599-0903, 15990903.or.kr)** 대상일 수 있어요. "
    "먼저 확인해 보시면 수수료를 아낄 수 있답니다!"
)

# 구청 대표전화 (출처: 서울특별시 자치구 안내 https://www.seoul.go.kr/seoul/autonomy.do)
DISTRICT_PHONES = {
    "종로구": "02-2148-1114",
    "중구": "02-3396-4114",
    "용산구": "02-2199-6114",
    "성북구": "02-2241-3114",
    "중랑구": "02-2094-0114",
    "노원구": "02-2116-3114",
    "양천구": "02-2620-3114",
    "강서구": "02-2600-6114",
    "구로구": "02-860-2114",
    "관악구": "02-879-5000",
    "서초구": "02-2155-6114",
    "강남구": "02-3423-5114",
    "마포구": "02-3153-8114",
    "영등포구": "02-2670-3114",
}
SEOUL_CALL_CENTER = "120"  # 다산콜센터

# 서울시 25개 자치구
SEOUL_DISTRICTS = [
    "종로구", "중구", "용산구", "성동구", "광진구", "동대문구", "중랑구", "성북구", "강북구",
    "도봉구", "노원구", "은평구", "서대문구", "마포구", "양천구", "강서구", "구로구", "금천구",
    "영등포구", "동작구", "관악구", "서초구", "강남구", "송파구", "강동구",
]

# 동의어 그룹
SYNONYM_GROUPS = [
    ["tv", "티비", "텔레비전", "텔레비젼"],
    ["소파", "쇼파"],
    ["매트리스", "메트리스", "매트래스"],
    ["에어컨", "에어콘"],
    ["컴퓨터", "데스크탑", "데스크톱"],
    ["전자레인지", "전자렌지"],
    ["장롱", "장농", "옷장"],
    ["책장", "책꽂이"],
    ["캔", "음료캔", "주류캔"],
    ["페트병", "pet병", "페트"],
    ["우유팩", "종이팩", "두유팩"],
    # "배터리"를 같은 묶음에 두면 건전지 질문이 대형폐기물 "자동차 배터리"에 걸려서 뺐다
    ["건전지", "폐건전지", "폐전지", "폐전지류", "폐배터리"],
    ["스티로폼", "스티로품", "스치로폼"],
    ["비닐봉지", "비닐봉투", "비닐"],
    ["헌옷", "의류", "옷가지"],
    ["형광등", "폐형광등"],
    ["달걀", "계란"],
    ["껍데기", "껍질"],
    ["닭뼈", "치킨뼈"],
]
SYNONYM_WORDS = {word for group in SYNONYM_GROUPS for word in group}

# 품목명 토큰에서 제외할 일반어
NAME_STOP_TOKENS = {
    "기타", "모든", "관련", "일반", "대형", "소형", "중형", "별도", "유리별도", "포함", "제외",
    "등", "것", "류", "및", "용", "개당", "이상", "미만", "이하", "초과",
}
# 메시지 단어 중 품목 검색에 쓰지 않을 일반어
MESSAGE_STOP_WORDS = {
    "버리", "버려", "버리기", "버리려면", "버리는", "버릴", "버려요", "버리고", "어떻게", "어디",
    "얼마", "얼마예요", "얼마에요", "수수료", "가격", "비용", "배출", "방법", "분리", "분리배출",
    "수거", "신고", "처리", "대형", "폐기물", "대형폐기물", "쓰레기", "알려줘", "알려주세요",
    "궁금", "궁금해요", "하나요", "해요", "있나요", "되나요", "인가요", "서울", "서울시", "우리",
    "집", "이거", "그거", "저거", "안녕", "안녕하세요",
}
JOSA_SUFFIXES = (
    "으로는", "에서는", "이랑", "에서", "으로", "까지", "부터", "는요", "은요", "이요",
    "은", "는", "이", "가", "을", "를", "에", "도", "요", "로", "랑", "와", "과", "의",
)
# 이 단어만 맞았을 때는 특정 품목으로 단정하지 않는다 (예: "바나나 껍질" → "조개 껍데기" 방지)
GENERIC_FOOD_WORDS = {"껍질", "껍데기", "뼈", "씨", "씨앗"}
# "큰소파", "폐가구"처럼 품목명 앞에 붙는 한 글자 수식어
MODIFIER_PREFIXES = {"큰", "새", "헌", "폐", "낡", "옛", "빈", "긴", "작"}
SPEC_STOP_TOKENS = {"모든", "규격", "모든규격", "이상", "미만", "이하", "초과", "개당", "기준"}

# 숫자+단위 파싱
UNIT_TABLE = {
    "인치": ("inch", 1.0), "inch": ("inch", 1.0), "형": ("inch", 1.0),
    "인용": ("seat", 1.0), "인승": ("seat", 1.0), "인": ("seat", 1.0),
    "리터": ("liter", 1.0), "l": ("liter", 1.0), "ℓ": ("liter", 1.0),
    "mm": ("len", 0.1), "cm": ("len", 1.0), "㎝": ("len", 1.0), "센티": ("len", 1.0),
    "m": ("len", 100.0), "미터": ("len", 100.0),
    "kg": ("kg", 1.0), "㎏": ("kg", 1.0), "킬로": ("kg", 1.0), "키로": ("kg", 1.0),
    "단": ("tier", 1.0), "칸": ("tier", 1.0), "자": ("ja", 1.0),
}
_UNIT_PATTERN = "|".join(sorted((re.escape(u) for u in UNIT_TABLE), key=len, reverse=True))
NUM_UNIT_RE = re.compile(rf"(\d+(?:\.\d+)?)\s*({_UNIT_PATTERN})\s*(이상|미만|이하|초과)?", re.IGNORECASE)
SPLIT_RE = re.compile(r"[\s()\[\]{}/·・,，\*\-~_+&|:;]+")


# ---------------------------------------------------------------------------
# 유틸
# ---------------------------------------------------------------------------
def normalize(text: object) -> str:
    if text is None or (isinstance(text, float) and pd.isna(text)):
        return ""
    return re.sub(r"[^0-9a-z가-힣ℓ㎝㎏]", "", str(text).lower())


def safe_str(value: object) -> str:
    if value is None or (isinstance(value, float) and pd.isna(value)):
        return ""
    return str(value).strip()


def format_fee(fee: int) -> str:
    return "무료(0원)" if fee <= 0 else f"{fee:,}원"


def strip_josa(word: str) -> str:
    for suffix in JOSA_SUFFIXES:
        if len(word) > len(suffix) + 1 and word.endswith(suffix):
            return word[: -len(suffix)]
    return word


EXCLUDE_PHRASE_RE = re.compile(r"\([^()]*제외\s*\)|_[^_()]*제외\s*$")


def base_name(name: str) -> str:
    base = EXCLUDE_PHRASE_RE.sub("", name.split("*")[0])
    return re.sub(r"\(.*?\)|\[.*?\]", "", base).strip() or name


def name_tokens(name: str) -> list[str]:
    # "화분(흙,식물 제외)"처럼 제외 대상을 적은 구절은 검색 토큰에서 뺀다
    base = EXCLUDE_PHRASE_RE.sub(" ", name.split("*")[0])
    parts = re.split(r"\s*및\s*", base)
    tokens: list[str] = []
    for part in parts:
        for tok in SPLIT_RE.split(part):
            n = normalize(tok)
            if len(n) >= 2 and n not in NAME_STOP_TOKENS:
                tokens.append(n)
    return tokens


def parse_measures(text: str) -> list[tuple[str, float, Optional[str]]]:
    results = []
    for num, unit, op in NUM_UNIT_RE.findall(text.lower()):
        dim, factor = UNIT_TABLE[unit.lower()]
        results.append((dim, float(num) * factor, op or None))
    return results


# ---------------------------------------------------------------------------
# 데이터 저장소
# ---------------------------------------------------------------------------
class WasteRepository:
    def __init__(self) -> None:
        self.general = pd.DataFrame()
        self.large = pd.DataFrame()
        self.districts: list[str] = []
        self._general_index: list[tuple[int, str, list[str]]] = []
        self._large_name_index: dict[str, tuple[str, list[str]]] = {}
        self.vocab: set[str] = set()

    def load(self) -> None:
        general = pd.read_csv(GENERAL_CSV, encoding="utf-8-sig", dtype=str).fillna("")
        general.columns = [c.strip() for c in general.columns]
        for col in general.columns:
            general[col] = general[col].astype(str).str.strip()

        large = pd.read_csv(LARGE_CSV, encoding="utf-8-sig", dtype=str).fillna("")
        large.columns = [c.strip() for c in large.columns]
        for col in large.columns:
            large[col] = large[col].astype(str).str.strip()
        large["수수료"] = (
            pd.to_numeric(large["수수료"].str.replace(",", "", regex=False), errors="coerce")
            .fillna(0)
            .astype(int)
        )
        # 띄어쓰기·기호만 다른 품목명(예: "화분(흙,식물 제외)" / "화분(흙, 식물 제외)")은 처음 나온 이름으로 통일
        canonical: dict[str, str] = {}
        for name in large["대형폐기물명"].unique():
            canonical.setdefault(normalize(name), name)
        large["대형폐기물명"] = large["대형폐기물명"].map(lambda n: canonical[normalize(n)])

        self.general = general.reset_index(drop=True)
        self.large = large.reset_index(drop=True)
        self.districts = sorted(self.large["시군구명"].unique().tolist(), key=len, reverse=True)

        self._general_index = [
            (idx, normalize(base_name(name)), name_tokens(name))
            for idx, name in self.general["item_name"].items()
        ]
        self._large_name_index = {
            name: (normalize(base_name(name)), name_tokens(name))
            for name in self.large["대형폐기물명"].unique()
        }
        vocab = {normalize(w) for w in SYNONYM_WORDS}
        for base_norm, tokens in [(b, t) for _, b, t in self._general_index] + list(self._large_name_index.values()):
            vocab.add(base_norm)
            vocab.update(tokens)
        self.vocab = {w for w in vocab if len(w) >= 2}
        logger.info(
            "CSV 로드 완료: general=%d행, large=%d행, 자치구=%s",
            len(self.general), len(self.large), ", ".join(self.districts),
        )

    @property
    def ready(self) -> bool:
        return not self.general.empty and not self.large.empty


repo = WasteRepository()
repo.load()



# ---------------------------------------------------------------------------
# 질의 해석
# ---------------------------------------------------------------------------
class Query:
    def __init__(self, message: str, body_district: Optional[str]) -> None:
        self.raw = message.strip()
        self.district, self.unsupported_district, cleaned = self._extract_district(self.raw, body_district)
        self.norm = self._expand_synonyms(normalize(cleaned))
        self.words = self._message_words(cleaned)
        self.measures = parse_measures(cleaned)
        self.vocab_hits = [v for v in repo.vocab if len(v) >= 3 and v in self.norm]
        self.raw_words = [strip_josa(normalize(w)) for w in re.split(r"[\s?!.,~·/()]+", cleaned)]

    def short_hit(self, ch: str) -> bool:
        """'귤'처럼 한 글자 품목: 질문에 '귤' 단독 또는 '귤껍질'처럼 붙여 쓴 경우만 인정"""
        return any(w == ch or (w.startswith(ch) and w[1:] in GENERIC_FOOD_WORDS) for w in self.raw_words)

    def contains(self, tok: str) -> bool:
        if tok not in self.norm:
            return False
        if tok in self.words:
            return True
        # 2글자 토큰이 질문 단어의 끝부분에만 걸리는 경우(예: "식물" ⊂ "음식물")는 다른 단어로 본다
        if len(tok) == 2 and any(
            len(w) == 3 and w.endswith(tok) and w[0] not in MODIFIER_PREFIXES for w in self.words
        ):
            return False
        for v in self.vocab_hits:
            if tok != v and tok in v:
                rest = v.replace(tok, "", 1)
                if rest and rest not in repo.vocab:
                    return False
        return True

    @staticmethod
    def _extract_district(message: str, body_district: Optional[str]) -> tuple[Optional[str], Optional[str], str]:
        cleaned = message
        found: Optional[str] = None
        unsupported: Optional[str] = None

        # 1) 데이터에 있는 자치구
        for d in repo.districts:
            if d in message:
                found = d
                break
        if not found:
            for d in repo.districts:
                stem = d[:-1]
                if len(stem) >= 2 and stem in message:
                    found = d
                    break
        if found:
            cleaned = cleaned.replace(found, " ").replace(found[:-1], " ")

        # 2) 데이터에 없는 서울시 자치구
        if not found:
            for d in sorted(SEOUL_DISTRICTS, key=len, reverse=True):
                if d in message:
                    unsupported = d
                    cleaned = cleaned.replace(d, " ")
                    break

        # 3) 질문에 없으면 body의 region/district 사용
        if not found and not unsupported and body_district:
            bd = body_district.strip()
            bd_full = bd if bd.endswith("구") else f"{bd}구"
            if bd_full in repo.districts:
                found = bd_full
            elif bd_full in SEOUL_DISTRICTS:
                unsupported = bd_full

        return found, unsupported, cleaned

    @staticmethod
    def _expand_synonyms(norm: str) -> str:
        extras = []
        for group in SYNONYM_GROUPS:
            keys = [normalize(g) for g in group]
            if any(k and k in norm for k in keys):
                extras.extend(keys)
        return norm + "|" + "|".join(extras) if extras else norm

    @staticmethod
    def _message_words(text: str) -> list[str]:
        words = []
        for w in re.split(r"[\s?!.,~·/()]+", text):
            w = strip_josa(normalize(w))
            if len(w) >= 2 and w not in MESSAGE_STOP_WORDS and not w.isdigit():
                words.append(w)
        return words

    def name_score(self, base_norm: str, tokens: list[str]) -> int:
        if not base_norm:
            return 0
        core = re.sub(r"^(일반|가정용|기타)", "", base_norm)
        for candidate in (base_norm, core):
            if len(candidate) >= 2 and self.contains(candidate):
                return 1000 + len(candidate) * 10
        score = 0
        specific = False
        for tok in tokens:
            if self.contains(tok):
                score += len(tok) * 10
                specific = specific or tok not in GENERIC_FOOD_WORDS
        for w in self.words:
            # 2글자 질문 단어가 품목명 속 다른 단어의 일부로만 걸리는 경우(예: "식물" ⊂ "음식물…")는 제외
            if len(w) == 2 and any(
                base_norm[i - 1 : i + 2] in repo.vocab
                for i in range(1, len(base_norm) - 1)
                if base_norm.startswith(w, i)
            ):
                continue
            if w in base_norm and w != base_norm:
                score += len(w) * 4
                specific = specific or w not in GENERIC_FOOD_WORDS
        return score if specific else 0

    def spec_score(self, spec: str, item_name: str = "") -> int:
        if not spec:
            return 0
        score = 0
        spec_measures = parse_measures(spec)
        for dim, value, op in spec_measures:
            for q_dim, q_value, q_op in self.measures:
                if dim != q_dim:
                    continue
                if op is None or (q_op is not None and q_op == op):
                    score += 60 if abs(value - q_value) < 1e-6 else -15
                elif op == "이상":
                    score += 30 if q_value >= value else -40
                elif op == "초과":
                    score += 30 if q_value > value else -40
                elif op == "미만":
                    score += 30 if q_value < value else -40
                elif op == "이하":
                    score += 30 if q_value <= value else -40
        item_norm = normalize(item_name)
        for tok in SPLIT_RE.split(spec):
            n = normalize(tok)
            if item_norm:
                n = n.replace(item_norm, "")
            if n in {"퀸", "킹"} and n in self.norm:
                score += 15
            elif (
                len(n) >= 2
                and n not in SPEC_STOP_TOKENS
                and n not in SYNONYM_WORDS
                and n not in item_norm
                and not re.fullmatch(r"\d+.*", n)
                and n in self.norm
            ):
                score += 15
        score += 15 * len(self.spec_words(spec, item_norm))
        return score

    def spec_words(self, spec: str, item_norm: str = "") -> list[str]:
        spec_norm = normalize(spec)
        return [
            w for w in set(self.words) | set(self.vocab_hits)
            if not w[0].isdigit() and w not in item_norm and w not in SPEC_STOP_TOKENS and w in spec_norm
        ]


# ---------------------------------------------------------------------------
# 검색
# ---------------------------------------------------------------------------
def search_large(q: Query, district: Optional[str]) -> tuple[int, pd.DataFrame]:
    df = repo.large if not district else repo.large[repo.large["시군구명"] == district]
    if df.empty:
        return 0, df

    scores = {}
    for name, specs in df.groupby("대형폐기물명", sort=False)["대형폐기물규격"]:
        base_norm, tokens = repo._large_name_index[name]
        s = q.name_score(base_norm, tokens)
        if s < 1000:
            spec_hits = {w for spec in specs for w in q.spec_words(spec, base_norm)}
            s += sum(len(w) * 8 for w in spec_hits)
        if s > 0:
            scores[name] = s
    if not scores:
        return 0, df.iloc[0:0]

    best = max(scores.values())
    names = [n for n, s in scores.items() if s == best]
    rows = df[df["대형폐기물명"].isin(names)].copy()
    rows["spec_score"] = [
        q.spec_score(spec, base_name(name)) for spec, name in zip(rows["대형폐기물규격"], rows["대형폐기물명"])
    ]
    return best, rows


def search_general(q: Query) -> tuple[int, pd.DataFrame]:
    scores = {}
    for idx, base_norm, tokens in repo._general_index:
        s = q.name_score(base_norm, tokens)
        # name_tokens는 한 글자 단어를 버리므로 "(바나나·귤·…)" 속 '귤' 같은 한 글자 품목은 따로 확인
        singles = {n for t in SPLIT_RE.split(repo.general.at[idx, "item_name"]) if len(n := normalize(t)) == 1}
        if any(q.short_hit(ch) for ch in singles - NAME_STOP_TOKENS):
            s += 20 + sum(len(t) * 10 for t in tokens if q.contains(t))
        if s > 0:
            scores[idx] = s
    if not scores:
        return 0, repo.general.iloc[0:0]
    best = max(scores.values())
    idxs = [i for i, s in scores.items() if s == best]
    rows = merge_same_items(repo.general.loc[idxs], q)
    rows = rows.drop_duplicates(subset=["disposal_type", "disposal_method"])
    return best, rows.head(3)


def _source_district(source: str) -> Optional[str]:
    return next((d for d in SEOUL_DISTRICTS if source.startswith(d)), None)


def find_common_equivalent(row: pd.Series, q: Query) -> Optional[pd.Series]:
    words = set(name_tokens(base_name(row["item_name"])))
    best, best_key = None, None
    for idx, base_norm, tokens in repo._general_index:
        cand = repo.general.loc[idx]
        if _source_district(cand["source"]) or cand["disposal_type"] != row["disposal_type"]:
            continue
        overlap = len(words & set(tokens))
        score = q.name_score(base_norm, tokens)
        if overlap == 0 or (score == 0 and overlap < 2):
            continue
        key = (score > 0, overlap, score)
        if best_key is None or key > best_key:
            best, best_key = cand, key
    return best


def merge_same_items(rows: pd.DataFrame, q: Query) -> pd.DataFrame:
    def priority(source: str) -> int:
        src_d = _source_district(source)
        if src_d and src_d == q.district:
            return 0
        if "환경부" in source:
            return 1
        if "서울시" in source:
            return 2
        return 3 if not src_d else 4

    replaced = []
    for _, r in rows.iterrows():
        if priority(r["source"]) == 4:
            alt = find_common_equivalent(r, q)
            if alt is not None:
                r = alt
        replaced.append(r)
    rows = pd.DataFrame(replaced)
    rows = rows.assign(_p=rows["source"].map(priority)).sort_values("_p", kind="stable")

    canon: list[tuple[str, str, set[str]]] = []
    keys = []
    for _, r in rows.iterrows():
        words = set(name_tokens(base_name(r["item_name"])))
        match = next((c for c, t, w in canon if t == r["disposal_type"] and w & words), None)
        if match is None:
            canon.append((r["item_name"], r["disposal_type"], words))
            match = r["item_name"]
        keys.append(match)
    rows = rows.assign(_key=keys)

    merged = []
    for _, grp in rows.groupby("_key", sort=False):
        common = grp[grp["_p"] < 4]
        if not common.empty:
            grp = common
        row = grp.iloc[0].copy()
        notes: list[str] = []
        for note in grp["notes"]:
            if note and not any(note in n or n in note for n in notes):
                notes.append(note)
        row["notes"] = " / ".join(notes)
        row["source"] = ", ".join(dict.fromkeys(s for s in grp["source"] if s))
        merged.append(row.drop(labels=["_p", "_key"]))
    return pd.DataFrame(merged) if merged else rows.drop(columns=["_p", "_key"])


# ---------------------------------------------------------------------------
# 답변 조립 (마크다운)
# ---------------------------------------------------------------------------
def _wrap(body: str) -> str:
    return f"{GREETING}\n\n{body.strip()}"


def build_large_reply(
    q: Query, rows: pd.DataFrame, district: Optional[str], note: str = "", related: Optional[pd.DataFrame] = None
) -> str:
    lines: list[str] = []
    if note:
        lines.append(note + "\n")

    has_spec_hit = rows["spec_score"].max() > 0
    is_appliance = rows["대형폐기물구분명"].str.contains("가전", na=False).any()

    if district:
        org = next((o for o in rows["관리기관명"] if o), f"서울특별시 {district}청")
        item_names = " / ".join(rows["대형폐기물명"].unique()[:4])
        lines.append(f"**{district}** 기준 **{item_names}** 대형폐기물 수수료를 찾아봤어요! 🔍\n")

        if has_spec_hit:
            top = rows[rows["spec_score"] == rows["spec_score"].max()]
            lines.append("### ✅ 말씀하신 규격에 딱 맞는 항목")
            for _, r in top.head(3).iterrows():
                spec = r["대형폐기물규격"] or "규격 구분 없음"
                lines.append(f"- **{r['대형폐기물명']}** ({spec}) → 💰 **{format_fee(r['수수료'])}**")
            others = rows.drop(top.index)
            if not others.empty:
                lines.append("\n<details><summary>다른 규격 수수료도 보기</summary>\n")
                lines.extend(_fee_table(others.head(15), with_district=False))
                lines.append("\n</details>")
        else:
            lines.extend(_fee_table(rows.head(15), with_district=False))
            if rows["대형폐기물규격"].nunique() > 1:
                lines.append("\n🙋 규격(예: *1인용*, *42인치*, *300L*)을 알려주시면 정확한 금액을 콕 집어드릴게요!")

        lines.append("\n### 📮 배출 방법")
        lines.append(f"1. **{org}** 홈페이지 또는 주민센터에서 대형폐기물 배출 신고")
        lines.append("2. 수수료 결제 후 받은 **배출 스티커(신고번호)**를 품목에 부착")
        lines.append("3. 지정한 날짜에 문 앞 또는 지정 장소에 배출")
        phone = DISTRICT_PHONES.get(district)
        contact = f"☎ [{phone}](tel:{phone.replace('-', '')}) (대표전화)" if phone else f"☎ {SEOUL_CALL_CENTER} 다산콜센터"
        lines.append(f"\n📞 접수처: **{org}** · {contact}")
    else:
        item_names = " / ".join(rows["대형폐기물명"].unique()[:4])
        lines.append(f"**{item_names}** 대형폐기물 수수료는 자치구마다 조금씩 달라요. 🗺️\n")
        if has_spec_hit:
            target = rows.sort_values("spec_score", ascending=False).groupby("시군구명", sort=False).head(1)
            lines.extend(_fee_table(target.head(15), with_district=True))
        else:
            lines.extend(["| 자치구 | 품목 | 수수료 범위 |", "|---|---|---|"])
            for d, grp in rows.groupby("시군구명"):
                lo, hi = int(grp["수수료"].min()), int(grp["수수료"].max())
                fee = format_fee(lo) if lo == hi else f"{format_fee(lo)} ~ {format_fee(hi)}"
                lines.append(f"| {d} | {' / '.join(grp['대형폐기물명'].unique()[:2])} | {fee} |")
        fees = rows["수수료"]
        lines.append(f"\n📊 전체 범위: **{format_fee(int(fees.min()))} ~ {format_fee(int(fees.max()))}**")
        lines.append(
            f"\n📍 사시는 **자치구**를 알려주시면 정확한 수수료와 접수처를 안내해 드릴게요! "
            f"(지원 자치구: {', '.join(sorted(repo.districts))})"
        )

    if is_appliance or (rows["수수료"] == 0).any():
        lines.append(f"\n{FREE_COLLECTION_TIP}")
    if related is not None and not related.empty:
        r = related.iloc[0]
        lines.append(
            f"\n🔁 **참고 – 작은 크기라면?** *{r['item_name']}*은(는) `{r['disposal_type']}` 배출 대상이에요. "
            f"{r['disposal_method']}"
        )
    return _wrap("\n".join(lines))


def _fee_table(rows: pd.DataFrame, with_district: bool) -> list[str]:
    if with_district:
        out = ["| 자치구 | 품목 | 규격 | 수수료 |", "|---|---|---|---|"]
        for _, r in rows.iterrows():
            out.append(f"| {r['시군구명']} | {r['대형폐기물명']} | {r['대형폐기물규격'] or '-'} | {format_fee(r['수수료'])} |")
    else:
        out = ["| 품목 | 규격 | 수수료 |", "|---|---|---|"]
        for _, r in rows.iterrows():
            out.append(f"| {r['대형폐기물명']} | {r['대형폐기물규격'] or '-'} | {format_fee(r['수수료'])} |")
    return out


def food_waste_exclusions() -> list[str]:
    """general_waste.csv 중 음식물 배출 금지(종량제 배출) 품목명 목록"""
    df = repo.general
    mask = (df["disposal_type"] == "종량제봉투") & (
        (df["source"] == "음식물쓰레기 분리배출 기준") | df["notes"].str.contains("음식물 쓰레기 배출 금지", regex=False)
    )
    return list(dict.fromkeys(df.loc[mask, "item_name"]))


def build_general_reply(rows: pd.DataFrame, note: str = "") -> str:
    lines: list[str] = []
    if note:
        lines.append(note + "\n")
    lines.append("분리배출 방법을 알려드릴게요! ♻️\n")
    for _, r in rows.iterrows():
        dtype = r["disposal_type"]
        badge = "♻️" if "재활용" in dtype else ("🗑️" if "종량제" in dtype else "📦")
        lines.append(f"### {badge} {r['item_name']}")
        if r["category"]:
            lines.append(f"- **분류:** {r['category']}")
        if dtype:
            lines.append(f"- **배출 유형:** `{dtype}`")
        if r["disposal_method"]:
            lines.append(f"- **배출 방법:** {r['disposal_method']}")
        if r["notes"]:
            lines.append(f"- **⚠️ 주의사항:** {r['notes']}")
        if r["source"]:
            lines.append(f"- <sub>출처: {r['source']}</sub>")
        lines.append("")
        if r["category"] == "음식물류":
            banned = food_waste_exclusions()
            if banned:
                lines.append(f"🚫 **음식물로 버리면 안 되는 것 (일반 종량제봉투):** {', '.join(banned)}\n")
        if "대형" in dtype:
            lines.append("💡 대형폐기물로 배출해야 할 수 있어요. 자치구와 크기를 알려주시면 수수료도 찾아드릴게요!\n")
    return _wrap("\n".join(lines))


def build_fallback_reply(q: Query) -> str:
    body = (
        "앗, 말씀하신 품목을 제 데이터에서 찾지 못했어요. 🥲\n\n"
        "조금만 더 구체적으로 알려주시면 바로 찾아드릴게요!\n\n"
        "- 🏷️ **품목 이름**을 짧게: *페트병*, *스티로폼*, *소파*, *냉장고*\n"
        "- 📏 **크기/규격**이 있다면 함께: *소파 3인용*, *TV 50인치*, *냉장고 300L*\n"
        "- 📍 **자치구**도 알려주시면 수수료까지: *강서구 침대 매트리스 1인용*"
    )
    return _wrap(body)


def unsupported_note(q: Query) -> str:
    if not q.unsupported_district:
        return ""
    return (
        f"📍 아쉽게도 **{q.unsupported_district}**의 대형폐기물 수수료 데이터는 아직 준비 중이에요. "
        "다른 자치구 기준으로 참고용 정보를 보여드릴게요!"
    )


# ---------------------------------------------------------------------------
# 라우팅
# ---------------------------------------------------------------------------
def answer(message: str, body_district: Optional[str]) -> tuple[str, str, list[str]]:
    q = Query(message, body_district)
    note = unsupported_note(q)

    large_d_score, large_d_rows = (0, None)
    if q.district:
        large_d_score, large_d_rows = search_large(q, q.district)
    large_all_score, large_all_rows = search_large(q, None)
    general_score, general_rows = search_general(q)

    # 1순위: 대형폐기물
    related = general_rows if general_score > 0 else None
    if q.district and large_d_score > 0 and large_d_score >= general_score:
        sources = [f"{q.district} 대형폐기물 수수료"]
        return "large", build_large_reply(q, large_d_rows, q.district, note, related), sources

    if not q.district and large_all_score > 0 and large_all_score >= general_score:
        sources = ["서울시 자치구 대형폐기물 수수료"]
        return "large", build_large_reply(q, large_all_rows, None, note, related), sources

    # 2순위: 일반 분리배출
    if general_score > 0:
        srcs = list(dict.fromkeys(s for s in general_rows["source"] if s)) or ["환경부 분리배출 가이드라인"]
        return "general", build_general_reply(general_rows, note), srcs

    # 지정 구에는 없지만 다른 구에 있는 대형폐기물
    if large_all_score > 0:
        miss = f"🔎 **{q.district}** 데이터에서는 해당 품목을 찾지 못해서, 다른 자치구 기준으로 보여드릴게요."
        sources = ["서울시 자치구 대형폐기물 수수료"]
        return "large", build_large_reply(q, large_all_rows, None, "\n".join(filter(None, [note, miss])), related), sources

    # 데이터에 없는 "○○ 껍질/뼈/씨" → 특정 품목으로 단정하지 않고 음식물 쓰레기 안내
    if any(w.endswith(g) for w in q.words for g in GENERIC_FOOD_WORDS):
        food = repo.general[repo.general["item_name"] == "음식물 쓰레기"]
        if not food.empty:
            return "general", build_general_reply(food.head(1), note), list(dict.fromkeys(food["source"]))

    # 3순위: Fallback
    return "unknown", build_fallback_reply(q), ["POTEN 분리배출 데이터베이스"]


# ---------------------------------------------------------------------------
# FastAPI
# ---------------------------------------------------------------------------
@asynccontextmanager
async def lifespan(_: FastAPI):
    try:
        repo.load()
    except Exception:
        logger.exception("CSV 로드 실패 (경로: %s)", DATA_DIR)
    yield


app = FastAPI(
    title="POTEN Chatbot API",
    description="AI로 더 정확하게, 재활용을 더 가치 있게 — 분리배출 & 대형폐기물 수수료 안내",
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://localhost:5173",
        "http://localhost:5174",
        "http://127.0.0.1:3000",
        "http://127.0.0.1:5173",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# 프론트엔드 명세서 + 기존 필드 완벽 호환 모델
class ChatRequest(BaseModel):
    message: str = Field(..., min_length=1, max_length=500, examples=["중구 3인용 소파 버리려면?"])
    region: Optional[str] = Field(None, max_length=20, examples=["중구"])        # 명세서 필드
    district: Optional[str] = Field(None, max_length=20, examples=["중구"])      # 기존 호환용 필드
    context_class: Optional[str] = Field(None, max_length=50, examples=["PET"]) # 카메라 인식 결과 힌트


class ChatResponse(BaseModel):
    # 명세서 지정 필드
    answer: str
    answer_format: str = "markdown"
    type: Literal["large_waste", "general", "unsupported"]
    sources: list[str]

    # 기존 웹 화면 및 테스트 완벽 호환용 필드
    status: str = "success"
    waste_type: Literal["large", "general", "unknown"]
    character_name: str = CHARACTER_NAME
    reply: str


def map_type_to_frontend(internal_type: str) -> Literal["large_waste", "general", "unsupported"]:
    if internal_type == "large":
        return "large_waste"
    elif internal_type == "general":
        return "general"
    return "unsupported"


def error_response(code: int, text: str) -> JSONResponse:
    wrapped = _wrap(text)
    return JSONResponse(
        status_code=code,
        content=ChatResponse(
            answer=wrapped,
            answer_format="markdown",
            type="unsupported",
            sources=["오류 안내"],
            status="error",
            waste_type="unknown",
            character_name=CHARACTER_NAME,
            reply=wrapped,
        ).model_dump(),
    )


# POST /chat (명세서 요구 경로) 및 POST /api/chat (기존 경로) 동시 등록
def generate_chat_response(req: ChatRequest):
    if not repo.ready:
        return error_response(503, "앗, 지금 분리배출 데이터를 불러오지 못했어요. 🛠️ 잠시 후 다시 시도해 주세요!")
    try:
        # region(명세서) 우선 적용, 없으면 district(기존) 적용
        target_district = req.region or req.district

        # 카메라 인식 힌트(context_class)가 있고 질문에 해당 단어가 없으면 보조 매칭에 활용
        query_text = req.message
        if req.context_class and req.context_class.lower() not in req.message.lower():
            query_text = f"{req.context_class} {req.message}"

        internal_waste_type, reply_text, sources = answer(query_text, target_district)
        frontend_type = map_type_to_frontend(internal_waste_type)

        return ChatResponse(
            answer=reply_text,
            answer_format="markdown",
            type=frontend_type,
            sources=sources,
            # 기존 호환용 값 유지
            status="success",
            waste_type=internal_waste_type,
            character_name=CHARACTER_NAME,
            reply=reply_text,
        )
    except Exception:
        logger.exception("답변 생성 중 오류: %r", req.message)
        return error_response(500, "죄송해요, 답변을 만드는 중에 작은 문제가 생겼어요. 😢 질문을 조금 바꿔서 다시 물어봐 주세요!")


@app.get("/api/districts")
def districts():
    return {"status": "success", "districts": sorted(repo.districts)}


# app.mount("/static", StaticFiles(directory=STATIC_DIR), name="static")


@app.get("/", include_in_schema=False)
def chat_page():
    """웹 브라우저 챗봇 테스트 페이지 (http://127.0.0.1:8001/)"""
    return FileResponse(CHAT_PAGE)


@app.get("/health")
def health():
    return {
        "status": "ok" if repo.ready else "degraded",
        "general_rows": len(repo.general),
        "large_rows": len(repo.large),
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run("main:app", host="127.0.0.1", port=8001, reload=True)