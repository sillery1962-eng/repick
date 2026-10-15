import { supabase } from "../../lib/supabase";
import { DEMO_QUIZZES } from "./demoQuiz";
import { QUIZ_REWARD } from "./data";

/**
 * 이벤트 화면이 백엔드(FastAPI)와 주고받는 곳.
 * - frontend/.env 에 VITE_API_URL(예: http://localhost:8000)을 넣으면 진짜 API를 부릅니다.
 * - 비워 두면 "시안 모드": 예시 3문제로 화면만 동작합니다 (저장·적립 없음).
 * - 로그인한 회원의 토큰(현숙 님 Supabase 로그인)을 자동으로 붙입니다.
 */
const API_URL = (import.meta.env.VITE_API_URL || "").replace(/\/$/, "");
export const USE_API = Boolean(API_URL);

export const LOGIN_NEEDED = "로그인하면 오늘의 퀴즈를 풀 수 있어요.";

async function request(path, { method = "GET", body } = {}) {
  const { data: auth } = await supabase.auth.getSession();
  const token = auth.session?.access_token;
  if (!token) throw new Error(LOGIN_NEEDED);
  const res = await fetch(API_URL + path, {
    method,
    headers: {
      ...(body ? { "Content-Type": "application/json" } : {}),
      Authorization: `Bearer ${token}`,
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
