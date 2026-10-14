import { lazy, Suspense } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import Layout from './components/Layout'
import Chat from './pages/Chat'
import Community from './pages/Community'
import Donate from './pages/Donate'
import Forest from './pages/Forest'
import Home from './pages/Home'
import MyPage from './pages/MyPage'
import Points from './pages/Points'
import Scan from './pages/Scan'

// 기능 폴더(features)의 큰 화면은 들어갈 때만 불러옵니다 (카카오 지도도 /map에서만 로드)
const EventsRoutes = lazy(() => import('./features/events/EventsRoutes'))
const RecycleMapPage = lazy(() => import('./features/recycle-map/RecycleMapPage'))

const Loading = () => <div style={{ padding: 40, textAlign: 'center', color: '#6B716D' }}>불러오는 중…</div>

// 시작·가입·로그인 화면 — 현숙 님 담당 (frontend/src/pages/auth/). 파일이 오면 아래 주석을 풀어 연결
import WelcomePage from './pages/auth/WelcomePage'
import SignupPage from './pages/auth/SignupPage'
import LoginPage from './pages/auth/LoginPage'

// 주소(URL)와 화면 연결 — v4.5 실사 비교 시안
function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<Loading />}>
        <Routes>
          {/* 틀 없이 화면 전체를 쓰는 화면 (헤더·하단 메뉴 없음) — 현숙 님 담당, 자리만 비워 둠 */}
          <Route path="welcome" element={<WelcomePage />} />
          <Route path="signup" element={<SignupPage />} />
          <Route path="login" element={<LoginPage />} />

          {/* 나머지는 공통 틀(PC 헤더·푸터 / 모바일 하단 메뉴) 안에서 */}
          <Route element={<Layout />}>
            <Route index element={<Home />} />
            <Route path="scan" element={<Scan />} />
            <Route path="forest" element={<Forest />} />
            <Route path="community" element={<Community />} />
            <Route path="mypage" element={<MyPage />} />
            <Route path="chat" element={<Chat />} />
            <Route path="points" element={<Points />} />
            <Route path="donate" element={<Donate />} />
            <Route path="events/*" element={<EventsRoutes />} />
            <Route path="map" element={<RecycleMapPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Route>
        </Routes>
      </Suspense>
    </BrowserRouter>
  )
}

export default App
