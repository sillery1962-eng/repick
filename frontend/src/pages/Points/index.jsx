// 2026-10-20: 화면 폭이 바뀌어도 잔액·필터·내역을 공통으로 유지합니다.
import useIsPc from '../../lib/useIsPc'
import usePoints from './usePoints'
import PointsMobile from './PointsMobile'
import PointsPc from './PointsPc'

export default function Points() {
  const isPc = useIsPc()
  const points = usePoints()
  return isPc ? <PointsPc points={points} /> : <PointsMobile points={points} />
}
