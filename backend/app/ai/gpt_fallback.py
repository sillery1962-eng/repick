# 챗봇 포티: CSV에서 못 찾은 질문만 ChatGPT(OpenAI)가 답함. 담당: 김선영
# - chatbot.py의 answer()가 CSV 검색(대형폐기물·일반 분리배출·음식물)을 다 해 보고도 못 찾았을 때만 부른다.
# - 키가 없거나 오류(키 틀림·한도 초과·네트워크)가 나면 None → chatbot.py가 원래 "못 찾았어요" 안내를 보여 준다.
# - 키는 backend/.env 의 OPENAI_API_KEY 에만 둔다. (화면 코드·Git·메신저에 올리지 않기)
import logging
import os

from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

# ---------- 숫자·설정 표 ----------
MODEL = os.getenv("OPENAI_MODEL", "gpt-4o-mini")  # 바꾸려면 .env 에 OPENAI_MODEL=모델이름
MAX_QUESTION_CHARS = 300  # 질문 최대 글자 수 (비용·남용 방지)
MAX_ANSWER_TOKENS = 500  # 답변 최대 길이
TIMEOUT_SECONDS = 20  # 이 시간 안에 답이 없으면 포기하고 원래 안내
AI_NOTICE = "\n\n_🤖 AI 답변이라 정확하지 않을 수 있어요. 정확한 내용은 구청이나 120다산콜재단에 확인해 주세요._"

SYSTEM_PROMPT = """너는 RePick의 분리배출 도우미 '포티'야. 밝고 친절한 말투로 답해.
- 서울시 기준 분리배출·재활용·대형폐기물·환경 실천 질문에만 답해.
- 분리배출·환경과 상관없는 질문(숙제, 잡담, 코딩, 다른 서비스 등)은 "저는 분리배출 질문만 도와드릴 수 있어요 🌱"라고 정중히 거절해.
- 수수료·금액·전화번호·배출 요일처럼 지역마다 다른 정확한 숫자는 지어내지 말고, 구청 홈페이지나 120다산콜재단에서 확인하라고 안내해.
- 읽기 쉽게 답해: 첫 줄에 한 문장으로 핵심, 그 아래 '- '로 시작하는 목록 2~4줄(한 줄에 한 가지 행동). 전체 5줄 이내.
- 문단을 길게 이어 쓰지 말고, 줄마다 짧게 끊어."""

log = logging.getLogger(__name__)
_client: OpenAI | None = None


def _get_client() -> OpenAI | None:
    """키가 있으면 OpenAI 연결을 만든다. 서버를 켠 뒤에 .env에 키를 넣어도 다음 질문부터 읽힘"""
    global _client
    if _client is None:
        load_dotenv()  # 서버를 켠 뒤 .env에 새로 넣은 키도 읽기
        if os.getenv("OPENAI_API_KEY"):
            _client = OpenAI(timeout=TIMEOUT_SECONDS, max_retries=1)
    return _client


def ask_gpt(message: str, district: str | None) -> str | None:
    """CSV에서 못 찾은 질문을 ChatGPT에게 묻는다. 답을 못 받으면 None"""
    client = _get_client()
    if client is None:
        return None
    try:
        res = client.chat.completions.create(
            model=MODEL,
            max_completion_tokens=MAX_ANSWER_TOKENS,
            messages=[
                {"role": "system", "content": SYSTEM_PROMPT},
                {"role": "user", "content": f"[자치구: {district or '모름'}]\n{message[:MAX_QUESTION_CHARS]}"},
            ],
        )
        text = (res.choices[0].message.content or "").strip()
    except Exception:  # 키 오류·한도 초과·시간 초과·네트워크 → 원래 안내로
        log.exception("ChatGPT 호출 실패")
        return None
    return text + AI_NOTICE if text else None
