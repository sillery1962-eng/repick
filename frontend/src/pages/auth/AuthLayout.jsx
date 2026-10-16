import Logo from '../../components/Logo'
import './auth.css'
import TreeArt from './TreeArt' // 왼쪽 나무 3그루 그림 (임시 SVG)

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
// art: 왼쪽 그림을 바꾸고 싶을 때 넣습니다. (없으면 기본 나무 그림 TreeArt)
//   예) 시작 화면은 움직이는 숲 <GrowScene /> 을 넣어요.
export default function AuthLayout({ children, art }) {
  return (
    <div className="auth-page">
      <aside className="auth-brand">
        <Logo size={44} />
        {art ?? <TreeArt className="auth-brand-art" />}
        <BrandCopy />
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
