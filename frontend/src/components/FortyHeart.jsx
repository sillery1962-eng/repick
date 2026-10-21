import './FortyHeart.css'

// 오른쪽 아래 떠 있는 포티 — 2초마다 머리 위 새싹이 초록 하트 새싹으로, 다시 분홍 하트로 바뀌었다 돌아옴
// 모양은 FortyIcon(Icons.jsx)과 같고, 움직임은 FortyHeart.css. '동작 줄이기'를 켠 사람은 평소 모습만.
const HEART = 'M0 3C-4 0-4.5-3.5-2.2-3.9-1-4.1 0-3.2 0-2.2 0-3.2 1-4.1 2.2-3.9 4.5-3.5 4 0 0 3Z'

export default function FortyHeart({ size = 48 }) {
  return (
    <svg className="forty-heart" width={size} height={size} viewBox="0 0 40 40" fill="none" aria-hidden="true">
      {/* ① 새싹 (평소) */}
      <g className="fh-sprout">
        <path d="M20 10V5.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
        <path d="M20 6.5c0-2.6-1.8-4-4.3-4 0 2.5 1.8 4 4.3 4z" fill="#5BCB6E" />
        <path d="M20 6.5c0-2.6 1.8-4 4.3-4 0 2.5-1.8 4-4.3 4z" fill="#3FB35A" />
      </g>
      {/* ② 초록 하트 새싹 (줄기 + 가운데가 뚫린 초록 테두리 하트) */}
      <g className="fh-green">
        <path d="M20 10V6.5" stroke="#2A9C52" strokeWidth="2" strokeLinecap="round" />
        <path d={HEART} transform="translate(20 4.4) scale(0.85)" fill="none" stroke="#3FB35A" strokeWidth="1.5" strokeLinejoin="round" />
      </g>
      {/* ③ 분홍 하트 */}
      <g transform="translate(20 5.6)">
        <path className="fh-heart" d={HEART} fill="#FF5A7A" />
      </g>

      {/* 팔·몸·얼굴 (그대로) */}
      <rect x="4" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
      <rect x="32" y="18" width="4" height="8" rx="2" fill="#2A9C52" />
      <rect x="6.5" y="9.5" width="27" height="25" rx="11.5" fill="#3DBB62" />
      <rect x="10.5" y="15" width="19" height="13" rx="6.5" fill="#1E2B3A" />
      <circle cx="16" cy="21.5" r="2.3" fill="#8FF0B0" />
      <circle cx="24" cy="21.5" r="2.3" fill="#8FF0B0" />
    </svg>
  )
}
