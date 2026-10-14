import { NavLink } from 'react-router-dom'
import { TreeAvatar } from './Icons'
import './BottomNav.css'

// 모바일 아래 메뉴 5개 (시안 그대로). 가운데 '촬영'은 위로 튀어나온 검은 버튼입니다.
export default function BottomNav() {
  const item = ({ isActive }) => (isActive ? 'bn-item active' : 'bn-item')
  return (
    <nav className="bn" aria-label="주요 메뉴">
      <NavLink to="/" end className={item}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 10.2L12 3l9 7.2V20a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 20z" /></svg>
        <span>홈</span>
      </NavLink>
      <NavLink to="/community" className={item}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17H9l-5 4V5.5A1.5 1.5 0 0 1 4 4z" /></svg>
        <span>커뮤니티</span>
      </NavLink>
      <NavLink to="/scan" className={({ isActive }) => (isActive ? 'bn-scan active' : 'bn-scan')} aria-label="AI 분리배출 촬영">
        <span className="bn-scan-btn">
          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#CDEB45" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M14.5 4h-5L7.5 6.5H4a1 1 0 0 0-1 1V19a1 1 0 0 0 1 1h16a1 1 0 0 0 1-1V7.5a1 1 0 0 0-1-1h-3.5z" /><circle cx="12" cy="13" r="3.5" /></svg>
        </span>
      </NavLink>
      <NavLink to="/forest" className={item}>
        <svg width="26" height="26" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="9" r="6" /><rect x="11" y="13" width="2" height="8" rx="1" /><path d="M7 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg>
        <span>나의 숲</span>
      </NavLink>
      <NavLink to="/mypage" className={item}>
        <span className="bn-avatar"><TreeAvatar size={26} /></span>
        <span>마이</span>
      </NavLink>
    </nav>
  )
}
