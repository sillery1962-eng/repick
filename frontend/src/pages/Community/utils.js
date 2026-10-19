// 커뮤니티 화면 공용 값·함수 (화면 조각은 parts.jsx)

// 인스타그램은 연동하지 않고 이동 링크만 둡니다 (docs/api-spec.md 7번)
export const INSTAGRAM_URL = 'https://www.instagram.com/'

// 사진: 서버와 같은 규칙 (5MB, 이미지만)
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/heic'

// 사진 압축: 긴 쪽 최대 1600px, WEBP 품질 0.8 (폰 사진 3~5MB → 보통 수백 KB)
// AVIF는 Storage posts 보관함 허용 목록에 없고 브라우저 대부분이 만들지 못해서 WEBP를 씀
const COMPRESS_MAX_SIDE = 1600
const COMPRESS_QUALITY = 0.8

// 브라우저에서 사진을 줄여 WEBP 파일로 바꿈. 못 바꾸거나(HEIC 등) 오히려 커지면 원본 그대로 돌려줌
export async function compressImage(file) {
  if (file.type === 'image/heic') return file // 대부분 브라우저가 HEIC를 열지 못함
  let bitmap
  try {
    bitmap = await createImageBitmap(file) // 폰 사진의 회전 정보도 반영됨
  } catch {
    return file
  }
  const scale = Math.min(1, COMPRESS_MAX_SIDE / Math.max(bitmap.width, bitmap.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(bitmap.width * scale)
  canvas.height = Math.round(bitmap.height * scale)
  canvas.getContext('2d').drawImage(bitmap, 0, 0, canvas.width, canvas.height)
  bitmap.close()

  const blob = await new Promise((resolve) => canvas.toBlob(resolve, 'image/webp', COMPRESS_QUALITY))
  // WEBP를 못 만드는 옛 브라우저는 PNG를 줌 → 그때나 결과가 더 크면 원본 사용
  if (!blob || blob.type !== 'image/webp' || blob.size >= file.size) return file
  const name = file.name.replace(/\.[^.]+$/, '') + '.webp'
  return new File([blob], name, { type: 'image/webp' })
}

// 인증글 보상 글자 (docs/api-spec.md 5번: 💧1 + ⭐1)
export const VERIFY_LABEL = '실천 인증 💧1 ⭐1'

// "2시간 전" 같은 글자로 바꾸기
export function timeAgo(iso) {
  const diff = (Date.now() - new Date(iso).getTime()) / 1000
  if (diff < 60) return '방금 전'
  if (diff < 3600) return `${Math.floor(diff / 60)}분 전`
  if (diff < 86400) return `${Math.floor(diff / 3600)}시간 전`
  if (diff < 86400 * 2) return '어제'
  if (diff < 86400 * 7) return `${Math.floor(diff / 86400)}일 전`
  return new Date(iso).toLocaleDateString('ko-KR')
}

// 검은 둥근 버튼 (시안의 "등록")
export const darkButton = { height: '44px', padding: '0 14px', whiteSpace: 'nowrap', borderRadius: '14px', border: 'none', background: '#121614', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', fontFamily: 'inherit' }
