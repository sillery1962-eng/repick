/**
 * 이용자 제보 저장소 연결 자리.
 * RePick 팀은 Supabase를 쓰기로 해서 Firebase는 연결하지 않습니다.
 * 지금은 null을 돌려줘서 제보 창이 "내용 복사해서 보내기" 방식으로 동작합니다.
 * 나중에 FastAPI 제보 API가 생기면 여기서 연결하세요.
 */
export function getDb() {
  return Promise.resolve(null);
}
