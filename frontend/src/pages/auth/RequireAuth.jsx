import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext' // 로그인 상태 게시판 읽기

// 로그인해야 들어갈 수 있는 페이지 앞에 세우는 "문지기"
// App.jsx 에서 <Route element={<RequireAuth />}> 로 페이지들을 감싸면,
//   - 로그인했으면: 원래 페이지를 그대로 보여 줍니다. (<Outlet /> = 감싼 페이지 자리)
//   - 로그인 안 했으면: /login 으로 보냅니다.
export default function RequireAuth() {
  const { user, loading } = useAuth()
  const location = useLocation() // 지금 가려던 주소 (예: /mypage)

  // 처음 켤 때 로그인 여부를 확인하는 아주 짧은 순간에는 아무것도 그리지 않습니다.
  // (확인 전에 "로그인 안 됨"으로 오해해서 로그인 화면으로 보내지 않도록)
  if (loading) return null

  if (!user) {
    // state.from: 가려던 주소를 로그인 화면에 같이 넘겨서, 로그인 후 그 페이지로 돌아오게 합니다.
    // replace: 뒤로 가기를 눌러도 막힌 페이지로 다시 튕겨 오지 않게 합니다.
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  return <Outlet />
}
