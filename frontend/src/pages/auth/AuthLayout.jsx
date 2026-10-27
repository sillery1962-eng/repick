import { Link } from 'react-router-dom'
import Logo from '../../components/Logo'
import './auth.css'
import GrowScene from './GrowScene' // 물방울 맞고 자라는 숲 애니메이션 (시작·가입·로그인 공통)

// 큰 문구 + 작은 설명. 시작 화면 모바일에서도 같이 쓰려고 따로 뺐어요.
export function BrandCopy() {
  return (
    <>
      <h2 className="auth-brand-title">
        잘 버리는 습관이
        <br />
        나만의 숲이 돼요
      </h2>
      <p className="auth-brand-sub">분리배출 · 물방울 모으기 · 과일나무 수확 · 친환경 제품 받기</p>
    </>
  )
}

// 회원 화면(시작·가입·로그인) 공용 틀
// PC: 왼쪽 그림 영역 + 오른쪽 내용 / 모바일: 작은 로고 + 내용
// art: 왼쪽 그림을 바꾸고 싶을 때 넣습니다. (없으면 움직이는 숲 GrowScene)
export default function AuthLayout({ children, art }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <Link to="/" className="auth-logo-link" aria-label="RePick 홈으로">{/* 로고 누르면 홈 */}
          <Logo size={44} />
        </Link>
        {art ?? <GrowScene className="auth-brand-art auth-grow" />}
        <BrandCopy />
      </aside>

      <main className="auth-main">
        <div className="auth-box">
          <div className="auth-mobile-logo">
            <Link to="/" className="auth-logo-link" aria-label="RePick 홈으로">
              <Logo />
            </Link>
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
