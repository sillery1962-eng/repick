import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext'
import PostCard from './PostCard'
import PostComposer from './PostComposer'
import { NoticeBox } from './parts'
import { darkButton } from './utils'
import { useFeed } from './useFeed'

// 커뮤니티 피드 (PC·모바일 공용): 필터 · 글쓰기 · 글 카드 목록 · 더보기
// PC는 글쓰기 → 필터 → 3칸 카드, 모바일은 필터 → 글쓰기 → 1칸 카드 (시안 순서 그대로)
const FILTERS = [
  { key: 'all', label: '전체' },
  { key: 'verify', label: '실천 인증' },
]

export default function Feed({ mobile = false }) {
  const { user } = useAuth()
  const me = user?.id ?? null
  const feed = useFeed(me)
  const [filter, setFilter] = useState('all')

  const shown = filter === 'verify' ? feed.items.filter((p) => p.is_verification) : feed.items

  const chips = (
    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
      {FILTERS.map((f) => {
        const on = filter === f.key
        return (
          <button
            key={f.key}
            type="button"
            onClick={() => setFilter(f.key)}
            aria-pressed={on}
            style={{ height: '38px', padding: '0 16px', borderRadius: '999px', background: on ? '#121614' : '#FFFFFF', color: on ? '#FFFFFF' : '#121614', border: on ? 'none' : '1px solid #ECEDE8', fontWeight: on ? '700' : '500', fontSize: '14px', display: 'flex', alignItems: 'center', cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {f.label}
          </button>
        )
      })}
    </div>
  )
  const composer = <PostComposer me={me} mobile={mobile} onCreated={feed.addPost} />

  let body
  if (feed.loading) {
    body = <NoticeBox>글을 불러오는 중…</NoticeBox>
  } else if (feed.error) {
    body = (
      <NoticeBox>
        {feed.error.message}
        <button type="button" onClick={feed.reload} style={{ ...darkButton, height: '38px' }}>
          다시 시도
        </button>
      </NoticeBox>
    )
  } else if (shown.length === 0) {
    body = <NoticeBox>{filter === 'verify' ? '아직 실천 인증 글이 없어요.' : '아직 글이 없어요. 첫 글을 올려 보세요!'}</NoticeBox>
  } else {
    body = (
      <div style={mobile ? { display: 'flex', flexDirection: 'column', gap: '14px' } : { display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: '12px', alignItems: 'stretch' }}>
        {shown.map((post) => (
          <PostCard key={post.id} post={post} me={me} mobile={mobile} onChange={feed.updatePost} onDelete={feed.removePost} />
        ))}
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: mobile ? '14px' : '16px' }}>
      {mobile ? chips : composer}
      {mobile ? composer : chips}
      {body}
      {!feed.loading && !feed.error && feed.hasMore ? (
        <button
          type="button"
          onClick={feed.loadMore}
          disabled={feed.loadingMore}
          style={{ height: '44px', borderRadius: '14px', border: '1px solid #ECEDE8', background: '#FFFFFF', fontSize: '14px', fontWeight: '700', color: '#454B47', cursor: 'pointer', fontFamily: 'inherit' }}
        >
          {feed.loadingMore ? '불러오는 중…' : '글 더보기'}
        </button>
      ) : null}
    </div>
  )
}
