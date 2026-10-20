import { useEffect, useMemo, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { api } from '../../api/client'
import { Avatar, DropIcon } from './parts'
import { IMAGE_ACCEPT, MAX_IMAGE_BYTES, VERIFY_LABEL, compressImage, darkButton } from './utils'

// 글쓰기 상자 (시안의 "오늘의 실천을 자랑해 보세요" 칸). 로그인 안 했으면 로그인 안내만.
// 글·사진·인증 여부를 FormData로 POST /posts 에 보내고, 받은 글을 onCreated로 목록 맨 앞에 넣어요.
export default function PostComposer({ me, mobile = false, onCreated }) {
  const [content, setContent] = useState('')
  const [file, setFile] = useState(null)
  const [verify, setVerify] = useState(false)
  const [sending, setSending] = useState(false)
  const [compressing, setCompressing] = useState(false) // 사진 줄이는 중
  const [message, setMessage] = useState('')
  const fileInput = useRef(null)

  // 사진 미리보기 주소. 사진이 바뀌거나 화면을 떠나면 정리 (메모리 낭비 방지)
  const preview = useMemo(() => (file ? URL.createObjectURL(file) : null), [file])
  useEffect(() => () => preview && URL.revokeObjectURL(preview), [preview])

  const box = { background: '#FFFFFF', borderRadius: mobile ? '22px' : '28px', padding: mobile ? '20px' : '28px', boxSizing: 'border-box' }
  const pillInput = { flexGrow: '1', minWidth: '0', borderRadius: '14px', background: '#F7F8F4', padding: '12px 16px', fontSize: '14px', color: '#8B918C', boxSizing: 'border-box' }

  if (!me) {
    return (
      <div style={box}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <Avatar id="guest" bg="#CDEB45" />
          <Link to="/login" style={{ ...pillInput, height: '46px', padding: '0 16px', display: 'flex', alignItems: 'center' }}>
            로그인하고 오늘의 실천을 자랑해 보세요
          </Link>
        </div>
      </div>
    )
  }

  async function pickFile(e) {
    const picked = e.target.files?.[0]
    e.target.value = '' // 같은 사진을 다시 골라도 동작하게
    if (!picked) return
    if (!IMAGE_ACCEPT.split(',').includes(picked.type)) {
      alert('사진은 JPG·PNG·WEBP·HEIC 이미지만 올릴 수 있어요.')
      return
    }
    // 먼저 WEBP로 줄인 뒤 5MB를 검사 (큰 폰 사진도 줄이면 올릴 수 있음)
    setCompressing(true)
    const small = await compressImage(picked)
    setCompressing(false)
    if (small.size > MAX_IMAGE_BYTES) {
      alert('사진은 5MB 이하만 올릴 수 있어요.')
      return
    }
    setFile(small)
  }

  function clearFile() {
    setFile(null)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    const text = content.trim()
    if (!text) {
      alert('내용을 적어 주세요.')
      return
    }
    const form = new FormData()
    form.append('content', text)
    form.append('is_verification', verify ? 'true' : 'false')
    if (file) form.append('image', file)

    setSending(true)
    setMessage('')
    try {
      const post = await api.post('/posts', form)
      onCreated(post)
      setContent('')
      clearFile()
      setVerify(false)
      if (post.drops_awarded > 0 || post.points_awarded > 0) {
        setMessage(`인증 보상으로 💧${post.drops_awarded} ⭐${post.points_awarded}를 받았어요!`)
      } else {
        setMessage('글을 올렸어요.')
      }
    } catch (err) {
      alert(err.message)
    } finally {
      setSending(false)
    }
  }

  const chip = { height: '28px', padding: '0 10px', borderRadius: '999px', fontSize: '12px', fontWeight: '800', display: 'inline-flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontFamily: 'inherit' }

  return (
    <form onSubmit={handleSubmit} style={box}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <Avatar id={me} bg="#CDEB45" />
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          maxLength={1000}
          rows={2}
          placeholder="오늘의 실천을 자랑해 보세요"
          aria-label="글 내용"
          style={{ ...pillInput, color: '#121614', border: 'none', resize: 'vertical', minHeight: '46px', fontFamily: 'inherit', lineHeight: '1.5' }}
        />
      </div>

      {preview ? (
        <div style={{ marginTop: '12px', position: 'relative', width: '120px', height: '120px', borderRadius: '16px', overflow: 'hidden', background: '#DCE9E1' }}>
          <img src={preview} alt="올릴 사진 미리보기" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          <button type="button" onClick={clearFile} aria-label="사진 빼기" style={{ position: 'absolute', right: '6px', top: '6px', width: '26px', height: '26px', borderRadius: '50%', border: 'none', background: 'rgba(18,22,20,0.7)', color: '#FFFFFF', fontSize: '14px', cursor: 'pointer' }}>
            ✕
          </button>
        </div>
      ) : null}

      <div style={{ display: 'flex', gap: '8px', marginTop: '12px', flexWrap: 'wrap', alignItems: 'center' }}>
        <button
          type="button"
          onClick={() => setVerify((v) => !v)}
          aria-pressed={verify}
          style={{ ...chip, border: verify ? '1.5px solid #3E9BEA' : '1.5px solid transparent', background: verify ? '#3E9BEA' : '#E3F1FC', color: verify ? '#FFFFFF' : '#17507F' }}
        >
          <DropIcon color={verify ? '#FFFFFF' : '#3E9BEA'} />
          {VERIFY_LABEL}
        </button>
        <button type="button" onClick={() => fileInput.current?.click()} disabled={compressing} style={{ ...chip, border: 'none', background: '#F2F3EE', color: '#121614' }}>
          📷 {compressing ? '사진 줄이는 중…' : file ? '사진 바꾸기' : '사진 추가'}
        </button>
        <input ref={fileInput} type="file" accept={IMAGE_ACCEPT} onChange={pickFile} hidden />
        <span style={{ flexGrow: '1' }} />
        <button type="submit" disabled={sending || compressing} style={{ ...darkButton, height: '36px', opacity: sending || compressing ? 0.5 : 1 }}>
          {sending ? '올리는 중…' : '올리기'}
        </button>
      </div>
      {verify ? (
        <p style={{ margin: '8px 0 0', fontSize: '12px', color: '#6B716D' }}>환경 실천 인증글은 하루 5번까지 💧1 ⭐1을 받아요.</p>
      ) : null}
      {message ? (
        <p role="status" style={{ margin: '8px 0 0', fontSize: '13px', color: '#1F5C3F', fontWeight: '700' }}>
          {message}
        </p>
      ) : null}
    </form>
  )
}
