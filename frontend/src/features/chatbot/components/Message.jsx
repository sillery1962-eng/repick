import { marked } from "marked";
import DOMPurify from "dompurify";
import PotyAvatar from "./PotyAvatar.jsx";

// 봇 답변(마크다운)을 HTML로 바꾸고, 위험한 태그는 DOMPurify로 제거한다
function renderMarkdown(text) {
  return DOMPurify.sanitize(marked.parse(text, { breaks: true }));
}

// 말풍선 1개. role: "user" | "bot", typing: 답변 기다리는 중 표시
export default function Message({ role, text, name, typing }) {
  if (role === "user") {
    return (
      <div className="row user">
        <div className="bubble">{text}</div>
      </div>
    );
  }

  return (
    <div className="row bot">
      <PotyAvatar />
      <div className="bubble">
        {name && <div className="name">{name}</div>}
        {typing ? (
          <span className="typing">
            포티가 찾는 중<span>.</span><span>.</span><span>.</span>
          </span>
        ) : (
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(text) }} />
        )}
      </div>
    </div>
  );
}
