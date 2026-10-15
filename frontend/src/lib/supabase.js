import { createClient } from '@supabase/supabase-js'

// frontend/.env 에서 값을 읽습니다. (VITE_ 로 시작하는 이름만 화면 코드에서 읽을 수 있어요)
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY

// .env 가 없거나 값이 비어 있으면 원인을 바로 알 수 있게 알려 줍니다.
if (!supabaseUrl || !supabaseKey) {
  throw new Error(
    'frontend/.env 에 VITE_SUPABASE_URL 과 VITE_SUPABASE_PUBLISHABLE_KEY 를 넣고 npm run dev 를 다시 실행하세요.'
  )
}

// 앱 전체가 함께 쓰는 Supabase 연결 통로 (가입·로그인·로그아웃에 사용)
export const supabase = createClient(supabaseUrl, supabaseKey)
