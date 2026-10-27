import { useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import Button from '../../components/Button' // 지원 님 공통 버튼
import Input from '../../components/Input' // 지원 님 공통 입력칸 (이름표 + 입력 + 안내/오류 문구)
import { supabase } from '../../lib/supabase' // Supabase 연결 통로
import AuthLayout from './AuthLayout' // 회원 화면 공용 틀 (PC 왼쪽 그림 + 오른쪽 내용)

// 서울 25개 자치구 (가나다순). 가입할 때 이 목록에서 고릅니다.
const SEOUL_GU = [
  '강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구',
  '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구',
  '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구',
]

// 닉네임 최대 글자 수 — 백엔드 PATCH /api/v1/me 와 같은 기준 (팀에서 바꾸면 함께 바꿉니다)
const MAX_NICKNAME = 20

// 추천인(친구 초대) 코드: 회원마다 DB가 만든 8자리 영문·숫자 (백엔드 POST /friends 는 8~12자를 받음)
const INVITE_CODE = /^[A-Za-z0-9]{8,12}$/

// 비밀번호 규칙 (10/27 강화) — Supabase 설정과 같은 기준
// Authentication → Sign In / Providers → Email:
//   Minimum password length = 10, Password requirements = "Lowercase, uppercase letters, digits and symbols"
// 실제로 막는 곳은 Supabase(서버)이고, 화면은 가입 버튼을 누르기 전에 미리 알려 주는 역할만 합니다.
// 규칙을 바꾸면 Supabase 설정과 이 표를 함께 바꿉니다.
const MIN_PASSWORD = 10
const PASSWORD_RULES = [
  { test: /[a-z]/, label: '영문 소문자' },
  { test: /[A-Z]/, label: '영문 대문자' },
  { test: /[0-9]/, label: '숫자' },
  { test: /[!@#$%^&*()_+\-=[\]{};':"|<>?,./`~]/, label: '특수문자' }, // Supabase가 특수문자로 세는 글자들
]
const PASSWORD_HINT = `${MIN_PASSWORD}자 이상, 영문 대·소문자·숫자·특수문자(!@#$ 등)를 모두 넣어 주세요`

// 비밀번호가 규칙에 맞지 않으면 무엇이 빠졌는지 알려 주는 문구, 맞으면 '' (빈 글자)
function checkPassword(password) {
  if (password.length < MIN_PASSWORD) return `비밀번호를 ${MIN_PASSWORD}자 이상 입력해 주세요.`
  const missing = PASSWORD_RULES.filter((rule) => !rule.test.test(password)).map((rule) => rule.label)
  if (missing.length > 0) return `${missing.join('·')}를 넣어 주세요.`
  return ''
}

// Supabase가 보낸 영어 오류를 사용자에게 보여 줄 한국어 문장으로 바꿉니다.
function toKoreanError(error) {
  if (error.code === 'user_already_exists') return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (error.code === 'weak_password') return `비밀번호가 너무 약해요. ${PASSWORD_HINT}.`
  if (error.code === 'email_address_invalid') return '사용할 수 없는 이메일 주소입니다.'
  if (error.status === 429) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.'
  return '가입하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

// 인증 메일의 [이메일 인증하기]를 누르면 돌아올 주소 (지금 열린 사이트의 홈)
// 링크를 누르면 인증과 함께 로그인까지 되므로 바로 홈으로 보냅니다.
// → 내 컴퓨터면 http://localhost:5173/, 배포 화면이면 https://repick-tau.vercel.app/
function confirmRedirectUrl() {
  return `${window.location.origin}/`
}

export default function SignupPage() {
  const navigate = useNavigate() // 다른 주소(화면)로 이동시키는 도구
  const [searchParams] = useSearchParams() // 주소 뒤 ?invite=코드 를 읽는 도구 (친구가 보낸 초대 링크)

  // 입력칸 6개의 값을 한 묶음으로 기억합니다.
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    region: '',
    inviteCode: searchParams.get('invite') || '', // 초대 링크로 왔으면 친구 코드를 미리 채워 둠
  })
  const [errors, setErrors] = useState({}) // 칸별 오류 문구 (예: { email: '이메일을 입력해 주세요.' })
  const [serverError, setServerError] = useState('') // Supabase가 거절했을 때 보여 줄 문구
  const [submitting, setSubmitting] = useState(false) // 가입 요청 중이면 true (버튼 두 번 누르기 방지)
  const [photoConsent, setPhotoConsent] = useState(false) // (필수) 사진 공개 동의 체크 여부 — 체크 안 하고 가입하면 안내가 나옵니다.
  const [sentEmail, setSentEmail] = useState('') // 인증 메일을 보낸 이메일 (값이 있으면 폼 대신 "인증 메일을 보냈어요" 안내)
  const [resendNote, setResendNote] = useState('') // [인증 메일 다시 보내기] 결과 문구
  const [resending, setResending] = useState(false) // 다시 보내는 중이면 true (버튼 두 번 누르기 방지)

  // 글자를 입력할 때마다: 그 칸의 값을 바꾸고, 그 칸에 떠 있던 오류 문구는 지웁니다.
  // 각 입력칸의 name 이 form 안의 이름(email, password …)과 같아서 함수 하나로 처리됩니다.
  function handleChange(e) {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  // Supabase에 보내기 전에 화면에서 먼저 검사합니다. 문제 있는 칸만 오류 문구를 담아 돌려줍니다.
  function validate() {
    const next = {}
    const email = form.email.trim()
    if (!email) next.email = '이메일을 입력해 주세요.'
    else if (!/^\S+@\S+\.\S+$/.test(email)) next.email = '이메일 형식이 올바르지 않아요.'

    // 비밀번호 규칙 (위 PASSWORD_RULES — Supabase 설정과 같은 기준)
    const passwordError = checkPassword(form.password)
    if (passwordError) next.password = passwordError
    if (form.passwordConfirm !== form.password) next.passwordConfirm = '비밀번호가 서로 달라요.'

    if (!form.nickname.trim()) next.nickname = '닉네임을 입력해 주세요.'
    if (!form.region) next.region = '자치구를 골라 주세요.'
    // 추천인 코드는 선택. 적었을 때만 모양을 확인합니다 (오타를 가입 전에 알려 주려고).
    const invite = form.inviteCode.trim()
    if (invite && !INVITE_CODE.test(invite)) next.inviteCode = '추천인 코드는 영문·숫자 8자리예요.'
    if (!photoConsent) next.photoConsent = '사진 공개에 동의해야 가입할 수 있어요.'
    return next
  }

  // "가입하기"를 눌렀을 때
  async function handleSubmit(e) {
    e.preventDefault() // 브라우저 기본 동작(페이지 새로고침)을 막습니다.
    setServerError('')

    const next = validate()
    setErrors(next)
    if (Object.keys(next).length > 0) return // 오류가 하나라도 있으면 여기서 멈춤

    setSubmitting(true)
    const email = form.email.trim()

    // 회원 정보에 같이 넣을 값.
    // nickname·region 은 DB 트리거(handle_new_user)가 profiles 테이블에 자동 저장합니다.
    // photo_consent 는 사진 공개 동의 기록입니다. 지금 트리거는 이 값을 profiles 에 옮기지 않아서
    // Supabase 회원 정보(auth.users 의 raw_user_meta_data)에만 남습니다.
    const metadata = { nickname: form.nickname.trim(), region: form.region, photo_consent: true }

    // 추천인 코드는 적었을 때만 회원 정보에 잠깐 넣어 둡니다 (공백 제거·대문자).
    // 친구 등록(POST /friends)은 로그인된 상태여야 해서, 가입 화면이 아니라 첫 로그인 때
    // lib/useInviteOnLogin.js 가 이 값을 보고 처리한 뒤 지웁니다.
    // → 이메일 인증을 켜서 가입 직후 로그인이 안 되는 경우에도 코드가 사라지지 않습니다.
    const invite = form.inviteCode.replace(/\s/g, '').toUpperCase()
    if (invite) metadata.invite_code = invite

    // Supabase Auth에 가입 요청.
    // 비밀번호는 Supabase가 안전하게 보관하고, 우리 코드·DB에는 남지 않습니다.
    const { data, error } = await supabase.auth.signUp({
      email,
      password: form.password,
      options: {
        data: metadata,
        emailRedirectTo: confirmRedirectUrl(), // 이메일 인증이 켜져 있을 때 메일 링크가 돌아올 곳
      },
    })
    setSubmitting(false)

    if (error) {
      console.error('가입 실패:', error) // 개발자 확인용 (F12 → Console)
      setServerError(toKoreanError(error))
      return
    }

    // Supabase "Confirm email"이 켜져 있으면 가입만 되고 로그인 정보(session)는 비어 있습니다.
    // → 메일의 링크를 눌러야 로그인할 수 있으므로, 폼 대신 "인증 메일을 보냈어요" 안내를 보여 줍니다.
    // (이미 가입된 이메일로 다시 가입해도 Supabase가 오류 없이 이렇게 답할 수 있어서 같은 안내가 나옵니다.)
    if (!data.session) {
      setSentEmail(email)
      return
    }

    // 이메일 인증이 꺼져 있으면(지금) 가입과 동시에 로그인됩니다 → 홈으로 이동.
    // replace 는 뒤로 가기를 눌러도 가입 화면으로 돌아오지 않게 합니다.
    navigate('/', { replace: true })
  }

  // [인증 메일 다시 보내기]: 같은 이메일로 인증 메일을 한 번 더 보냅니다.
  async function handleResend() {
    setResendNote('')
    setResending(true)
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: sentEmail,
      options: { emailRedirectTo: confirmRedirectUrl() },
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

  // 인증 메일을 보낸 뒤에는 가입 폼 대신 이 안내만 보여 줍니다.
  // 꾸밈은 아래 동의 체크칸처럼 auth.css 와 같은 색·글꼴 변수(var(--…))만 씁니다.
  if (sentEmail) {
    return (
      <AuthLayout>
        <div
          role="status"
          style={{
            padding: 'var(--space-4)',
            border: '1px solid var(--color-primary)',
            borderRadius: 12,
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-sub)',
            lineHeight: 1.6,
          }}
        >
          <h1 className="auth-title">📧 인증 메일을 보냈어요</h1>
          <p>
            <strong>{sentEmail}</strong>로 보낸 메일의 [이메일 인증하기]를 눌러 주세요. 메일이 안 보이면
            스팸함도 확인해 주세요.
          </p>
        </div>

        <div className="auth-form">
          {/* 다시 보내기 결과 문구 (성공·실패 모두 여기에) */}
          {resendNote && (
            <p className="field-note" role="alert">
              {resendNote}
            </p>
          )}
          <Button variant="ghost" size="lg" fullWidth onClick={handleResend} disabled={resending}>
            {resending ? '보내는 중…' : '인증 메일 다시 보내기'}
          </Button>
          <Button size="lg" fullWidth onClick={() => navigate('/login')}>
            로그인 화면으로
          </Button>
        </div>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h1 className="auth-title">이메일로 가입하기</h1>
      <p className="auth-sub">닉네임과 사는 지역을 알려 주세요.</p>

      {/* noValidate: 브라우저의 영어 경고창 대신 위 validate()의 한국어 문구를 보여 줍니다. */}
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
          hint={PASSWORD_HINT}
          autoComplete="new-password"
        />
        <Input
          label="비밀번호 확인"
          type="password"
          name="passwordConfirm"
          value={form.passwordConfirm}
          onChange={handleChange}
          error={errors.passwordConfirm}
          autoComplete="new-password"
        />
        <Input
          label="닉네임"
          name="nickname"
          value={form.nickname}
          onChange={handleChange}
          error={errors.nickname}
          maxLength={MAX_NICKNAME} // 20자 넘게는 입력되지 않습니다.
          hint={`최대 ${MAX_NICKNAME}자, 다른 회원에게 보여요`}
          autoComplete="nickname"
        />

        {/* 자치구 선택 목록 — 공통 Input은 글자 입력용이라, 같은 모양(field-*)으로 직접 만듭니다. */}
        <div className="field">
          <label htmlFor="signup-region" className="field-label">
            자치구
          </label>
          <select
            id="signup-region"
            name="region"
            value={form.region}
            onChange={handleChange}
            className={errors.region ? 'field-input field-input-error' : 'field-input'}
            aria-invalid={errors.region ? true : undefined}
          >
            <option value="" disabled>
              사는 구를 골라 주세요
            </option>
            {SEOUL_GU.map((gu) => (
              <option key={gu} value={gu}>
                {gu}
              </option>
            ))}
          </select>
          {errors.region && <p className="field-note field-note-error">{errors.region}</p>}
        </div>

        {/* (선택) 추천인 코드 — 친구 초대 링크(/signup?invite=코드)로 오면 미리 채워져 있습니다. */}
        <Input
          label="추천인 코드 (선택)"
          name="inviteCode"
          value={form.inviteCode}
          onChange={handleChange}
          error={errors.inviteCode}
          maxLength={12}
          hint="친구에게 받은 코드가 있으면 적어 주세요. 친구에게 물방울이 가요"
          autoComplete="off"
        />

        {/* (필수) 사진 공개 동의 — label 로 감싸서 글자를 눌러도 체크됩니다.
            꾸밈은 auth.css 와 같은 색·글꼴 변수(var(--…))만 씁니다. */}
        <label
          style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: 'var(--space-2)',
            marginTop: 'var(--space-4)',
            fontSize: 'var(--text-sm)',
            color: 'var(--color-text-sub)',
            cursor: 'pointer',
          }}
        >
          <input
            type="checkbox"
            checked={photoConsent}
            onChange={(e) => {
              setPhotoConsent(e.target.checked)
              setErrors((prev) => ({ ...prev, photoConsent: undefined })) // 체크하면 안내 지우기
            }}
            style={{ marginTop: 3, flexShrink: 0, accentColor: 'var(--color-primary)' }}
          />
          <span>(필수) 커뮤니티에 직접 올린 사진은 다른 회원에게 공개되는 것에 동의합니다</span>
        </label>
        {/* 동의하지 않고 "가입하기"를 누르면 빨간 안내 */}
        {errors.photoConsent && (
          <p className="field-note field-note-error" role="alert">
            {errors.photoConsent}
          </p>
        )}

        {/* Supabase가 거절했을 때만 보이는 안내 상자 */}
        {serverError && (
          <p className="auth-error" role="alert">
            {serverError}
          </p>
        )}

        {/* 버튼은 항상 진하게. 가입 요청 중일 때만 누를 수 없습니다. (동의 확인은 validate에서) */}
        <Button type="submit" size="lg" fullWidth disabled={submitting}>
          {submitting ? '가입하는 중…' : '가입하기'}
        </Button>
      </form>

      <p className="auth-links">
        이미 계정이 있나요?
        <Link to="/login">로그인</Link>
      </p>
    </AuthLayout>
  )
}
