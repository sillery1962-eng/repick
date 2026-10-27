import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import Button from '../../components/Button' // 지원 님 공통 버튼
import Input from '../../components/Input' // 지원 님 공통 입력칸
import { supabase } from '../../lib/supabase' // Supabase 연결 통로
import { useAuth } from '../../lib/AuthContext' // 로그인 상태 게시판 읽기
import { useApi } from '../../api/useApi' // 팀 공용 API 도우미 (토큰 자동)
import AuthLayout from './AuthLayout' // 회원 화면 공용 틀

// 이메일 인증(Supabase "Confirm email")을 아직 안 한 회원이 로그인하면 오는 오류인지
// (code 가 없는 옛 응답도 있어서 영어 메시지 "Email not confirmed"도 같이 봅니다)
function isEmailNotConfirmed(error) {
  return error.code === 'email_not_confirmed' || /email not confirmed/i.test(error.message || '')
}

// Supabase가 보낸 영어 오류를 한국어 문장으로 바꿉니다.
function toKoreanError(error) {
  // 이메일·비밀번호 중 무엇이 틀렸는지는 일부러 알려 주지 않습니다.
  // (알려 주면 다른 사람이 "이 이메일이 가입돼 있는지"를 알아낼 수 있어서)
  if (error.code === 'invalid_credentials') return '이메일 또는 비밀번호가 맞지 않아요.'
  if (isEmailNotConfirmed(error))
    return '이메일 인증이 아직 안 됐어요. 메일함(스팸함 포함)에서 인증 메일을 확인해 주세요.'
  if (error.status === 429) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.'
  return '로그인하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

export default function LoginPage() {
  const navigate = useNavigate() // 다른 주소(화면)로 이동시키는 도구
  // 문지기(RequireAuth)가 보내 준 "원래 가려던 주소". 없으면 홈('/')
  const from = useLocation().state?.from || '/'

  const { user, loading } = useAuth() // 지금 로그인한 회원(없으면 null), 확인 중인지

  // 로그인한 경우에만 FastAPI의 GET /api/v1/me 로 DB의 내 정보(닉네임·자치구)를 받아 옵니다.
  // (팀원용 예시: 다른 화면도 이렇게 useApi('/주소') 한 줄로 진짜 값을 가져오면 됩니다.)
  const me = useApi('/me', { skip: !user })

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState({}) // 칸별 오류 문구
  const [serverError, setServerError] = useState('') // Supabase가 거절했을 때 보여 줄 문구
  const [submitting, setSubmitting] = useState(false) // 요청 중이면 true (버튼 두 번 누르기 방지)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState('') // 인증 안 된 이메일 (값이 있으면 [인증 메일 다시 보내기] 버튼이 보임)
  const [resendNote, setResendNote] = useState('') // 다시 보내기 결과 문구
  const [resending, setResending] = useState(false) // 다시 보내는 중이면 true

  // 글자를 입력할 때마다 그 칸의 값을 바꾸고, 그 칸의 오류 문구는 지웁니다.
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // "로그인"을 눌렀을 때
  async function handleSubmit(e) {
    e.preventDefault() // 브라우저 기본 동작(페이지 새로고침)을 막습니다.
    setServerError('')
    setUnconfirmedEmail('')
    setResendNote('')

    // 빈칸만 먼저 검사합니다. (맞는지 틀린지는 Supabase가 판단)
    const next = {}
    if (!form.email.trim()) next.email = '이메일을 입력해 주세요.'
    if (!form.password) next.password = '비밀번호를 입력해 주세요.'
    setErrors(next)
    if (Object.keys(next).length > 0) return

    setSubmitting(true)
    // Supabase Auth에 로그인 요청. 성공하면 로그인 정보가 브라우저에 저장되고,
    // AuthContext 게시판이 자동으로 "로그인됨"으로 바뀝니다.
    const { error } = await supabase.auth.signInWithPassword({
      email: form.email.trim(),
      password: form.password,
    })
    setSubmitting(false)

    if (error) {
      console.error('로그인 실패:', error) // 개발자 확인용 (F12 → Console)
      setServerError(toKoreanError(error))
      // 인증 메일을 아직 안 눌렀으면 [인증 메일 다시 보내기] 버튼을 보여 줍니다.
      if (isEmailNotConfirmed(error)) setUnconfirmedEmail(form.email.trim())
      return
    }

    // 성공: 원래 가려던 페이지(없으면 홈)로 이동. replace 는 뒤로 가기로 로그인 화면에 돌아오지 않게 합니다.
    navigate(from, { replace: true })
  }

  // [인증 메일 다시 보내기]: 가입 화면(SignupPage.jsx)과 같은 방식으로 인증 메일을 한 번 더 보냅니다.
  // 메일의 링크를 누르면 이 로그인 화면으로 돌아옵니다.
  async function handleResend() {
    setResendNote('')
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: unconfirmedEmail,
      options: { emailRedirectTo: `${window.location.origin}/login` },
    })
    setResending(false)

    if (error) {
      console.error('인증 메일 다시 보내기 실패:', error) // 개발자 확인용
      // Supabase는 같은 주소로 메일을 너무 자주 보내면 잠시 막습니다 (429).
      setResendNote(
        error.status === 429
          ? '너무 자주 눌렀어요. Supabase가 잠시 메일 보내기를 막아요. 1분쯤 뒤에 다시 눌러 주세요.'
          : '메일을 다시 보내지 못했어요. 잠시 후 다시 시도해 주세요. (너무 자주 누르면 Supabase가 잠시 막아요)'
      )
      return
    }
    setResendNote('다시 보냈어요. 메일함(스팸함 포함)을 확인해 주세요.')
  }

  // 로그아웃: Supabase가 브라우저에 저장된 로그인 정보를 지웁니다.
  // 게시판이 "로그아웃됨"으로 바뀌면서 이 화면이 자동으로 로그인 폼으로 바뀝니다.
  // ※ 임시 위치입니다. 마이페이지 "로그아웃" 연결은 팀 회의 후 정합니다.
  async function handleLogout() {
    const { error } = await supabase.auth.signOut()
    if (error) console.error('로그아웃 실패:', error)
  }

  // 1) 처음 켤 때 로그인 여부를 확인하는 아주 짧은 순간 — 아무것도 그리지 않습니다.
  if (loading) return <AuthLayout />

  // 2) 이미 로그인한 상태로 이 화면에 왔을 때 — 로그인 폼 대신 안내 + 로그아웃 버튼
  if (user) {
    // DB(profiles)의 닉네임을 먼저 쓰고, 아직 못 받아 왔으면 가입 때 보낸 값 → 이메일 순서로 표시
    const name = me.data?.nickname || user.user_metadata?.nickname || user.email
    return (
      <AuthLayout>
        <h1 className="auth-title">이미 로그인돼 있어요</h1>
        <p className="auth-sub">
          {name}님({user.email})으로 로그인 중이에요.
          {me.data?.region && ` · ${me.data.region}`}
        </p>
        {/* 서버(FastAPI)가 꺼져 있거나 오류면 안내 (로그아웃은 그대로 됩니다) */}
        {me.error && (
          <p className="auth-error" role="alert">
            {me.error.message}
          </p>
        )}
        <div className="auth-form">
          <Button size="lg" fullWidth onClick={() => navigate('/')}>
            홈으로
          </Button>
          <Button variant="ghost" size="lg" fullWidth onClick={handleLogout}>
            로그아웃
          </Button>
        </div>
      </AuthLayout>
    )
  }

  // 3) 로그인하지 않은 상태 — 로그인 폼
  return (
    <AuthLayout>
      <h1 className="auth-title">로그인</h1>
      <p className="auth-sub">가입한 이메일과 비밀번호를 입력해 주세요.</p>

      {/* noValidate: 브라우저의 영어 경고창 대신 한국어 문구를 보여 줍니다. */}
      <form className="auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="이메일"
          type="email"
          name="email"
          value={form.email}
          onChange={handleChange}
          error={errors.email}
          placeholder="example@email.com"
          autoComplete="email"
        />
        <Input
          label="비밀번호"
          type="password"
          name="password"
          value={form.password}
          onChange={handleChange}
          error={errors.password}
          autoComplete="current-password"
        />

        {/* Supabase가 거절했을 때만 보이는 안내 상자 */}
        {serverError && (
          <p className="auth-error" role="alert">
            {serverError}
          </p>
        )}

        {/* 이메일 인증이 안 된 회원일 때만: 인증 메일 다시 보내기 (type="button" → 로그인 제출이 아님) */}
        {unconfirmedEmail && (
          <>
            {resendNote && (
              <p className="field-note" role="alert">
                {resendNote}
              </p>
            )}
            <Button type="button" variant="ghost" size="lg" fullWidth onClick={handleResend} disabled={resending}>
              {resending ? '보내는 중…' : '인증 메일 다시 보내기'}
            </Button>
          </>
        )}

        <Button type="submit" size="lg" fullWidth disabled={submitting}>
          {submitting ? '로그인하는 중…' : '로그인'}
        </Button>
      </form>

      <p className="auth-links">
        아직 회원이 아니신가요?
        <Link to="/signup">가입하기</Link>
      </p>
    </AuthLayout>
  )
}
