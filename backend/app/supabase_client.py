from supabase import Client, create_client

from app.config import SUPABASE_SECRET_KEY, SUPABASE_URL

# secret 키로 연결한 창고 전화기
# secret 키는 RLS(본인만 보기 규칙)를 건너뛰므로 백엔드 안에서만 사용한다.
# 그래서 이 전화기로 조회할 때는 항상 "누구의 데이터인지"(user id)를 직접 지정해야 한다.
supabase: Client = create_client(SUPABASE_URL, SUPABASE_SECRET_KEY)
