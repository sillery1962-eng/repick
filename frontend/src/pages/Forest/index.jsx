// 나무 조회·물주기·수확 상태는 PC/모바일 전환 중에도 이 컴포넌트에 유지됩니다.
import useIsPc from '../../lib/useIsPc'
import useForest from './useForest'
import ForestMobile from './ForestMobile'
import ForestPc from './ForestPc'

export default function Forest() {
  const isPc = useIsPc()
  // 화면 크기가 바뀌어도 같은 훅을 유지하므로 API를 다시 조회하지 않습니다.
  const forest = useForest(isPc)
  return isPc ? <ForestPc forest={forest} /> : <ForestMobile forest={forest} />
}
