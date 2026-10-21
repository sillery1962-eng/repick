import { Link } from 'react-router-dom'
import { useApi } from '../../api/useApi'

// 홈 "커뮤니티 자랑 피드"의 카드 2개 (PC·모바일 공용). 모양은 시안 카드 그대로.
// 커뮤니티 GET /posts 최신 글을 읽기만 합니다 — 사진 있는 글을 먼저 고르고, 모자라면 사진 없는 글로 채움.
// imageHeight: PC 150 · 모바일 110 (시안 크기)
const SHOW = 2

const cardStyle = { borderRadius: '20px', background: '#F2F3EE', overflow: 'hidden', display: 'flex', flexDirection: 'column' }
const textStyle = { fontSize: '14px', fontWeight: '700', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', overflowWrap: 'anywhere' }

function pickPosts(items) {
  const withImage = items.filter((p) => p.image_url)
  const withoutImage = items.filter((p) => !p.image_url)
  return [...withImage, ...withoutImage].slice(0, SHOW)
}

export default function HomeCommunityFeed({ imageHeight }) {
  const { data, loading, error } = useApi('/posts?limit=10')
  const posts = data ? pickPosts(data.items) : []
  const photoBox = { height: `${imageHeight}px`, background: 'linear-gradient(180deg, #E6F4FB, #EEF7E6)', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', overflow: 'hidden', isolation: 'isolate' }

  // 불러오는 중 · 오류 · 글 없음: 같은 크기의 회색 카드에 안내 한 줄
  if (loading || error || posts.length === 0) {
    const message = loading ? '자랑 글을 불러오는 중…' : error ? error.message : '아직 자랑 글이 없어요. 첫 글을 올려 보세요!'
    return (
      <Link to="/community" style={{ ...cardStyle, minHeight: `${imageHeight + 40}px`, alignItems: 'center', justifyContent: 'center', padding: '16px', fontSize: '14px', color: '#454B47', textAlign: 'center' }}>
        {message}
      </Link>
    )
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '12px' }}>
      {posts.map((post) => (
        <Link key={post.id} to="/community" style={cardStyle}>
          <span style={photoBox}>
            {post.image_url ? (
              <img src={post.image_url} alt={`${post.author.nickname}님이 올린 사진`} loading="lazy" decoding="async" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', zIndex: '-1' }} />
            ) : (
              <span style={{ fontSize: '13px', fontWeight: '700', color: '#1F5C3F' }}>{post.is_verification ? '실천 인증' : '자랑 글'}</span>
            )}
          </span>
          <span style={{ padding: '12px 14px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
            <span style={{ fontSize: '12px', color: '#454B47' }}>{post.author.nickname}</span>
            <span style={textStyle}>{post.content}</span>
            <span style={{ fontSize: '12px', color: '#C4552B', fontWeight: '700' }}>♥ {post.like_count}</span>
          </span>
        </Link>
      ))}
    </div>
  )
}
