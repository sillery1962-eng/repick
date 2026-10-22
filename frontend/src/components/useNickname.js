import { useEffect } from 'react'
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
  const { user } = useAuth()
  const { data, reload } = useApi('/me', { skip: !user })

  useEffect(() => {
    window.addEventListener(EVENT, reload)
    return () => window.removeEventListener(EVENT, reload)
  }, [reload])

  if (!user) return null
  return data?.nickname || ''
}
