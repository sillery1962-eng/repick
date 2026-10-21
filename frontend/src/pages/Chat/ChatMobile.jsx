/* RePick 챗봇 폰 화면: 팀 시안 디자인 유지 + 실제 API 연결 (질문·답변 기능은 ChatPc.jsx의 askPoty·BotReply를 함께 씀) */
import { Link } from 'react-router-dom'
import { Fragment, useState } from 'react'
import { BotReply, SUGGESTIONS, askPoty } from './ChatPc'

export default function ChatMobile() {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const asked = new Set(msgs.filter(x => x.me).map(x => x.text));
  const chips = SUGGESTIONS.filter(q => !asked.has(q));

  // PC 화면(ChatPc)과 같은 방식으로 포티 서버에 질문합니다
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
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%", maxWidth: "560px", margin: "0 auto", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 4px 6px" }}>
        <Link to="/" aria-label="뒤로가기" style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <span style={{ fontSize: "17px", fontWeight: "800" }}>
          포티 · 배출 가이드
        </span>
        <div style={{ display: "flex", gap: "6px" }}>
          <Link to="/forest" title="물방울" style={{ height: "34px", padding: "0 10px 0 6px", borderRadius: "999px", background: "#E3F1FC", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "800", color: "#17507F" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
              <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            </svg>
            12
          </Link>
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "16px", minHeight: "1060px" }}>
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
          <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "14px", overflow: "hidden" }}>
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
              <div style={{ maxWidth: "260px", padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#F2F3EE", fontSize: "15px", lineHeight: "1.55" }}>
                {"안녕하세요, 분리배출 도우미 "}
                <b>
                  포티
                </b>
                예요! 버리려는 물건 이름이나 사진을 보내주시면 버리는 방법을 알려드릴게요.
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "240px", padding: "12px 14px", borderRadius: "18px 4px 18px 18px", background: "#121614", color: "#FFFFFF", fontSize: "15px", lineHeight: "1.55" }}>
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
              <div style={{ maxWidth: "260px", padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#F2F3EE", fontSize: "15px", lineHeight: "1.55" }}>
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
                      <div style={{ maxWidth: "240px", padding: "12px 14px", borderRadius: "18px 4px 18px 18px", background: "#121614", color: "#FFFFFF", fontSize: "15px", lineHeight: "1.55" }}>
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
                      <div style={{ maxWidth: "calc(100% - 46px)", padding: "12px 14px", borderRadius: "4px 18px 18px 18px", background: "#F2F3EE", fontSize: "15px", lineHeight: "1.55" }}>
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
            <button type="button" aria-label="전송" disabled={loading} onClick={() => send(input)} style={{ width: "48px", height: "48px", borderRadius: "16px", background: "#121614", border: 0, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="#CDEB45">
                <path d="M3 20l18-8L3 4v6l12 2-12 2z" />
              </svg>
            </button>
          </div>
        </div>
        <div style={{ marginTop: "14px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px", fontWeight: "800" }}>
                  헷갈리는 분류 사전
                </span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  수박 껍질
                </span>
                <b style={{ color: "#1F7A3A" }}>
                  음식물
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  바나나 껍질
                </span>
                <b style={{ color: "#1F7A3A" }}>
                  음식물
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  양파 껍질
                </span>
                <b style={{ color: "#C4552B" }}>
                  일반
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  달걀 껍데기
                </span>
                <b style={{ color: "#C4552B" }}>
                  일반
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  치킨 뼈
                </span>
                <b style={{ color: "#C4552B" }}>
                  일반
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  복숭아 씨
                </span>
                <b style={{ color: "#C4552B" }}>
                  일반
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  커피 찌꺼기
                </span>
                <b style={{ color: "#C4552B" }}>
                  일반
                </b>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", padding: "11px 0", borderBottom: "1px solid #F0F1EC", fontSize: "14px" }}>
                <span>
                  귤 껍질
                </span>
                <b style={{ color: "#1F7A3A" }}>
                  음식물
                </b>
              </div>
            </div>
            <Link to="/map" style={{ background: "#E6F0FB", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: "12px" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="#4D8FD6" />
                <circle cx="12" cy="10" r="2.8" fill="#FFFFFF" />
              </svg>
              <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "16px", fontWeight: "800" }}>
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
