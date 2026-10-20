import { useCallback, useEffect, useState } from 'react'
import { api } from '../../api/client'

// 커뮤니티 글 목록 (GET /posts). "더보기"로 다음 쪽을 이어 붙이고,
// 새 글·좋아요·삭제는 서버 답을 받아 목록에 바로 반영합니다.
// userId: 로그인한 회원 id — 바뀌면(로그인·로그아웃) "내 좋아요" 표시를 위해 다시 불러와요.
export function useFeed(userId, pageSize = 9) {
  const [items, setItems] = useState([])
  const [nextCursor, setNextCursor] = useState(null)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [error, setError] = useState(null)
  const [reloadKey, setReloadKey] = useState(0)

  useEffect(() => {
    let alive = true // 화면이 닫힌 뒤 늦게 온 답은 버림
    api
      .get(`/posts?limit=${pageSize}`)
      .then((data) => {
        if (!alive) return
        setItems(data.items)
        setNextCursor(data.next_cursor)
        setError(null)
        setLoading(false)
      })
      .catch((err) => {
        if (!alive) return
        setError(err)
        setLoading(false)
      })
    return () => {
      alive = false
    }
  }, [userId, pageSize, reloadKey])

  const reload = useCallback(() => {
    setLoading(true)
    setReloadKey((k) => k + 1)
  }, [])

  const loadMore = useCallback(async () => {
    if (nextCursor === null) return
    setLoadingMore(true)
    try {
      const data = await api.get(`/posts?limit=${pageSize}&cursor=${nextCursor}`)
      setItems((prev) => [...prev, ...data.items])
      setNextCursor(data.next_cursor)
    } catch (err) {
      alert(err.message)
    } finally {
      setLoadingMore(false)
    }
  }, [nextCursor, pageSize])

  const addPost = useCallback((post) => setItems((prev) => [post, ...prev]), [])
  const updatePost = useCallback(
    (id, patch) => setItems((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p))),
    [],
  )
  const removePost = useCallback((id) => setItems((prev) => prev.filter((p) => p.id !== id)), [])

  return { items, loading, error, reload, hasMore: nextCursor !== null, loadMore, loadingMore, addPost, updatePost, removePost }
}
