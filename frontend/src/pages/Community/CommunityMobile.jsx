/* 커뮤니티 모바일 화면 (1024px 미만). 모양은 시안 "POTEN 앱 첫 화면 시안" v4.5 → v45pm_Community.dc.html 그대로이고,
   시안에 직접 적혀 있던 글 3개 대신 실제 API(GET /posts)의 글을 보여 줍니다. 글 카드·글쓰기는 Feed.jsx
   맨 위 줄 물방울·포인트 숫자는 실제 잔액(GET /points, useWallet) — PC 헤더·모바일 홈과 같은 값 */
import { Link } from 'react-router-dom'
import useWallet from '../../components/useWallet'
import Feed from './Feed'
import { MyTreeAvatar } from './parts' // 위 막대 프로필 = 내 나무 사진 (PC 커뮤니티 프로필과 같음)

export default function CommunityMobile() {
  const W = useWallet() // 로그인 전·불러오는 중이면 '-'
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
          <Link to="/mypage" aria-label="마이페이지" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <MyTreeAvatar size={36} bg="#E8F3E4" />
          </Link>
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <Feed mobile />
      </main>
    </div>
  )
}
