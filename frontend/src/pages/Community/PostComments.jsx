import { useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'
import { Avatar } from './parts'
import { darkButton, timeAgo } from './utils'

// 글 하나의 댓글·답글 (펼쳤을 때만 불러옴). 답글은 parent_id로 원래 댓글 아래에 붙여요.
// 모양은 시안의 댓글 영역 그대로. loggedIn이 아니면 입력 칸 대신 로그인 안내.
export default function PostComments({ postId, loggedIn, onAdded }) {
  const { data, error, loading, reload } = useApi(`/posts/${postId}/comments`)
  const [text, setText] = useState('')
  const [replyTo, setReplyTo] = useState(null) // 답글 달 댓글 {id, nickname}
  const [sending, setSending] = useState(false)

  const comments = data?.items ?? []
  const roots = comments.filter((c) => c.parent_id === null)
  const repliesOf = (id) => comments.filter((c) => c.parent_id === id)

  async function handleSubmit(e) {
    e.preventDefault()
    const content = text.trim()
    if (!content) return
    setSending(true)
    try {
      await api.post(`/posts/${postId}/comments`, { content, parent_id: replyTo?.id ?? null })
      setText('')
      setReplyTo(null)
      reload()
      onAdded()
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  function renderComment(c, isReply) {
    return (
      <div key={c.id} style={{ display: 'flex', gap: '10px', marginLeft: isReply ? '42px' : '0' }}>
        {isReply ? (
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#B9BDB8" strokeWidth="2" strokeLinecap="round" aria-hidden="true" style={{ flexShrink: '0' }}>
            <path d="M5 4v8a4 4 0 0 0 4 4h10" />
          </svg>
        ) : null}
        <Avatar id={c.author.id} size={isReply ? 28 : 32} />
        <span style={{ display: 'flex', flexDirection: 'column', gap: '4px', minWidth: '0' }}>
          <span style={{ fontSize: '14px', overflowWrap: 'anywhere' }}>
            <b>{c.author.nickname}</b> {c.content}
          </span>
          <span style={{ fontSize: '12px', color: '#6B716D' }}>
            {timeAgo(c.created_at)}
            {loggedIn ? (
              <>
                {' · '}
                <button
                  type="button"
                  onClick={() => setReplyTo({ id: c.parent_id ?? c.id, nickname: c.author.nickname })}
                  style={{ border: 'none', background: 'none', padding: '0', font: 'inherit', color: 'inherit', cursor: 'pointer' }}
                >
                  답글 달기
                </button>
              </>
            ) : null}
          </span>
        </span>
      </div>
    )
  }

  return (
    <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F0F1EC', display: 'flex', flexDirection: 'column', gap: '12px' }}>
      {loading ? <span style={{ fontSize: '13px', color: '#6B716D' }}>댓글을 불러오는 중…</span> : null}
      {error ? <span style={{ fontSize: '13px', color: '#C4552B' }}>{error.message}</span> : null}
      {!loading && !error && comments.length === 0 ? (
        <span style={{ fontSize: '13px', color: '#6B716D' }}>첫 댓글을 남겨 보세요.</span>
      ) : null}

      {roots.map((root) => (
        <div key={root.id} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {renderComment(root, false)}
          {repliesOf(root.id).map((reply) => renderComment(reply, true))}
        </div>
      ))}

      {loggedIn ? (
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {replyTo ? (
            <span style={{ fontSize: '12px', color: '#454B47', display: 'flex', gap: '6px', alignItems: 'center' }}>
              <b>{replyTo.nickname}</b>님에게 답글
              <button type="button" onClick={() => setReplyTo(null)} style={{ border: 'none', background: 'none', padding: '0', font: 'inherit', color: '#8B918C', cursor: 'pointer' }}>
                취소
              </button>
            </span>
          ) : null}
          <div style={{ display: 'flex', gap: '8px' }}>
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              maxLength={500}
              placeholder={replyTo ? '답글을 남겨보세요' : '댓글을 남겨보세요'}
              aria-label="댓글 내용"
              style={{ flexGrow: '1', minWidth: '0', height: '44px', borderRadius: '14px', border: 'none', background: '#F7F8F4', padding: '0 14px', fontSize: '14px', color: '#121614', fontFamily: 'inherit', boxSizing: 'border-box' }}
            />
            <button type="submit" disabled={sending || !text.trim()} style={{ ...darkButton, opacity: sending || !text.trim() ? 0.5 : 1 }}>
              등록
            </button>
          </div>
        </form>
      ) : (
        <Link to="/login" style={{ height: '44px', borderRadius: '14px', background: '#F7F8F4', padding: '0 14px', display: 'flex', alignItems: 'center', fontSize: '14px', color: '#8B918C' }}>
          로그인하고 댓글을 남겨보세요
        </Link>
      )}
    </div>
  )
}
