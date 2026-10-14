import { useCallback, useEffect, useMemo, useState } from "react";
import { QUIZ_REWARD, TODAY_QUIZZES } from "./data";
import { EventsContext } from "./useEvents";

/**
 * 이벤트 화면끼리 공유하는 상태: 내 포인트, 이번 주 출석, 오늘의 퀴즈 답.
 * 시안 단계라 브라우저 sessionStorage에만 저장합니다 (탭을 닫으면 초기화).
 * 실제 서비스에서는 이 Provider 안의 load/save를 API 호출로 바꾸면 됩니다.
 */
const KEY = "repick-events-v2";
const INITIAL = { points: 6170, attended: [true, true, true, true, true, false, false], answers: {} };

function load() {
  try { return { ...INITIAL, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") }; } catch { return INITIAL; }
}

export function EventsProvider({ children }) {
  const [state, setState] = useState(load);
  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장소 막힘: 메모리에서만 유지 */ }
  }, [state]);

  // 오늘 = 출석 안 한 첫 칸 (시안: 월~금 출석 완료, 토요일이 오늘)
  const todayIndex = state.attended.indexOf(false);
  const attendedToday = todayIndex === -1;
  const streak = state.attended.filter(Boolean).length;

  const answeredCount = TODAY_QUIZZES.filter((q) => state.answers[q.id]).length;
  const correctCount = TODAY_QUIZZES.filter((q) => state.answers[q.id] === q.answer).length;
  // 아직 안 푼 첫 문제 (다 풀었으면 -1)
  const nextQuizIndex = TODAY_QUIZZES.findIndex((q) => !state.answers[q.id]);

  const attend = useCallback(() => {
    setState((s) => {
      const i = s.attended.indexOf(false);
      if (i === -1) return s;
      const attended = [...s.attended];
      attended[i] = true;
      return { ...s, attended };
    });
  }, []);

  /** 문제 하나에 답합니다 (문제마다 한 번만). 정답이면 포인트를 더하고 true를 돌려줍니다. */
  const answerQuiz = useCallback((quizId, key) => {
    const quiz = TODAY_QUIZZES.find((q) => q.id === quizId);
    const correct = !!quiz && key === quiz.answer;
    setState((s) => (s.answers[quizId] ? s : { ...s, answers: { ...s.answers, [quizId]: key }, points: s.points + (correct ? QUIZ_REWARD : 0) }));
    return correct;
  }, []);

  const value = useMemo(
    () => ({ ...state, todayIndex, attendedToday, streak, answeredCount, correctCount, nextQuizIndex, doneCount: answeredCount, attend, answerQuiz }),
    [state, todayIndex, attendedToday, streak, answeredCount, correctCount, nextQuizIndex, attend, answerQuiz],
  );
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}
