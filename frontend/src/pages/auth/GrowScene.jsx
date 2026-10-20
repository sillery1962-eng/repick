import { useEffect, useId, useState } from 'react'
import './grow-scene.css'
import sproutImg from '../../assets/stages/stage-2.webp' // 새싹
import youngImg from '../../assets/stages/stage-4.webp' // 어린 나무
import appleImg from '../../assets/stages/stage-7.webp' // 사과나무

// 로그인·가입 화면 PC 왼쪽의 움직이는 숲 그림 (모바일은 auth.css 가 왼쪽 영역을 숨겨서 안 보임)
// 물방울이 떨어지면 새싹 → 어린 나무 → 사과나무 순서로 쑥쑥 자랍니다. (9초마다 처음부터 반복)
// 원본: 아티팩트 "RePick 성장 스플래시" — 추가 설치 없이 CSS 애니메이션으로 옮겼습니다.
// 그림은 실사 사진(src/assets/stages). 사진에 흙더미가 들어 있어서 흙 둔덕은 따로 그리지 않아요.
// 움직임 시간(언제 시작할지)은 grow-scene.css 의 animation-delay 에서 바꿉니다.
// 기기에서 '동작 줄이기'를 켠 사람에게는 처음부터 다 자란 그림만 보입니다.

const CYCLE_MS = 9000 // 한 바퀴 시간. 바꾸면 grow-scene.css 의 .grow-scene animation 시간도 같이 바꿔요.
const GROUND_Y = 316 // 땅 높이
const DROP_PATH = 'M0 -9.4c-2.6 3.7-5.2 6.7-5.2 9.4a5.2 5.2 0 0 0 10.4 0c0-2.7-2.6-5.7-5.2-9.4z' // 물방울 모양

// 물방울 3개 + 땅에 닿을 때 퍼지는 물결. n = 몇 번째 나무(1·2·3), dropId = 물방울 색칠 이름
// 실사 느낌: 가운데는 밝고 가장자리는 진한 파랑(입체감) + 하얀 반사광 2개 + 얇은 테두리
function Rain({ x, n, dropId }) {
  return (
    <g className={`gs-rain gs-rain-${n}`}>
      {[-12, 12, 0].map((dx, i) => (
        <g key={i} transform={`translate(${x + dx} ${GROUND_Y - 6})`}>
          <g className={`gs-drop gs-drop-${i}`}>
            <path d={DROP_PATH} fill={`url(#${dropId})`} stroke="#2F7FC4" strokeOpacity="0.45" strokeWidth="0.5" />
            <ellipse cx="-2" cy="-1.2" rx="1.1" ry="2.4" transform="rotate(18 -2 -1.2)" fill="#FFFFFF" opacity="0.9" />
            <circle cx="2.2" cy="2.4" r="0.7" fill="#FFFFFF" opacity="0.6" />
          </g>
        </g>
      ))}
      <ellipse className="gs-ripple" cx={x} cy={GROUND_Y - 2} rx="16" ry="4" fill="none" stroke="#7FC0F0" strokeWidth="1.5" />
    </g>
  )
}

export default function GrowScene({ className = '' }) {
  // run 숫자가 바뀌면 React가 그림을 새로 그려서 애니메이션이 처음부터 다시 시작돼요.
  const [run, setRun] = useState(0)
  const glowId = useId() // 빛 색칠 이름. 그림이 2개(PC·모바일)라도 겹치지 않게 자동으로 만들어요.
  const dropId = useId() // 물방울 색칠 이름

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
        {/* 물방울: 왼쪽 위가 밝고 오른쪽 아래로 갈수록 진해지는 투명한 파랑 */}
        <radialGradient id={dropId} cx="38%" cy="62%" r="65%">
          <stop offset="0%" stopColor="#E6F5FF" stopOpacity="0.95" />
          <stop offset="45%" stopColor="#8CCBF5" stopOpacity="0.85" />
          <stop offset="100%" stopColor="#2F7FC4" stopOpacity="0.95" />
        </radialGradient>
      </defs>

      {/* 물 준 자리가 환하게 밝아지는 빛 */}
      <ellipse className="gs-glow gs-glow-1" cx="172" cy="298" rx="48" ry="41" fill={`url(#${glowId})`} />
      <ellipse className="gs-glow gs-glow-2" cx="320" cy="268" rx="64" ry="54" fill={`url(#${glowId})`} />
      <ellipse className="gs-glow gs-glow-3" cx="475" cy="240" rx="86" ry="73" fill={`url(#${glowId})`} />

      {/* 실사 사진 3장 — 밑동(흙)을 y=322 에 맞춤. 자라는 시간은 grow-scene.css 의 클래스 이름을 그대로 씀
          (gs-sprout-leaves 1.75초, gs-pine-low 3.55초, gs-apple-leaves 5.4초) */}
      {/* 1. 새싹 */}
      <image className="gs-grow gs-sprout-leaves" href={sproutImg} x="134" y="276" width="76" height="46" />
      {/* 2. 어린 나무 */}
      <image className="gs-grow gs-pine-low" href={youngImg} x="267" y="191" width="106" height="131" />
      {/* 3. 사과나무 */}
      <image className="gs-grow gs-apple-leaves" href={appleImg} x="397" y="172" width="156" height="150" />

      {/* 물방울 (맨 위에 그려야 나무에 가려지지 않아요) */}
      <Rain x={172} n={1} dropId={dropId} />
      <Rain x={320} n={2} dropId={dropId} />
      <Rain x={475} n={3} dropId={dropId} />
    </svg>
  )
}
