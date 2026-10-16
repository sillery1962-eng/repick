/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Community.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { DCLogic, useDcLogic, css } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
constructor(props) { super(props); this.state = { liked: { p1: false, p2: true, p3: false } }; }
renderVals() {
const base = { p1: 128, p2: 64, p3: 41 }; const L = this.state.liked;
const like = {}, likeCount = {}, likeFill = {}, likeColor = {};
for (const k of Object.keys(base)) { like[k] = () => this.setState({ liked: { ...this.state.liked, [k]: !this.state.liked[k] } });
  likeCount[k] = base[k] + (L[k] ? 1 : 0); likeFill[k] = L[k] ? '#E2483D' : 'none'; likeColor[k] = L[k] ? '#C4552B' : '#121614'; }
return { like, likeCount, likeFill, likeColor };
}
}

export default function CommunityMobile() {
  const V = useDcLogic(Component)
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
            12
          </Link>
          <Link to="/points" title="포인트" style={{ height: "34px", padding: "0 10px 0 5px", borderRadius: "999px", background: "#F2F3EE", display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", fontWeight: "800" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>
              P
            </span>
            6,170
          </Link>
          <Link to="/mypage" aria-label="마이페이지" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
              <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
              <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
              <path d="M60 22l22 30H38z" fill="#3FA35A" />
              <path d="M60 38l27 34H33z" fill="#2E8B4E" />
            </svg>
          </Link>
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
            <span style={{ height: "38px", padding: "0 16px", borderRadius: "999px", background: "#121614", color: "#FFFFFF", fontWeight: "700", fontSize: "14px", display: "flex", alignItems: "center" }}>
              전체
            </span>
            <span style={{ height: "38px", padding: "0 16px", borderRadius: "999px", background: "#FFFFFF", border: "1px solid #ECEDE8", fontWeight: "500", fontSize: "14px", display: "flex", alignItems: "center" }}>
              나무 자랑
            </span>
            <span style={{ height: "38px", padding: "0 16px", borderRadius: "999px", background: "#FFFFFF", border: "1px solid #ECEDE8", fontWeight: "500", fontSize: "14px", display: "flex", alignItems: "center" }}>
              실천 인증
            </span>
            <span style={{ height: "38px", padding: "0 16px", borderRadius: "999px", background: "#FFFFFF", border: "1px solid #ECEDE8", fontWeight: "500", fontSize: "14px", display: "flex", alignItems: "center" }}>
              AI 인식
            </span>
            <span style={{ height: "38px", padding: "0 16px", borderRadius: "999px", background: "#FFFFFF", border: "1px solid #ECEDE8", fontWeight: "500", fontSize: "14px", display: "flex", alignItems: "center" }}>
              팔로잉
            </span>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <svg width="40" height="40" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                  <path d="M60 22l22 30H38z" fill="#3FA35A" />
                  <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                </svg>
              </span>
              <span style={{ flexGrow: "1", height: "46px", borderRadius: "14px", background: "#F7F8F4", padding: "0 16px", display: "flex", alignItems: "center", fontSize: "14px", color: "#8B918C" }}>
                오늘의 실천을 자랑해 보세요
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "12px", flexWrap: "wrap" }}>
              <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#E3F1FC", color: "#17507F", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                  <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                  <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                </svg>
                실천 인증 +5
              </span>
              <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#EEF7E6", color: "#1F5C3F", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                나무 자랑
              </span>
              <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#F2F3EE", color: "#121614", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                AI 인식 기록
              </span>
            </div>
          </div>
          <article style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEF7E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <svg width="40" height="40" viewBox="0 0 120 120" fill="none" aria-hidden="true">
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
              </span>
              <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  오*원
                  <a href="#instagram" aria-label="인스타그램" style={{ color: "#C13584", display: "flex" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="3" width="18" height="18" rx="5" />
                      <circle cx="12" cy="12" r="4" />
                      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                    </svg>
                  </a>
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  나무 자랑 · 2시간 전
                </span>
              </span>
              <span style={{ fontSize: "20px", color: "#8B918C" }}>
                ···
              </span>
            </div>
            <div style={{ marginTop: "14px", height: "240px", borderRadius: "22px", background: "linear-gradient(180deg, #DDF0FB, #EEF7E6 70%, #F6EEDB)", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
              <img src="/design/ec6bcbc9324d2d97bcc52e97947dd34b.jpg" alt="잎이 무성한 큰 나무 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
              <span style={{ position: "absolute", left: "14px", top: "14px" }}>
                <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#121614", color: "#CDEB45", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  수확 인증 · 사과나무
                </span>
              </span>
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.55", marginTop: "14px" }}>
              나 드디어 사과나무 완성했다! 새싹부터 87일 걸렸어요. 다음엔 감나무 나왔으면 좋겠다
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button onClick={V.like.p1} style={css(`height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #ECEDE8; background: #FFFFFF; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: ${V.likeColor.p1}`)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={V.likeFill.p1} stroke="#E2483D" strokeWidth="2">
                  <path d="M12 20.5l-7.6-7.4A5 5 0 0 1 12 6.4a5 5 0 0 1 7.6 6.7z" />
                </svg>
                {V.likeCount.p1}
              </button>
              <span style={{ height: "38px", padding: "0 14px", borderRadius: "999px", border: "1.5px solid #ECEDE8", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2">
                  <path d="M4 4h16v12H9l-5 4z" />
                </svg>
                3
              </span>
              <span style={{ flexGrow: "1" }} />
              <a href="#instagram" style={{ height: "38px", padding: "0 12px", borderRadius: "999px", background: "#FCEEF5", color: "#C13584", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
                공유
              </a>
            </div>
            <div style={{ marginTop: "14px", paddingTop: "14px", borderTop: "1px solid #F0F1EC", display: "flex", flexDirection: "column", gap: "12px" }}>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF7E6", flexShrink: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                    <path d="M60 22l22 30H38z" fill="#3FA35A" />
                    <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "14px" }}>
                    <b>
                      김*결
                    </b>
                    {" 와 축하해요! 저는 아직 묘목이에요"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    1시간 전 · 답글 달기
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px", marginLeft: "42px" }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9BDB8" strokeWidth="2" strokeLinecap="round">
                  <path d="M5 4v8a4 4 0 0 0 4 4h10" />
                </svg>
                <span style={{ width: "28px", height: "28px", borderRadius: "50%", background: "#FDE7E4", flexShrink: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="26" height="26" viewBox="0 0 120 120" fill="none" aria-hidden="true">
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
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "14px" }}>
                    <b>
                      오*원
                    </b>
                    {" 출석 매일 하면 금방이에요!"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    40분 전 · 답글 달기
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "10px" }}>
                <span style={{ width: "32px", height: "32px", borderRadius: "50%", background: "#EEF7E6", flexShrink: "0", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="30" height="30" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                    <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                    <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                    <path d="M60 106V78" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                    <ellipse cx="46" cy="76" rx="15" ry="8.5" transform="rotate(-24 46 76)" fill="#6CC25F" />
                    <ellipse cx="74" cy="74" rx="15" ry="8.5" transform="rotate(24 74 74)" fill="#4EAE52" />
                  </svg>
                </span>
                <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "14px" }}>
                    <b>
                      한*린
                    </b>
                    {" 사과 진짜 귀엽다"}
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    20분 전 · 답글 달기
                  </span>
                </span>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <span style={{ flexGrow: "1", height: "44px", borderRadius: "14px", background: "#F7F8F4", padding: "0 14px", display: "flex", alignItems: "center", fontSize: "14px", color: "#8B918C" }}>
                  댓글을 남겨보세요
                </span>
                <span style={{ height: "44px", padding: "0 16px", borderRadius: "14px", background: "#121614", color: "#FFFFFF", fontSize: "14px", fontWeight: "700", display: "flex", alignItems: "center" }}>
                  등록
                </span>
              </div>
            </div>
          </article>
          <article style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEF7E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <svg width="40" height="40" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                  <path d="M60 22l22 30H38z" fill="#3FA35A" />
                  <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                </svg>
              </span>
              <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  김*결
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  실천 인증 · 5시간 전
                </span>
              </span>
              <span style={{ fontSize: "20px", color: "#8B918C" }}>
                ···
              </span>
            </div>
            <div style={{ marginTop: "14px", borderRadius: "22px", overflow: "hidden", position: "relative", display: "flex", justifyContent: "center", background: "#DCE9E1", height: "240px", isolation: "isolate" }}>
              <img src="/design/1bf518cba1e99295c3037341afced4a2.jpg" alt="색깔별 분리수거함 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
              <span style={{ position: "absolute", left: "14px", top: "14px" }}>
                <span style={{ height: "28px", padding: "0 10px", borderRadius: "999px", background: "#3E9BEA", color: "#FFFFFF", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center", gap: "4px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#FFFFFF" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  실천 인증 +5
                </span>
              </span>
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.55", marginTop: "14px" }}>
              오늘 아파트 분리수거 완료! 페트병 라벨 다 떼고 투명 페트병 수거함에 따로 넣었어요 #분리배출 #투명페트병
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button onClick={V.like.p2} style={css(`height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #ECEDE8; background: #FFFFFF; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: ${V.likeColor.p2}`)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={V.likeFill.p2} stroke="#E2483D" strokeWidth="2">
                  <path d="M12 20.5l-7.6-7.4A5 5 0 0 1 12 6.4a5 5 0 0 1 7.6 6.7z" />
                </svg>
                {V.likeCount.p2}
              </button>
              <span style={{ height: "38px", padding: "0 14px", borderRadius: "999px", border: "1.5px solid #ECEDE8", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2">
                  <path d="M4 4h16v12H9l-5 4z" />
                </svg>
                0
              </span>
              <span style={{ flexGrow: "1" }} />
              <a href="#instagram" style={{ height: "38px", padding: "0 12px", borderRadius: "999px", background: "#FCEEF5", color: "#C13584", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
                공유
              </a>
            </div>
          </article>
          <article style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <span style={{ width: "44px", height: "44px", borderRadius: "50%", background: "#EEF7E6", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                <svg width="40" height="40" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="56.5" y="70" width="7" height="36" rx="2.5" fill="#8A5A3C" />
                  <circle cx="60" cy="58" r="20" fill="#3FA35A" />
                  <circle cx="44" cy="68" r="12" fill="#3FA35A" />
                  <circle cx="76" cy="68" r="12" fill="#3FA35A" />
                  <circle cx="54" cy="52" r="7" fill="#5DB85A" />
                </svg>
              </span>
              <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                <span style={{ fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", gap: "6px" }}>
                  정*호
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  AI 인식 · 어제
                </span>
              </span>
              <span style={{ fontSize: "20px", color: "#8B918C" }}>
                ···
              </span>
            </div>
            <div style={{ marginTop: "14px", padding: "20px", borderRadius: "22px", background: "#121614", color: "#FFFFFF", display: "flex", alignItems: "center", gap: "16px" }}>
              <span style={{ width: "64px", height: "64px", borderRadius: "20px", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
                  <rect x="4" y="5" width="16" height="14" rx="2" fill="#FFFFFF" />
                  <path d="M7 9h10M7 12h10M7 15h6" stroke="#121614" strokeWidth="1.6" strokeLinecap="round" />
                </svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                <span style={{ fontSize: "13px", color: "#CDEB45", fontWeight: "700" }}>
                  이번 주 AI 인식 기록
                </span>
                <span style={{ fontSize: "22px", fontWeight: "800" }}>
                  폐휴지 32개 인식 완료!
                </span>
                <span style={{ fontSize: "13px", color: "#C9CEC9" }}>
                  물방울 32개 · 탄소 1.2kg 절감
                </span>
              </span>
            </div>
            <div style={{ fontSize: "16px", lineHeight: "1.55", marginTop: "14px" }}>
              택배 박스 정리하면서 다 찍었더니 물방울이 이만큼 모였네요
            </div>
            <div style={{ display: "flex", gap: "8px", marginTop: "14px" }}>
              <button onClick={V.like.p3} style={css(`height: 38px; padding: 0 14px; border-radius: 999px; border: 1.5px solid #ECEDE8; background: #FFFFFF; display: flex; align-items: center; gap: 6px; font-size: 14px; font-weight: 700; color: ${V.likeColor.p3}`)}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill={V.likeFill.p3} stroke="#E2483D" strokeWidth="2">
                  <path d="M12 20.5l-7.6-7.4A5 5 0 0 1 12 6.4a5 5 0 0 1 7.6 6.7z" />
                </svg>
                {V.likeCount.p3}
              </button>
              <span style={{ height: "38px", padding: "0 14px", borderRadius: "999px", border: "1.5px solid #ECEDE8", display: "flex", alignItems: "center", gap: "6px", fontSize: "14px", fontWeight: "700" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2">
                  <path d="M4 4h16v12H9l-5 4z" />
                </svg>
                0
              </span>
              <span style={{ flexGrow: "1" }} />
              <a href="#instagram" style={{ height: "38px", padding: "0 12px", borderRadius: "999px", background: "#FCEEF5", color: "#C13584", display: "flex", alignItems: "center", gap: "6px", fontSize: "13px", fontWeight: "700" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="3" width="18" height="18" rx="5" />
                  <circle cx="12" cy="12" r="4" />
                  <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
                </svg>
                공유
              </a>
            </div>
          </article>
        </div>
      </main>
    </div>
  )
}
