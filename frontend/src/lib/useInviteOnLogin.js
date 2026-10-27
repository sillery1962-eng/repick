import { useEffect, useRef } from 'react'
import { api } from '../api/client' // FastAPI 부르기 도구 (토큰 자동)
import { supabase } from './supabase' // Supabase 연결 통로

// 첫 로그인 때 추천인 코드 처리 (AuthContext.jsx 의 AuthProvider 안에서 한 번 부릅니다)
//
// 가입 화면(SignupPage.jsx)은 추천인 코드를 회원 정보(user_metadata.invite_code)에 넣어 두기만 합니다.
// 친구 등록 POST /friends 는 로그인된 상태여야 해서, 로그인 상태가 되면 여기서 처리합니다.
// - 이메일 인증 OFF(지금): 가입하자마자 로그인 → 바로 처리
// - 이메일 인증 ON(나중): 메일 인증 후 첫 로그인 때 처리
//
// 결과별로:
// - 성공 → 코드를 지우고 "추천인 ○○님이 등록됐어요" 알림
// - 400(내 코드)·404(없는 코드)·409(이미 등록)·422(코드 모양이 틀림) → 다시 해도 안 되므로 똑같이 지우고 이유 알림
// - 그 밖(서버 꺼짐 0, 401, 500 등) → 지우지 않음 → 다음 로그인 때 다시 시도 (알림 없이 console.warn 만)

// 다시 시도해도 결과가 같은 오류 (코드를 지워도 되는 경우)
const GIVE_UP_STATUS = [400, 404, 409, 422]

// 회원 정보에서 추천인 코드를 지웁니다 (다음 로그인 때 또 부르지 않게).
async function clearInviteCode() {
  const { error } = await supabase.auth.updateUser({ data: { invite_code: null } })
  if (error) console.warn('추천인 코드 지우기 실패:', error) // 지우지 못하면 다음 로그인 때 다시 시도 → 409로 지워짐
}

async function registerInvite(inviteCode) {
  try {
    const res = await api.post('/friends', { invite_code: inviteCode })
    await clearInviteCode()
    window.alert(`추천인 ${res.referrer_nickname}님이 등록됐어요`)
  } catch (err) {
    if (GIVE_UP_STATUS.includes(err.status)) {
      await clearInviteCode()
      window.alert(`추천인 코드는 등록하지 못했어요 (${err.message})`)
      return
    }
    console.warn('추천인 코드 등록 보류 — 다음 로그인 때 다시 시도:', err)
  }
}

export function useInviteOnLogin(user) {
  // 이 화면(탭)에서 이미 처리한 회원 id. 같은 회원으로 두 번 부르지 않게 막습니다.
  // (React StrictMode 는 개발 중 effect 를 두 번 돌리는데, ref 는 그대로 남아서 두 번째는 건너뜀)
  const handledRef = useRef(null)

  const userId = user?.id
  const inviteCode = user?.user_metadata?.invite_code

  // onAuthStateChange 콜백 안에서 await 로 supabase 함수를 부르면 멈출 수 있어서,
  // 콜백이 아니라 "로그인한 회원이 바뀔 때" 도는 이 effect 에서 처리합니다.
  useEffect(() => {
    if (!userId) {
      handledRef.current = null // 로그아웃하면 초기화 → 다시 로그인하면 한 번 더 시도
      return
    }
    if (!inviteCode || handledRef.current === userId) return
    handledRef.current = userId
    registerInvite(inviteCode)
  }, [userId, inviteCode])
}
