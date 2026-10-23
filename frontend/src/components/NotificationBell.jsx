import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import useNotifications from './useNotifications'

// PC 헤더 알림 종 + 누르면 아래로 뜨는 팝업 (내 글에 달린 댓글). 담당: 오지원
// - 빨간 점: 마지막으로 연 뒤에 새 댓글이 있을 때만. 팝업을 열면 읽음 처리
// - 팝업 안 "새" 표시는 열기 직전 기준이라 열어 둔 동안은 남아 있음

function timeAgo(iso) {
  const sec = Math.max(0, (Date.now() - Date.parse(iso)) / 1000)
  if (sec < 60) return '방금'
  if (sec < 3600) return `${Math.floor(sec / 60)}분 전`
  if (sec < 86400) return `${Math.floor(sec / 3600)}시간 전`
  if (sec < 86400 * 7) return `${Math.floor(sec / 86400)}일 전`
  return new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' })
}

export default function NotificationBell() {
  const N = useNotifications()
  const [open, setOpen] = useState(false)
  const [newSince, setNewSince] = useState(0) // 팝업을 열기 직전의 읽음 시각
  const boxRef = useRef(null)

  // 바깥을 누르거나 Esc를 누르면 닫기
  useEffect(() => {
    if (!open) return undefined
    const onDown = (e) => { if (!boxRef.current?.contains(e.target)) setOpen(false) }
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false) }
    document.addEventListener('mousedown', onDown)
    window.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      window.removeEventListener('keydown', onKey)
    }
  }, [open])

  const toggle = () => {
    if (!open) {
      setNewSince(N.seenAt)
      N.markSeen()
    }
    setOpen(!open)
  }

  return (
    <div className="pc-noti" ref={boxRef}>
      <button type="button" className="pc-bell" aria-label={N.hasNew ? '알림 (새 댓글 있음)' : '알림'} aria-expanded={open} onClick={toggle}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="#121614" aria-hidden="true"><path d="M6 9a6 6 0 0 1 12 0c0 6 2.5 8 2.5 8h-17S6 15 6 9z" /><path d="M10 20a2.2 2.2 0 0 0 4 0z" /></svg>
        {N.hasNew && <span className="pc-bell-dot" />}
      </button>

      {open && (
        <div className="pc-noti-pop" role="dialog" aria-label="알림">
          <div className="pc-noti-head">내 글에 달린 댓글</div>
          {!N.loggedIn ? (
            <p className="pc-noti-empty"><Link to="/login" onClick={() => setOpen(false)}>로그인</Link>하면 알림을 볼 수 있어요.</p>
          ) : N.loading && N.items.length === 0 ? (
            <p className="pc-noti-empty">불러오는 중…</p>
          ) : N.error ? (
            <p className="pc-noti-empty">{N.error}</p>
          ) : N.items.length === 0 ? (
            <p className="pc-noti-empty">아직 내 글에 달린 댓글이 없어요.</p>
          ) : (
            <ul className="pc-noti-list">
              {N.items.map((c) => (
                <li key={c.id}>
                  <Link to="/community" className="pc-noti-item" onClick={() => setOpen(false)}>
                    <span className="pc-noti-row">
                      {Date.parse(c.created_at) > newSince && <span className="pc-noti-new">새</span>}
                      <span className="pc-noti-text"><strong>{c.nickname}</strong>님이 댓글을 남겼어요: {c.content}</span>
                    </span>
                    <span className="pc-noti-meta">내 글 "{c.post_excerpt}" · {timeAgo(c.created_at)}</span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
          {N.loggedIn && <Link to="/community" className="pc-noti-more" onClick={() => setOpen(false)}>커뮤니티에서 보기 ›</Link>}
        </div>
      )}
    </div>
  )
}
