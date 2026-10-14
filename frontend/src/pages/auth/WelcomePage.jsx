import { useState } from 'react'
import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button' // 지원 님 공통 버튼
import { useAuth } from '../../lib/AuthContext' // 로그인 상태 게시판 읽기
import AuthLayout from './AuthLayout' // 회원 화면 공용 틀

// ---------- 버튼 안 아이콘 (currentColor = 버튼 글자색을 그대로 씀) ----------
function KakaoIcon() {
  // 말풍선
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M12 4C7 4 3 7.1 3 11c0 2.5 1.7 4.7 4.2 6l-1 3.6c-.1.3.3.6.6.4l4.3-2.9c.3 0 .6.1.9.1 5 0 9-3.1 9-7s-4-7-9-7z" />
    </svg>
  )
}

function NaverIcon() {
  // N 글자
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M5 4h4.6l4.8 7V4H19v16h-4.6l-4.8-7v7H5z" />
    </svg>
  )
}

function AppleIcon() {
  // 사과 모양
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <path fill="currentColor" d="M16.4 12.6c0-2.3 1.9-3.4 2-3.5-1.1-1.6-2.8-1.8-3.4-1.8-1.4-.1-2.8.9-3.5.9-.7 0-1.8-.9-3-.8-1.5 0-3 .9-3.8 2.3-1.6 2.8-.4 7 1.2 9.2.8 1.1 1.7 2.4 2.9 2.3 1.2 0 1.6-.7 3-.7s1.8.7 3 .7c1.3 0 2.1-1.1 2.8-2.3.9-1.3 1.3-2.5 1.3-2.6 0 0-2.5-1-2.5-3.7zM14.1 5.8c.6-.8 1.1-1.8 1-2.8-.9 0-2 .6-2.7 1.4-.6.7-1.1 1.7-1 2.7 1 .1 2-.5 2.7-1.3z" />
    </svg>
  )
}

export default function WelcomePage() {
  const navigate = useNavigate() // 다른 주소(화면)로 이동시키는 도구
  const { user, loading } = useAuth() // 지금 로그인한 회원(없으면 null), 확인 중인지
  const [notice, setNotice] = useState('') // "준비 중이에요" 안내 문구

  // 소셜 로그인은 아직 만들지 않았습니다. (카카오는 시간이 남으면 2차로 검토)
  // 누르면 안내 문구만 보여 줍니다.
  function showComingSoon(name) {
    setNotice(`${name} 로그인은 준비 중이에요. 지금은 이메일로 가입해 주세요.`)
  }

  // 1) 처음 켤 때 로그인 여부를 확인하는 아주 짧은 순간 — 내용 없이 틀만
  if (loading) return <AuthLayout />

  // 2) 이미 로그인한 사람은 시작 화면이 필요 없으니 홈으로 보냅니다.
  if (user) return <Navigate to="/" replace />

  // 3) 로그인하지 않은 사람 — 시작 화면
  return (
    <AuthLayout>
      <h1 className="auth-title">RePick 시작하기</h1>
      {/* 시안의 "물방울 [N]개"는 가입 보너스 개수가 아직 미정이라 숫자 없이 둡니다. */}
      <p className="auth-sub">가입하면 새싹 하나와 물방울을 드려요.</p>

      <div className="auth-buttons">
        <Button size="lg" fullWidth className="auth-kakao" onClick={() => showComingSoon('카카오')}>
          <KakaoIcon />
          카카오로 시작하기
        </Button>
        <Button size="lg" fullWidth className="auth-naver" onClick={() => showComingSoon('네이버')}>
          <NaverIcon />
          네이버로 시작하기
        </Button>
        <Button size="lg" fullWidth className="auth-apple" onClick={() => showComingSoon('Apple')}>
          <AppleIcon />
          Apple로 시작하기
        </Button>
        <Button size="lg" fullWidth className="auth-email" onClick={() => navigate('/signup')}>
          이메일로 가입하기
        </Button>
      </div>

      {/* 소셜 버튼을 눌렀을 때만 보이는 안내 상자 (role="status": 화면 읽기 프로그램이 읽어 줌) */}
      {notice && (
        <p className="auth-notice" role="status">
          {notice}
        </p>
      )}

      <p className="auth-links">
        이미 계정이 있나요?
        <Link to="/login">로그인</Link>
      </p>

      {/* 가입 없이 홈 화면 구경하기 */}
      <Link to="/" className="auth-browse">
        둘러보기 ›
      </Link>
    </AuthLayout>
  )
}
