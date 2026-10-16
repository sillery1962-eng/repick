/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45p_Home.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic, css } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
renderVals() {
const S = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']; const NEED = [5, 10, 15, 20, 30, 40];
let i = S.indexOf(this.props.stage ?? '묘목'); if (i < 0) i = 3;
const o = {}; for (let k = 0; k < 7; k++) o['t' + k] = i === k;
const left = i < 6 ? Math.ceil(NEED[i] * 0.6) : 0;
const inn = (this.props.login ?? '로그인 후') !== '로그인 전';
return { ...o, stageNum: i + 1, stageName: S[i], pct: i < 6 ? '40%' : '100%',
  nextLine: i < 6 ? '다음 단계 ‘' + S[i + 1] + '’까지 물방울 ' + left + '개' : '열매가 열렸어요! 지금 수확할 수 있어요',
  loggedIn: inn, loggedOut: !inn };
}
}

export default function HomePc() {
  const V = useDcLogic(Component)
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%" }}>
      <main style={{ position: "relative", padding: "32px 0 60px", boxSizing: "border-box", margin: "0 auto", width: "100%", maxWidth: "1120px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
          <Link to="/scan" style={{ position: "relative", display: "block", height: "340px", borderRadius: "30px", overflow: "hidden", background: "#1F5C3F", color: "#FFFFFF", padding: "38px 40px", boxSizing: "border-box", isolation: "isolate" }}>
            <img src="/design/73cb4d1a9860ddc5f95bf1a70f49edf3.jpg" alt="햇살 가득한 밝은 숲길 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
            <span style={{ position: "absolute", inset: "0", zIndex: "-1", background: "linear-gradient(90deg, rgba(14,38,24,0.70) 0%, rgba(14,38,24,0.38) 55%, rgba(14,38,24,0.08) 100%)" }} />
            <span style={{ display: "inline-flex", height: "28px", padding: "0 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", fontSize: "12px", fontWeight: "700", alignItems: "center" }}>
              RePick 나의 숲 시즌 1
            </span>
            <div style={{ fontSize: "40px", fontWeight: "800", lineHeight: "1.25", marginTop: "14px", position: "relative", zIndex: "1" }}>
              버리는 순간,
              <br />
              나의 숲이 자라요
            </div>
            <div style={{ fontSize: "16px", color: "#D7EBDD", marginTop: "10px", lineHeight: "1.5", width: "420px", position: "relative", zIndex: "1" }}>
              AI로 인증하고 물방울을 모아
              <br />
              나만의 과일나무를 키워보세요.
            </div>
            <span style={{ position: "absolute", left: "40px", bottom: "36px", height: "50px", padding: "0 22px", borderRadius: "999px", background: "#CDEB45", color: "#121614", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
              AI로 인증 시작하기 ›
            </span>
            <span style={{ position: "absolute", right: "24px", top: "24px", height: "26px", padding: "0 10px", borderRadius: "999px", background: "rgba(0,0,0,0.25)", fontSize: "12px", display: "flex", alignItems: "center" }}>
              1 / 3
            </span>
          </Link>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                나의 숲
              </span>
              <Link to="/forest" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                자세히 ›
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px" }}>
              <span style={{ width: "140px", height: "140px", borderRadius: "24px", background: "linear-gradient(180deg, #E6F4FB, #EEF7E6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                {V.t0 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <path d="M60 106V90" stroke="#3E8E45" strokeWidth="3.5" strokeLinecap="round" />
                      <path d="M60 94c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
                      <path d="M60 92c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
                    </svg>
                  </>
                ) : null}
                {V.t1 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <path d="M60 106V78" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                      <ellipse cx="46" cy="76" rx="15" ry="8.5" transform="rotate(-24 46 76)" fill="#6CC25F" />
                      <ellipse cx="74" cy="74" rx="15" ry="8.5" transform="rotate(24 74 74)" fill="#4EAE52" />
                    </svg>
                  </>
                ) : null}
                {V.t2 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <path d="M60 106V52" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                      <path d="M60 92c0-9-7-14-16-14 0 9 7 14 16 14z" fill="#6CC25F" />
                      <path d="M60 80c0-9 7-14 16-14 0 9-7 14-16 14z" fill="#4EAE52" />
                      <path d="M60 68c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
                      <path d="M60 58c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
                    </svg>
                  </>
                ) : null}
                {V.t3 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                      <path d="M60 22l22 30H38z" fill="#3FA35A" />
                      <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                    </svg>
                  </>
                ) : null}
                {V.t4 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="56.5" y="70" width="7" height="36" rx="2.5" fill="#8A5A3C" />
                      <circle cx="60" cy="58" r="20" fill="#3FA35A" />
                      <circle cx="44" cy="68" r="12" fill="#3FA35A" />
                      <circle cx="76" cy="68" r="12" fill="#3FA35A" />
                      <circle cx="54" cy="52" r="7" fill="#5DB85A" />
                    </svg>
                  </>
                ) : null}
                {V.t5 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                    </svg>
                  </>
                ) : null}
                {V.t6 ? (
                  <>
                    <svg width="128" height="128" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                      <circle cx="46" cy="44" r="5" fill="#FFFFFF" />
                      <circle cx="70" cy="34" r="5" fill="#FFFFFF" />
                      <circle cx="64" cy="58" r="5" fill="#FFFFFF" />
                      <circle cx="36" cy="62" r="5" fill="#FFFFFF" />
                      <circle cx="84" cy="56" r="5" fill="#FFFFFF" />
                      <circle cx="56" cy="24" r="5" fill="#FFFFFF" />
                      <circle cx="46" cy="44" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                      <circle cx="70" cy="34" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                      <circle cx="64" cy="58" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                      <circle cx="36" cy="62" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                      <circle cx="84" cy="56" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                      <circle cx="56" cy="24" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                    </svg>
                  </>
                ) : null}
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: "1" }}>
                <span style={{ alignSelf: "flex-start", height: "26px", padding: "0 10px", borderRadius: "999px", background: "#CDEB45", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center" }}>
                  {V.stageNum}{" / 7단계"}
                </span>
                <span style={{ fontSize: "22px", fontWeight: "800" }}>
                  {V.stageName}
                </span>
                <span style={{ fontSize: "13px", color: "#454B47", display: "flex", alignItems: "center", gap: "4px" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  {"보유 물방울 "}
                  <b style={{ color: "#17507F" }}>
                    12개
                  </b>
                </span>
              </div>
            </div>
            <div style={{ height: "10px", borderRadius: "999px", background: "#EEF0EA", marginTop: "18px", overflow: "hidden" }}>
              <div style={css(`height: 100%; border-radius: 999px; background: #3E9BEA; width: ${V.pct}`)} />
            </div>
            <div style={{ fontSize: "13px", color: "#454B47", marginTop: "8px" }}>
              {V.nextLine}
            </div>
            <span style={{ flexGrow: "1" }} />
            <Link to="/forest" style={{ marginTop: "16px", height: "50px", borderRadius: "16px", background: "#D7EBDD", color: "#121614", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              물 주러 가기
            </Link>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1.9fr 1fr 1fr 1fr", gap: "16px", marginTop: "24px" }}>
          <Link to="/scan" style={{ display: "flex", alignItems: "center", gap: "14px", background: "#12804A", color: "#FFFFFF", borderRadius: "24px", padding: "22px 24px" }}>
            <span style={{ width: "52px", height: "52px", borderRadius: "16px", background: "rgba(255,255,255,0.18)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8V5a2 2 0 0 1 2-2h3" />
                <path d="M16 3h3a2 2 0 0 1 2 2v3" />
                <path d="M21 16v3a2 2 0 0 1-2 2h-3" />
                <path d="M8 21H5a2 2 0 0 1-2-2v-3" />
                <circle cx="12" cy="12" r="3.5" />
              </svg>
            </span>
            <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
              <span style={{ fontSize: "17px", fontWeight: "700", whiteSpace: "nowrap" }}>
                AI로 분리배출 인증하기
              </span>
              <span style={{ fontSize: "13px", color: "#E6F7EC" }}>
                작은 분리배출이 만드는, 더 큰 내일
              </span>
            </span>
            <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#FFFFFF", color: "#17507F", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px", flexShrink: "0" }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              +1
            </span>
          </Link>
          <Link to="/forest#attend" style={{ display: "flex", flexDirection: "row", gap: "10px", padding: "18px", borderRadius: "22px", background: "#E3F1FC" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>
                출석체크
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                매일 물방울 +1
              </span>
            </span>
          </Link>
          <Link to="/events" style={{ display: "flex", flexDirection: "row", gap: "10px", padding: "18px", borderRadius: "22px", background: "#FFEEE6" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="9" width="16" height="11" rx="2" fill="#FF7A59" />
                <rect x="3" y="6" width="18" height="4" rx="1.5" fill="#FFB199" />
                <path d="M12 6v14" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>
                이벤트
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                퀴즈 · 친구추천
              </span>
            </span>
          </Link>
          {V.loggedOut ? (
            <>
              <Link to="/welcome" style={{ display: "flex", flexDirection: "row", gap: "10px", padding: "18px", borderRadius: "22px", background: "#EEF7E6" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F5C3F" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "800" }}>
                    회원가입 · 로그인
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    가입하면 새싹 선물
                  </span>
                </span>
              </Link>
            </>
          ) : null}
          {V.loggedIn ? (
            <>
              <Link to="/mypage" style={{ display: "flex", flexDirection: "row", gap: "10px", padding: "18px", borderRadius: "22px", background: "#EEF7E6" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="30" height="30" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                    <path d="M60 22l22 30H38z" fill="#3FA35A" />
                    <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "800" }}>
                    마이페이지
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    나의 숲 · 인식 통계
                  </span>
                </span>
              </Link>
            </>
          ) : null}
        </div>
        <div style={{ marginTop: "24px" }}>
          <nav aria-label="바로가기" style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: "10px" }}>
            <a href="#rework" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <ellipse cx="12" cy="21.3" rx="7" ry="1.4" fill="#BFE6D6" />
                  <circle cx="13.6" cy="4.2" r="2.4" fill="#17A37B" />
                  <path d="M12.6 8.4l-1.6 6.1" stroke="#17A37B" strokeWidth="3.2" strokeLinecap="round" />
                  <path d="M11 14.5l-2.8 5.8M11 14.5l3 2.6.4 3.3" stroke="#17A37B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12.4 9.2l-3.6 2.4M12.6 9.6l2.4 2.9 2.6.6" stroke="#0E7357" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              리워크
            </a>
            <Link to="/chat" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="7" width="14" height="14" rx="3" fill="#7CC6A0" />
                  <rect x="3.5" y="4" width="17" height="4" rx="2" fill="#1F5C3F" />
                  <path d="M10 11v6M14 11v6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              배출 가이드
            </Link>
            <Link to="/map" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="#4D8FD6" />
                  <circle cx="12" cy="10" r="2.8" fill="#FFFFFF" />
                </svg>
              </span>
              수거함 찾기
            </Link>
            <Link to="/points" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill="#F5C33B" />
                  <circle cx="12" cy="12" r="6.5" fill="#FFD866" />
                  <path d="M10 16V8h2.6a2.3 2.3 0 0 1 0 4.6H10" stroke="#9A6A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              포인트
            </Link>
            <Link to="/points#shop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 8h14l-1.2 12a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z" fill="#9BD37A" />
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="#1F5C3F" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 18v-4M12 15c0-1.6 1.2-2.6 3-2.6 0 1.7-1.2 2.6-3 2.6z" stroke="#1F5C3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              저탄소 제품
            </Link>
            <Link to="/community" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M3 5.5A1.5 1.5 0 0 1 4.5 4h11A1.5 1.5 0 0 1 17 5.5v7a1.5 1.5 0 0 1-1.5 1.5H8l-4 3.2z" fill="#7CB7F0" />
                  <path d="M19 8h.5A1.5 1.5 0 0 1 21 9.5V20l-3.5-2.8H11a1.5 1.5 0 0 1-1.5-1.5V16" fill="#C4DEF8" />
                  <circle cx="7.5" cy="9" r="1.1" fill="#FFFFFF" />
                  <circle cx="10.5" cy="9" r="1.1" fill="#FFFFFF" />
                  <circle cx="13.5" cy="9" r="1.1" fill="#FFFFFF" />
                </svg>
              </span>
              커뮤니티
            </Link>
            <Link to="/donate" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 20.5l-7.2-7.1A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 7.2 6.4z" fill="#FF7A59" />
                  <path d="M3 20h5l3-2" stroke="#C4552B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              기부하기
            </Link>
            <Link to="/events#ranking" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "68px", height: "68px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="#B48CF0" />
                  <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.6M17 6h2.5a2.5 2.5 0 0 1-2.6 3.6" stroke="#7A4FC9" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M12 14v4M8.5 20.5h7" stroke="#7A4FC9" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              챌린지
            </Link>
          </nav>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                저탄소 참여기업
              </span>
              <Link to="/points#shop" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", margin: "-8px 0 18px" }}>
              174곳 기업의 저탄소 제품을 이용해보세요.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px" }}>
              <a href="#company" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                <span style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#E6E9E2", position: "relative", overflow: "hidden", isolation: "isolate", display: "block", flexShrink: "0" }}>
                  <img src="/design/6533f2ecb04c60d2eadd60301f7d8bac.jpg" alt="채소 진열대 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  자연상점
                </span>
                <span style={{ fontSize: "12px", color: "#454B47", marginTop: "-6px" }}>
                  제품 1,163개
                </span>
              </a>
              <a href="#company" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                <span style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#E6E9E2", position: "relative", overflow: "hidden", isolation: "isolate", display: "block", flexShrink: "0" }}>
                  <img src="/design/168a7e44e8a1d376f6292f58ccc86bac.jpg" alt="제철 채소와 과일 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  올가홀푸드
                </span>
                <span style={{ fontSize: "12px", color: "#454B47", marginTop: "-6px" }}>
                  제품 624개
                </span>
              </a>
              <a href="#company" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                <span style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#E6E9E2", position: "relative", overflow: "hidden", isolation: "isolate", display: "block", flexShrink: "0" }}>
                  <img src="/design/3751b0f61bc5806919065836a8b923f2.jpg" alt="바구니에 담긴 채소 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  두레생협
                </span>
                <span style={{ fontSize: "12px", color: "#454B47", marginTop: "-6px" }}>
                  제품 522개
                </span>
              </a>
              <a href="#company" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", textAlign: "center" }}>
                <span style={{ width: "96px", height: "96px", borderRadius: "50%", background: "#E6E9E2", position: "relative", overflow: "hidden", isolation: "isolate", display: "block", flexShrink: "0" }}>
                  <img src="/design/04a7ec2dcd556642d5e8df765d3e03d8.jpg" alt="초록 농장 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ fontSize: "14px", fontWeight: "700" }}>
                  농협하나로유통
                </span>
                <span style={{ fontSize: "12px", color: "#454B47", marginTop: "-6px" }}>
                  제품 424개
                </span>
              </a>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                모은 포인트로 지구에 기부
              </span>
              <Link to="/donate" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link to="/donate" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "20px", background: "#E6F0FB" }}>
                <span style={{ width: "58px", height: "58px", borderRadius: "16px", background: "#4D8FD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/0111d49b8ba700679becc1d1474445b2.jpg" alt="바다와 해변 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700" }}>
                    해양 정화 활동 지원
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    바다 쓰레기를 함께 치워요
                  </span>
                </span>
                <span style={{ fontSize: "20px", color: "#454B47" }}>
                  ›
                </span>
              </Link>
              <a href="#d2" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px", borderRadius: "20px", background: "#E8F3E4" }}>
                <span style={{ width: "58px", height: "58px", borderRadius: "16px", background: "#1F5C3F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
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
                <span style={{ width: "58px", height: "58px", borderRadius: "16px", background: "#FF7A59", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                커뮤니티 자랑 피드
              </span>
              <Link to="/community" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "12px" }}>
              <Link to="/community" style={{ borderRadius: "20px", background: "#F2F3EE", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "150px", background: "linear-gradient(180deg, #E6F4FB, #EEF7E6)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/ec6bcbc9324d2d97bcc52e97947dd34b.jpg" alt="잎이 무성한 큰 나무 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    오*원
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700", lineHeight: "1.4" }}>
                    사과나무 완성했어요! 87일 걸렸네요
                  </span>
                  <span style={{ fontSize: "12px", color: "#C4552B", fontWeight: "700" }}>
                    ♥ 128
                  </span>
                </span>
              </Link>
              <Link to="/community" style={{ borderRadius: "20px", background: "#F2F3EE", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "150px", background: "linear-gradient(180deg, #E6F4FB, #EEF7E6)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/1bf518cba1e99295c3037341afced4a2.jpg" alt="색깔별 분리수거함 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    김*결
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700", lineHeight: "1.4" }}>
                    아파트 분리수거 인증 · 라벨 다 뗐어요
                  </span>
                  <span style={{ fontSize: "12px", color: "#C4552B", fontWeight: "700" }}>
                    ♥ 64
                  </span>
                </span>
              </Link>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                이달의 적립왕
              </span>
              <Link to="/events#ranking" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "18px", background: "#CDEB45" }}>
                <b style={{ width: "24px", fontSize: "18px" }}>
                  1
                </b>
                <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                    <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                    <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                    <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                    <circle cx="52" cy="36" r="10" fill="#45A862" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", fontSize: "15px", fontWeight: "700" }}>
                  이*진
                </span>
                <b style={{ fontSize: "15px" }}>
                  1,520P
                </b>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "18px", background: "#F2F3EE" }}>
                <b style={{ width: "24px", fontSize: "18px" }}>
                  2
                </b>
                <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <rect x="56.5" y="70" width="7" height="36" rx="2.5" fill="#8A5A3C" />
                    <circle cx="60" cy="58" r="20" fill="#3FA35A" />
                    <circle cx="44" cy="68" r="12" fill="#3FA35A" />
                    <circle cx="76" cy="68" r="12" fill="#3FA35A" />
                    <circle cx="54" cy="52" r="7" fill="#5DB85A" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", fontSize: "15px", fontWeight: "700" }}>
                  박*우
                </span>
                <b style={{ fontSize: "15px" }}>
                  1,380P
                </b>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "18px", background: "#F2F3EE" }}>
                <b style={{ width: "24px", fontSize: "18px" }}>
                  3
                </b>
                <span style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="32" height="32" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                    <path d="M60 22l22 30H38z" fill="#3FA35A" />
                    <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", fontSize: "15px", fontWeight: "700" }}>
                  최*아
                </span>
                <b style={{ fontSize: "15px" }}>
                  1,210P
                </b>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
