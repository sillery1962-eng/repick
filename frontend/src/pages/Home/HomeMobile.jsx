/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Home.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic, css } from '../../lib/dc'
import HomeEcoCompanies from './HomeEcoCompanies' // 친환경 기업 추천 = 친환경샵 쇼핑몰 (data/ecoCompanies.js, 누르면 쇼핑몰 팝업)
import ReworkMenu from './ReworkMenu' // 바로가기 리워크 칸 + 준비 중 팝업
import HomeRanking from './HomeRanking' // 이달의 적립왕: 실제 GET /events/ranking
import HomeCommunityFeed from './HomeCommunityFeed' // 커뮤니티 자랑 피드: 실제 GET /posts
import useHomeForest from './useHomeForest' // 나의 숲 카드: 실제 GET /forest 값
import useWallet from '../../components/useWallet' // 위 막대 💧·⭐: 실제 GET /points 값

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

export default function HomeMobile() {
  const V = useDcLogic(Component)
  const F = useHomeForest()
  const W = useWallet()
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%", maxWidth: "560px", margin: "0 auto", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px", display: "inline-flex", alignItems: "baseline" }} aria-label="RePick">
            Rep
            <svg viewBox="0 0 20 44" aria-hidden="true" style={{ height: "1.1em", width: "0.5em", margin: "0 -0.04em", overflow: "visible" }}>
              <path d="M10 24V12" stroke="#1F5C3F" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 16.5C10 10.8 6.4 7.2 1 7.2c0 5.5 3.6 9.3 9 9.3z" fill="#CDEB45" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 13.6C10 7.9 13.4 4.4 19 4.4c0 5.6-3.4 9.2-9 9.2z" fill="#9BD37A" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="7.4" y="22.4" width="5.2" height="21.6" rx="1.4" fill="currentColor" />
            </svg>
            ck
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Link to="/forest" title="물방울" style={{ height: "34px", padding: "0 10px 0 6px", borderRadius: "999px", background: "#E3F1FC", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "800", color: "#17507F" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
              <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            </svg>
            {W.dropsText}
          </Link>
          <Link to="/points" title="포인트" style={{ height: "34px", padding: "0 10px 0 5px", borderRadius: "999px", background: "#F2F3EE", display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", fontWeight: "800" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>
              P
            </span>
            {W.pointsText}
          </Link>
          {V.loggedIn ? (
            <>
              <Link to="/mypage" aria-label="마이페이지" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                  <path d="M60 22l22 30H38z" fill="#3FA35A" />
                  <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                </svg>
              </Link>
            </>
          ) : null}
          {V.loggedOut ? (
            <>
              <Link to="/welcome" style={{ height: "34px", padding: "0 12px", borderRadius: "999px", background: "#121614", color: "#FFFFFF", display: "flex", alignItems: "center", fontSize: "13px", fontWeight: "700" }}>
                로그인
              </Link>
            </>
          ) : null}
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px" }}>
          <Link to="/scan" style={{ position: "relative", display: "block", height: "230px", borderRadius: "22px", overflow: "hidden", background: "#1F5C3F", color: "#FFFFFF", padding: "22px 22px", boxSizing: "border-box", isolation: "isolate" }}>
            <img src="/design/73cb4d1a9860ddc5f95bf1a70f49edf3.jpg" alt="햇살 가득한 밝은 숲길 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
            <span style={{ position: "absolute", inset: "0", zIndex: "-1", background: "linear-gradient(90deg, rgba(14,38,24,0.70) 0%, rgba(14,38,24,0.38) 55%, rgba(14,38,24,0.08) 100%)" }} />
            <span style={{ display: "inline-flex", height: "28px", padding: "0 12px", borderRadius: "999px", background: "rgba(255,255,255,0.16)", fontSize: "12px", fontWeight: "700", alignItems: "center" }}>
              RePick 나의 숲 시즌 1
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", lineHeight: "1.25", marginTop: "14px", position: "relative", zIndex: "1" }}>
              잘 버리는 순간,
              <br />
              나의 숲이 자라요
            </div>
            <div style={{ fontSize: "13px", color: "#D7EBDD", marginTop: "10px", lineHeight: "1.5", width: "230px", position: "relative", zIndex: "1" }}>
              AI로 인증하고 물방울을 모아
              <br />
              나만의 과일나무를 키워보세요.
            </div>
            <span style={{ position: "absolute", right: "16px", top: "16px", height: "26px", padding: "0 10px", borderRadius: "999px", background: "rgba(0,0,0,0.25)", fontSize: "12px", display: "flex", alignItems: "center" }}>
              1 / 3
            </span>
          </Link>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                나의 숲
              </span>
              <Link to="/forest" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                자세히 ›
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", padding: "14px", borderRadius: "24px", overflow: "hidden", background: "linear-gradient(180deg, #DDF0FB 0%, #EAF6DA 50%, #FBE3CC 100%)" }}> {/* 나의 숲 카드 배경: 나의 숲 화면과 같은 하늘·연두 그라데이션 → 아래 흙색 (가로 줄마다 같은 색) */}
              <span style={{ width: "120px", height: "120px", borderRadius: "24px", background: "#F7F8F4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", boxShadow: "0 6px 16px rgba(31, 92, 63, 0.15)" }}>
                <img src={F.image} alt={`${F.stageName} 나무`} width="108" height="108" decoding="async" style={{ display: "block", width: "108px", height: "108px", objectFit: "contain", objectPosition: "center bottom" }} />
              </span>
              <div style={{ display: "flex", flexDirection: "column", gap: "6px", flexGrow: "1", minWidth: "0" }}>
                <span style={{ alignSelf: "flex-start", height: "26px", padding: "0 10px", borderRadius: "999px", background: "#CDEB45", fontSize: "12px", fontWeight: "800", display: "flex", alignItems: "center" }}>
                  {F.badge}
                </span>
                <span style={{ fontSize: "22px", fontWeight: "800" }}>
                  {F.stageName}
                </span>
                <span style={{ fontSize: "13px", color: "#454B47", display: "flex", alignItems: "center", gap: "4px", whiteSpace: "nowrap" }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  {"보유 물방울 "}
                  <b style={{ color: "#17507F", fontSize: "15px", fontWeight: "800" }}>
                    {F.drops}
                  </b>
                </span>
              </div>
            </div>
            <div style={{ height: "10px", borderRadius: "999px", background: "#EEF0EA", marginTop: "18px", overflow: "hidden" }}>
              <div style={css(`height: 100%; border-radius: 999px; background: #3E9BEA; width: ${F.pct}`)} />
            </div>
            <div style={{ fontSize: "13px", color: "#454B47", marginTop: "8px" }}>
              {F.nextLine}
            </div>
            <span style={{ flexGrow: "1" }} />
            <Link to="/forest" style={{ marginTop: "16px", height: "50px", borderRadius: "16px", color: "#FFFFFF", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px", backgroundColor: "#d7ebdd" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#7CC4FF" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              <span>
                물 주러 가기
              </span>
            </Link>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: V.loggedIn ? "1fr 1fr 1fr" : "1fr 1fr", gap: "10px", marginTop: "16px" }}>
          <div style={{ gridColumn: "1 / -1" }}>
            <Link to="/scan" style={{ display: "flex", alignItems: "center", gap: "14px", background: "#12804A", color: "#FFFFFF", borderRadius: "24px", padding: "18px" }}>
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
          </div>
          <Link to="/events" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px", borderRadius: "22px", background: "#E3F1FC", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800" }}>
                출석체크
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                매일 물방울
              </span>
            </span>
          </Link>
          <Link to="/events" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px", borderRadius: "22px", background: "#FFEEE6", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="9" width="16" height="11" rx="2" fill="#FF7A59" />
                <rect x="3" y="6" width="18" height="4" rx="1.5" fill="#FFB199" />
                <path d="M12 6v14" stroke="#FFFFFF" strokeWidth="2" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800" }}>
                이벤트
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                퀴즈 · 챌린지
              </span>
            </span>
          </Link>
          {/* 친구 초대: 이벤트·챌린지의 친구 초대 화면으로 이동 */}
          <Link to="/events/invite" style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "14px", borderRadius: "22px", background: "#E8F3E4", alignItems: "center", justifyContent: "center", textAlign: "center" }}>
            <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12804A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
                <path d="M19 8v6M16 11h6" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "14px", fontWeight: "800" }}>
                친구 초대
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                1명당 물방울
              </span>
            </span>
          </Link>
          {V.loggedOut ? (
            <>
              <Link to="/welcome" style={{ display: "flex", flexDirection: "column", gap: "10px", padding: "14px", borderRadius: "22px", background: "#EEF7E6" }}>
                <span style={{ width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1F5C3F" strokeWidth="2" strokeLinecap="round">
                    <circle cx="12" cy="8" r="4" />
                    <path d="M4 21c0-4 4-6 8-6s8 2 8 6" />
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "800" }}>
                    회원가입 · 로그인
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    가입하면 새싹 선물
                  </span>
                </span>
              </Link>
            </>
          ) : null}
        </div>
        <div style={{ marginTop: "16px" }}>
          <nav aria-label="바로가기" style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "18px 6px" }}>
            <Link to="/chat" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <rect x="5" y="7" width="14" height="14" rx="3" fill="#7CC6A0" />
                  <rect x="3.5" y="4" width="17" height="4" rx="2" fill="#1F5C3F" />
                  <path d="M10 11v6M14 11v6" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                </svg>
              </span>
              배출 가이드
            </Link>
            <Link to="/map" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="#4D8FD6" />
                  <circle cx="12" cy="10" r="2.8" fill="#FFFFFF" />
                </svg>
              </span>
              수거함 찾기
            </Link>
            <Link to="/points" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <circle cx="12" cy="12" r="9" fill="#F5C33B" />
                  <circle cx="12" cy="12" r="6.5" fill="#FFD866" />
                  <path d="M10 16V8h2.6a2.3 2.3 0 0 1 0 4.6H10" stroke="#9A6A00" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              포인트
            </Link>
            <Link to="/points#shop" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M5 8h14l-1.2 12a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z" fill="#9BD37A" />
                  <path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="#1F5C3F" strokeWidth="1.8" strokeLinecap="round" />
                  <path d="M12 18v-4M12 15c0-1.6 1.2-2.6 3-2.6 0 1.7-1.2 2.6-3 2.6z" stroke="#1F5C3F" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              친환경샵
            </Link>
            <Link to="/community" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
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
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M12 20.5l-7.2-7.1A4.8 4.8 0 0 1 12 7a4.8 4.8 0 0 1 7.2 6.4z" fill="#FF7A59" />
                  <path d="M3 20h5l3-2" stroke="#C4552B" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              기부하기
            </Link>
            <Link to="/events#ranking" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "13px", fontWeight: "500" }}>
              <span style={{ width: "60px", height: "60px", borderRadius: "20px", background: "#F2F3EE", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width="30" height="30" viewBox="0 0 24 24" fill="none">
                  <path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="#B48CF0" />
                  <path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.6M17 6h2.5a2.5 2.5 0 0 1-2.6 3.6" stroke="#7A4FC9" strokeWidth="1.6" strokeLinecap="round" />
                  <path d="M12 14v4M8.5 20.5h7" stroke="#7A4FC9" strokeWidth="2" strokeLinecap="round" />
                </svg>
              </span>
              챌린지
            </Link>
            <ReworkMenu boxSize={60} /> {/* 리워크: 준비 중이라 맨 뒤 (누르면 "준비 중입니다" 팝업) */}
          </nav>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", marginTop: "16px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                친환경 기업 추천
              </span>
              <Link to="/points#shop" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", margin: "-8px 0 18px" }}>
              환경을 생각하는 기업을 둘러보세요.
            </div>
            {/* 쇼핑몰 목록은 data/ecoCompanies.js (친환경샵과 같은 목록) */}
            <HomeEcoCompanies circle={70} mobile />
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
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
                <span style={{ width: "54px", height: "54px", borderRadius: "16px", background: "#4D8FD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
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
        <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: "14px", marginTop: "16px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                커뮤니티 자랑 피드
              </span>
              <Link to="/community" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            {/* 커뮤니티 최신 글 2개 (GET /posts, 사진 있는 글 먼저) */}
            <HomeCommunityFeed imageHeight={110} />
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                이달의 적립왕
              </span>
              <Link to="/events#ranking" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            {/* 이번 달 1~3위 (GET /events/ranking — 이벤트 명예의 전당과 같은 데이터) */}
            <HomeRanking />
          </div>
        </div>
      </main>
    </div>
  )
}
