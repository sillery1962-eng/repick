// 사용자님 화면 불러오기
import RewardPage from '../../features/reward/RewardPage'

export default function Scan() {
  return (
    <RewardPage embedded backendReady={false} />
  )
}