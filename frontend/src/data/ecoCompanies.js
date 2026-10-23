// 친환경샵 쇼핑몰 목록 — 포인트 화면 친환경샵(features/eco-shop/EcoShop.jsx)과 홈 "친환경 기업 추천"이 같이 씀
// 서버·DB 없이 화면 안의 목록입니다. 외부 쇼핑몰 링크만, 포인트 차감·구매 기록 없음 (api-spec 8번)
// 쇼핑몰을 바꾸거나 늘리려면 이 배열만 고치면 돼요. 사진은 시안 예시 사진.
// - frameWidth: PC 화면 폭이 고정된 쇼핑몰(좌우가 잘려 보임)만. 그 폭으로 띄운 뒤 팝업에 맞게 줄여 보여 줌
//   (동구밭 PC 사이트는 최소 폭 1280px, 폰에서는 모바일 사이트로 바뀌어 줄이지 않음)
export const ECO_SHOPS = [
  { name: '동구밭', tag: '고체 화장품 · 생활용품', desc: '장애인과 함께 만드는 친환경 고체 비누·샴푸', url: 'https://donggubat.co.kr/', frameWidth: 1280, image: '/design/3751b0f61bc5806919065836a8b923f2.jpg', alt: '바구니에 담긴 채소 사진', bg: '#E8F3E4' },
  { name: '플립플롭', tag: '업사이클링', desc: '버려진 소재를 새 디자인 제품으로', url: 'https://flipflop.kr/', image: '/design/4fd29259087713176c80dcc3fb3c4e43.jpg', alt: '초록 텀블러 사진', bg: '#E6F0FB' },
  { name: '자연상점', tag: '제로웨이스트 · 공정무역', desc: '친환경 생활용품·비건·선물세트 전문몰', url: 'https://onlyeco.co.kr/', image: '/design/6533f2ecb04c60d2eadd60301f7d8bac.jpg', alt: '채소 진열대 사진', bg: '#FFF3D6' },
]
