/* 이벤트 · 챌린지 화면의 시안 데이터 (v4.5 실사 비교).
   실제 서비스에서는 API 응답으로 바꾸면 됩니다. [N]처럼 대괄호로 된 값은 아직 정하지 않은 값입니다. */

export const WEEK = ["월", "화", "수", "목", "금", "토", "일"];

/** 오늘의 포인트 미션: 재활용 상식 퀴즈 (하루 3문제, 정답마다 reward 포인트, 3문제 모두 맞히면 bonus 포인트 더)
    문제와 정답은 백엔드(backend/data/quizzes.json)에만 있고, 화면은 API로 문제만 받아 옵니다 (api.js). */
export const QUIZ_TITLE = "재활용 상식 퀴즈";
export const QUIZ_REWARD = 10; // 정답 1개당. API 응답(reward)이 오기 전 기본값
export const QUIZ_BONUS = 50; // 3문제 모두 정답 보너스. API 응답(bonus)이 오기 전 기본값

/** 친구 초대 보상: 친구 1명당 물방울 2개, 5명마다 1000P (보상 후 0명부터 다시) */
export const DROPS_PER_FRIEND = 2;
export const GOAL_FRIENDS = 5;
export const GOAL_REWARD = 1000;

/** 퀴즈 외 오늘의 미션 (to: 누르면 갈 주소, ready: false면 "구현 준비 중"으로만 표시) */
export const OTHER_MISSIONS = [
  { id: "walk", title: "리워크로 걸으며 포인트 받기", progress: "걸음 수에 따라 포인트를 받을 수 있어요", to: null, ready: false },
];

/** 진행중인 이벤트 */
export const EVENTS = [
  {
    id: "invite",
    tag: "친구 초대 미션",
    title: "함께하면 더\n아름다운 지구가 돼요!",
    summary: "친구 1명당 물방울 2개, 5명 모일 때마다 1000P를 드려요.",
    cta: "친구 초대하러 가기",
  },
];

export const INVITE_STEPS = [
  ["초대 코드 보내기", "메시지나 링크로 친구에게 내 코드를 보내요"],
  ["친구가 코드 입력하고 가입", "가입할 때 초대 코드 칸에 입력하면 돼요"],
  ["친구 1명당 물방울 2개", "친구가 가입을 마치면 바로 들어와요"],
  ["5명 모일 때마다 1000P", "5명째 친구가 가입하면 들어오고, 다시 0명부터 모아요"],
];
