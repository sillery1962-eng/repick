import { Navigate } from 'react-router-dom'

// 시작 화면(/welcome)은 쓰지 않기로 했어요 (10/16 결정). → 로그인 화면으로 바로 보냅니다.
// 홈·마이페이지의 /welcome 버튼도 그대로 로그인 화면으로 이어져요.
// 원래 시작 화면은 WelcomePage.backup.jsx 에 보관해 두었어요.
export default function WelcomePage() {
  return <Navigate to="/login" replace />
}
