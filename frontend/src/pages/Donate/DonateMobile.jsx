/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Donate.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { Fragment } from 'react'
import { useDcLogic } from '../../lib/dc'
import { DonateLogic } from './donateLogic'

// 화면 로직 (상태·버튼·서버 연결)은 donateLogic.js 에 있습니다 (PC·모바일 공용). renderVals()가 돌려준 값을 V.이름 으로 씁니다.

export default function DonateMobile() {
  const V = useDcLogic(DonateLogic)
  const C = V.campaign
  if (!C) {
    return (
      <div style={{ padding: "60px 20px", textAlign: "center", fontSize: "15px", color: "#454B47", fontFamily: "var(--font-base)" }}>
        {V.loadError || "기부처를 불러오는 중…"}
      </div>
    )
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
            <img src={C.look.img} alt={C.look.alt} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", gap: "6px" }}>
              {C.tags.map((tag, i) => (
                <span key={tag} style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: i === 0 ? C.look.soft : "#F2F3EE", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center" }}>
                  {tag}
                </span>
              ))}
            </div>
            {C.slogan ? (
              <div style={{ fontSize: "16px", fontWeight: "800", color: C.look.deep, marginTop: "12px" }}>
                {C.slogan}
              </div>
            ) : null}
            <div style={{ fontSize: "24px", fontWeight: "800", marginTop: C.slogan ? "4px" : "10px" }}>
              {C.title}
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", marginTop: "4px" }}>
              함께하는 기관 · {C.org}
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", marginTop: "10px" }}>
              {C.summary}
            </div>
            <div style={{ marginTop: "18px", padding: "18px", borderRadius: "20px", background: "#F7F8F4" }}>
              <div style={{ fontSize: "13px", color: "#454B47" }}>
                지금까지 모인 포인트
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginTop: "4px" }}>
                <b style={{ fontSize: "22px" }}>
                  {V.raisedText}P
                </b>
                <span style={{ fontSize: "13px", color: "#454B47" }}>
                  목표 {V.goalText}P
                </span>
              </div>
              <div style={{ height: "10px", borderRadius: "999px", background: "#E4E6E0", marginTop: "10px", overflow: "hidden" }}>
                <div style={{ height: "100%", width: `${V.percent}%`, background: C.look.bar, borderRadius: "999px" }} />
              </div>
            </div>
            <div style={{ fontSize: "17px", fontWeight: "800", marginTop: "22px" }}>
              기부한 포인트는 이렇게 쓰여요
            </div>
            {(C.uses || []).map((u, i) => (
              <div key={u.title} style={{ display: "flex", gap: "12px", alignItems: "center", marginTop: "12px" }}>
                <span style={{ width: "44px", height: "44px", borderRadius: "14px", background: C.look.soft, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "800", color: C.look.deep, flexShrink: "0" }}>
                  {i + 1}
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <b style={{ fontSize: "15px" }}>
                    {u.title}
                  </b>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    {u.desc}
                  </span>
                </span>
              </div>
            ))}
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
            <button onClick={V.onDonate} disabled={!V.canDonate} style={{ marginTop: "14px", width: "100%", height: "58px", borderRadius: "18px", border: "none", background: V.canDonate ? "#12804A" : "#B8BDB6", color: "#FFFFFF", fontSize: "17px", fontWeight: "800" }}>
              {V.busy ? "기부하는 중…" : V.balance < 100 ? "100P부터 기부할 수 있어요" : `${V.amountText}P 기부하기`}
            </button>
            {V.error ? (
              <div role="alert" style={{ fontSize: "14px", color: "#C2410C", marginTop: "10px", textAlign: "center" }}>
                {V.error}
              </div>
            ) : null}
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                기부처 둘러보기
              </span>
              <span style={{ fontSize: "14px", color: "#454B47" }}>
                모두 {V.total}곳
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {V.list.map((o) => (
                <button key={o.id} type="button" onClick={o.pick} style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "20px", background: o.look.soft, border: o.selected ? `2px solid ${o.look.deep}` : "2px solid transparent", textAlign: "left", width: "100%", font: "inherit", color: "inherit", cursor: "pointer" }}>
                  <span style={{ width: "54px", height: "54px", borderRadius: "16px", background: o.look.deep, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                    <img src={o.look.img} alt={o.look.alt} style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                  </span>
                  <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                    <span style={{ fontSize: "16px", fontWeight: "700" }}>
                      {o.title}
                    </span>
                    <span style={{ fontSize: "13px", color: "#454B47" }}>
                      {o.slogan || o.summary}
                    </span>
                  </span>
                  {o.selected ? (
                    <span style={{ fontSize: "12px", fontWeight: "800", color: "#FFFFFF", background: o.look.deep, borderRadius: "999px", padding: "4px 10px", flexShrink: "0" }}>
                      보는 중
                    </span>
                  ) : (
                    <span style={{ fontSize: "20px", color: "#454B47" }}>
                      ›
                    </span>
                  )}
                </button>
              ))}
            </div>
            {V.moreCount > 0 ? (
              <button type="button" onClick={V.onToggleMore} style={{ marginTop: "12px", width: "100%", height: "46px", borderRadius: "14px", border: "1px solid #E1E3DD", background: "#FFFFFF", fontSize: "14px", fontWeight: "700", color: "#454B47", cursor: "pointer" }}>
                {V.showAll ? "접기 ⌃" : `더보기 (${V.moreCount}) ⌄`}
              </button>
            ) : null}
          </div>
        </div>
        <section aria-labelledby="dn-history" style={{ marginTop: "14px", background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", gap: "10px" }}>
            <h2 id="dn-history" style={{ margin: "0", fontSize: "20px", fontWeight: "800" }}>나의 기부 내역</h2>
            <span style={{ fontSize: "14px", color: "#454B47" }}>모두 {V.historyCount}번</span>
          </div>
          <div style={{ background: "#E8F3E4", borderRadius: "18px", padding: "18px", display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: "10px" }}>
            <span style={{ fontSize: "14px", color: "#1F5C3F", fontWeight: "700" }}>지금까지 기부한 포인트</span>
            <b style={{ fontSize: "22px", color: "#1F5C3F" }}>{V.historyTotalText}P</b>
          </div>
          {V.historyEmpty ? (
            <p style={{ margin: "0", fontSize: "14px", color: "#6B716D" }}>아직 기부한 내역이 없어요. 위에서 첫 기부를 해 보세요.</p>
          ) : (
            <ul style={{ listStyle: "none", margin: "0", padding: "0", display: "flex", flexDirection: "column" }}>
              {V.historyRows.map((h) => (
                <li key={h.key} style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderTop: "1px solid #F0F1EC" }}>
                  <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: h.look.soft, flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                    <img src={h.look.img} alt="" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                  </span>
                  <span style={{ flexGrow: "1", minWidth: "0", display: "flex", flexDirection: "column", gap: "2px" }}>
                    <b style={{ fontSize: "15px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{h.title}</b>
                    <span style={{ fontSize: "12px", color: "#454B47" }}>{h.dateText}</span>
                  </span>
                  <b style={{ fontSize: "15px", color: h.look.deep, flexShrink: "0" }}>{h.pointsText}</b>
                </li>
              ))}
            </ul>
          )}
          {V.historyMore > 0 ? (
            <button type="button" onClick={V.onToggleHistory} style={{ width: "100%", height: "46px", borderRadius: "14px", border: "1px solid #E1E3DD", background: "#FFFFFF", fontSize: "14px", fontWeight: "700", color: "#454B47", cursor: "pointer" }}>
              {V.historyAll ? "접기 ⌃" : `더보기 (${V.historyMore}) ⌄`}
            </button>
          ) : null}
        </section>
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
                {C.thanks}
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
