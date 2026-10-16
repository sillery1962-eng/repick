/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Donate.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { Fragment } from 'react'
import { DCLogic, useDcLogic } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
constructor(props) { super(props); this.state = { balance: 6170, amount: 1000, done: false, last: 0 }; }
renderVals() {
const { balance, amount, done, last } = this.state; const fmt = (n) => Number(n).toLocaleString('ko-KR');
const clamp = (v) => Math.max(0, Math.min(balance, Math.round(Number(v) || 0)));
// 기부는 100P 단위 (입력 중에는 그대로 두고, 칸을 벗어나거나 기부할 때 100 단위로 내림)
const unit = (v) => Math.floor(v / 100) * 100;
const chips = [['+100', 100], ['+500', 500], ['+1,000', 1000], ['전액', -1]].map(([label, v]) => ({ label, add: () => this.setState({ amount: unit(v < 0 ? balance : clamp(this.state.amount + v)) }) }));
return { balance, amount, chips, done, balanceText: fmt(balance), amountText: fmt(amount), leftText: fmt(balance - amount), doneText: fmt(last),
  onInput: (e) => this.setState({ amount: clamp(e.target.value) }),
  onBlur: () => this.setState({ amount: unit(amount) }),
  onDonate: () => { const give = unit(amount); if (give <= 0) return; this.setState({ balance: balance - give, last: give, amount: unit(Math.min(1000, balance - give)), done: true }); },
  onClose: () => this.setState({ done: false }) };
}
}

