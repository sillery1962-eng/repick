/* RePick 챗봇 PC 화면: 팀 디자인 유지 + 실제 API 연결 */
import { Link } from 'react-router-dom'
import { Fragment, useState, useEffect, useRef } from 'react'
import { useChatHistory } from './useChatHistory'
import ChatFaq from './ChatFaq'

export const SUGGESTIONS = ['치킨 뼈는요?', '귤 껍질은?', '컵라면 용기는?', '폐건전지는 어디에?'];

// 서버 주소: frontend/.env 의 VITE_CHATBOT_API_URL (배포 때 백엔드 주소로), 없으면 내 컴퓨터 서버
const API_BASE = import.meta.env.VITE_CHATBOT_API_URL || 'http://localhost:8000';

// 서버가 꺼져 있을 때 추천 질문에만 보여 줄 예시 답변 (실제 답변과 구분되게 표시를 붙입니다)
const DEMO_ANSWERS = {
  '치킨 뼈는요?': '치킨 뼈는 **일반 쓰레기**예요.\n\n### 🗑️ 동물 뼈(닭뼈·생선뼈)\n- **배출 방법:** 살은 발라서 음식물로, 뼈는 일반 종량제봉투에 배출\n- **⚠️ 주의사항:** 뼈는 사료로 쓰기 어려워 음식물로 버리면 안 돼요',
  '귤 껍질은?': '귤 껍질은 **음식물 쓰레기**예요.\n\n### 📦 과일·채소 껍질\n- **배출 방법:** 물기를 빼고 음식물 전용 봉투나 수거용기에 배출\n- **⚠️ 주의사항:** 과일 스티커는 떼어 주세요',
  '컵라면 용기는?': '컵라면 용기는 **재질에 맞게 분리배출**해요.\n\n### ♻️ 컵라면 용기\n- **배출 방법:** 국물을 비우고 헹군 뒤 플라스틱·종이 재질에 맞게 배출\n- **⚠️ 주의사항:** 빨간 기름이 지워지지 않으면 일반 종량제봉투에 배출',
  '폐건전지는 어디에?': '폐건전지는 **전용 수거함**에 버려요.\n\n### 📦 폐전지류\n- **배출 방법:** 주민센터나 아파트의 폐건전지 전용 수거함에 배출\n- **💡 팁:** 가까운 수거함 찾기에서 위치를 볼 수 있어요',
};

