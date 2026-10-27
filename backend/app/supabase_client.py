import httpx
from supabase import Client, ClientOptions, create_client

from app.config import SUPABASE_SECRET_KEY, SUPABASE_URL

# Supabase와 주고받을 통신선 (10/27 추가)
# 기본값은 HTTP/2 연결 하나를 모든 요청이 같이 쓰는데, Supabase가 쉬고 있던 그 연결을 끊으면
# 그 순간 들어온 요청이 한꺼번에 "httpx.RemoteProtocolError: Server disconnected"로 500이 났다
# (배포 서버 Render에서 /points·/me·/posts 등 GET이 동시에 실패, 헤더 잔액이 안 바뀜).
# → HTTP/1.1 연결 여러 개(연결 풀)로 바꿔서, 연결 하나가 끊겨도 다른 요청은 영향을 받지 않게 한다.
#   keepalive_expiry: 5초 넘게 쉰 연결은 다시 쓰지 않고 새로 연결 (끊긴 연결을 붙잡지 않게)
#   retries: 연결을 처음 맺다가 실패하면 한 번 더 시도
#   (transport 를 직접 만들면 Client 의 http2·limits 는 무시되므로 transport 안에 넣는다)
http_client = httpx.Client(
    timeout=httpx.Timeout(30.0),
    transport=httpx.HTTPTransport(
        http2=False,
        retries=1,
        limits=httpx.Limits(max_connections=20, max_keepalive_connections=10, keepalive_expiry=5.0),
    ),
    follow_redirects=True,
)

# secret 키로 연결한 창고 전화기
# secret 키는 RLS(본인만 보기 규칙)를 건너뛰므로 백엔드 안에서만 사용한다.
# 그래서 이 전화기로 조회할 때는 항상 "누구의 데이터인지"(user id)를 직접 지정해야 한다.
supabase: Client = create_client(
    SUPABASE_URL, SUPABASE_SECRET_KEY, options=ClientOptions(httpx_client=http_client)
)
