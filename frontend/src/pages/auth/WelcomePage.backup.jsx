import { Link, Navigate, useNavigate } from 'react-router-dom'
import Button from '../../components/Button' // 지원 님 공통 버튼
import { useAuth } from '../../lib/AuthContext' // 로그인 상태 게시판 읽기
import AuthLayout, { BrandCopy } from './AuthLayout' // 회원 화면 공용 틀 + 큰 문구
import GrowScene from './GrowScene' // 물방울 맞고 자라는 숲 애니메이션

// ⚠️ 백업본 (10/16): 시작 화면은 지금 쓰지 않아요. /welcome 은 WelcomePage.jsx 가 로그인 화면으로 보냅니다.
//    다시 쓰려면 이 파일 내용을 WelcomePage.jsx 에 붙여 넣고, 함수 이름을 WelcomePage 로 되돌리면 돼요.
// 가입은 이메일만 받습니다(10/15 결정: SNS 로그인 제외).
export default function WelcomePageBackup() {
  const navigate = useNavigate() // 다른 주소(화면)로 이동시키는 도구
  const { user, loading } = useAuth() // 지금 로그인한 회원(없으면 null), 확인 중인지

  // 1) 처음 켤 때 로그인 여부를 확인하는 아주 짧은 순간 — 내용 없이 틀만
  if (loading) return <AuthLayout />

  // 2) 이미 로그인한 사람은 시작 화면이 필요 없으니 홈으로 보냅니다.
  if (user) return <Navigate to="/" replace />

  // 3) 로그인하지 않은 사람 — 시작 화면
  return (
    // PC: 왼쪽에 움직이는 숲(AuthLayout 기본) / 모바일: 로고 아래에 움직이는 숲
    <AuthLayout>
      {/* 모바일 전용: 움직이는 숲 + 큰 문구 (PC는 왼쪽에 이미 있어서 숨김) */}
      <div className="auth-mobile-brand">
        <GrowScene />
        <BrandCopy />
      </div>
      <h1 className="auth-title">RePick 시작하기</h1>
      <p className="auth-sub">가입하면 새싹 하나와 물방울💧 3개를 드려요.</p>

      <div className="auth-buttons">
        {/* 버튼이 하나뿐이라 주인공(진한 기본) 버튼으로 */}
        <Button size="lg" fullWidth onClick={() => navigate('/signup')}>
          이메일로 가입하기
        </Button>
      </div>

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