// 포티에게 질문하고 답변 글을 돌려줍니다 (PC·폰 화면 공용)
export async function askPoty(message) {
  try {
    const response = await fetch(`${API_BASE}/api/v1/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message }),
    });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const data = await response.json();
    return data.reply || data.answer || '답변이 없습니다.';
  } catch {
    if (DEMO_ANSWERS[message]) return `${DEMO_ANSWERS[message]}\n\n<sub>예시 답변 · 서버 미연결</sub>`;
    return '서버 연결에 실패했어요. 백엔드 실행과 API 주소를 확인해 주세요.';
  }
}

// 마크다운 한 줄 안의 **굵게**, `코드`, *기울임*, [글자](링크), <sub> 를 화면용으로 바꿉니다
function inline(text) {
  const clean = text
    .replace(/<\/?sub>/g, '')
    .replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')
    .replace(/`([^`]+)`/g, '**$1**')
    .replace(/(^|[^*])\*([^*]+)\*(?!\*)/g, '$1$2');
  return clean.split(/\*\*(.+?)\*\*/g).map((part, i) => (i % 2 ? <b key={i}>{part}</b> : part));
}

// 봇 답변(마크다운 글자)을 문단·카드·표·안내 문구로 나눕니다
function parseReply(text) {
  const blocks = [];
  let card = null;
  let table = null;
  for (const raw of text.split('\n')) {
    const line = raw.trim();
    if (!line || line === '---' || /^<\/?details|^<summary/.test(line)) { card = null; table = null; continue; }
    if (line.startsWith('|')) {
      if (/^\|[-|\s]+\|$/.test(line)) continue;
      const cells = line.slice(1, -1).split('|').map(c => c.trim());
      if (!table) { table = { type: 'table', head: cells, rows: [] }; blocks.push(table); }
      else table.rows.push(cells);
      continue;
    }
    table = null;
    if (line.startsWith('###')) {
      const title = line.replace(/^#+\s*/, '');
      card = { type: 'card', title, warn: title.includes('🗑️'), items: [] };
      blocks.push(card);
      continue;
    }
    const ban = line.match(/^🚫\s*\*\*(.+?):?\*\*:?\s*(.+)$/);
    if (ban) {
      blocks.push({ type: 'card', title: ban[1].replace(/:$/, ''), warn: true, items: ban[2].split(/,\s*/) });
      card = null;
      continue;
    }
    const item = line.match(/^(?:[-*]|\d+\.)\s+(.+)$/);
    if (item && card) { card.items.push(item[1]); continue; }
    if (line.includes('<sub>')) { blocks.push({ type: 'note', text: line }); continue; }
    card = null;
    blocks.push({ type: 'p', text: item ? `· ${item[1]}` : line });
  }
  return blocks;
}

const boxStyle = { padding: '12px', borderRadius: '14px', background: '#FFFFFF' };
// ChatGPT 답변(CSV에 없는 질문)은 흰 박스 안에 넣습니다 (CSV 카드와 같은 흰색). 서버가 답 끝에 "🤖 AI 답변…" 안내를 붙여 줍니다
const AI_MARK = '🤖 AI 답변';
const aiBoxStyle = { padding: '12px 14px', borderRadius: '14px', background: '#FFFFFF', marginTop: '10px' };

function ReplyCard({ c }) {
  return (
    <div style={boxStyle}>
      <div style={{ fontSize: '13px', fontWeight: '800', color: c.warn ? '#C4552B' : '#1F7A3A' }}>{inline(c.title)}</div>
      {c.items.map((it, i) => (
        <div key={i} style={{ fontSize: '13px', marginTop: '6px' }}>· {inline(it)}</div>
      ))}
    </div>
  );
}

// 연속된 카드는 사진처럼 2칸으로 나란히 놓습니다 (폰 화면 ChatMobile에서도 씁니다)
export function BotReply({ text }) {
  const blocks = parseReply(text);
  const isAi = text.includes(AI_MARK);
  const out = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type === 'card') {
      const group = [b];
      while (blocks[i + 1]?.type === 'card') group.push(blocks[++i]);
      out.push(
        <div key={i} style={{ display: 'grid', gridTemplateColumns: group.length > 1 ? '1fr 1fr' : '1fr', gap: '8px', marginTop: '10px', alignItems: 'start' }}>
          {group.map((c, j) => <ReplyCard key={j} c={c} />)}
        </div>
      );
    } else if (b.type === 'table') {
      out.push(
        <div key={i} style={{ ...boxStyle, marginTop: '10px', overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '13px' }}>
            <thead>
              <tr>{b.head.map((h, j) => <th key={j} style={{ textAlign: 'left', padding: '6px 8px', color: '#1F7A3A', fontWeight: '800', borderBottom: '1px solid #F0F1EC' }}>{h}</th>)}</tr>
            </thead>
            <tbody>
              {b.rows.map((r, j) => (
                <tr key={j}>{r.map((cell, k) => <td key={k} style={{ padding: '6px 8px', borderBottom: '1px solid #F0F1EC' }}>{inline(cell)}</td>)}</tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    } else if (b.type === 'note') {
      out.push(<div key={i} style={{ fontSize: '12px', color: '#6B716D', marginTop: '8px' }}>{inline(b.text)}</div>);
    } else if (isAi && b.text.includes(AI_MARK)) {
      out.push(<div key={i} style={{ fontSize: '12px', color: '#6B716D', marginTop: '10px' }}>{inline(b.text.replace(/^_|_$/g, ''))}</div>);
    } else if (isAi && i > 0) {
      // ChatGPT 답변: 긴 문단은 문장마다 줄을 바꿔 읽기 쉽게
      b.text.split(/(?<=[.!?])\s+/).forEach((line, j) => out.push(<div key={`${i}-${j}`} style={{ marginTop: '6px' }}>{inline(line)}</div>));
    } else {
      out.push(<div key={i} style={{ marginTop: i ? '6px' : 0 }}>{inline(b.text)}</div>);
    }
  }
  // ChatGPT 답변: 첫 줄(포티 인사)은 그대로, 나머지 내용은 흰 박스 안에
  if (isAi && out.length > 1) return [out[0], <div key="ai" style={aiBoxStyle}>{out.slice(1)}</div>];
  return out;
}

export default function ChatPc() {
  const [msgs, setMsgs] = useChatHistory(); // 로그인해 있는 동안 대화 유지 (useChatHistory.js)
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef(null);
  const asked = new Set(msgs.filter(x => x.me).map(x => x.text));
  const chips = SUGGESTIONS.filter(q => !asked.has(q));

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [msgs, loading]);

  async function send(raw) {
    const message = raw.trim();
    if (!message || loading) return;
    setInput('');
    setMsgs(prev => [...prev, { me: true, bot: false, text: message }]);
    setLoading(true);
    const text = await askPoty(message);
    setMsgs(prev => [...prev, { me: false, bot: true, text }]);
    setLoading(false);
  }


  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%" }}>
      <main style={{ position: "relative", padding: "32px 0 60px", boxSizing: "border-box", margin: "0 auto", width: "100%", maxWidth: "1120px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ fontSize: "30px", fontWeight: "800", marginBottom: "20px" }}>
          배출 가이드 · 포티
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 280px", gap: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px", height: "900px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px", paddingBottom: "16px", borderBottom: "1px solid #F0F1EC" }}>
              <span style={{ width: "52px", height: "52px", borderRadius: "50%", background: "#EAF7EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="42" height="42" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                  <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
                  <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
                  <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
                  <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                  <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                  <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
                  <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
                  <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
                  <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
                </svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "18px", fontWeight: "800" }}>
                  포티
                </span>
                <span style={{ fontSize: "13px", color: "#1F7A3A" }}>
                  ● 분리배출 도우미 · 바로 답해요
                </span>
              </span>
            </div>
            <div ref={scrollRef} style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "14px", overflowY: "auto" }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF7EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
                    <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
                    <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
                    <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                    <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                    <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
                    <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
                    <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
                    <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
                  </svg>
                </span>
                <div style={{ maxWidth: "85%", padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#F2F3EE", fontSize: "15px", lineHeight: "1.55" }}>
                  {"안녕하세요, 분리배출 도우미 "}
                  <b>
                    포티
                  </b>
                  예요! 버리려는 물건 이름이나 사진을 보내주시면 버리는 방법을 알려드릴게요.
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "flex-end" }}>
                <div style={{ maxWidth: "420px", padding: "12px 14px", borderRadius: "18px 4px 18px 18px", background: "#121614", color: "#FFFFFF", fontSize: "15px", lineHeight: "1.55" }}>
                  양파 껍질은 음식물 쓰레기인가요?
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                <span style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF7EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                    <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
                    <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
                    <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
                    <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                    <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                    <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
                    <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
                    <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
                    <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
                  </svg>
                </span>
                <div style={{ maxWidth: "85%", padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#F2F3EE", fontSize: "15px", lineHeight: "1.55" }}>
                  {"양파 껍질은 "}
                  <b>
                    일반 쓰레기
                  </b>
                  예요. 동물 사료나 퇴비로 쓰기 어려운 딱딱하거나 질긴 것은 일반 쓰레기로 버려요.
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "10px" }}>
                    <div style={{ padding: "12px", borderRadius: "14px", background: "#FFFFFF" }}>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#1F7A3A" }}>
                        음식물 쓰레기
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 수박·바나나 껍질 (잘게)
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 채소 잎, 무·배추
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 밥, 면, 빵
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 생선살, 고기 (뼈 제외)
                      </div>
                    </div>
                    <div style={{ padding: "12px", borderRadius: "14px", background: "#FFFFFF" }}>
                      <div style={{ fontSize: "13px", fontWeight: "800", color: "#C4552B" }}>
                        일반 쓰레기
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 양파·마늘·옥수수 껍질
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 달걀·조개·게 껍데기
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 닭·생선 뼈
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 복숭아·자두 씨
                      </div>
                      <div style={{ fontSize: "13px", marginTop: "6px" }}>
                        · 티백, 한약재 찌꺼기
                      </div>
                    </div>
                  </div>
                  <div style={{ fontSize: "12px", color: "#6B716D", marginTop: "8px" }}>
                    지자체마다 기준이 조금씩 달라요. 우리 동네 기준도 꼭 확인해 주세요.
                  </div>
                </div>
              </div>
              {msgs.map((x, $index) => (
                <Fragment key={$index}>
                  {x.me ? (
                    <>
                      <div style={{ display: "flex", justifyContent: "flex-end" }}>
                        <div style={{ maxWidth: "420px", padding: "12px 14px", borderRadius: "18px 4px 18px 18px", background: "#121614", color: "#FFFFFF", fontSize: "15px", lineHeight: "1.55" }}>
                          {x.text}
                        </div>
                      </div>
                    </>
                  ) : null}
                  {x.bot ? (
                    <>
                      <div style={{ display: "flex", gap: "8px", alignItems: "flex-start" }}>
                        <span style={{ width: "38px", height: "38px", borderRadius: "50%", background: "#EAF7EE", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                          <svg width="30" height="30" viewBox="0 0 40 40" fill="none" aria-hidden="true">
                            <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
                            <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
                            <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
                            <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                            <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
                            <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
                            <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
                            <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
                            <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
                          </svg>
                        </span>
                        <div style={{ maxWidth: "85%", padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#F2F3EE", fontSize: "15px", lineHeight: "1.55" }}>
                          <BotReply text={x.text} />
                        </div>
                      </div>
                    </>
                  ) : null}
                </Fragment>
              ))}
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {chips.map((c, $index) => (
                <Fragment key={$index}>
                  <button onClick={() => send(c)} style={{ height: "38px", padding: "0 14px", borderRadius: "999px", border: "1.5px solid #D5D8D2", background: "#FFFFFF", fontSize: "14px", fontWeight: "700" }}>
                    {c}
                  </button>
                </Fragment>
              ))}
            </div>
            <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
              <input aria-label="버릴 물건 입력" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === "Enter") send(input); }} placeholder="OO구 품목 형태로 입력하세요" maxLength={500} style={{ flexGrow: 1, minWidth: 0, height: "48px", borderRadius: "16px", border: "1.5px solid #E1E3DD", padding: "0 16px", fontSize: "14px" }} />
              <button type="button" aria-label="전송" disabled={loading} onClick={() => send(input)} style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#121614", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="#CDEB45">
                  <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
                </svg></button>
            </div>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ChatFaq />
            <Link to="/map" style={{ background: "#E6F0FB", borderRadius: "22px", padding: "16px 20px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="#4D8FD6" />
                <circle cx="12" cy="10" r="2.8" fill="#FFFFFF" />
              </svg>
              <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800" }}>
                  가까운 수거함 찾기
                </span>
                <span style={{ fontSize: "13px", color: "#454B47" }}>
                  폐건전지, 투명 페트병 등
                </span>
              </span>
              <span style={{ fontSize: "20px" }}>
                ›
              </span>
            </Link>
          </div>
        </div>
      </main>
    </div>
  )
}
