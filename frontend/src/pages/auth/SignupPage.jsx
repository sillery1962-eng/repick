import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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

// Supabase가 보낸 영어 오류를 사용자에게 보여 줄 한국어 문장으로 바꿉니다.
function toKoreanError(error) {
  if (error.code === 'user_already_exists') return '이미 가입된 이메일입니다. 로그인해 주세요.'
  if (error.code === 'weak_password') return '비밀번호를 6자 이상으로 입력해 주세요.'
  if (error.code === 'email_address_invalid') return '사용할 수 없는 이메일 주소입니다.'
  if (error.status === 429) return '요청이 너무 많아요. 잠시 후 다시 시도해 주세요.'
  return '가입하지 못했어요. 잠시 후 다시 시도해 주세요.'
}

export default function SignupPage() {
  const navigate = useNavigate() // 다른 주소(화면)로 이동시키는 도구

  // 입력칸 5개의 값을 한 묶음으로 기억합니다.
  const [form, setForm] = useState({
    email: '',
    password: '',
    passwordConfirm: '',
    nickname: '',
    region: '',
  })
  const [errors, setErrors] = useState({}) // 칸별 오류 문구 (예: { email: '이메일을 입력해 주세요.' })
  const [serverError, setServerError] = useState('') // Supabase가 거절했을 때 보여 줄 문구
  const [submitting, setSubmitting] = useState(false) // 가입 요청 중이면 true (버튼 두 번 누르기 방지)

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

    // Supabase 기본 규칙: 비밀번호 6자 이상
    if (form.password.length < 6) next.password = '비밀번호를 6자 이상 입력해 주세요.'
    if (form.passwordConfirm !== form.password) next.passwordConfirm = '비밀번호가 서로 달라요.'

    if (!form.nickname.trim()) next.nickname = '닉네임을 입력해 주세요.'
    if (!form.region) next.region = '자치구를 골라 주세요.'
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
    // Supabase Auth에 가입 요청.
    // options.data 의 nickname·region 은 DB 트리거(handle_new_user)가 profiles 테이블에 자동 저장합니다.
    // 비밀번호는 Supabase가 안전하게 보관하고, 우리 코드·DB에는 남지 않습니다.
    const { data, error } = await supabase.auth.signUp({
      email: form.email.trim(),
      password: form.password,
      options: {
        data: { nickname: form.nickname.trim(), region: form.region },
      },
    })
    setSubmitting(false)

    if (error) {
      console.error('가입 실패:', error) // 개발자 확인용 (F12 → Console)
      setServerError(toKoreanError(error))
      return
    }

    // 이메일 인증을 꺼 두었으므로 가입과 동시에 로그인 정보(session)가 옵니다.
    // 혹시 Supabase 설정에서 이메일 인증이 켜져 있으면 session 이 비어 있습니다.
    if (!data.session) {
      setServerError('가입은 됐지만 자동 로그인이 되지 않았어요. 로그인해 주세요.')
      return
    }

    // 성공: 홈으로 이동. replace 는 뒤로 가기를 눌러도 가입 화면으로 돌아오지 않게 합니다.
    navigate('/', { replace: true })
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
          hint="6자 이상"
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

        {/* Supabase가 거절했을 때만 보이는 안내 상자 */}
        {serverError && (
          <p className="auth-error" role="alert">
            {serverError}
          </p>
        )}

        <Button type="submit" size="lg" fullWidth disabled={submitting}>
          {submitting ? '가입하는 중…' : '가입하기'}
        </Button>
      </form>

      {/* /login 화면은 다음 단계에서 만듭니다. 그 전에는 눌러도 홈으로 이동합니다. */}
      <p className="auth-links">
        이미 계정이 있나요?
        <Link to="/login">로그인</Link>
      </p>
    </AuthLayout>
  )
}
