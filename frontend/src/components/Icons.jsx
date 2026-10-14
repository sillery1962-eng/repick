// 시안에서 여러 화면이 같이 쓰는 아이콘

export function DropIcon({ size = 18, color = '#3E9BEA' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill={color} />
      <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

/** 분리배출 도우미 '포티' 캐릭터 */
export function FortyIcon({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
      <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
      <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
      <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
      <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
      <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
      <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
      <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
      <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
    </svg>
  )
}

/** 마이 메뉴·프로필의 나무 아바타 */
export function TreeAvatar({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
      <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
      <path d="M60 22l22 30H38z" fill="#3FA35A" />
      <path d="M60 38l27 34H33z" fill="#2E8B4E" />
    </svg>
  )
}
