import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from './supabase'

// 앱 전체가 함께 보는 "로그인 상태 게시판"
const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null) // 로그인 정보 (없으면 null = 로그아웃 상태)
  const [loading, setLoading] = useState(true) // 처음 로그인 여부를 확인하는 중인지

  useEffect(() => {
    // 로그인·로그아웃이 일어날 때마다 Supabase가 알려 줍니다.
    // 처음 켤 때도 한 번 알려 주므로, 새로고침해도 저장된 로그인 상태를 불러옵니다.
    const { data } = supabase.auth.onAuthStateChange((_event, newSession) => {
      setSession(newSession)
      setLoading(false)
    })

    // 화면이 사라질 때 알림 받기를 멈춥니다.
    return () => data.subscription.unsubscribe()
  }, [])

  const value = {
    session, // session.access_token 은 FastAPI 호출 때 헤더에 붙일 토큰
    user: session?.user ?? null, // 로그인한 회원 (id, email 등)
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// 다른 화면에서 const { user, loading } = useAuth() 처럼 꺼내 씁니다.
export function useAuth() {
  return useContext(AuthContext)
}
