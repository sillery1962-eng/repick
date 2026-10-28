/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45p_Home.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic, css } from '../../lib/dc'
import HomeEcoCompanies from './HomeEcoCompanies' // 친환경 기업 추천 = 친환경샵 쇼핑몰 (data/ecoCompanies.js, 누르면 쇼핑몰 팝업)
import ReworkMenu from './ReworkMenu' // 바로가기 리워크 칸 + 준비 중 팝업
import HomeRanking from './HomeRanking' // 이달의 적립왕: 실제 GET /events/ranking
import HomeCommunityFeed from './HomeCommunityFeed' // 커뮤니티 자랑 피드: 실제 GET /posts
import useHomeForest from './useHomeForest' // 나의 숲 카드: 실제 GET /forest 값
import HomeBanner from './HomeBanner' // 맨 위 배너 슬라이드 3장 (줍깅 챌린지 → 커뮤니티)

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

// AI 인증 옆 작은 칸(출석·이벤트·친구 초대·가입) 공통 모양 — 시안 v45p_Home_AI2: 높이 150, 배경 그림은 칸 안 svg
const tileStyle = (background) => ({ position: "relative", overflow: "hidden", isolation: "isolate", height: "150px", boxSizing: "border-box", display: "flex", flexDirection: "column", gap: "10px", padding: "18px 20px", borderRadius: "24px", background })
const tileIconStyle = { width: "40px", height: "40px", borderRadius: "12px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }

export default function HomePc() {
  const V = useDcLogic(Component)
  const F = useHomeForest()
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%" }}>
      <main style={{ position: "relative", padding: "32px 0 60px", boxSizing: "border-box", margin: "0 auto", width: "100%", maxWidth: "1120px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: "24px" }}>
          {/* 맨 위 배너 슬라이드: 나의 숲 → 줍깅 챌린지 → RePick 프렌즈 (HomeBanner.jsx) */}
          <HomeBanner />
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                나의 숲
              </span>
              <Link to="/forest" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                자세히 ›
              </Link>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "16px", marginTop: "8px", padding: "20px", borderRadius: "24px", overflow: "hidden", background: "linear-gradient(180deg, #DDF0FB 0%, #EAF6DA 50%, #FBE3CC 100%)" }}> {/* 나의 숲 카드 배경: 나의 숲 화면과 같은 하늘·연두 그라데이션 → 아래 흙색 (가로 줄마다 같은 색) */}
              <span style={{ width: "140px", height: "140px", borderRadius: "24px", background: "#F7F8F4", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", boxShadow: "0 6px 16px rgba(31, 92, 63, 0.15)" }}>
                <img src={F.image} alt={`${F.stageName} 나무`} width="128" height="128" decoding="async" style={{ display: "block", width: "128px", height: "128px", objectFit: "contain", objectPosition: "center bottom" }} />
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
            <Link to="/forest" style={{ marginTop: "16px", height: "50px", borderRadius: "16px", background: "#D7EBDD", color: "#121614", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              물 주러 가기
            </Link>
          </div>
        </div>
        {/* AI 인증 · 출석 · 이벤트 · 친구 초대 줄 — 시안 v45p_Home_AI2 (AI 인증 사진 카드 + 타일 배경 그림), 칸 높이 150 */}
        <div style={{ display: "grid", gridTemplateColumns: V.loggedIn ? "1.9fr 1fr 1fr 1fr" : "1.9fr 1fr 1fr 1fr 1fr", gap: "16px", marginTop: "24px" }}>
          <Link to="/scan" style={{ position: "relative", display: "block", height: "150px", borderRadius: "24px", overflow: "hidden", isolation: "isolate", background: "#12804A", color: "#FFFFFF" }}>
            <img src="/design/b18967dd6c8d2ce9d303826b260294b3.jpg" alt="투명 페트병이 가득한 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", objectPosition: "70% 50%", zIndex: "-2" }} />
            <span style={{ position: "absolute", inset: "0", zIndex: "-1", background: "linear-gradient(90deg, rgba(18,128,74,0.97) 0%, rgba(18,128,74,0.88) 40%, rgba(18,128,74,0.15) 72%, rgba(18,128,74,0) 100%)" }} />
            {/* 오른쪽 인식 틀 + "인식 완료" 표시 (꾸밈 그림) */}
            <span aria-hidden="true" style={{ position: "absolute", right: "22px", top: "24px", bottom: "18px", width: "150px" }}>
              <span style={{ position: "absolute", left: "0", top: "0", width: "18px", height: "18px", border: "0 solid #FFFFFF", borderLeftWidth: "2px", borderTopWidth: "2px", borderTopLeftRadius: "4px" }} />
              <span style={{ position: "absolute", right: "0", top: "0", width: "18px", height: "18px", border: "0 solid #FFFFFF", borderRightWidth: "2px", borderTopWidth: "2px", borderTopRightRadius: "4px" }} />
              <span style={{ position: "absolute", left: "0", bottom: "0", width: "18px", height: "18px", border: "0 solid #FFFFFF", borderLeftWidth: "2px", borderBottomWidth: "2px", borderBottomLeftRadius: "4px" }} />
              <span style={{ position: "absolute", right: "0", bottom: "0", width: "18px", height: "18px", border: "0 solid #FFFFFF", borderRightWidth: "2px", borderBottomWidth: "2px", borderBottomRightRadius: "4px" }} />
              <span style={{ position: "absolute", left: "50%", top: "-13px", transform: "translateX(-50%)", display: "inline-flex", alignItems: "center", gap: "5px", height: "26px", padding: "0 11px", borderRadius: "999px", background: "rgba(255,255,255,0.92)", color: "#121614", fontSize: "12px", fontWeight: "800", whiteSpace: "nowrap", boxShadow: "0 4px 12px rgba(0,0,0,0.15)" }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#12804A" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M5 12.5l4.5 4.5L19 7.5" />
                </svg>
                인식 완료 · 98%
              </span>
            </span>
            <span style={{ position: "absolute", left: "24px", top: "22px", bottom: "22px", width: "230px", display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
              <span style={{ height: "26px", padding: "0 10px", borderRadius: "999px", background: "#CDEB45", color: "#121614", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "3px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                  <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                </svg>
                물방울 +1
              </span>
              <span style={{ fontSize: "20px", fontWeight: "800", marginTop: "12px", whiteSpace: "nowrap" }}>
                AI로 분리배출 인증하기
              </span>
              <span style={{ fontSize: "13px", color: "#E6F7EC", marginTop: "4px", lineHeight: "1.45" }}>
                사진 한 장이면 품목과
                <br />
                버리는 법을 알려드려요
              </span>
            </span>
          </Link>
          {/* 출석체크: 배경은 오른쪽 위 흰 동그라미만 */}
          <Link to="/events" style={tileStyle("#E3F1FC")}>
            <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 236 150" preserveAspectRatio="xMaxYMax slice" style={{ position: "absolute", inset: "0", zIndex: "-1" }}>
              <circle cx="214" cy="24" r="46" fill="#FFFFFF" opacity="0.35" />
            </svg>
            <span style={tileIconStyle}>
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
          {/* 이벤트: 배경은 오른쪽 위 흰 동그라미만 */}
          <Link to="/events" style={tileStyle("#FFEEE6")}>
            <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 236 150" preserveAspectRatio="xMaxYMax slice" style={{ position: "absolute", inset: "0", zIndex: "-1" }}>
              <circle cx="210" cy="30" r="50" fill="#FFFFFF" opacity="0.35" />
            </svg>
            <span style={tileIconStyle}>
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
                퀴즈 · 챌린지
              </span>
            </span>
          </Link>
          {/* 친구 초대: 이벤트·챌린지의 친구 초대 화면으로 이동 (배경은 오른쪽 위 흰 동그라미만) */}
          <Link to="/events/invite" style={tileStyle("#E8F3E4")}>
            <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 236 150" preserveAspectRatio="xMaxYMax slice" style={{ position: "absolute", inset: "0", zIndex: "-1" }}>
              <circle cx="206" cy="34" r="44" fill="#FFFFFF" opacity="0.4" />
            </svg>
            <span style={tileIconStyle}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#12804A" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                <circle cx="9" cy="8" r="3.5" />
                <path d="M2.5 20c0-3.6 3-5.5 6.5-5.5s6.5 1.9 6.5 5.5" />
                <path d="M19 8v6M16 11h6" />
              </svg>
            </span>
            <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>
                친구 초대
              </span>
              <span style={{ fontSize: "12px", color: "#454B47" }}>
                1명당 물방울 +2
              </span>
            </span>
          </Link>
          {V.loggedOut ? (
            <>
              {/* 회원가입 · 로그인 (로그아웃 상태만): 배경에 언덕과 새싹 그림 */}
              <Link to="/welcome" style={tileStyle("#EEF7E6")}>
                <svg aria-hidden="true" width="100%" height="100%" viewBox="0 0 236 150" preserveAspectRatio="xMaxYMax slice" style={{ position: "absolute", inset: "0", zIndex: "-1" }}>
                  <circle cx="206" cy="34" r="44" fill="#FFFFFF" opacity="0.4" />
                  <path d="M0 132c60-26 130-30 236-8v26H0z" fill="#CFE6BC" />
                  <path d="M80 150c40-24 100-30 156-18v18z" fill="#B5D99C" />
                  <path d="M186 134V92" stroke="#2E8B4E" strokeWidth="6" strokeLinecap="round" />
                  <path d="M186 102c-6-20-26-26-40-20 3 17 20 26 40 20z" fill="#69C46A" />
                  <path d="M186 92c3-23 23-31 40-26-3 20-20 29-40 26z" fill="#3FA35A" />
                </svg>
                <span style={tileIconStyle}>
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
        </div>
        <div style={{ marginTop: "24px" }}>
          <nav aria-label="바로가기" style={{ background: "#FFFFFF", borderRadius: "28px", padding: "18px 28px", boxSizing: "border-box", display: "grid", gridTemplateColumns: "repeat(8, minmax(0, 1fr))", gap: "10px" }}>
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
              친환경샵
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
            <ReworkMenu boxSize={68} /> {/* 리워크: 준비 중이라 맨 뒤 (누르면 "준비 중입니다" 팝업) */}
          </nav>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                친환경 기업 추천
              </span>
              <Link to="/points#shop" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", margin: "-8px 0 50px" }}> {/* 아래 50px: 동그라미 3개를 조금 아래로 (동그라미 128→134로 커진 6px만큼 줄여 칸 높이 유지) */}
              환경을 생각하는 기업을 둘러보세요.
            </div>
            {/* 쇼핑몰 목록은 data/ecoCompanies.js (친환경샵과 같은 목록) */}
            <HomeEcoCompanies circle={134} />
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
              {/* 기부처를 누르면 그 기부처 상세 (/donate?campaign=번호, 번호는 backend/data/campaigns.json의 id) */}
              <Link to="/donate?campaign=1" style={{ display: "flex", alignItems: "center", gap: "28px", padding: "8px 14px 8px 8px", borderRadius: "5px", background: "#E6F0FB" }}>
                <span style={{ width: "116px", height: "70px", borderRadius: "8px", background: "#4D8FD6", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
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
              <Link to="/donate?campaign=2" style={{ display: "flex", alignItems: "center", gap: "28px", padding: "8px 14px 8px 8px", borderRadius: "5px", background: "#E8F3E4" }}>
                <span style={{ width: "116px", height: "70px", borderRadius: "5px", background: "#1F5C3F", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
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
              </Link>
              <Link to="/donate?campaign=6" style={{ display: "flex", alignItems: "center", gap: "28px", padding: "8px 14px 8px 8px", borderRadius: "5px", background: "#FFF1E0" }}>
                <span style={{ width: "116px", height: "70px", borderRadius: "5px", background: "#F08A24", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/ff18d2fbf891033bf82b9595a8865072.jpg" alt="들판 위 노을 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "3px" }}>
                  <span style={{ fontSize: "16px", fontWeight: "700" }}>
                    저소득층 난방비 지원
                  </span>
                  <span style={{ fontSize: "13px", color: "#454B47" }}>
                    추운 겨울을 함께 나눠요
                  </span>
                </span>
                <span style={{ fontSize: "20px", color: "#454B47" }}>
                  ›
                </span>
              </Link>
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
            {/* 커뮤니티 최신 글 2개 (GET /posts, 사진 있는 글 먼저) */}
            <HomeCommunityFeed imageHeight={150} />
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "flex", flexDirection: "column" }}> {/* 세로로 쌓아서 순위 목록이 남은 높이를 채움 */}
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                이달의 적립왕
              </span>
              <Link to="/events#ranking" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                더보기 ›
              </Link>
            </div>
            {/* 이번 달 1~4위 (GET /events/ranking — 이벤트 명예의 전당과 같은 데이터), 옆 커뮤니티 칸 아래 줄에 맞춰 위아래로 벌림 */}
            <HomeRanking show={4} fill />
          </div>
        </div>
      </main>
    </div>
  )
}
