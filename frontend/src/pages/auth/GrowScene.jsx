import { useEffect, useId, useState } from 'react'
import './grow-scene.css'

// 시작 화면(/welcome)의 움직이는 숲 그림
// 물방울이 떨어지면 새싹 → 소나무 → 사과나무 순서로 쑥쑥 자랍니다. (9초마다 처음부터 반복)
// 원본: 아티팩트 "RePick 성장 스플래시" — 추가 설치 없이 CSS 애니메이션으로 옮겼습니다.
// 움직임 시간(언제 시작할지)은 grow-scene.css 의 animation-delay 에서 바꿉니다.
// 기기에서 '동작 줄이기'를 켠 사람에게는 처음부터 다 자란 그림만 보입니다.

const CYCLE_MS = 9000 // 한 바퀴 시간. 바꾸면 grow-scene.css 의 .grow-scene animation 시간도 같이 바꿔요.
const GROUND_Y = 316 // 땅 높이
const DROP_PATH = 'M0 -9.4c-2.6 3.7-5.2 6.7-5.2 9.4a5.2 5.2 0 0 0 10.4 0c0-2.7-2.6-5.7-5.2-9.4z' // 물방울 모양

// 물방울 3개 + 땅에 닿을 때 퍼지는 물결. n = 몇 번째 나무(1·2·3)
function Rain({ x, n }) {
  return (
    <g className={`gs-rain gs-rain-${n}`}>
      {[-12, 12, 0].map((dx, i) => (
        <g key={i} transform={`translate(${x + dx} ${GROUND_Y - 6})`}>
          <path className={`gs-drop gs-drop-${i}`} d={DROP_PATH} fill="#3E9BEA" />
        </g>
      ))}
      <ellipse className="gs-ripple" cx={x} cy={GROUND_Y - 2} rx="16" ry="4" fill="none" stroke="#3E9BEA" strokeWidth="2" />
    </g>
  )
}

// 흙 둔덕
function Mound({ cx, rx }) {
  return (
    <g>
      <ellipse cx={cx} cy={GROUND_Y + 4} rx={rx} ry={rx * 0.13} fill="#E8D6AE" />
      <ellipse cx={cx} cy={GROUND_Y + 2} rx={rx * 0.65} ry={rx * 0.08} fill="#D9BC88" />
    </g>
  )
}

const APPLES = [
  [463, 191], [480, 216], [446, 228], [468, 241], [427, 253], [494, 252],
]

export default function GrowScene({ className = '' }) {
  // run 숫자가 바뀌면 React가 그림을 새로 그려서 애니메이션이 처음부터 다시 시작돼요.
  const [run, setRun] = useState(0)
  const glowId = useId() // 빛 색칠 이름. 그림이 2개(PC·모바일)라도 겹치지 않게 자동으로 만들어요.

  useEffect(() => {
    // '동작 줄이기'를 켠 사람은 반복하지 않아요 (다 자란 그림만 보임).
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return undefined
    const timer = setInterval(() => setRun((n) => n + 1), CYCLE_MS)
    return () => clearInterval(timer) // 화면을 떠나면 반복을 멈춰요
  }, [])

  return (
    // aria-hidden: 꾸밈용 그림이라 화면 읽기 프로그램이 건너뜁니다.
    <svg key={run} className={`grow-scene ${className}`} viewBox="100 110 450 225" aria-hidden="true">
      <defs>
        <radialGradient id={glowId}>
          <stop offset="0%" stopColor="#FFF6B8" stopOpacity="1" />
          <stop offset="55%" stopColor="#F6FAD2" stopOpacity="0.55" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* 물 준 자리가 환하게 밝아지는 빛 */}
      <ellipse className="gs-glow gs-glow-1" cx="170" cy="298" rx="48" ry="41" fill={`url(#${glowId})`} />
      <ellipse className="gs-glow gs-glow-2" cx="320" cy="268" rx="64" ry="54" fill={`url(#${glowId})`} />
      <ellipse className="gs-glow gs-glow-3" cx="460" cy="240" rx="86" ry="73" fill={`url(#${glowId})`} />

      <Mound cx={170} rx={46} />
      <Mound cx={320} rx={56} />
      <Mound cx={460} rx={56} />

      {/* 1. 새싹 */}
      <rect className="gs-grow gs-sprout-stem" x="168.5" y="298" width="3" height="20" rx="1.5" fill="#3E8E45" />
      <g className="gs-grow gs-sprout-leaves">
        <ellipse cx="160" cy="297" rx="10" ry="4.5" transform="rotate(-22 160 297)" fill="#6CC25F" />
        <ellipse cx="180" cy="295" rx="11" ry="5" transform="rotate(18 180 295)" fill="#4EAE52" />
      </g>

      {/* 2. 소나무 */}
      <rect className="gs-grow gs-pine-trunk" x="316" y="271" width="8" height="47" rx="2" fill="#8A5A3C" />
      <path className="gs-grow gs-pine-low" d="M320 228L355 276H285Z" fill="#2E8B4E" />
      <path className="gs-grow gs-pine-top" d="M320 210L344 251H296Z" fill="#5DB85A" />

      {/* 3. 사과나무: 줄기 → 잎 → 사과 톡톡 */}
      <g className="gs-grow gs-apple-trunk">
        <rect x="454.5" y="238" width="11" height="80" rx="3" fill="#8A5A3C" />
        <path d="M456 282L441 271M464 277L479 266" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
      </g>
      <g className="gs-grow gs-apple-leaves">
        <circle cx="432" cy="246" r="21" fill="#2E8B4E" />
        <circle cx="488" cy="246" r="21" fill="#2E8B4E" />
        <circle cx="460" cy="220" r="32" fill="#2E8B4E" />
        <circle cx="450" cy="212" r="12" fill="#4FAE63" />
      </g>
      {APPLES.map(([cx, cy], i) => (
        <circle
          key={i}
          className="gs-grow gs-apple"
          style={{ animationDelay: `${5.85 + i * 0.09}s` }}
          cx={cx}
          cy={cy}
          r="6"
          fill="#E2483D"
        />
      ))}

      {/* 물방울 (맨 위에 그려야 나무에 가려지지 않아요) */}
      <Rain x={170} n={1} />
      <Rain x={320} n={2} />
      <Rain x={460} n={3} />
    </svg>
  )
}
