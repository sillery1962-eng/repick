import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTodayQuiz, submitQuizAnswer } from "./api";
import { QUIZ_REWARD } from "./data";
import { EventsContext } from "./useEvents";

/**
 * 이벤트 화면끼리 공유하는 상태: 내 포인트, 이번 주 출석, 오늘의 퀴즈.
 * - 퀴즈 문제와 채점 결과는 API(api.js)에서 받아 옵니다. 화면은 정답을 갖고 있지 않습니다.
 * - 포인트·출석·푼 결과는 시안 단계라 브라우저 sessionStorage에도 남깁니다 (탭을 닫으면 초기화).
 *   출석은 포인트 API(POST /api/v1/points/attendance)가 생기면 연결합니다.
 */
const KEY = "repick-events-v3";
const INITIAL = { points: 6170, attended: [true, true, true, true, true, false, false], quizDate: null, answers: {} };

function load() {
  try { return { ...INITIAL, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") }; } catch { return INITIAL; }
}

export function EventsProvider({ children }) {
  const [state, setState] = useState(load);
  const [quiz, setQuiz] = useState({ status: "loading", items: [], reward: QUIZ_REWARD, error: "" });

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장소 막힘: 메모리에서만 유지 */ }
  }, [state]);

  // 오늘의 퀴즈 불러오기. 날짜가 바뀌었으면 어제 푼 결과는 지웁니다.
  useEffect(() => {
    let alive = true;
    fetchTodayQuiz()
      .then((data) => {
        if (!alive) return;
        setQuiz({ status: "ready", items: data.items, reward: data.reward, error: "" });
        setState((s) => ({ ...s, quizDate: data.date, answers: { ...(s.quizDate === data.date ? s.answers : {}), ...data.answered } }));
      })
      .catch((e) => alive && setQuiz((q) => ({ ...q, status: "error", error: e.message })));
    return () => { alive = false; };
  }, []);

  // 오늘 = 출석 안 한 첫 칸 (시안: 월~금 출석 완료, 토요일이 오늘)
  const todayIndex = state.attended.indexOf(false);
  const attendedToday = todayIndex === -1;
  const streak = state.attended.filter(Boolean).length;

  const quizzes = quiz.items;
  const answeredCount = quizzes.filter((q) => state.answers[q.id]).length;
  const correctCount = quizzes.filter((q) => state.answers[q.id]?.is_correct).length;
  // 아직 안 푼 첫 문제 (다 풀었으면 -1)
  const nextQuizIndex = quizzes.findIndex((q) => !state.answers[q.id]);

  const attend = useCallback(() => {
    setState((s) => {
      const i = s.attended.indexOf(false);
      if (i === -1) return s;
      const attended = [...s.attended];
      attended[i] = true;
      return { ...s, attended };
    });
  }, []);

  /** 문제 하나에 답합니다 (문제마다 한 번). 서버가 채점한 결과를 돌려주고, 정답이면 포인트를 더합니다. */
  const answerQuiz = useCallback(async (quizId, key) => {
    const result = await submitQuizAnswer(quizId, key);
    setState((s) => (s.answers[quizId] ? s : { ...s, answers: { ...s.answers, [quizId]: result }, points: s.points + result.reward }));
    return result;
  }, []);

  const value = useMemo(
    () => ({
      ...state, todayIndex, attendedToday, streak,
      quizzes, quizStatus: quiz.status, quizReward: quiz.reward, quizError: quiz.error,
      answeredCount, correctCount, nextQuizIndex, doneCount: answeredCount, attend, answerQuiz,
    }),
    [state, todayIndex, attendedToday, streak, quizzes, quiz.status, quiz.reward, quiz.error, answeredCount, correctCount, nextQuizIndex, attend, answerQuiz],
  );
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}
