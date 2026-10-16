import { supabase } from '../lib/supabase' // 로그인 정보(토큰)를 꺼내는 Supabase 연결 통로

// 팀 공용 "API 부르기 도구" (담당: 백현숙)
// - FastAPI 주소 앞부분(/api/v1)을 대신 붙여 줍니다.
// - 로그인한 사람이면 토큰(Authorization: Bearer ...)을 자동으로 붙여 줍니다.
// - 서버가 거절하면 한국어 문구가 담긴 ApiError 를 던집니다.
//
// 사용 예:
//   import { api } from '../../api/client'
//   const me = await api.get('/me')                       // GET  /api/v1/me
//   await api.patch('/me', { nickname: '나나' })          // PATCH /api/v1/me
//   await api.post('/posts', formData)                     // 사진 같은 파일은 FormData 그대로

// frontend/.env 의 VITE_API_URL (없으면 내 컴퓨터의 FastAPI 기본 주소)
const BASE_URL = (import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/$/, '')

// 서버 오류를 담는 상자. 화면에서는 error.message 를 그대로 보여 주면 됩니다.
export class ApiError extends Error {
  constructor(message, status, detail) {
    super(message)
    this.name = 'ApiError'
    this.status = status // 401, 404, 500 … (서버에 아예 연결 못 하면 0)
    this.detail = detail // 서버가 보낸 원래 내용 (FastAPI 기본 모양 {"detail": ...})
  }
}

// 서버가 이유를 안 알려 줄 때 쓸 기본 문구
function defaultMessage(status) {
  if (status === 401) return '로그인이 필요해요. 다시 로그인해 주세요.'
  if (status === 403) return '이 기능을 쓸 권한이 없어요.'
  if (status === 404) return '찾는 정보가 없어요.'
  if (status === 409) return '이미 처리된 요청이에요.'
  if (status === 400 || status === 422) return '입력한 값을 확인해 주세요.'
  if (status >= 500) return '서버에 문제가 생겼어요. 잠시 후 다시 시도해 주세요.'
  return '요청을 처리하지 못했어요.'
}

// 실제로 서버에 요청을 보내는 함수 (아래 api.get / post / patch / delete 가 이걸 씁니다)
async function request(method, path, body) {
  // 1) 지금 로그인 정보에서 토큰 꺼내기 (로그아웃 상태면 토큰 없이 보냄)
  const { data: sessionData } = await supabase.auth.getSession()
  const token = sessionData.session?.access_token

  const headers = {}
  if (token) headers.Authorization = `Bearer ${token}`

  // 2) 보낼 내용 준비: 파일(FormData)은 그대로, 나머지는 JSON 글자로
  let payload
  if (body instanceof FormData) {
    payload = body // Content-Type 은 브라우저가 알아서 붙입니다.
  } else if (body !== undefined) {
    headers['Content-Type'] = 'application/json'
    payload = JSON.stringify(body)
  }

  // 3) 보내기
  let res
  try {
    res = await fetch(`${BASE_URL}${path}`, { method, headers, body: payload })
  } catch (err) {
    console.error('API 연결 실패:', method, path, err) // 개발자 확인용 (F12 → Console)
    throw new ApiError('서버에 연결하지 못했어요. 백엔드 서버(uvicorn)가 켜져 있는지 확인해 주세요.', 0)
  }

  // 4) 답 읽기 (내용이 없는 답도 있음)
  const text = await res.text()
  let data = null
  if (text) {
    try {
      data = JSON.parse(text)
    } catch {
      data = text
    }
  }

  // 5) 실패면 ApiError 던지기. FastAPI 가 보낸 "detail" 이 글자면 그 문구를 그대로 씁니다.
  if (!res.ok) {
    const detail = data && typeof data === 'object' ? data.detail : undefined
    const message = typeof detail === 'string' ? detail : defaultMessage(res.status)
    console.error('API 오류:', method, path, res.status, data)
    throw new ApiError(message, res.status, detail)
  }

  return data
}

// 팀원이 쓰는 4가지 (주소는 /api/v1 뒤 부분만 씁니다)
export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  patch: (path, body) => request('PATCH', path, body),
  delete: (path) => request('DELETE', path),
}
