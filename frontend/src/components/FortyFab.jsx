import { Link, useLocation } from 'react-router-dom'
import FortyHeart from './FortyHeart' // 2초마다 새싹 → 초록 하트 새싹 → 분홍 하트로 바뀌는 포티

// 오른쪽 아래 떠 있는 '포티에게 물어보기' 버튼 (챗봇 화면에서는 숨김)
export default function FortyFab() {
  const { pathname } = useLocation()
  if (pathname.startsWith('/chat')) return null
  return (
    <Link to="/chat" className="forty-fab" aria-label="분리배출 도우미 포티와 대화하기" title="포티에게 물어보기">
      <FortyHeart size={48} />
    </Link>
  )
}
