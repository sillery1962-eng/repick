import { useEffect, useRef } from 'react'
import { useApi } from '../api/useApi'
import { useAuth } from '../lib/AuthContext'

// 헤더에 보여 줄 내 닉네임 (GET /me, docs/api-spec.md 2번). 담당: 오지원
// - 로그인 전이면 null, 불러오는 중이면 ''
// - 닉네임을 바꾼 화면(마이페이지 프로필 편집)에서 refreshNickname()을 부르면 헤더도 다시 불러옵니다

const EVENT = 'repick:me-refresh'

/** 닉네임을 바꾼 뒤 부르기 */
export function refreshNickname() {
  window.dispatchEvent(new Event(EVENT))
}

export default function useNickname() {
  const { user, session } = useAuth()
  const { data, reload } = useApi('/me', { skip: !user })
  useReloadOnNewToken(session?.access_token, reload)

  useEffect(() => {
    window.addEventListener(EVENT, reload)
    return () => window.removeEventListener(EVENT, reload)
  }, [reload])

  if (!user) return null
  // 서버 값이 아직 없으면(불러오는 중·401) 가입할 때 넣은 닉네임으로
  return data?.nickname || user.user_metadata?.nickname || ''
}

/** 로그인 토큰이 바뀌면(자동 갱신·다시 로그인) 다시 불러오기 — 새로고침 직후 만료된 토큰으로 401을 받은 경우 */
export function useReloadOnNewToken(token, reload) {
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    if (token) reload()
  }, [token, reload])
}
