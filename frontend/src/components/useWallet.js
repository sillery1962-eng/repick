import { useEffect } from 'react'
import { useApi } from '../api/useApi'
import { useAuth } from '../lib/AuthContext'

// 헤더·상단 바의 💧물방울·⭐포인트 잔액 (GET /points, docs/api-spec.md 5번). 담당: 오지원
//
// 사용 예:
//   const W = useWallet()
//   <span>{W.dropsText}</span> <span>{W.pointsText}</span>
//
// - 로그인 전·불러오는 중·서버 꺼짐이면 '-'
// - 적립·차감한 화면에서 refreshWallet()을 부르면 열려 있는 모든 잔액이 다시 불러와집니다

const EVENT = 'repick:wallet-refresh'

/** 포인트·물방울이 바뀐 뒤 부르기 (예: 퀴즈 정답, 출석) */
export function refreshWallet() {
  window.dispatchEvent(new Event(EVENT))
}

export default function useWallet() {
  const { user } = useAuth()
  const { data, reload } = useApi('/points', { skip: !user })

  useEffect(() => {
    window.addEventListener(EVENT, reload)
    return () => window.removeEventListener(EVENT, reload)
  }, [reload])

  const drops = user && data ? Number(data.drops_balance) || 0 : null
  const points = user && data ? Number(data.points_balance) || 0 : null
  return {
    drops,
    points,
    dropsText: drops === null ? '-' : drops.toLocaleString('ko-KR'),
    pointsText: points === null ? '-' : points.toLocaleString('ko-KR'),
  }
}
