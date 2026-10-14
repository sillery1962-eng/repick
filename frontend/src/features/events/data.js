/* 이벤트 · 챌린지 화면의 시안 데이터 (v4.5 실사 비교).
   실제 서비스에서는 API 응답으로 바꾸면 됩니다. [N]처럼 대괄호로 된 값은 아직 정하지 않은 값입니다. */

export const WEEK = ["월", "화", "수", "목", "금", "토", "일"];

/** 오늘의 포인트 미션: 재활용 상식 퀴즈 (하루 3문제, 맞히면 문제마다 reward 포인트) */
export const QUIZ_TITLE = "재활용 상식 퀴즈";
export const QUIZ_REWARD = 50;
export const QUIZ_PER_DAY = 3;

/** 퀴즈 문제 목록 (4지선다 20문제). 문제를 추가·수정하려면 여기만 고치면 됩니다. */
export const QUIZ_BANK = [
  {
    id: "q-pet-bin",
    question: "다음 중 '투명 페트병 전용 수거함'에 넣을 수 있는 것은?",
    options: [
      { key: "A", text: "라벨을 뗀 초록색 사이다 페트병" },
      { key: "B", text: "깨끗이 씻은 투명 플라스틱 일회용 컵" },
      { key: "C", text: "라벨을 떼고 찌그러뜨린 투명 생수병" },
      { key: "D", text: "투명한 플라스틱 과일 용기" },
    ],
    answer: "C",
    explain: "전용 수거함은 투명한 생수병과 음료 페트병만 받습니다. 유색 페트병, 투명 컵, 과일 용기는 재질이 다르거나 섞여 있어 일반 플라스틱류로 배출해야 합니다.",
  },
  {
    id: "q-coated-paper",
    question: "다음 중 종이류로 배출하면 '안 되는' 것은?",
    options: [
      { key: "A", text: "스프링을 뺀 노트" },
      { key: "B", text: "비닐 코팅된 광고 전단지" },
      { key: "C", text: "펼친 과자 상자" },
      { key: "D", text: "다 읽은 신문지" },
    ],
    answer: "B",
    explain: "코팅된 종이, 사진, 벽지, 금박 포장지는 물에 잘 풀리지 않아 종이 재활용을 방해합니다. 종량제 봉투에 버리세요.",
  },
  {
    id: "q-paper-cup",
    question: "다 쓴 종이컵을 버리는 올바른 방법은?",
    options: [
      { key: "A", text: "일반 종이류와 함께 섞어서 버린다" },
      { key: "B", text: "플라스틱류로 배출한다" },
      { key: "C", text: "헹군 뒤 따로 모아 묶거나 종이팩과 함께 배출한다" },
      { key: "D", text: "코팅이 있으니 무조건 종량제 봉투에 버린다" },
    ],
    answer: "C",
    explain: "종이컵은 안쪽이 코팅되어 있어 일반 종이와 재활용 공정이 다릅니다. 따로 모으면 화장지 같은 고급 재생 원료가 됩니다.",
  },
  {
    id: "q-aseptic-pack",
    question: "두유나 상온 보관 주스팩(멸균팩)을 일반 우유팩과 따로 모으면 좋은 이유는?",
    options: [
      { key: "A", text: "크기가 작아서" },
      { key: "B", text: "안쪽에 알루미늄 층이 있어 재활용 공정이 다르기 때문에" },
      { key: "C", text: "잉크가 많이 들어가서" },
      { key: "D", text: "플라스틱 뚜껑이 달려 있어서" },
    ],
    answer: "B",
    explain: "멸균팩은 상온 보관을 위해 알루미늄 박막을 덧댄 팩입니다. 일반 우유팩과 섞이면 재활용 효율이 떨어지므로 가능하면 따로 묶어 배출하세요.",
  },
  {
    id: "q-bottle-deposit",
    question: "빈 소주병을 마트나 편의점에 가져가면 돌려받을 수 있는 빈용기 보증금은?",
    options: [
      { key: "A", text: "50원" },
      { key: "B", text: "100원" },
      { key: "C", text: "130원" },
      { key: "D", text: "300원" },
    ],
    answer: "B",
    explain: "소주병은 100원, 맥주병은 130원입니다. 반환된 병은 세척해서 여러 번 다시 쓰이므로 깨뜨려 버리는 것보다 훨씬 친환경적입니다.",
  },
  {
    id: "q-food-waste",
    question: "다음 중 음식물 쓰레기로 버려도 '되는' 것은?",
    options: [
      { key: "A", text: "양파 껍질" },
      { key: "B", text: "옥수수 껍질" },
      { key: "C", text: "바나나 껍질" },
      { key: "D", text: "복숭아 씨" },
    ],
    answer: "C",
    explain: "음식물 쓰레기는 동물 사료나 퇴비로 쓸 수 있는지가 기준입니다. 양파 껍질, 옥수수 껍질처럼 질긴 섬유질과 딱딱한 씨는 일반쓰레기입니다.",
  },
  {
    id: "q-coffee-grounds",
    question: "집에서 내린 커피 찌꺼기는 어떻게 버려야 할까요?",
    options: [
      { key: "A", text: "음식물 쓰레기로 버린다" },
      { key: "B", text: "물기를 말린 뒤 종량제 봉투에 버린다" },
      { key: "C", text: "싱크대 배수구로 흘려보낸다" },
      { key: "D", text: "종이 필터째 종이류로 배출한다" },
    ],
    answer: "B",
    explain: "커피 찌꺼기와 티백, 한약 찌꺼기는 음식물 쓰레기가 아닙니다. 말린 커피 찌꺼기는 냉장고나 신발장 탈취제로 한 번 더 쓸 수 있습니다.",
  },
  {
    id: "q-air-cap",
    question: "택배에 들어 있던 에어캡(뽁뽁이)은 어떻게 버려야 할까요?",
    options: [
      { key: "A", text: "플라스틱류" },
      { key: "B", text: "비닐류" },
      { key: "C", text: "스티로폼류" },
      { key: "D", text: "종량제 봉투" },
    ],
    answer: "B",
    explain: "에어캡은 얇은 필름 형태라 비닐류로 배출합니다. 깨끗하다면 이사나 포장할 때 다시 쓰는 것이 더 좋습니다.",
  },
  {
    id: "q-styrofoam",
    question: "다음 중 스티로폼으로 분리배출할 수 있는 것은?",
    options: [
      { key: "A", text: "국물 자국이 밴 컵라면 용기" },
      { key: "B", text: "과일을 감싸는 그물 모양 완충재" },
      { key: "C", text: "테이프와 운송장을 뗀 흰색 스티로폼 상자" },
      { key: "D", text: "음식물이 묻은 스티로폼 접시" },
    ],
    answer: "C",
    explain: "이물질이 없는 흰색 스티로폼만 재활용됩니다. 과일 그물망은 재질이 달라서, 오염된 용기는 씻어도 깨끗해지지 않아서 종량제 봉투에 버립니다.",
  },
  {
    id: "q-glass",
    question: "다음 중 '유리병' 수거함에 넣어도 되는 것은?",
    options: [
      { key: "A", text: "뚜껑을 분리하고 헹군 잼 유리병" },
      { key: "B", text: "내열유리 밀폐 용기" },
      { key: "C", text: "크리스털 유리컵" },
      { key: "D", text: "도자기 머그컵" },
    ],
    answer: "A",
    explain: "내열유리, 크리스털, 도자기는 녹는 온도와 성분이 병 유리와 달라서 섞이면 재활용 유리 전체에 불량이 생깁니다.",
  },
  {
    id: "q-umbrella",
    question: "망가진 우산을 버리는 가장 좋은 방법은?",
    options: [
      { key: "A", text: "통째로 종량제 봉투에 넣는다" },
      { key: "B", text: "통째로 캔·고철류로 배출한다" },
      { key: "C", text: "천을 분리해 종량제 봉투에 넣고, 철제 살과 대는 고철류로 배출한다" },
      { key: "D", text: "의류 수거함에 넣는다" },
    ],
    answer: "C",
    explain: "우산 천은 재활용이 어렵지만 금속 부분은 좋은 고철 자원입니다. 분리가 어렵다면 종량제 봉투에 버리세요.",
  },
  {
    id: "q-toothbrush",
    question: "다음 중 종량제 봉투에 버려야 하는 것은?",
    options: [
      { key: "A", text: "깨끗이 헹군 요구르트 병" },
      { key: "B", text: "다 쓴 칫솔" },
      { key: "C", text: "다 쓴 세제 용기" },
      { key: "D", text: "헹군 샴푸 통" },
    ],
    answer: "B",
    explain: "칫솔은 손잡이, 솔, 고무 등 여러 재질이 붙어 있어 분리할 수 없습니다. 칫솔, 볼펜, 고무장갑처럼 재질이 섞인 작은 제품은 대부분 종량제 봉투로 버립니다.",
  },
  {
    id: "q-other-mark",
    question: "분리배출 표시에 'OTHER(아더)'라고 적힌 플라스틱은 어떻게 버려야 할까요?",
    options: [
      { key: "A", text: "재활용이 안 되므로 종량제 봉투에 버린다" },
      { key: "B", text: "깨끗하다면 플라스틱류로 배출한다" },
      { key: "C", text: "비닐류로 배출한다" },
      { key: "D", text: "대형 폐기물로 신고한다" },
    ],
    answer: "B",
    explain: "OTHER는 여러 플라스틱이 섞인 복합재질이라는 뜻일 뿐 재활용 불가라는 의미가 아닙니다. 이물질만 없다면 플라스틱류로 배출하세요.",
  },
  {
    id: "q-hard-to-recycle",
    question: "포장재에 '재활용 어려움' 표시가 있다면 어떻게 버려야 할까요?",
    options: [
      { key: "A", text: "무조건 종량제 봉투에 버린다" },
      { key: "B", text: "분리배출 표시(재질 마크)에 따라 분리배출한다" },
      { key: "C", text: "제조사에 반송한다" },
      { key: "D", text: "소각용으로 따로 모은다" },
    ],
    answer: "B",
    explain: "'재활용 어려움'은 포장재 설계를 평가한 등급입니다. 버리는 방법은 그대로 분리배출 표시를 따르면 됩니다. 소비자 입장에서는 이 표시가 없는 제품을 고르는 것도 좋은 실천입니다.",
  },
  {
    id: "q-power-bank",
    question: "다 쓴 보조배터리를 버릴 때 화재를 막기 위해 해야 할 일은?",
    options: [
      { key: "A", text: "물에 담가 방전시킨 뒤 버린다" },
      { key: "B", text: "단자 부분에 절연 테이프를 붙여 폐건전지·폐배터리 전용 수거함에 넣는다" },
      { key: "C", text: "일반쓰레기 봉투 깊숙이 넣는다" },
      { key: "D", text: "망치로 부숴 부피를 줄인다" },
    ],
    answer: "B",
    explain: "리튬 배터리는 눌리거나 단자끼리 닿으면 불이 날 수 있습니다. 실제로 수거차와 선별장 화재의 주요 원인 중 하나입니다.",
  },
  {
    id: "q-small-appliance",
    question: "폐가전 무상 방문수거 서비스를 이용할 때, 소형 가전만 버리려면 최소 몇 개 이상 모아야 할까요?",
    options: [
      { key: "A", text: "1개" },
      { key: "B", text: "3개" },
      { key: "C", text: "5개" },
      { key: "D", text: "10개" },
    ],
    answer: "C",
    explain: "냉장고, 세탁기 같은 대형 가전은 1개만 있어도 무료로 수거해 줍니다. 소형 가전은 5개 이상 모아 신청하면 됩니다. 그보다 적으면 주민센터 등의 소형 가전 수거함을 이용하세요.",
  },
  {
    id: "q-ice-pack",
    question: "택배로 받은 아이스팩을 버리는 올바른 방법은?",
    options: [
      { key: "A", text: "내용물이 무엇이든 가위로 잘라 하수구에 흘려보낸다" },
      { key: "B", text: "내용물이 물이면 물을 버리고 비닐류로, 고흡수성 수지(젤)이면 통째로 종량제 봉투에 버린다" },
      { key: "C", text: "모두 플라스틱류로 배출한다" },
      { key: "D", text: "모두 음식물 쓰레기로 버린다" },
    ],
    answer: "B",
    explain: "젤형 아이스팩 속 고흡수성 수지는 미세플라스틱의 일종이라 하수로 흘려보내면 안 됩니다. 포장에 적힌 내용물 표시를 먼저 확인하세요.",
  },
  {
    id: "q-laundry",
    question: "빨래할 때 합성섬유에서 나오는 미세플라스틱을 줄이는 방법은?",
    options: [
      { key: "A", text: "뜨거운 물로 오래 세탁한다" },
      { key: "B", text: "세탁물을 조금씩 넣어 자주 돌린다" },
      { key: "C", text: "세탁망을 쓰고, 찬물로 짧게, 세탁기를 적당히 채워 돌린다" },
      { key: "D", text: "섬유유연제를 듬뿍 넣는다" },
    ],
    answer: "C",
    explain: "높은 온도와 긴 세탁 시간, 옷끼리의 마찰이 섬유 조각을 더 많이 떨어뜨립니다. 세탁망과 찬물 세탁만으로도 배출량을 줄일 수 있습니다.",
  },
  {
    id: "q-fridge",
    question: "냉장고 전기를 아끼는 보관 방법으로 알맞은 것은?",
    options: [
      { key: "A", text: "냉장실과 냉동실을 모두 꽉 채운다" },
      { key: "B", text: "냉장실과 냉동실을 모두 비워 둔다" },
      { key: "C", text: "냉장실은 60% 정도만 채우고, 냉동실은 가득 채운다" },
      { key: "D", text: "냉장실은 가득 채우고, 냉동실은 비워 둔다" },
    ],
    answer: "C",
    explain: "냉장실은 찬 공기가 돌 공간이 있어야 효율이 좋습니다. 냉동실은 얼어 있는 음식들이 서로 냉기를 지켜 주므로 채워 두는 편이 유리합니다.",
  },
  {
    id: "q-food-mileage",
    question: "'푸드 마일리지'를 줄여 탄소 배출을 낮추는 실천은?",
    options: [
      { key: "A", text: "냉동 수입 식품을 대량으로 사 둔다" },
      { key: "B", text: "가까운 지역에서 난 제철 식재료를 산다" },
      { key: "C", text: "포장이 튼튼한 해외 직구 식품을 고른다" },
      { key: "D", text: "온실에서 재배한 비제철 채소를 고른다" },
    ],
    answer: "B",
    explain: "푸드 마일리지는 식품이 생산지에서 식탁까지 이동한 거리를 나타냅니다. 이동 거리가 짧고 난방 재배가 필요 없는 로컬 제철 식품일수록 탄소 배출이 적습니다.",
  },
];

