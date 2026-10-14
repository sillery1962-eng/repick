// RePick 로고 (i 자리에 새싹). size는 글자 크기(px)
export default function Logo({ size = 30 }) {
  return (
    <span className="logo" style={{ fontSize: size }} aria-label="RePick">
      Rep
      <svg viewBox="0 0 20 44" aria-hidden="true">
        <path d="M10 24V12" stroke="#1F5C3F" strokeWidth="2" strokeLinecap="round" />
        <path d="M10 16.5C10 10.8 6.4 7.2 1 7.2c0 5.5 3.6 9.3 9 9.3z" fill="#CDEB45" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
        <path d="M10 13.6C10 7.9 13.4 4.4 19 4.4c0 5.6-3.4 9.2-9 9.2z" fill="#9BD37A" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
        <rect x="7.4" y="22.4" width="5.2" height="21.6" rx="1.4" fill="currentColor" />
      </svg>
      ck
    </span>
  )
}
