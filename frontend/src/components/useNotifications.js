import { useCallback, useEffect, useState } from 'react'
import { useApi } from '../api/useApi'
import { useAuth } from '../lib/AuthContext'
import { useReloadOnNewToken } from './useNickname'

// 헤더 알림 종: 내 글에 남이 단 댓글 (GET /me/activity의 received_comments, 최근 20개). 담당: 오지원
//
// 사용 예:
//   const N = useNotifications()
//   {N.hasNew && <span className="dot" />}
//   <button onClick={N.markSeen}>읽음</button>
//
// - 새 알림 = 마지막으로 알림을 연 뒤에 달린 댓글. 연 시각은 DB 없이 이 브라우저(localStorage)에만 저장
//   → 다른 기기·브라우저에서는 따로 계산됨
// - 페이지를 열 때와 다른 창에 갔다가 돌아올 때 다시 불러옴 (실시간 아님)

const SEEN_KEY = 'repick:noti-seen:'

function readSeen(userId) {
  try {
    return Number(localStorage.getItem(SEEN_KEY + userId)) || 0
  } catch {
    return 0 // 사생활 보호 창 등에서 저장소를 못 쓰면 모두 새 알림으로
  }
}

export default function useNotifications() {
  const { user, session } = useAuth()
  const { data, loading, error, reload } = useApi('/me/activity', { skip: !user })
  useReloadOnNewToken(session?.access_token, reload)
  const [seen, setSeen] = useState({}) // 이번 화면에서 읽음 처리한 시각 { 회원 id: ms }

  useEffect(() => {
    if (!user) return undefined
    window.addEventListener('focus', reload)
    return () => window.removeEventListener('focus', reload)
  }, [user, reload])

  const items = user && data ? data.received_comments || [] : []
  const seenAt = user ? (seen[user.id] ?? readSeen(user.id)) : 0
  const latest = items.reduce((max, c) => Math.max(max, Date.parse(c.created_at) || 0), 0)

  const markSeen = useCallback(() => {
    if (!user || !latest) return
    try {
      localStorage.setItem(SEEN_KEY + user.id, String(latest))
    } catch {
      // 저장 못 해도 이번 화면에서는 읽음으로
    }
    setSeen((prev) => ({ ...prev, [user.id]: latest }))
  }, [user, latest])

  return {
    loggedIn: !!user,
    items,
    seenAt,
    hasNew: latest > seenAt,
    loading,
    error: error?.message || '',
    markSeen,
  }
}
