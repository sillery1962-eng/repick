import { useEffect, useRef, useState } from "react";
import Message from "./components/Message.jsx";
import { askChat, getDistricts } from "./api.js";
import "./ChatbotPage.css";


const SUGGESTIONS = [
  "강서구 소파 3인용 얼마예요?",
  "TV 50인치 버리는 비용",
  "페트병 어떻게 버려요?",
  "양파 껍질 음식물이에요?",
  "보조배터리 버리는 법",
];

const WELCOME =
  "🌱 안녕하세요, POTEN의 분리배출 도우미 **포티**예요!\n\n" +
  "버릴 물건을 알려주시면 **분리배출 방법**이나 **대형폐기물 수수료**를 찾아드릴게요.\n\n" +
  "- 📍 자치구 + 🏷️ 품목 + 📏 크기를 함께 알려주시면 더 정확해요!\n" +
  "- 예) *강서구 냉장고 350L*, *노원구 장롱*, *우유팩*";

export default function ChatbotPage() {
  const [messages, setMessages] = useState([{ role: "bot", text: WELCOME, name: "포티" }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [districts, setDistricts] = useState([]);
  const [district, setDistrict] = useState("");
  const chatRef = useRef(null);
  const inputRef = useRef(null);

  // 처음 한 번: 자치구 목록 불러오기
  useEffect(() => {
    getDistricts().then(setDistricts).catch(() => {});
  }, []);

  // 메시지가 늘어나면 맨 아래로 스크롤
  useEffect(() => {
    const el = chatRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, loading]);

  async function ask(raw) {
    const message = raw.trim();
    if (!message || loading) return;
    setMessages((prev) => [...prev, { role: "user", text: message }]);
    setInput("");
    setLoading(true);

    let reply;
    let name = "포티";
    try {
      const data = await askChat(message, district);
      reply = data.reply || "앗, 답변을 받지 못했어요. 다시 시도해 주세요! 🥲";
      name = data.character_name || "포티";
    } catch {
      reply = "서버에 연결하지 못했어요. 🛠️ 서버가 켜져 있는지 확인해 주세요!";
    }
    setMessages((prev) => [...prev, { role: "bot", text: reply, name }]);
    setLoading(false);
    inputRef.current?.focus();
  }

  function handleSubmit(e) {
    e.preventDefault();
    ask(input);
  }

  return (
    <div className="app">
      <header>
        <div>
          <img className="logo" src="/logo.png" alt="POTEN" />
          <div className="hint">📍 자치구 + 🏷️ 품목 + 📏 크기</div>
        </div>
        <div className="spacer" />
        <select aria-label="자치구 선택" value={district} onChange={(e) => setDistrict(e.target.value)}>
          <option value="">자치구 선택(선택)</option>
          {districts.map((d) => (
            <option key={d} value={d}>{d}</option>
          ))}
        </select>
      </header>

      <main id="chat" ref={chatRef}>
        {messages.map((m, i) => (
          <Message key={i} role={m.role} text={m.text} name={m.name} />
        ))}
        {loading && <Message role="bot" name="포티" typing />}
      </main>

      <div className="chips">
        {SUGGESTIONS.map((s) => (
          <button key={s} type="button" className="chip" onClick={() => ask(s)}>
            {s}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit}>
        <input
          ref={inputRef}
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="예) 강서구 소파 3인용 얼마예요?"
          autoComplete="off"
          maxLength={500}
          autoFocus
        />
        <button className="send" type="submit" disabled={loading}>
          전송
        </button>
      </form>
    </div>
  );
}