/** 날짜에 따라 목록에서 하루 3문제를 차례로 고릅니다 (같은 날에는 누구나 같은 문제, 약 7일이면 20문제가 한 바퀴). */
export function pickQuizzes(date = new Date(), bank = QUIZ_BANK, count = QUIZ_PER_DAY) {
  const day = Math.floor(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()) / 86400000);
  const start = (day * count) % bank.length;
  return Array.from({ length: Math.min(count, bank.length) }, (_, i) => bank[(start + i) % bank.length]);
}

/** 오늘의 퀴즈 3문제 */
export const TODAY_QUIZZES = pickQuizzes();

/** 퀴즈 외 오늘의 미션 */
export const OTHER_MISSIONS = [
  { id: "scan", title: "AI로 분리배출 3회 인증", progress: "1 / 3회 완료", reward: 100, to: "#scan" },
  { id: "walk", title: "리워크로 3,000보 걷기", progress: "1,820보", reward: 30, to: "#rework" },
];

/** 이달의 적립왕 (10월 적립 포인트 기준) */
export const PODIUM = [
  { rank: 2, name: "박*우", points: 1380, stage: "bigTree" },
  { rank: 1, name: "이*진", points: 1520, stage: "fruitTree" },
  { rank: 3, name: "최*아", points: 1210, stage: "bigTree" },
];
export const RANK_LIST = [
  { rank: 4, name: "정*호", label: "어린 나무", points: 1090, stage: "youngTree" },
  { rank: 5, name: "한*린", label: "줄기", points: 980, stage: "stem" },
  { rank: 6, name: "오*나", label: "줄기", points: 910, stage: "stem" },
  { rank: 7, name: "김*결", label: "묘목", points: 870, stage: "sapling" },
];
export const MY_RANK = { rank: 42, name: "[이름]", points: 190, toTop10: 230 };

/** 진행중인 이벤트 */
export const EVENTS = [
  {
    id: "invite",
    tag: "친구 초대 미션",
    title: "함께하면 더\n아름다운 지구가 돼요!",
    summary: "친구 5명을 초대하면 식물영양제를 드려요.",
    cta: "친구 초대하러 가기",
  },
];

export const INVITE_STEPS = [
  ["초대 코드 보내기", "메시지나 링크로 친구에게 내 코드를 보내요"],
  ["친구가 코드 입력하고 가입", "가입할 때 초대 코드 칸에 입력하면 돼요"],
  ["첫 분리배출하면 둘 다 적립", "친구가 AI로 첫 인증을 마치면 포인트가 들어와요"],
  ["5명 모이면 식물영양제", "누적 5명마다 1개씩 지급돼요"],
];
