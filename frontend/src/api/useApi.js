import { useCallback, useEffect, useState } from 'react'
import { api } from './client'

// 화면이 열릴 때 GET 요청으로 값을 받아 오는 도우미 (담당: 백현숙)
//
// 사용 예:
//   const { data, error, loading, reload } = useApi('/points')
//   if (loading) return <p>불러오는 중…</p>
//   if (error) return <p>{error.message}</p>
//   return <p>물방울 {data.drops_balance}개</p>
//
// - skip: true 로 주면 요청하지 않습니다. (예: 로그인 전에는 부르지 않기)
//   const { data } = useApi('/me', { skip: !user })
// - reload(): 물 주기·적립처럼 값이 바뀐 뒤 다시 받아 오고 싶을 때
export function useApi(path, { skip = false } = {}) {
  const [state, setState] = useState({ data: null, error: null, loading: !skip })
  const [reloadKey, setReloadKey] = useState(0) // 숫자가 바뀌면 다시 요청

  useEffect(() => {
    if (skip) return undefined

    let alive = true // 화면이 닫힌 뒤 늦게 온 답은 버리기 위한 표시
    api
      .get(path)
      .then((data) => {
        if (alive) setState({ data, error: null, loading: false })
      })
      .catch((error) => {
        if (alive) setState({ data: null, error, loading: false })
      })

    return () => {
      alive = false
    }
  }, [path, skip, reloadKey])

  const reload = useCallback(() => {
    setState((prev) => ({ ...prev, loading: true }))
    setReloadKey((k) => k + 1)
  }, [])

  return { ...state, loading: skip ? false : state.loading, reload }
}
