import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import useIsPc from '../lib/useIsPc'
import BottomNav from './BottomNav'
import FortyFab from './FortyFab'
import PcFooter from './PcFooter'
import PcHeader from './PcHeader'
import './Layout.css'

// 페이지마다 본문 폭(시안 기준). 헤더·푸터 안쪽 폭을 본문과 맞춰 로고와 본문 시작점을 정렬합니다.
// 10/28: 수거함 지도(/map)도 1200 → 다른 페이지와 같은 1080 (폭이 더 넓어 보여서). 다른 폭이 필요한 페이지만 여기에 적기
const PAGE_WIDTH = {}
const DEFAULT_WIDTH = 1080

/**
 * 모든 화면의 공통 틀
 * - PC(1024px 이상): 위 헤더 + 페이지 + 아래 푸터
 * - 모바일: 페이지(각 화면의 상단 바 포함) + 아래 메뉴 5개
 * - 공통: 오른쪽 아래 포티 버튼
 */
export default function Layout() {
  const isPc = useIsPc()
  const { pathname, hash } = useLocation()
  const width = PAGE_WIDTH[Object.keys(PAGE_WIDTH).find((p) => pathname.startsWith(p))] || DEFAULT_WIDTH

  // 페이지를 옮기면 맨 위로, 주소에 #이 있으면 그 위치로
  useEffect(() => {
    if (hash) {
      const el = document.getElementById(decodeURIComponent(hash.slice(1)))
      if (el) { el.scrollIntoView({ block: 'start' }); return }
    }
    window.scrollTo(0, 0)
  }, [pathname, hash])

  return (
    <div className={`layout ${isPc ? 'layout-pc' : 'layout-mobile'}${width < 1200 ? ' layout-narrow' : ''}`} style={{ '--page-max': `${width}px` }}>
      {isPc && <PcHeader />}
      <main className="layout-main">
        <Outlet />
      </main>
      {isPc ? <PcFooter /> : <BottomNav />}
      <FortyFab />
    </div>
  )
}
