import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import PostComments from './PostComments'
import { Avatar, DropIcon, InstagramIcon } from './parts'
import { INSTAGRAM_URL, VERIFY_LABEL, darkButton, timeAgo } from './utils'

// 글 전체 보기 팝업: 카드에서는 글이 2줄로 잘리니, 카드를 누르면 사진과 글 전문을 보여 줌
// 닫기: ✕ 버튼 · 바깥 어두운 곳 누르기 · Esc 키
function PostPopup({ post, onClose }) {
  const closeRef = useRef(null)
  useEffect(() => {
    closeRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: '0', zIndex: '1000', background: 'rgba(18, 22, 20, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label={`${post.author.nickname}님의 글`}
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '520px', maxHeight: '88vh', overflowY: 'auto', background: '#FFFFFF', borderRadius: '24px', padding: '20px', boxSizing: 'border-box', color: '#121614', fontFamily: 'var(--font-base)', display: 'flex', flexDirection: 'column', gap: '14px' }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Avatar id={post.author.id} />
          <span style={{ flexGrow: '1', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '0' }}>
            <span style={{ fontSize: '15px', fontWeight: '800' }}>{post.author.nickname}</span>
            <span style={{ fontSize: '12px', color: '#6B716D' }}>
              {post.is_verification ? '실천 인증 · ' : ''}
              {timeAgo(post.created_at)}
            </span>
          </span>
          <button ref={closeRef} type="button" onClick={onClose} aria-label="닫기" style={{ width: '36px', height: '36px', borderRadius: '50%', border: 'none', background: '#F2F3EE', fontSize: '16px', cursor: 'pointer', flexShrink: '0' }}>
            ✕
          </button>
        </div>
        {post.image_url ? (
          <img src={post.image_url} alt={`${post.author.nickname}님이 올린 사진`} style={{ width: '100%', maxHeight: '60vh', objectFit: 'contain', borderRadius: '18px', background: '#F2F3EE' }} />
        ) : null}
        <div style={{ fontSize: '16px', lineHeight: '1.6', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}>{post.content}</div>
      </div>
    </div>,
    document.body,
  )
}

// 글 카드 1개 (시안의 article 모양 그대로). mobile이면 모바일 시안의 크기·여백.
// post: GET /posts 의 글 객체 / me: 로그인한 회원 id (없으면 null)
export default function PostCard({ post, me, mobile = false, onChange, onDelete }) {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false) // 댓글 펼침
  const [busy, setBusy] = useState(false)
  const [editing, setEditing] = useState(false) // 글 고치는 중
  const [draft, setDraft] = useState('')
  const [saving, setSaving] = useState(false)
  const [viewing, setViewing] = useState(false) // 글 전체 보기 팝업
  const mine = me !== null && post.author.id === me

  async function handleLike() {
    if (!me) {
      navigate('/login')
      return
    }
    setBusy(true)
    try {
      const res = await api.post(`/posts/${post.id}/like`)
      onChange(post.id, { liked_by_me: res.liked, like_count: res.like_count })
    } catch (err) {
      alert(err.message)
    } finally {
      setBusy(false)
    }
  }

  async function handleDelete() {
    if (!window.confirm('이 글을 지울까요? 댓글과 사진도 함께 지워져요.')) return
    try {
      await api.delete(`/posts/${post.id}`)
      onDelete(post.id)
    } catch (err) {
      alert(err.message)
    }
  }

  function startEdit() {
    setDraft(post.content)
    setEditing(true)
  }

  // 글 내용만 고침 (사진·인증 여부는 그대로 — 서버 PATCH /posts/{id})
  async function handleSave() {
    const content = draft.trim()
    if (!content) {
      alert('내용을 적어 주세요.')
      return
    }
    setSaving(true)
    try {
      const updated = await api.patch(`/posts/${post.id}`, { content })
      onChange(post.id, { content: updated.content })
      setEditing(false)
    } catch (err) {
      alert(err.message)
    } finally {
      setSaving(false)
    }
  }

  // 카드를 누르면 팝업. 버튼·링크·입력 칸·댓글 영역을 누른 건 원래 동작만 (수정 중에는 열지 않음)
  function handleCardClick(e) {
    if (editing || e.target.closest('button, a, input, textarea, form, [data-no-popup]')) return
    setViewing(true)
  }

  const textButton = { border: 'none', background: 'none', padding: '4px', fontSize: '13px', fontWeight: '700', color: '#8B918C', cursor: 'pointer', fontFamily: 'inherit' }
  const pill = mobile ? '0 14px' : '0 10px'
  const likeColor = post.liked_by_me ? '#C4552B' : '#121614'

  return (
    <article onClick={handleCardClick} style={{ background: '#FFFFFF', borderRadius: mobile ? '22px' : '24px', padding: mobile ? '20px' : '14px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column', minWidth: '0', cursor: editing ? 'auto' : 'pointer' }}>
      {/* 작성자 · 종류 · 시간 */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Avatar id={post.author.id} />
        <span style={{ flexGrow: '1', display: 'flex', flexDirection: 'column', gap: '2px', minWidth: '0' }}>
          <span style={{ fontSize: '15px', fontWeight: '800' }}>{post.author.nickname}</span>
          <span style={{ fontSize: '12px', color: '#6B716D' }}>
            {post.is_verification ? '실천 인증 · ' : ''}
            {timeAgo(post.created_at)}
          </span>
        </span>
        {mine && !editing ? (
          <span style={{ display: 'flex', flexShrink: '0' }}>
            <button type="button" onClick={startEdit} style={textButton}>
              수정
            </button>
            <button type="button" onClick={handleDelete} style={textButton}>
              삭제
            </button>
          </span>
        ) : null}
      </div>

      {/* 사진 (있을 때만) */}
      {post.image_url ? (
        <div style={{ marginTop: '14px', height: mobile ? '240px' : '220px', borderRadius: '22px', background: '#DCE9E1', position: 'relative', overflow: 'hidden', isolation: 'isolate' }}>
          <img src={post.image_url} alt={`${post.author.nickname}님이 올린 사진`} loading="lazy" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', zIndex: '-1' }} />
          {post.is_verification ? (
            <span style={{ position: 'absolute', left: '14px', top: '14px', height: '28px', padding: '0 10px', borderRadius: '999px', background: '#3E9BEA', color: '#FFFFFF', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <DropIcon color="#FFFFFF" />
              {VERIFY_LABEL}
            </span>
          ) : null}
        </div>
      ) : null}

      {/* 글 — PC는 시안처럼 2줄 높이로 맞춰 카드 높이를 같게 (댓글을 펼치면 전체 글이 보임). 수정 중이면 입력 칸 */}
      {editing ? (
        <div style={{ marginTop: '14px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            rows={3}
            aria-label="글 내용 수정"
            style={{ borderRadius: '14px', border: 'none', background: '#F7F8F4', padding: '12px 14px', fontSize: '15px', lineHeight: '1.5', color: '#121614', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
            <button type="button" onClick={() => setEditing(false)} disabled={saving} style={{ ...darkButton, height: '36px', background: '#F2F3EE', color: '#121614' }}>
              취소
            </button>
            <button type="button" onClick={handleSave} disabled={saving || !draft.trim()} style={{ ...darkButton, height: '36px', opacity: saving || !draft.trim() ? 0.5 : 1 }}>
              {saving ? '저장 중…' : '저장'}
            </button>
          </div>
        </div>
      ) : (
        <div
          role="button"
          tabIndex={0}
          aria-label="글 전체 보기"
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ') {
              e.preventDefault()
              setViewing(true)
            }
          }}
          style={{
            fontSize: '16px',
            lineHeight: '1.55',
            marginTop: '14px',
            whiteSpace: 'pre-wrap',
            overflowWrap: 'anywhere',
            ...(mobile || open ? {} : { display: '-webkit-box', WebkitLineClamp: '2', WebkitBoxOrient: 'vertical', overflow: 'hidden', minHeight: '3.1em' }),
          }}
        >
          {post.content}
        </div>
      )}

      {/* 좋아요 · 댓글 수 · 인스타그램 */}
      <div style={{ display: 'flex', gap: '8px', marginTop: mobile ? '14px' : 'auto', paddingTop: mobile ? '0' : '14px' }}>
        <button
          type="button"
          onClick={handleLike}
          disabled={busy}
          aria-pressed={post.liked_by_me}
          aria-label={post.liked_by_me ? '좋아요 취소' : '좋아요'}
          style={{ height: '38px', padding: pill, whiteSpace: 'nowrap', borderRadius: '999px', border: '1.5px solid #ECEDE8', background: '#FFFFFF', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700', color: likeColor, cursor: 'pointer', fontFamily: 'inherit' }}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill={post.liked_by_me ? '#E2483D' : 'none'} stroke="#E2483D" strokeWidth="2" aria-hidden="true">
            <path d="M12 20.5l-7.6-7.4A5 5 0 0 1 12 6.4a5 5 0 0 1 7.6 6.7z" />
          </svg>
          {post.like_count}
        </button>
        <span style={{ height: '38px', padding: pill, whiteSpace: 'nowrap', borderRadius: '999px', border: '1.5px solid #ECEDE8', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '14px', fontWeight: '700' }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#121614" strokeWidth="2" aria-hidden="true">
            <path d="M4 4h16v12H9l-5 4z" />
          </svg>
          {post.comment_count}
        </span>
        <span style={{ flexGrow: '1' }} />
        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" style={{ height: '38px', padding: mobile ? '0 12px' : '0 10px', whiteSpace: 'nowrap', borderRadius: '999px', background: '#FCEEF5', color: '#C13584', display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', fontWeight: '700' }}>
          <InstagramIcon />
          공유
        </a>
      </div>

      {/* 댓글 펼치기 */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        style={{ marginTop: '10px', width: '100%', height: '38px', borderRadius: '12px', border: 'none', background: '#F7F8F4', fontSize: '13px', fontWeight: '700', color: '#454B47', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'inherit' }}
      >
        {open ? '댓글 접기 ⌃' : post.comment_count > 0 ? `댓글 ${post.comment_count}개 보기 ⌄` : '댓글 달기 ⌄'}
      </button>
      {open ? (
        <div data-no-popup>
          <PostComments postId={post.id} loggedIn={me !== null} onAdded={() => onChange(post.id, { comment_count: post.comment_count + 1 })} />
        </div>
      ) : null}
      {viewing ? <PostPopup post={post} onClose={() => setViewing(false)} /> : null}
    </article>
  )
}
