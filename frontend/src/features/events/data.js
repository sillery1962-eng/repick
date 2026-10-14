/* 이벤트 · 챌린지 화면의 시안 데이터 (v4.5 실사 비교).
   실제 서비스에서는 API 응답으로 바꾸면 됩니다. [N]처럼 대괄호로 된 값은 아직 정하지 않은 값입니다. */

export const WEEK = ["월", "화", "수", "목", "금", "토", "일"];

/** 오늘의 포인트 미션: 재활용 상식 퀴즈 (하루 3문제, 맞히면 문제마다 reward 포인트) */
export const QUIZ_TITLE = "재활용 상식 퀴즈";
export const QUIZ_REWARD = 50;
export const TODAY_QUIZZES = [
  {
    id: "q-label",
    question: "페트병에 붙은 비닐 라벨, 어떻게 버려야 할까요?",
    options: [
      { key: "A", text: "붙어 있는 그대로 버린다" },
      { key: "B", text: "떼어내고 페트병만 따로 버린다" },
      { key: "C", text: "라벨째 일반쓰레기로 버린다" },
    ],
    answer: "B",
    explain: "비닐 라벨은 떼어서 비닐류로, 페트병은 투명 페트병 수거함에 따로 버려요.",
  },
  {
    id: "q-pizza",
    question: "기름이 많이 묻은 피자 상자는 어떻게 버려야 할까요?",
    options: [
      { key: "A", text: "그대로 종이류로 버린다" },
      { key: "B", text: "플라스틱류와 함께 버린다" },
      { key: "C", text: "기름 묻은 부분은 일반쓰레기, 깨끗한 부분만 종이류로 버린다" },
    ],
    answer: "C",
    explain: "음식물이나 기름에 오염된 종이는 재활용이 어려워 종량제 봉투에 버리고, 깨끗한 부분만 종이류로 내놓아요.",
  },
  {
    id: "q-milk",
    question: "다 마신 우유팩(종이팩)은 어떻게 배출할까요?",
    options: [
      { key: "A", text: "헹군 뒤 펼쳐 말려서 종이팩 전용 수거함에 버린다" },
      { key: "B", text: "신문지·상자와 함께 일반 종이류로 묶어 버린다" },
      { key: "C", text: "뚜껑을 닫아 플라스틱류로 버린다" },
    ],
    answer: "A",
    explain: "종이팩은 일반 종이와 재활용 공정이 달라요. 헹구고 펼쳐 말린 뒤 종이팩 전용 수거함이나 주민센터 교환 창구로 가져가요.",
  },
];

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
