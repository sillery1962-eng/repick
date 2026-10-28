import { useNavigate, useSearchParams } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext'
import useIsPc from '../../lib/useIsPc'
import DonateMobile from './DonateMobile'
import DonatePc from './DonatePc'

// PC(1024px 이상)는 PC 시안, 그보다 좁으면 모바일 시안을 보여 줍니다.
// 로그아웃 상태에서도 기부처를 둘러볼 수 있고, 기부하려면 로그인 → 로그인 후 이 화면으로 돌아옴
export default function Donate() {
  const isPc = useIsPc()
  const { user, loading } = useAuth()
  const navigate = useNavigate()
  const [params] = useSearchParams()
  if (loading) return null // 로그인 여부를 확인한 뒤에 그리기 (둘러보기 → 회원 화면으로 바뀌며 깜빡이지 않게)

  // 홈 기부 목록에서 누르면 /donate?campaign=번호 → 그 기부처를 고른 상태로 시작
  const campaign = params.get('campaign')
  const from = campaign ? `/donate?campaign=${campaign}` : '/donate'
  const props = {
    loggedIn: Boolean(user),
    campaignId: campaign ? Number(campaign) : null,
    onLogin: () => navigate('/login', { state: { from } }), // 로그인하고 돌아와도 같은 기부처로
  }
  // key: 로그인·로그아웃하거나 다른 기부처 주소로 오면 화면 로직을 새로 만들어 다시 불러옴
  const key = `${user?.id ?? 'guest'}-${campaign ?? ''}`
  return isPc ? <DonatePc key={key} {...props} /> : <DonateMobile key={key} {...props} />
}
