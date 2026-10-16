import { useCallback, useEffect, useMemo, useState } from "react";
import { fetchTodayQuiz, submitQuizAnswer } from "./api";
import { QUIZ_BONUS, QUIZ_REWARD } from "./data";
import { EventsContext } from "./useEvents";

/**
 * 이벤트 화면끼리 공유하는 상태: 내 포인트, 이번 주 출석, 오늘의 퀴즈.
 * - 퀴즈 문제와 채점 결과는 API(api.js)에서 받아 옵니다. 화면은 정답을 갖고 있지 않습니다.
 * - 포인트·출석·푼 결과는 시안 단계라 브라우저 sessionStorage에도 남깁니다 (탭을 닫으면 초기화).
 *   출석은 포인트 API(POST /api/v1/points/attendance)가 생기면 연결합니다.
 */
const KEY = "repick-events-v3";
const INITIAL = { points: 6170, attended: [true, true, true, true, true, false, false], quizDate: null, answers: {} };

/** 맞힌 문제인지 (처음에 맞혔거나 다시 풀어 맞힘) */
const isSolved = (a) => Boolean(a && (a.solved ?? a.is_correct));

function load() {
  try { return { ...INITIAL, ...JSON.parse(sessionStorage.getItem(KEY) || "{}") }; } catch { return INITIAL; }
}

export function EventsProvider({ children }) {
  const [state, setState] = useState(load);
  const [quiz, setQuiz] = useState({ status: "loading", items: [], reward: QUIZ_REWARD, bonus: QUIZ_BONUS, error: "" });

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장소 막힘: 메모리에서만 유지 */ }
  }, [state]);

  // 오늘의 퀴즈 불러오기. 날짜가 바뀌었으면 어제 푼 결과는 지웁니다.
  useEffect(() => {
    let alive = true;
    fetchTodayQuiz()
      .then((data) => {
        if (!alive) return;
        setQuiz({ status: "ready", items: data.items, reward: data.reward, bonus: data.bonus ?? QUIZ_BONUS, error: "" });
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
  // 맞힌 문제 = 처음에 맞혔거나, 틀린 뒤 다시 풀어 맞힌 문제
  const correctCount = quizzes.filter((q) => isSolved(state.answers[q.id])).length;
  // 처음 풀 때 3문제를 모두 맞혔는지 (보너스는 이때만 한 번, 다시 풀어 맞힌 건 제외)
  const allCorrect = quizzes.length > 0 && quizzes.every((q) => state.answers[q.id]?.is_correct);
  // 오늘 퀴즈로 받은 포인트 = 정답 수 × 10 + 모두 정답 보너스
  const quizEarned = correctCount * quiz.reward + (allCorrect ? quiz.bonus : 0);
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

  /** 문제 하나에 답합니다. 틀린 문제는 맞힐 때까지 다시 풀 수 있습니다.
      - 처음 답: 정답이면 10P, 3문제를 처음에 모두 맞히면 보너스 50P
        (가짜 API는 앞의 답을 몰라 bonus가 늘 0이므로, 그때는 화면에서 "모두 정답"을 계산합니다)
      - 다시 풀기: 맞히면 10P, 보너스는 없음. 처음 답(is_correct)은 그대로 두고 solved·last만 바꿉니다.
      돌려주는 값: 저장한 결과 + 이번에 받은 포인트 { reward, bonus } */
  const answerQuiz = useCallback(async (quizId, key) => {
    const prev = state.answers[quizId];
    if (isSolved(prev)) return { ...prev, reward: 0, bonus: 0 };
    const result = await submitQuizAnswer(quizId, key, Boolean(prev));
    const last = { answer: key, is_correct: result.is_correct };
    let saved, gain;
    if (!prev) {
      const answers = { ...state.answers, [quizId]: result };
      const allRight = quiz.items.length > 0 && quiz.items.every((q) => answers[q.id]?.is_correct);
      gain = { reward: result.reward, bonus: result.bonus || (allRight ? quiz.bonus : 0) };
      saved = { ...result, ...gain, solved: result.is_correct, last, retried: false };
    } else {
      gain = { reward: result.reward, bonus: 0 };
      saved = { ...prev, solved: result.is_correct, last, retried: true };
    }
    setState((s) => ({ ...s, answers: { ...s.answers, [quizId]: saved }, points: s.points + gain.reward + gain.bonus }));
    return { ...saved, ...gain };
  }, [state.answers, quiz.items, quiz.bonus]);

  const value = useMemo(
    () => ({
      ...state, todayIndex, attendedToday, streak,
      quizzes, quizStatus: quiz.status, quizReward: quiz.reward, quizBonus: quiz.bonus, quizEarned, quizError: quiz.error,
      answeredCount, correctCount, allCorrect, nextQuizIndex, doneCount: answeredCount, attend, answerQuiz,
    }),
    [state, todayIndex, attendedToday, streak, quizzes, quiz.status, quiz.reward, quiz.bonus, quizEarned, quiz.error, answeredCount, correctCount, allCorrect, nextQuizIndex, attend, answerQuiz],
  );
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}
