import { api } from "../../api/client";
import { supabase } from "../../lib/supabase";
import { DEMO_QUIZZES } from "./demoQuiz";
import { QUIZ_BONUS, QUIZ_REWARD } from "./data";

/**
 * 이벤트 화면이 백엔드(FastAPI)와 주고받는 곳. 팀 공용 API 도구(api/client.js)를 씁니다.
 * - 주소 앞부분(/api/v1)과 로그인 토큰은 공용 도구가 붙여 줍니다 (frontend/.env 의 VITE_API_URL).
 * - 백엔드 서버에 연결이 안 되면 "시안 모드": 예시 3문제로 화면만 동작합니다 (저장·적립 없음).
 */
export const LOGIN_NEEDED = "로그인하면 오늘의 퀴즈를 풀 수 있어요.";

let demoMode = false; // 서버에 연결하지 못했을 때 true

/** 한국 날짜 (YYYY-MM-DD) */
function todayKst() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 오늘의 퀴즈 3문제 → { date, reward, bonus, items: [{ id, question, options }], answered: { [id]: 결과 } } */
export async function fetchTodayQuiz() {
  const { data } = await supabase.auth.getSession();
  if (!data.session) throw new Error(LOGIN_NEEDED);
  try {
    demoMode = false;
    return await api.get("/events/quiz/today");
  } catch (e) {
    if (e.status !== 0) throw e;
    demoMode = true; // 서버 꺼짐 → 예시 문제로 화면만 보여 줌
    const items = DEMO_QUIZZES.map(({ id, question, options }) => ({ id, question, options }));
    return { date: todayKst(), reward: QUIZ_REWARD, bonus: QUIZ_BONUS, items, answered: {}, demo: true };
  }
}

/** 답 제출 → { quiz_id, answer, is_correct, correct_answer, explain, reward, bonus }
    reward: 정답이면 10, bonus: 3문제 모두 정답일 때 마지막 답에서만 50 */
export async function submitQuizAnswer(quizId, answer, retry = false) {
  if (demoMode) {
    const quiz = DEMO_QUIZZES.find((q) => q.id === quizId);
    const isCorrect = answer === quiz.answer;
    return { quiz_id: quizId, answer, is_correct: isCorrect, correct_answer: quiz.answer, explain: quiz.explain, reward: isCorrect ? QUIZ_REWARD : 0, bonus: 0 };
  }
  return api.post("/events/quiz/answer", { quiz_id: quizId, answer, retry });
}

/** 이번 주 출석 → { today, today_index(월=0…일=6), week: [월~일 true/false], checked_today, streak, week_bonus, week_bonus_received }
    로그인한 회원만 부릅니다 (로그인 안 했으면 화면이 부르지 않음). 출석 기록은 서버(Supabase)에 있습니다. */
export function fetchAttendance() {
  return api.get("/points/attendance");
}

/** 오늘 출석 → { drops_awarded: 1, week_bonus: 7 또는 0, drops_balance }
    오늘 이미 했으면 409 오류(ApiError, status 409). 물방울 적립은 서버만 합니다. */
export function checkAttendance() {
  return api.post("/points/attendance");
}
