import { useApi } from '../../api/useApi'
import { useAuth } from '../../lib/AuthContext'

// 홈 화면 "나의 숲" 카드에 보여 줄 값 (PC·모바일 공용)
// 나의 숲 화면과 같은 GET /forest 를 읽기만 합니다 (docs/api-spec.md 6번). 물 주기·수확은 나의 숲 화면에서.
// 사진도 나의 숲 화면과 같은 public/images/trees/stage-1~6.png (7단계는 6번 사진 — 나의 숲과 같게)
const NAMES = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']

const treeImage = (stage) => `/images/trees/stage-${Math.min(Math.max(stage, 1), 6)}.png`

export default function useHomeForest() {
  const { user } = useAuth()
  const { data, loading, error } = useApi('/forest', { skip: !user })

  // 로그인 전: 새싹 사진 + 로그인 안내
  if (!user) {
    return { badge: '로그인 전', stageName: '나의 나무', drops: '-', pct: '0%', image: treeImage(1), nextLine: '로그인하고 물방울로 나무를 키워 보세요' }
  }
  if (loading || !data) {
    return { badge: '…', stageName: '불러오는 중', drops: '-', pct: '0%', image: treeImage(1), nextLine: error ? error.message : '나무 정보를 불러오는 중…' }
  }

  const stage = Math.min(Math.max(Number(data.stage) || 1, 1), 7)
  const inStage = Number(data.drops_in_stage) || 0
  const need = Number(data.drops_to_next) || 0
  const left = Math.max(need - inStage, 0)

  let nextLine
  if (data.harvest_ready) nextLine = '열매가 열렸어요! 지금 수확할 수 있어요'
  else if (stage < 7) nextLine = `다음 단계 ‘${NAMES[stage]}’까지 물방울 ${left}개`
  else nextLine = `수확까지 물방울 ${left}개`

  return {
    badge: `${stage} / 7단계`,
    stageName: data.stage_name || NAMES[stage - 1],
    drops: `${Number(data.drops_balance) || 0}개`,
    pct: data.harvest_ready ? '100%' : need > 0 ? `${Math.round((inStage / need) * 100)}%` : '0%',
    image: treeImage(stage),
    nextLine,
  }
}
