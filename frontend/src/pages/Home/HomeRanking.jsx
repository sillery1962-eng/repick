import { Link } from 'react-router-dom'
import { useApi } from '../../api/useApi'
import { Tree } from '../../features/events/components/Icons'

// 홈 "이달의 적립왕" 1~3위 (PC·모바일 공용, PC는 show={4}로 4위까지). 모양은 시안 줄 그대로.
// fill: 칸에 남는 높이만큼 줄 사이를 벌려 마지막 줄을 칸 아래에 맞춤 (PC — 옆 커뮤니티 칸과 줄 맞추기)
// 이벤트 페이지 "명예의 전당"과 같은 GET /events/ranking 을 읽기만 합니다 (docs/api-spec.md 8번).
// 나무 그림도 이벤트 페이지와 같은 Tree 아이콘·단계 대응을 씁니다.
const TREE_ICON = { 1: 'stem', 2: 'stem', 3: 'stem', 4: 'sapling', 5: 'youngTree', 6: 'bigTree', 7: 'fruitTree' }
const SHOW = 3

const rowStyle = (first) => ({ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 14px', borderRadius: '18px', background: first ? '#CDEB45' : '#F2F3EE' })

export default function HomeRanking({ show = SHOW, fill = false }) {
  const { data, loading, error } = useApi('/events/ranking')
  const top = data?.top?.slice(0, show) ?? []

  if (loading || error || top.length === 0) {
    const message = loading ? '순위를 불러오는 중…' : error ? error.message : '이번 달 아직 포인트를 받은 사람이 없어요.'
    return (
      <Link to="/events#ranking" style={{ ...rowStyle(false), justifyContent: 'center', fontSize: '14px', color: '#454B47' }}>
        {message}
      </Link>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', ...(fill ? { flexGrow: '1', justifyContent: 'space-between' } : null) }}>
      {top.map((p) => (
        <div key={p.rank} style={rowStyle(p.rank === 1)}>
          <b style={{ width: '24px', fontSize: '18px' }}>{p.rank}</b>
          <span title={p.stage_name || undefined} style={{ width: '36px', height: '36px', borderRadius: '50%', background: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: '0' }}>
            <Tree stage={TREE_ICON[p.stage] || 'stem'} size={32} />
          </span>
          <span style={{ flexGrow: '1', minWidth: '0', fontSize: '15px', fontWeight: '700', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.name}</span>
          <b style={{ fontSize: '15px' }}>{Number(p.points).toLocaleString('ko-KR')}P</b>
        </div>
      ))}
    </div>
  )
}
