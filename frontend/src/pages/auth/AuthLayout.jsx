import Logo from '../../components/Logo'
import './auth.css'
import TreeArt from './TreeArt' // 왼쪽 나무 3그루 그림 (임시 SVG)

// 회원 화면(시작·가입·로그인) 공용 틀
// PC: 왼쪽 그림 영역 + 오른쪽 내용 / 모바일: 작은 로고 + 내용
export default function AuthLayout({ children }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <Logo size={44} />
        <TreeArt className="auth-brand-art" />
        <h2 className="auth-brand-title">
          버리는 습관이
          <br />
          나만의 숲이 돼요
        </h2>
        <p className="auth-brand-sub">분리배출 인증 · 물방울 모으기 · 과일나무 수확</p>
      </aside>

      <main className="auth-main">
        <div className="auth-box">
          <div className="auth-mobile-logo">
            <Logo />
          </div>
          {children}
        </div>
      </main>
    </div>
  )
}
