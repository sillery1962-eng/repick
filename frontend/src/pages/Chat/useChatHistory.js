/* 챗봇 포티 대화 기록: 로그인해 있는 동안 메뉴를 옮기거나 새로고침해도 대화가 남게 합니다 (담당: 김선영)
 * - 회원마다 따로 브라우저(localStorage)에 저장 → 다른 계정으로 로그인하면 그 계정 대화만 보임
 * - 로그아웃하면 저장된 대화를 모두 지움 (같은 컴퓨터를 쓰는 다른 사람이 못 보게)
 * - 로그아웃 상태로 쓸 때는 저장하지 않음 (예전처럼 화면을 나가면 사라짐)
 */
import { useCallback, useEffect, useState } from 'react'
import { supabase } from '../../lib/supabase'
import { useAuth } from '../../lib/AuthContext'

const PREFIX = 'repick:chat:'
const MAX_SAVED = 50 // 최근 대화 50개만 저장 (저장 공간이 너무 커지지 않게)

function load(userId) {
  if (!userId) return []
  try {
    const saved = JSON.parse(localStorage.getItem(PREFIX + userId))
    return Array.isArray(saved) ? saved : []
  } catch {
    return [] // 시크릿 창 등 저장이 막힌 환경 → 빈 대화로 시작
  }
}

// 로그아웃 신호를 받으면 저장된 대화를 모두 지움 (챗봇 화면을 열지 않은 상태에서 로그아웃해도 동작)
supabase.auth.onAuthStateChange((event) => {
  if (event !== 'SIGNED_OUT') return
  try {
    Object.keys(localStorage)
      .filter((key) => key.startsWith(PREFIX))
      .forEach((key) => localStorage.removeItem(key))
  } catch {
    /* 저장 공간을 못 쓰는 환경이면 지울 것도 없음 */
  }
})

// useState([]) 대신 쓰는 도구: const [msgs, setMsgs] = useChatHistory()
export function useChatHistory() {
  const { user } = useAuth()
  const userId = user?.id ?? null
  const [hist, setHist] = useState(() => ({ userId, msgs: load(userId) }))

  // 로그인 정보가 늦게 도착하거나 계정이 바뀌면 그 회원의 대화로 바꿔 끼움
  if (hist.userId !== userId) setHist({ userId, msgs: load(userId) })

  const setMsgs = useCallback(
    (update) => setHist((h) => ({ ...h, msgs: typeof update === 'function' ? update(h.msgs) : update })),
    [],
  )

  // 대화가 바뀔 때마다 저장 (로그인한 회원만)
  useEffect(() => {
    if (!hist.userId) return
    try {
      localStorage.setItem(PREFIX + hist.userId, JSON.stringify(hist.msgs.slice(-MAX_SAVED)))
    } catch {
      /* 저장에 실패해도 채팅은 계속 */
    }
  }, [hist])

  return [hist.userId === userId ? hist.msgs : [], setMsgs]
}
