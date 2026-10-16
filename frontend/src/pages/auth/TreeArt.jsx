// 회원 화면 왼쪽의 나무 3그루 그림 (새싹 → 소나무 → 사과나무)
// 시안을 보고 코드(SVG)로 간단히 그린 임시 그림입니다.
// 나중에 그림 파일(png·svg)로 바꿀 때는 이 파일만 고치면 됩니다.
//   예) return <img className={className} src="/images/trees.png" alt="" />
//
// SVG 읽는 법: viewBox="0 0 420 180" = 가로 420 × 세로 180 크기의 도화지.
//   (0,0)이 왼쪽 위, x는 오른쪽으로, y는 아래로 갈수록 커집니다.
//   ellipse = 타원(흙더미), rect = 사각형(줄기), circle = 원(잎·사과), path = 자유 도형
const LEAF = '#5DBB63' // 밝은 잎
const LEAF_DARK = '#2E8B4E' // 진한 잎
const LEAF_LIGHT = '#4FAE68' // 잎의 빛 받는 부분
const TRUNK = '#8B5A3C' // 줄기
const SOIL = '#EAD9B5' // 흙더미 바깥
const SOIL_DARK = '#D8BC8A' // 흙더미 안쪽
const APPLE = '#E5483F' // 사과

export default function TreeArt({ className }) {
  return (
    // aria-hidden: 꾸밈용 그림이라 화면 읽기 프로그램이 건너뜁니다.
    <svg className={className} viewBox="0 0 420 180" aria-hidden="true">
      {/* ---------- 1. 새싹 (왼쪽) ---------- */}
      <ellipse cx="60" cy="166" rx="45" ry="8" fill={SOIL} />
      <ellipse cx="60" cy="163" rx="30" ry="5" fill={SOIL_DARK} />
      <path d="M60 163V142" stroke={LEAF_DARK} strokeWidth="3" strokeLinecap="round" />
      {/* 왼쪽 잎 · 오른쪽 잎 */}
      <path d="M60 148C53 139 44 139 40 141C44 149 53 152 60 148Z" fill={LEAF} />
      <path d="M60 145C67 136 76 136 80 138C76 146 67 149 60 145Z" fill={LEAF} />

      {/* ---------- 2. 소나무 (가운데) ---------- */}
      <ellipse cx="210" cy="166" rx="70" ry="10" fill={SOIL} />
      <ellipse cx="210" cy="163" rx="50" ry="6" fill={SOIL_DARK} />
      <rect x="205" y="100" width="10" height="64" rx="3" fill={TRUNK} />
      {/* 위쪽 작은 삼각형(밝은 색) 위에 아래쪽 큰 삼각형(진한 색)을 겹쳐 그립니다. */}
      <path d="M210 20L245 72H175Z" fill={LEAF} />
      <path d="M210 45L256 108H164Z" fill={LEAF_DARK} />

      {/* ---------- 3. 사과나무 (오른쪽) ---------- */}
      <ellipse cx="350" cy="166" rx="55" ry="9" fill={SOIL} />
      <ellipse cx="350" cy="163" rx="38" ry="5" fill={SOIL_DARK} />
      <rect x="344" y="100" width="12" height="64" rx="3" fill={TRUNK} />
      {/* 양쪽 작은 가지 */}
      <path d="M347 128L332 116M353 124L368 114" stroke={TRUNK} strokeWidth="5" strokeLinecap="round" />
      {/* 잎 덩어리: 가운데 큰 원 + 양옆 원 + 빛 받는 부분 */}
      <circle cx="350" cy="70" r="34" fill={LEAF_DARK} />
      <circle cx="322" cy="92" r="22" fill={LEAF_DARK} />
      <circle cx="378" cy="92" r="22" fill={LEAF_DARK} />
      <circle cx="340" cy="62" r="12" fill={LEAF_LIGHT} />
      {/* 사과 6개 */}
      <circle cx="352" cy="40" r="6" fill={APPLE} />
      <circle cx="368" cy="62" r="6" fill={APPLE} />
      <circle cx="334" cy="74" r="6" fill={APPLE} />
      <circle cx="358" cy="86" r="6" fill={APPLE} />
      <circle cx="316" cy="100" r="6" fill={APPLE} />
      <circle cx="384" cy="98" r="6" fill={APPLE} />
    </svg>
  )
}
