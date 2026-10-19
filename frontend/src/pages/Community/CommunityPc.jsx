/* 커뮤니티 PC 화면 (1024px 이상). 모양은 시안 "POTEN 앱 첫 화면 시안" v4.5 → v45p_Community.dc.html 그대로이고,
   시안에 직접 적혀 있던 글 6개 대신 실제 API(GET /posts)의 글을 보여 줍니다. 글 카드·글쓰기는 Feed.jsx */
import { Link } from 'react-router-dom'
import { useApi } from '../../api/useApi'
import { useAuth } from '../../lib/AuthContext'
import Feed from './Feed'
import { Avatar, InstagramIcon } from './parts'
import { INSTAGRAM_URL } from './utils'

// 오른쪽 위 내 프로필 (로그인했으면 /me 의 닉네임·자치구)
function ProfileCard() {
  const { user } = useAuth()
  const { data: profile } = useApi('/me', { skip: !user })

  return (
    <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box", textAlign: "center" }}>
      <span style={{ width: "96px", height: "96px", borderRadius: "50%", background: "linear-gradient(180deg, #DDF0FB, #EEF7E6)", display: "inline-flex", alignItems: "center", justifyContent: "center" }}>
        <Avatar id={user?.id ?? 'guest'} size={88} bg="transparent" />
      </span>
      {user ? (
        <>
          <div style={{ fontSize: "18px", fontWeight: "800", marginTop: "8px" }}>
            {profile?.nickname ?? '…'}
          </div>
          <div style={{ fontSize: "13px", color: "#454B47" }}>
            {profile?.region ?? ''}
          </div>
        </>
      ) : (
        <Link to="/login" style={{ display: "block", fontSize: "15px", fontWeight: "800", marginTop: "8px" }}>
          로그인하고 참여하기 ›
        </Link>
      )}
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ marginTop: "14px", height: "44px", borderRadius: "14px", background: "linear-gradient(90deg, #F9CE34, #EE2A7B, #6228D7)", color: "#FFFFFF", fontSize: "14px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
        <InstagramIcon />
        인스타그램 바로가기
      </a>
    </div>
  )
}

export default function CommunityPc() {
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%" }}>
      <main style={{ position: "relative", padding: "32px 0 60px", boxSizing: "border-box", margin: "0 auto", width: "100%", maxWidth: "1120px", paddingLeft: "20px", paddingRight: "20px" }}>
        <div style={{ fontSize: "30px", fontWeight: "800", marginBottom: "20px" }}>
          커뮤니티
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "24px", alignItems: "start" }}>
          <Feed />
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <ProfileCard />
            {/* 지금 뜨는 태그: 태그 기능이 아직 없어 시안 그대로 둔 예시 (팀 결정 후 연결) */}
            <div style={{ background: "#FFFFFF", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
              <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
                <span style={{ fontSize: "20px", fontWeight: "800" }}>
                  지금 뜨는 태그
                </span>
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                {['#투명페트병', '#사과나무', '#라벨떼기', '#용기내챌린지', '#감나무완성', '#제로웨이스트'].map((tag) => (
                  <span key={tag} style={{ height: "34px", padding: "0 12px", borderRadius: "999px", background: "#F2F3EE", fontSize: "13px", fontWeight: "700", display: "flex", alignItems: "center" }}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
