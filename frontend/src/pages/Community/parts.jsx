// 커뮤니티 화면 공용 조각 (PC·모바일이 같이 씀). 모양·색은 시안(CommunityPc/Mobile) 그대로 옮겼어요.
// 값·함수(인스타 주소, 시간 표시 등)는 utils.js
import useHomeForest from '../Home/useHomeForest' // 내 나무 사진: 나의 숲(GET /forest) 단계 사진

// ---------- 프로필 그림: 시안의 나무 3가지 중 회원 id로 하나를 골라 늘 같은 그림 ----------
const TREES = [
  {
    bg: '#EEF7E6',
    art: (
      <>
        <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
        <path d="M60 22l22 30H38z" fill="#3FA35A" />
        <path d="M60 38l27 34H33z" fill="#2E8B4E" />
      </>
    ),
  },
  {
    bg: '#FDE7E4',
    art: (
      <>
        <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
        <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
        <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
        <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
        <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
        <circle cx="52" cy="36" r="10" fill="#45A862" />
        <circle cx="46" cy="44" r="5" fill="#E2483D" />
        <circle cx="70" cy="34" r="5" fill="#E2483D" />
        <circle cx="64" cy="58" r="5" fill="#E2483D" />
        <circle cx="36" cy="62" r="5" fill="#E2483D" />
        <circle cx="84" cy="56" r="5" fill="#E2483D" />
        <circle cx="56" cy="24" r="5" fill="#E2483D" />
      </>
    ),
  },
  {
    bg: '#EEF7E6',
    art: (
      <>
        <path d="M60 106V78" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
        <ellipse cx="46" cy="76" rx="15" ry="8.5" transform="rotate(-24 46 76)" fill="#6CC25F" />
        <ellipse cx="74" cy="74" rx="15" ry="8.5" transform="rotate(24 74 74)" fill="#4EAE52" />
      </>
    ),
  },
]

function pickTree(id = '') {
  let sum = 0
  for (const ch of String(id)) sum += ch.charCodeAt(0)
  return TREES[sum % TREES.length]
}

// 나의 숲과 같은 단계 사진 (public/images/trees/stage-1~6.png, 7단계는 6번 사진)
const stageImage = (stage) => `/images/trees/stage-${Math.min(Math.max(stage, 1), 6)}.png`

// 나무 사진 동그라미: 내 프로필(MyTreeAvatar)과 같은 미색 배경 + 1.25배
function TreePhoto({ src, alt, size, bg = '#F7F8F4' }) {
  return (
    <span style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: bg, flexShrink: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <img src={src} alt={alt} width={size} height={size} decoding="async" style={{ display: 'block', width: '100%', height: '100%', objectFit: 'contain', objectPosition: 'center bottom', transform: 'scale(1.25)', transformOrigin: 'center bottom' }} />
    </span>
  )
}

// size: 44(글) · 32(댓글) · 28(답글). bg를 주면 배경색을 바꿈 (글쓰기 칸은 연두)
// stage(1~7)가 있으면 그 사람의 나의 숲 나무 단계 사진, 없으면(서버가 못 읽음) 시안 그림
export function Avatar({ id, size = 44, bg, stage }) {
  if (stage) return <TreePhoto src={stageImage(Number(stage))} alt={`나무 ${stage}단계`} size={size} />
  const tree = pickTree(id)
  return (
    <span style={{ width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: bg || tree.bg, flexShrink: '0', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      <svg width={size - 4} height={size - 4} viewBox="0 0 120 120" fill="none" aria-hidden="true">
        <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
        <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
        {tree.art}
      </svg>
    </span>
  )
}

// 내 프로필 그림 = 나의 숲에서 키우는 내 나무 사진 (단계에 따라 바뀜). 로그인 전에는 새싹 사진
// 배경은 홈 나의 숲 카드의 나무 칸과 같은 미색, 사진은 1.25배로 키움
export function MyTreeAvatar({ size = 44, bg = '#F7F8F4' }) {
  const F = useHomeForest()
  return <TreePhoto src={F.image} alt={`내 나무: ${F.stageName}`} size={size} bg={bg} />
}

// ---------- 아이콘 ----------
export function InstagramIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" />
    </svg>
  )
}

export function DropIcon({ color = '#3E9BEA' }) {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill={color} />
      <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
    </svg>
  )
}

// 목록 위 상태 안내 상자 (불러오는 중 · 오류 · 빈 목록)
export function NoticeBox({ children }) {
  return (
    <div style={{ background: '#FFFFFF', borderRadius: '24px', padding: '28px', boxSizing: 'border-box', textAlign: 'center', fontSize: '14px', color: '#454B47', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
      {children}
    </div>
  )
}
