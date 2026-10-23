// 친환경샵 쇼핑몰 목록 — 포인트 화면 친환경샵(features/eco-shop/EcoShop.jsx)과 홈 "친환경 기업 추천"이 같이 씀
// 서버·DB 없이 화면 안의 목록입니다. 외부 쇼핑몰 링크만, 포인트 차감·구매 기록 없음 (api-spec 8번)
// 쇼핑몰을 바꾸거나 늘리려면 이 배열만 고치면 돼요.
// 사진은 분위기만 맞춘 무료 사진(CC0, Wikimedia Commons) — 쇼핑몰의 실제 상품 사진이 아님
//   비누: Marseille soap bars (lemon verbena and lavender) / 가방: The recycle bag at the Kabilin Center 1
//   매장: Zero waste section in Gimsel, de Groene Passage 2024-12-03
// - frameWidth: PC 화면 폭이 고정된 쇼핑몰(좌우가 잘려 보임)만. 그 폭으로 띄운 뒤 팝업에 맞게 줄여 보여 줌
//   (동구밭 PC 사이트는 최소 폭 1280px, 폰에서는 모바일 사이트로 바뀌어 줄이지 않음)
export const ECO_SHOPS = [
  { name: '동구밭', tag: '고체 화장품 · 생활용품', desc: '장애인과 함께 만드는 친환경 고체 비누·샴푸', url: 'https://donggubat.co.kr/', frameWidth: 1280, image: '/design/eco-shop/soap-bars.jpg', alt: '초록·보라색 고체 비누 사진', bg: '#E8F3E4' },
  { name: '플립플롭', tag: '업사이클링', desc: '버려진 소재를 새 디자인 제품으로', url: 'https://flipflop.kr/', image: '/design/eco-shop/upcycled-bag.jpg', alt: '재활용 소재로 만든 가방 사진', bg: '#E6F0FB' },
  { name: '자연상점', tag: '제로웨이스트 · 공정무역', desc: '친환경 생활용품·비건·선물세트 전문몰', url: 'https://onlyeco.co.kr/', image: '/design/eco-shop/zero-waste-store.jpg', alt: '곡물을 덜어 사는 제로웨이스트 매장 사진', bg: '#FFF3D6' },
]
