/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45p_My.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
renderVals() { return {}; }
}

export default function MyPagePc() {
  useDcLogic(Component)
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "'Gothic A1', sans-serif", letterSpacing: "-0.3px", width: "100%" }}>
      <main style={{ position: "relative", padding: "32px 0 60px", boxSizing: "border-box", margin: "0 auto", width: "100%", maxWidth: "1120px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ fontSize: "30px", fontWeight: "800", marginBottom: "20px" }}>
          마이페이지
        </div>
        <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: "18px" }}>
          <span style={{ width: "110px", height: "110px", borderRadius: "50%", background: "linear-gradient(180deg, #DDF0FB, #EEF7E6)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
            <svg width="100" height="100" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
              <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
              <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
              <path d="M60 22l22 30H38z" fill="#3FA35A" />
              <path d="M60 38l27 34H33z" fill="#2E8B4E" />
            </svg>
          </span>
          <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
            <span style={{ fontSize: "24px", fontWeight: "800" }}>
              [이름]
            </span>
            <span style={{ fontSize: "14px", color: "#454B47" }}>
              묘목 · 4 / 7단계 · 대표 나무 사과나무
            </span>
            <a href="#instagram" style={{ alignSelf: "flex-start", height: "34px", padding: "0 12px", borderRadius: "999px", background: "#FCEEF5", color: "#C13584", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center", gap: "6px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
              </svg>
              @[instagram_id] 연동됨
            </a>
          </div>
          <a href="#edit" style={{ height: "42px", padding: "0 16px", borderRadius: "12px", border: "1px solid #D5D8D2", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center" }}>
            프로필 편집
          </a>
        </div>
        <div style={{ marginTop: "20px" }}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "16px" }}>
            <Link to="/points" style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
              <div style={{ fontSize: "13px", color: "#454B47" }}>
                포인트
              </div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "6px", color: "#121614" }}>
                6,170P
              </div>
            </Link>
            <Link to="/forest" style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
              <div style={{ fontSize: "13px", color: "#454B47" }}>
                물방울
              </div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "6px", color: "#17507F" }}>
                12개
              </div>
            </Link>
            <Link to="/forest" style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
              <div style={{ fontSize: "13px", color: "#454B47" }}>
                수확한 나무
              </div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "6px", color: "#1F5C3F" }}>
                1그루
              </div>
            </Link>
            <Link to="/points" style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
              <div style={{ fontSize: "13px", color: "#454B47" }}>
                탄소 절감
              </div>
              <div style={{ fontSize: "26px", fontWeight: "800", marginTop: "6px", color: "#121614" }}>
                32.6kg
              </div>
            </Link>
          </div>
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px", marginTop: "24px" }}>
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px", fontWeight: "800" }}>
                  나의 과일나무 컬렉션
                </span>
                <Link to="/forest" style={{ fontSize: "14px", color: "#454B47", padding: "8px 0" }}>
                  나의 숲 ›
                </Link>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
                <div style={{ borderRadius: "20px", background: "#FDECEA", padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>
                  <svg width="80" height="80" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                    <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                    <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                    <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                    <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                    <circle cx="52" cy="36" r="10" fill="#45A862" />
                    <circle cx="46" cy="44" r="5" fill="#E2483D" />
                    <circle cx="70" cy="34" r="5" fill="#E2483D" />
                    <circle cx="64" cy="58" r="5" fill="#E2483D" />
                    <circle cx="36" cy="62" r="5" fill="#E2483D" />
                    <circle cx="84" cy="56" r="5" fill="#E2483D" />
                    <circle cx="56" cy="24" r="5" fill="#E2483D" />
                  </svg>
                  <b style={{ fontSize: "14px" }}>
                    사과나무
                  </b>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    2026.08.14 수확
                  </span>
                </div>
                <div style={{ borderRadius: "20px", background: "#F7F8F4", padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>
                  <span style={{ opacity: "0.25", filter: "grayscale(1)" }}>
                    <svg width="80" height="80" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                      <circle cx="46" cy="44" r="5" fill="#E3CB5C" />
                      <circle cx="70" cy="34" r="5" fill="#E3CB5C" />
                      <circle cx="64" cy="58" r="5" fill="#E3CB5C" />
                      <circle cx="36" cy="62" r="5" fill="#E3CB5C" />
                      <circle cx="84" cy="56" r="5" fill="#E3CB5C" />
                      <circle cx="56" cy="24" r="5" fill="#E3CB5C" />
                    </svg>
                  </span>
                  <b style={{ fontSize: "14px" }}>
                    배나무
                  </b>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    아직 없어요
                  </span>
                </div>
                <div style={{ borderRadius: "20px", background: "#F7F8F4", padding: "14px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px", textAlign: "center" }}>
                  <span style={{ opacity: "0.25", filter: "grayscale(1)" }}>
                    <svg width="80" height="80" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                      <circle cx="46" cy="44" r="5" fill="#F08A24" />
                      <circle cx="70" cy="34" r="5" fill="#F08A24" />
                      <circle cx="64" cy="58" r="5" fill="#F08A24" />
                      <circle cx="36" cy="62" r="5" fill="#F08A24" />
                      <circle cx="84" cy="56" r="5" fill="#F08A24" />
                      <circle cx="56" cy="24" r="5" fill="#F08A24" />
                    </svg>
                  </span>
                  <b style={{ fontSize: "14px" }}>
                    감나무
                  </b>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    아직 없어요
                  </span>
                </div>
              </div>
            </div>
            <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", paddingTop: "10px", paddingBottom: "10px" }}>
              <Link to="/points" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F0F1EC", fontSize: "15px", fontWeight: "600" }}>
                포인트 적립 현황
                <span style={{ color: "#8B918C" }}>
                  ›
                </span>
              </Link>
              <Link to="/community" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F0F1EC", fontSize: "15px", fontWeight: "600" }}>
                내가 쓴 게시글
                <span style={{ color: "#8B918C" }}>
                  ›
                </span>
              </Link>
              <Link to="/events/invite" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F0F1EC", fontSize: "15px", fontWeight: "600" }}>
                친구 초대
                <span style={{ color: "#8B918C" }}>
                  ›
                </span>
              </Link>
              <Link to="/donate" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F0F1EC", fontSize: "15px", fontWeight: "600" }}>
                나의 기부 내역
                <span style={{ color: "#8B918C" }}>
                  ›
                </span>
              </Link>
              <a href="#notice" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F0F1EC", fontSize: "15px", fontWeight: "600" }}>
                알림 설정
                <span style={{ color: "#8B918C" }}>
                  ›
                </span>
              </a>
              <a href="#sns" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 0", borderBottom: "1px solid #F0F1EC", fontSize: "15px", fontWeight: "600" }}>
                SNS 연동 관리
                <span style={{ color: "#8B918C" }}>
                  ›
                </span>
              </a>
              <Link to="/welcome" style={{ display: "block", padding: "16px 0 6px", fontSize: "14px", color: "#6B716D" }}>
                로그아웃
              </Link>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                AI 인식 통계
              </span>
              <span style={{ fontSize: "13px", color: "#454B47" }}>
                10월
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "8px" }}>
              <div style={{ padding: "14px 10px", borderRadius: "16px", background: "#F7F8F4" }}>
                <div style={{ fontSize: "12px", color: "#454B47" }}>
                  이번 달 인식
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>
                  43회
                </div>
              </div>
              <div style={{ padding: "14px 10px", borderRadius: "16px", background: "#F7F8F4" }}>
                <div style={{ fontSize: "12px", color: "#454B47" }}>
                  누적 인식
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>
                  320회
                </div>
              </div>
              <div style={{ padding: "14px 10px", borderRadius: "16px", background: "#F7F8F4" }}>
                <div style={{ fontSize: "12px", color: "#454B47" }}>
                  정확도
                </div>
                <div style={{ fontSize: "20px", fontWeight: "800", marginTop: "4px" }}>
                  96%
                </div>
              </div>
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", marginTop: "20px" }}>
              이번 주 인식 수
            </div>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "190px", marginTop: "10px" }}>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  4
                </span>
                <span style={{ width: "100%", height: "50px", borderRadius: "8px", background: "#CFE6F8" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  월
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  7
                </span>
                <span style={{ width: "100%", height: "87px", borderRadius: "8px", background: "#CFE6F8" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  화
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  3
                </span>
                <span style={{ width: "100%", height: "37px", borderRadius: "8px", background: "#CFE6F8" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  수
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  9
                </span>
                <span style={{ width: "100%", height: "112px", borderRadius: "8px", background: "#CFE6F8" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  목
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  5
                </span>
                <span style={{ width: "100%", height: "62px", borderRadius: "8px", background: "#CFE6F8" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  금
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  12
                </span>
                <span style={{ width: "100%", height: "150px", borderRadius: "8px", background: "#3E9BEA" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  토
                </span>
              </div>
              <div style={{ flex: "1", display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                <span style={{ fontSize: "11px", color: "#5E645F" }}>
                  3
                </span>
                <span style={{ width: "100%", height: "37px", borderRadius: "8px", background: "#CFE6F8" }} />
                <span style={{ fontSize: "12px", color: "#5E645F" }}>
                  일
                </span>
              </div>
            </div>
            <div style={{ fontSize: "14px", fontWeight: "800", marginTop: "20px" }}>
              품목별 비율
            </div>
            <div style={{ display: "flex", height: "16px", borderRadius: "999px", overflow: "hidden", marginTop: "10px" }}>
              <span style={{ width: "45%", background: "#3E9BEA" }} />
              <span style={{ width: "25%", background: "#8B918C" }} />
              <span style={{ width: "20%", background: "#C9A36B" }} />
              <span style={{ width: "10%", background: "#3FA35A" }} />
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "12px", marginTop: "10px", fontSize: "13px" }}>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#3E9BEA" }} />
                플라스틱 45%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#8B918C" }} />
                캔 25%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#C9A36B" }} />
                종이 20%
              </span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                <span style={{ width: "10px", height: "10px", borderRadius: "3px", background: "#3FA35A" }} />
                유리 10%
              </span>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
