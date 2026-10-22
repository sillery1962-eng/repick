import { Link, NavLink } from 'react-router-dom'
import { DropIcon, FortyIcon, TreeAvatar } from './Icons'
import Logo from './Logo'

// PC 위쪽 메뉴 (시안: 1줄 로고·검색·출석·물방울/포인트·알림·프로필, 2줄 메뉴 알약)
const MENUS = [
  { to: '/', label: '홈', end: true, icon: <path d="M3 10.2L12 3l9 7.2V20a1.5 1.5 0 0 1-1.5 1.5H15v-6H9v6H4.5A1.5 1.5 0 0 1 3 20z" fill="currentColor" /> },
  { to: '/scan', label: 'AI 인증', icon: <g fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 8V5a2 2 0 0 1 2-2h3M16 3h3a2 2 0 0 1 2 2v3M21 16v3a2 2 0 0 1-2 2h-3M8 21H5a2 2 0 0 1-2-2v-3" /><circle cx="12" cy="12" r="3.5" /></g> },
  { to: '/forest', label: '나의 숲', icon: <><circle cx="12" cy="9" r="6" fill="currentColor" /><rect x="11" y="13" width="2" height="8" rx="1" fill="currentColor" /><path d="M7 21h10" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
  { to: '/community', label: '커뮤니티', icon: <path d="M4 4h16a1.5 1.5 0 0 1 1.5 1.5v10A1.5 1.5 0 0 1 20 17H9l-5 4V5.5A1.5 1.5 0 0 1 4 4z" fill="currentColor" /> },
  { to: '/events', label: '이벤트 · 챌린지', icon: <><path d="M7 4h10v5a5 5 0 0 1-10 0z" fill="currentColor" /><path d="M7 6H4.5a2.5 2.5 0 0 0 2.6 3.6M17 6h2.5a2.5 2.5 0 0 1-2.6 3.6M12 14v4M8.5 20.5h7" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></> },
  { to: '/chat', label: '배출 가이드', icon: <><rect x="3" y="5" width="18" height="13" rx="6" fill="currentColor" /><circle cx="9" cy="11.5" r="1.6" fill="#FFFFFF" /><circle cx="15" cy="11.5" r="1.6" fill="#FFFFFF" /><path d="M12 5V2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></> },
  { to: '/map', label: '수거함 찾기', icon: <><path d="M12 22s7-6.5 7-12a7 7 0 0 0-14 0c0 5.5 7 12 7 12z" fill="currentColor" /><circle cx="12" cy="10" r="2.8" fill="#FFFFFF" /></> },
  { to: '/points', label: '포인트', end: true, icon: <><circle cx="12" cy="12" r="9" fill="currentColor" /><path d="M10 16V8h2.6a2.3 2.3 0 0 1 0 4.6H10" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" fill="none" /></> },
  { to: '/donate', label: '기부', icon: <path d="M12 20.5l-7.6-7.4A5 5 0 0 1 12 6.4a5 5 0 0 1 7.6 6.7z" fill="currentColor" /> },
  { to: '/points#shop', label: '친환경샵', icon: <><path d="M5 8h14l-1.2 12a1.5 1.5 0 0 1-1.5 1.3H7.7a1.5 1.5 0 0 1-1.5-1.3z" fill="currentColor" /><path d="M9 10V6a3 3 0 0 1 6 0v4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" fill="none" /></> },
]

export default function PcHeader() {
  return (
    <header className="pc-header">
      <div className="pc-row pc-row-top">
        <Link to="/" className="pc-logo"><Logo size={30} /></Link>
        <Link to="/chat" className="pc-search">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#6B716D" strokeWidth="2.2" strokeLinecap="round" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="M20 20l-4-4" /></svg>
          <span className="pc-search-text">무엇을 버리시나요? 포티에게 물어보세요</span>
          <span className="pc-search-forty"><FortyIcon size={26} /></span>
        </Link>
        <span className="pc-grow" />
        <Link to="/events" className="pc-attend"><DropIcon />출석체크 +1</Link>
        <span className="pc-wallet">
          <Link to="/forest" title="물방울" className="pc-wallet-item pc-drops"><DropIcon size={20} />12</Link>
          <span className="pc-wallet-bar" />
          <Link to="/points" title="포인트" className="pc-wallet-item"><span className="pc-p">P</span>6,170</Link>
        </span>
        <button type="button" className="pc-bell" aria-label="알림">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="#121614" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9z" /><path d="M10 20a2.2 2.2 0 0 0 4 0z" /></svg>
          <span className="pc-bell-dot" />
        </button>
        <Link to="/mypage" className="pc-profile">
          <span className="pc-avatar"><TreeAvatar size={34} /></span>[이름]님
        </Link>
      </div>
      <div className="pc-row pc-row-nav">
        <nav aria-label="주요 메뉴" className="pc-nav">
          {MENUS.map((m) => (
            <NavLink key={m.to} to={m.to} end={m.end} className={({ isActive }) => (isActive && !m.to.includes('#') ? 'pc-nav-item active' : 'pc-nav-item')}>
              <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">{m.icon}</svg>
              {m.label}
            </NavLink>
          ))}
        </nav>
      </div>
    </header>
  )
}