export default function DonateMobile() {
  const V = useDcLogic(Component)
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "'Gothic A1', sans-serif", letterSpacing: "-0.3px", width: "100%", maxWidth: "560px", margin: "0 auto", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 12px 4px 6px" }}>
        <Link to="/" aria-label="뒤로가기" style={{ width: "44px", height: "44px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M15 5l-7 7 7 7" />
          </svg>
        </Link>
        <span style={{ fontSize: "17px", fontWeight: "800" }}>
          기부하기
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
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ borderRadius: "22px", overflow: "hidden", height: "220px", position: "relative", isolation: "isolate" }}>
            <img src="/design/0111d49b8ba700679becc1d1474445b2.jpg" alt="바다와 해변 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#E6F0FB", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center" }}>
                해양 환경
              </span>
              <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#F2F3EE", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center" }}>
                상시 모금
              </span>
            </div>
            <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "10px" }}>
              해양 정화 활동 지원
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", marginTop: "4px" }}>
              함께하는 기관 · [기부처 이름]
            </div>
            <div style={{ marginTop: "18px", padding: "18px", borderRadius: "20px", background: "#F7F8F4" }}>
              <div style={{ fontSize: "13px", color: "#454B47" }}>
                지금까지 모인 포인트
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
                <b style={{ fontSize: "22px" }}>
                  [모인 포인트] 570,000P
                </b>
                <span style={{ fontSize: "13px", color: "#454B47" }}>
                  [목표 포인트] 1,000,000P
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "999px", background: "#E4E6E0", marginTop: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: "57%", background: "#4D8FD6", borderRadius: "999px" }} />
              </div>
            </div>
            <div style={{ fontSize: "17px", fontWeight: "800", marginTop: "22px" }}>
              기부한 포인트는 이렇게 쓰여요
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#E6F0FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#1D4C7A" }}>
                1
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  해안 쓰레기 수거 활동
                </b>
                <span style={{ fontSize: "13px", color: "#454B47" }}>
                  해변과 바닷가 쓰레기를 직접 치워요
                </span>
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#E6F0FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#1D4C7A" }}>
                2
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  수거 장비와 봉사자 지원
                </b>
                <span style={{ fontSize: "13px", color: "#454B47" }}>
                  집게, 마대, 안전장비를 마련해요
                </span>
              </span>
            </div>
            <div style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: "#E6F0FB", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: "#1D4C7A" }}>
                3
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <b style={{ fontSize: "15px" }}>
                  바다 생태 교육
                </b>
                <span style={{ fontSize: "13px", color: "#454B47" }}>
                  아이들과 바다 지키는 법을 배워요
                </span>
              </span>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box", border: "2px solid #121614" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                얼마나 기부할까요?
              </span>
              <span style={{ fontSize: "13px", color: "#454B47" }}>
                {"보유 "}
                <b style={{ color: "#121614" }}>
                  {V.balanceText}P
                </b>
              </span>
            </div>
            <label style={{ display: "block", fontSize: "13px", color: "#454B47", marginTop: "16px" }}>
              기부할 포인트 직접 입력
            </label>
            <div style={{ display: "flex", alignItems: "center", height: "56px", borderRadius: "16px", border: "1.5px solid #D5D8D2", padding: "0 16px", marginTop: "6px" }}>
              <input type="number" inputMode="numeric" step="100" placeholder="0" value={V.amount || ""} onChange={V.onInput} onBlur={V.onBlur} style={{ flexGrow: "1", border: "none", outline: "none", fontSize: "22px", fontWeight: "800", width: "100%", background: "transparent" }} />
              <b style={{ fontSize: "18px" }}>
                P
              </b>
            </div>
            <input type="range" min="0" max={V.balance} step="100" value={V.amount} onChange={V.onInput} aria-label="기부할 포인트 조절" style={{ width: "100%", marginTop: "16px", accentColor: "#121614" }} />
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "6px", marginTop: "10px" }}>
              {(V.chips || []).map((c, $index) => (
                <Fragment key={$index}>
                  <button onClick={c.add} style={{ height: "40px", borderRadius: "12px", border: "1px solid #E1E3DD", background: "#FFFFFF", fontSize: "14px", fontWeight: "700" }}>
                    {c.label}
                  </button>
                </Fragment>
              ))}
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "14px", color: "#454B47", marginTop: "16px" }}>
              <span>
                기부 후 남는 포인트
              </span>
              <b style={{ color: "#121614" }}>
                {V.leftText}P
              </b>
            </div>
            <button onClick={V.onDonate} style={{ marginTop: "14px", width: "100%", height: "58px", borderRadius: "18px", border: "none", background: "#12804A", color: "#FFFFFF", fontSize: "17px", fontWeight: "800" }}>
              {V.amountText}P 기부하기
            </button>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                다른 기부처도 둘러보세요
              </span>
              <a href="#all" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                전체보기 ›
              </a>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <a href="#d2" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "20px", background: "#E8F3E4" }}>
                <span style={{ width: "54px", height: "54px", borderRadius: "16px", background: "#1F5C3F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/b63cdf73553f9bc43f841aeee16da0c6.jpg" alt="올려다본 숲 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700" }}>
                    도시 숲 조성 캠페인
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    도심에 진짜 나무를 심어요
                  </span>
                </span>
                <span style={{ fontSize: "20px", color: "#454B47" }}>
                  ›
                </span>
              </a>
              <a href="#d3" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "20px", background: "#FFEEE6" }}>
                <span style={{ width: "54px", height: "54px", borderRadius: "16px", background: "#FF7A59", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/ff18d2fbf891033bf82b9595a8865072.jpg" alt="들판 위 노을 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700" }}>
                    저소득층 냉방비 지원
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    더운 여름을 함께 나눠요
                  </span>
                </span>
                <span style={{ fontSize: "20px", color: "#454B47" }}>
                  ›
                </span>
              </a>
            </div>
          </div>
        </div>
      </main>
      {V.done ? (
        <>
          <div style={{ position: "fixed", inset: "0", background: "rgba(18,22,20,0.55)", zIndex: "10", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "300px", animation: "rpFade .25s ease" }}>
            <div style={{ width: "360px", borderRadius: "30px", background: "#FFFFFF", padding: "30px 24px 22px", boxSizing: "border-box", textAlign: "center", animation: "rpPop .5s ease" }}>
              <svg width="72" height="72" viewBox="0 0 24 24" fill="none">
                <path d="M12 20.5l-7.6-7.4A5 5 0 0 1 12 6.4a5 5 0 0 1 7.6 6.7z" fill="#FF7A59" />
              </svg>
              <div style={{ fontSize: "22px", fontWeight: "800", marginTop: "10px" }}>
                {V.doneText}P 기부 완료!
              </div>
              <div style={{ fontSize: "15px", color: "#454B47", marginTop: "6px" }}>
                바다를 지키는 데 소중히 쓰일게요.
              </div>
              <div style={{ fontSize: "14px", marginTop: "12px" }}>
                {"남은 포인트 "}
                <b>
                  {V.balanceText}P
                </b>
              </div>
              <button onClick={V.onClose} style={{ marginTop: "16px", width: "100%", height: "54px", borderRadius: "16px", border: "none", background: "#121614", color: "#FFFFFF", fontSize: "16px", fontWeight: "800" }}>
                확인
              </button>
            </div>
          </div>
        </>
      ) : null}
    </div>
  )
}
