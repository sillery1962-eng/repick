/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Scan.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
constructor(props) { super(props); this.state = { cert: false, toast: '' }; }
say(msg) { clearTimeout(this.t1); this.setState({ toast: msg }); this.t1 = setTimeout(() => this.setState({ toast: '' }), 2000); }
componentWillUnmount() { clearTimeout(this.t1); }
renderVals() { const { cert, toast } = this.state; return { cert, notCert: !cert, dropsToday: cert ? 8 : 3, hasToast: !!toast, toast,
  onCert: () => { this.setState({ cert: true }); this.say('실천 인증 완료! 물방울 5개를 받았어요'); } }; }
}

export default function ScanMobile() {
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
          AI 분리배출 인증
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
        <div style={{ position: "relative", height: "360px", borderRadius: "24px", background: "radial-gradient(circle at 50% 40%, #3A4440, #121614 75%)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center", isolation: "isolate" }}>
          <img src="/design/b18967dd6c8d2ce9d303826b260294b3.jpg" alt="투명 페트병 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
          <span style={{ position: "absolute", inset: "0", zIndex: "-1", background: "linear-gradient(180deg, rgba(18,22,20,0.35), rgba(18,22,20,0.05) 40%, rgba(18,22,20,0.45))" }} />
          <span style={{ position: "absolute", left: "16%", top: "12%", width: "44px", height: "44px", border: "0 solid #CDEB45", borderWidth: "4px 0 0 4px", borderRadius: "6px" }} />
          <span style={{ position: "absolute", right: "16%", top: "12%", width: "44px", height: "44px", border: "0 solid #CDEB45", borderWidth: "4px 4px 0 0", borderRadius: "6px" }} />
          <span style={{ position: "absolute", left: "16%", bottom: "12%", width: "44px", height: "44px", border: "0 solid #CDEB45", borderWidth: "0 0 4px 4px", borderRadius: "6px" }} />
          <span style={{ position: "absolute", right: "16%", bottom: "12%", width: "44px", height: "44px", border: "0 solid #CDEB45", borderWidth: "0 4px 4px 0", borderRadius: "6px" }} />
          <span style={{ position: "absolute", left: "50%", top: "18px", marginLeft: "-80px", width: "160px", height: "34px", borderRadius: "999px", background: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
            인식 완료 · 98%
          </span>
          <div style={{ position: "absolute", left: "0", right: "0", bottom: "18px", display: "flex", justifyContent: "center", gap: "10px" }}>
            <span style={{ height: "44px", padding: "0 18px", borderRadius: "999px", background: "rgba(255,255,255,0.14)", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center" }}>
              다시 찍기
            </span>
            <span style={{ height: "44px", padding: "0 18px", borderRadius: "999px", background: "rgba(255,255,255,0.14)", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center" }}>
              앨범에서 올리기
            </span>
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ fontSize: "13px", fontWeight: "700", color: "#1F5C3F" }}>
              AI 인식 결과
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
              <span style={{ fontSize: "26px", fontWeight: "800" }}>
                투명 페트병
              </span>
              <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#F2F3EE", fontSize: "12px", fontWeight: "700", display: "flex", alignItems: "center" }}>
                플라스틱 · PET
              </span>
            </div>
            <div style={{ marginTop: "16px", padding: "16px", borderRadius: "20px", background: "#E3F1FC", display: "flex", alignItems: "center", gap: "12px", animation: "rpPop .5s ease" }}>
              <span style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                  <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                </svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "17px", fontWeight: "800", color: "#17507F" }}>
                  물방울 1개 적립! (+1P)
                </span>
                <span style={{ fontSize: "13px", color: "#2F5F86" }}>
                  사진 등록 기본 리워드 · 오늘 3번째 인식
                </span>
              </span>
            </div>
            <div style={{ fontSize: "16px", fontWeight: "800", marginTop: "22px" }}>
              이렇게 버려주세요
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginTop: "12px" }}>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#121614", color: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  1
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    내용물 비우고 헹구기
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    물로 한 번 헹궈 말려 주세요
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#121614", color: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  2
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    라벨 떼기
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    비닐 라벨은 비닐류로 따로
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#121614", color: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  3
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    납작하게 찌그러뜨리기
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    뚜껑은 닫아서 함께 배출
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "12px", alignItems: "flex-start" }}>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#121614", color: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  4
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    투명 페트병 전용 수거함
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    유색 페트병과 섞지 않아요
                  </span>
                </span>
              </div>
            </div>
          </div>
          <div style={{ background: "#121614", borderRadius: "22px", padding: "20px", boxSizing: "border-box", color: "#FFFFFF" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <span style={{ fontSize: "13px", fontWeight: "700", color: "#CDEB45" }}>
                더 큰 리워드
              </span>
              <span style={{ height: "30px", padding: "0 10px", borderRadius: "999px", background: "#3E9BEA", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#FFFFFF" />
                  <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                </svg>
                +5
              </span>
            </div>
            <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "8px", lineHeight: "1.4" }}>
              실제로 버리는 모습을 인증하면
              <br />
              물방울 5개를 드려요
            </div>
            <div style={{ fontSize: "13px", color: "#C9CEC9", marginTop: "6px" }}>
              수거함에 넣는 사진을 올리면 커뮤니티 피드에도 함께 올라가요.
            </div>
            {V.notCert ? (
              <>
                <button onClick={V.onCert} style={{ marginTop: "16px", width: "100%", height: "54px", borderRadius: "16px", border: "none", background: "#CDEB45", color: "#121614", fontSize: "16px", fontWeight: "800" }}>
                  실천 인증 사진 올리기
                </button>
              </>
            ) : null}
            {V.cert ? (
              <>
                <Link to="/community" style={{ marginTop: "16px", height: "54px", borderRadius: "16px", background: "rgba(255,255,255,0.12)", color: "#FFFFFF", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  인증 완료 · 커뮤니티에서 보기 ›
                </Link>
              </>
            ) : null}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
            <Link to="/chat" style={{ padding: "16px", borderRadius: "20px", background: "#EAF7EE", display: "flex", flexDirection: "column", gap: "8px" }}>
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none" aria-hidden="true">
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
              <span style={{ fontSize: "15px", fontWeight: "800" }}>
                헷갈리면 포티에게
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                음식물 vs 일반쓰레기 등
              </span>
            </Link>
            <a href="#partner" style={{ padding: "16px", borderRadius: "20px", background: "#FFF6DC", display: "flex", flexDirection: "column", gap: "8px" }}>
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                <rect x="3" y="8" width="18" height="12" rx="2" fill="#F5C33B" />
                <path d="M3 9l2-5h14l2 5" fill="#FFD866" />
                <rect x="10" y="13" width="4" height="7" fill="#FFFFFF" />
              </svg>
              <span style={{ fontSize: "15px", fontWeight: "800" }}>
                리사이클 파트너
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                [파트너사] 회수 프로그램
              </span>
            </a>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                오늘의 인식
              </span>
              <Link to="/mypage" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                통계 ›
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
              <div style={{ padding: "14px 10px", borderRadius: "16px", background: "#F7F8F4", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800" }}>
                  3회
                </div>
                <div style={{ fontSize: "12px", color: "#454B47", marginTop: "2px" }}>
                  오늘 인식
                </div>
              </div>
              <div style={{ padding: "14px 10px", borderRadius: "16px", background: "#F7F8F4", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800" }}>
                  320회
                </div>
                <div style={{ fontSize: "12px", color: "#454B47", marginTop: "2px" }}>
                  누적 인식
                </div>
              </div>
              <div style={{ padding: "14px 10px", borderRadius: "16px", background: "#F7F8F4", textAlign: "center" }}>
                <div style={{ fontSize: "22px", fontWeight: "800" }}>
                  {V.dropsToday}개
                </div>
                <div style={{ fontSize: "12px", color: "#454B47", marginTop: "2px" }}>
                  오늘 물방울
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      {V.hasToast ? (
        <>
          <div style={{ position: "fixed", left: "50%", bottom: "120px", marginLeft: "-200px", width: "400px", zIndex: "9", display: "flex", justifyContent: "center", animation: "rpToast 2s ease forwards" }}>
            <span style={{ padding: "14px 22px", borderRadius: "999px", background: "#121614", color: "#FFFFFF", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#7CC4FF" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              {V.toast}
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}
