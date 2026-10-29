import { Link } from 'react-router-dom'

const logoMark = (
  <span
    style={{ fontSize: 24, fontWeight: 800, letterSpacing: '-0.5px', display: 'inline-flex', alignItems: 'baseline' }}
    aria-label="RePick"
  >
    Rep
    <svg viewBox="0 0 20 44" aria-hidden="true" style={{ height: '1.1em', width: '0.5em', margin: '0 -0.04em', overflow: 'visible' }}>
      <path d="M10 24V12" stroke="#1F5C3F" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 16.5C10 10.8 6.4 7.2 1 7.2c0 5.5 3.6 9.3 9 9.3z" fill="#CDEB45" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
      <path d="M10 13.6C10 7.9 13.4 4.4 19 4.4c0 5.6-3.4 9.2-9 9.2z" fill="#9BD37A" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="7.4" y="22.4" width="5.2" height="21.6" rx="1.4" fill="currentColor" />
    </svg>
    ck
  </span>
)

function TreeBadge() {
  return (
    <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
      <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
      <path d="M60 22l22 30H38z" fill="#3FA35A" />
      <path d="M60 38l27 34H33z" fill="#2E8B4E" />
    </svg>
  )
}

/** Mobile top bar shared by AI certification, Forest, and Points pages. */
export default function MobileWalletHeader({ drops, points }) {
  const pointsLabel = points == null || points === '' ? '포인트' : `${points}`

  return (
    <header className="repick-mobile-wallet-header" style={{ width: 'min(560px, calc(100% - 32px))', minHeight: 58, margin: '0 auto', padding: '10px 0 6px', boxSizing: 'border-box', alignItems: 'center', justifyContent: 'space-between', gap: 8, background: '#F7F8F4' }}>
      <Link to="/" aria-label="RePick 홈" style={{ display: 'flex', alignItems: 'center', gap: 2, color: '#121614', textDecoration: 'none', flex: '0 0 auto' }}>
        {logoMark}
      </Link>
      <nav aria-label="내 보유 정보" style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 5, minWidth: 0 }}>
        <Link to="/forest" title="물방울" style={{ height: 34, padding: '0 9px 0 7px', borderRadius: 999, background: '#E3F1FC', display: 'flex', alignItems: 'center', gap: 4, fontSize: 13, fontWeight: 800, color: '#17507F', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
            <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
          </svg>
          {drops ?? '—'}
        </Link>
        <Link to="/points" title="포인트" style={{ minHeight: 34, boxSizing: 'border-box', padding: '0 9px 0 5px', borderRadius: 999, background: '#F2F3EE', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13, fontWeight: 800, color: '#121614', textDecoration: 'none', whiteSpace: 'nowrap' }}>
          <span style={{ width: 22, height: 22, flex: '0 0 22px', borderRadius: '50%', background: '#CDEB45', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11 }}>P</span>
          {pointsLabel}
        </Link>
        <Link to="/mypage" aria-label="마이페이지" style={{ width: 36, height: 36, flex: '0 0 36px', borderRadius: '50%', background: '#CDEB45', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
          <TreeBadge />
        </Link>
      </nav>
      <style>{`.repick-mobile-wallet-header { display: none; } @media (max-width: 1023px) { .repick-mobile-wallet-header { display: flex; } } @media (max-width: 360px) { .repick-mobile-wallet-header { gap: 5px; } }`}</style>
    </header>
  )
}
