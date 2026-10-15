import { DEMO_QUIZZES } from "./demoQuiz";
import { QUIZ_REWARD } from "./data";

/**
 * 이벤트 화면이 백엔드(FastAPI)와 주고받는 곳.
 * - frontend/.env 에 VITE_API_URL(예: http://localhost:8000)을 넣으면 진짜 API를 부릅니다.
 * - 비워 두면 "시안 모드": 예시 3문제로 화면만 동작합니다 (저장·적립 없음).
 */
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const USE_API = Boolean(API_URL);

// 로그인 토큰. 로그인(Supabase)이 붙으면 setTokenGetter(() => session.access_token)으로 연결합니다.
let getToken = () => null;
export function setTokenGetter(fn) {
  getToken = fn;
}

async function request(path, { method = "GET", body } = {}) {
  const token = getToken();
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(typeof data.detail === "string" ? data.detail : "요청을 처리하지 못했어요.");
  return data;
}

/** 한국 날짜 (YYYY-MM-DD) */
function todayKst() {
  return new Date(Date.now() + 9 * 3600 * 1000).toISOString().slice(0, 10);
}

/** 오늘의 퀴즈 3문제 → { date, reward, items: [{ id, question, options }], answered: { [id]: 결과 } } */
export async function fetchTodayQuiz() {
  if (!USE_API) {
    const items = DEMO_QUIZZES.map(({ id, question, options }) => ({ id, question, options }));
    return { date: todayKst(), reward: QUIZ_REWARD, items, answered: {} };
  }
  return request("/api/v1/events/quiz/today");
}

/** 답 제출 → { quiz_id, answer, is_correct, correct_answer, explain, reward } */
export async function submitQuizAnswer(quizId, answer) {
  if (!USE_API) {
    const quiz = DEMO_QUIZZES.find((q) => q.id === quizId);
    const isCorrect = answer === quiz.answer;
    return { quiz_id: quizId, answer, is_correct: isCorrect, correct_answer: quiz.answer, explain: quiz.explain, reward: isCorrect ? QUIZ_REWARD : 0 };
  }
  return request("/api/v1/events/quiz/answer", { method: "POST", body: { quiz_id: quizId, answer } });
}
