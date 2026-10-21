// 친환경 기업 목록 (홈 "친환경 기업 추천"이 씀 · 나중에 저탄소샵도 이 파일을 불러 쓰면 같은 목록이 됨)
// 기업을 바꾸거나 늘리려면 이 배열만 고치면 돼요. 서버·DB 없이 화면 안의 목록입니다.
// - url: 누르면 새 탭으로 열 기업 사이트 주소. 비워 두면 저탄소샵(/points#shop)으로 이동
// - desc: 이름 아래 작은 글씨 (없으면 비워 둠)
// ⚠️ 아래 4곳·사진·설명은 시안의 예시 그대로 — 실제 추천 기업과 주소가 정해지면 바꿔 주세요.
export const ECO_COMPANIES = [
  { name: '자연상점', image: '/design/6533f2ecb04c60d2eadd60301f7d8bac.jpg', alt: '채소 진열대 사진', desc: '제품 1,163개', url: '' },
  { name: '올가홀푸드', image: '/design/168a7e44e8a1d376f6292f58ccc86bac.jpg', alt: '제철 채소와 과일 사진', desc: '제품 624개', url: '' },
  { name: '두레생협', image: '/design/3751b0f61bc5806919065836a8b923f2.jpg', alt: '바구니에 담긴 채소 사진', desc: '제품 522개', url: '' },
  { name: '농협하나로유통', image: '/design/04a7ec2dcd556642d5e8df765d3e03d8.jpg', alt: '초록 농장 사진', desc: '제품 424개', url: '' },
]
