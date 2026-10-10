import os

from dotenv import load_dotenv

# backend/.env 파일의 값을 읽어 온다
load_dotenv()

SUPABASE_URL = os.getenv("SUPABASE_URL", "")
SUPABASE_SECRET_KEY = os.getenv("SUPABASE_SECRET_KEY", "")
FRONTEND_ORIGIN = os.getenv("FRONTEND_ORIGIN", "http://localhost:5173")

# 필수 값이 비어 있으면 서버를 켤 때 바로 알려 준다
if not SUPABASE_URL or not SUPABASE_SECRET_KEY:
    raise RuntimeError("backend/.env에 SUPABASE_URL과 SUPABASE_SECRET_KEY를 채워 주세요.")
