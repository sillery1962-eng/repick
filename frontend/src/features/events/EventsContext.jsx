import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "../../lib/AuthContext";
import { checkAttendance, fetchAttendance, fetchTodayQuiz, submitQuizAnswer } from "./api";
import { QUIZ_BONUS, QUIZ_REWARD } from "./data";
import { EventsContext } from "./useEvents";

/**
 * 이벤트 화면끼리 공유하는 상태: 내 포인트, 이번 주 출석, 오늘의 퀴즈.
 * - 퀴즈 문제와 채점 결과는 API(api.js)에서 받아 옵니다. 화면은 정답을 갖고 있지 않습니다.
 * - 포인트·푼 결과는 시안 단계라 브라우저 sessionStorage에도 남깁니다 (탭을 닫으면 초기화).
 * - 출석은 서버(GET·POST /api/v1/points/attendance)가 기록합니다. 로그인 안 했으면 서버를 부르지 않고 빈 칸.
 */
const KEY = "repick-events-v3";
const INITIAL = { points: 6170, quizDate: null, answers: {} };

/** 한국 날짜 기준 오늘 요일 (월=0 … 일=6) — 로그인 전에도 오늘 칸을 강조하려고 브라우저에서 계산 */
function todayIndexKst() {
  return (new Date(Date.now() + 9 * 3600 * 1000).getUTCDay() + 6) % 7;
}

/** 출석 상태: 로그인 전·불러오기 전에는 모두 빈 칸 */
const emptyAttendance = () => ({ status: "idle", week: Array(7).fill(false), todayIndex: todayIndexKst(), checkedToday: false, streak: 0, error: "" });

/** 서버 GET /points/attendance 응답 → 화면 상태 */
const fromServer = (d) => ({ status: "ready", week: d.week, todayIndex: d.today_index, checkedToday: d.checked_today, streak: d.streak, error: "" });

/** 오늘 칸만 채우기 (서버를 다시 못 부를 때) */
function markToday(a) {
  if (a.checkedToday) return a;
  const week = [...a.week];
  week[a.todayIndex] = true;
  return { ...a, week, checkedToday: true, streak: a.streak + 1 };
}

/** 맞힌 문제인지 (처음에 맞혔거나 다시 풀어 맞힘) */
const isSolved = (a) => Boolean(a && (a.solved ?? a.is_correct));

function load() {
  try {
    const { attended: _old, ...saved } = JSON.parse(sessionStorage.getItem(KEY) || "{}"); // 예전 가짜 출석 값은 버림
    return { ...INITIAL, ...saved };
  } catch { return INITIAL; }
}

export function EventsProvider({ children }) {
  const [state, setState] = useState(load);
  const [quiz, setQuiz] = useState({ status: "loading", items: [], reward: QUIZ_REWARD, bonus: QUIZ_BONUS, error: "" });
  const [att, setAtt] = useState(emptyAttendance);
  const { user, loading: authLoading } = useAuth();
  const userId = user?.id ?? null;

  useEffect(() => {
    try { sessionStorage.setItem(KEY, JSON.stringify(state)); } catch { /* 저장소 막힘: 메모리에서만 유지 */ }
  }, [state]);

  // 오늘의 퀴즈 불러오기. 날짜가 바뀌었으면 어제 푼 결과는 지웁니다.
  useEffect(() => {
    let alive = true;
    fetchTodayQuiz()
      .then((data) => {
        if (!alive) return;
        setQuiz({ status: "ready", items: data.items, reward: data.reward, bonus: data.bonus ?? QUIZ_BONUS, error: "", demo: Boolean(data.demo), allDone: Boolean(data.all_done) });
        setState((s) => ({ ...s, quizDate: data.date, answers: { ...(s.quizDate === data.date ? s.answers : {}), ...data.answered } }));
      })
      .catch((e) => alive && setQuiz((q) => ({ ...q, status: "error", error: e.message })));
    return () => { alive = false; };
  }, []);

  // 이번 주 출석 불러오기 (로그인했을 때만. 로그아웃하면 빈 칸으로)
  useEffect(() => {
    if (authLoading) return undefined;
    if (!userId) { setAtt(emptyAttendance()); return undefined; }
    let alive = true;
    setAtt((a) => ({ ...a, status: "loading" }));
    fetchAttendance()
      .then((d) => alive && setAtt(fromServer(d)))
      .catch((e) => alive && setAtt((a) => ({ ...a, status: "error", error: e.message })));
    return () => { alive = false; };
  }, [authLoading, userId]);

  const quizzes = quiz.items;
  const answeredCount = quizzes.filter((q) => state.answers[q.id]).length;
  // 맞힌 문제 = 처음에 맞혔거나, 틀린 뒤 다시 풀어 맞힌 문제
  const correctCount = quizzes.filter((q) => isSolved(state.answers[q.id])).length;
  // 오늘 3문제를 모두 맞혔는지 (다시 풀어 맞힌 것 포함 — 서버 규칙과 같음, 보너스는 하루 한 번)
  const allCorrect = quizzes.length > 0 && quizzes.every((q) => isSolved(state.answers[q.id]));
  // 오늘 퀴즈로 받은 포인트 = 정답 수 × 10 + 모두 정답 보너스
  const quizEarned = correctCount * quiz.reward + (allCorrect ? quiz.bonus : 0);
  // 아직 안 푼 첫 문제 (다 풀었으면 -1)
  const nextQuizIndex = quizzes.findIndex((q) => !state.answers[q.id]);

  /** 오늘 출석 (서버가 💧+1 적립). 돌려주는 값:
      { result: "done", weekBonus } 성공 (weekBonus: 1주일 7일을 다 채웠으면 7) / { result: "already" } 오늘 이미 함 (409)
      / { result: "error", message } 서버 꺼짐 등 */
  const attend = useCallback(async () => {
    try {
      const r = await checkAttendance();
      try { setAtt(fromServer(await fetchAttendance())); } catch { setAtt(markToday); } // 연속 출석 숫자까지 서버 값으로
      return { result: "done", weekBonus: r.week_bonus || 0 };
    } catch (e) {
      if (e.status === 409) { setAtt(markToday); return { result: "already" }; }
      return { result: "error", message: e.message || "출석하지 못했어요. 잠시 후 다시 시도해 주세요." };
    }
  }, []);

  /** 문제 하나에 답합니다. 틀린 문제는 맞힐 때까지 다시 풀 수 있습니다.
      - 받은 포인트(reward 10/0)와 보너스(bonus 50/0)는 서버가 정해서 보내 줍니다 (POST /events/quiz/answer)
        (시안 모드 = 서버 꺼짐: 보너스가 늘 0이라, 방금 3문제를 모두 맞혔는지 화면에서 계산합니다)
      - 처음 답(is_correct)은 그대로 두고 solved·last만 바꿉니다. last.reward = 이번 답으로 받은 포인트
      돌려주는 값: 저장한 결과 + 이번에 받은 포인트 { reward, bonus } */
  const answerQuiz = useCallback(async (quizId, key) => {
    const prev = state.answers[quizId];
    if (isSolved(prev)) return { ...prev, last: { ...prev.last, reward: 0 }, reward: 0, bonus: 0 };
    const result = await submitQuizAnswer(quizId, key, Boolean(prev));
    const reward = result.reward || 0;
    const last = { answer: key, is_correct: result.is_correct, reward };
    const saved = prev
      ? { ...prev, explain: result.explain, correct_answer: result.correct_answer, solved: result.is_correct, last, retried: true }
      : { ...result, solved: result.is_correct, last, retried: false };
    let bonus = result.bonus || 0;
    if (quiz.demo && result.is_correct) {
      const answers = { ...state.answers, [quizId]: saved };
      if (quiz.items.length > 0 && quiz.items.every((q) => isSolved(answers[q.id]))) bonus = quiz.bonus;
    }
    setState((s) => ({ ...s, answers: { ...s.answers, [quizId]: saved }, points: s.points + reward + bonus }));
    // 이 답으로 준비된 퀴즈를 모두 맞힘 → 더 풀 문제 없음
    const allDone = Boolean(result.all_done);
    if (allDone) setQuiz((q) => ({ ...q, allDone: true }));
    return { ...saved, reward, bonus, all_done: allDone };
  }, [state.answers, quiz.items, quiz.bonus, quiz.demo]);

  const value = useMemo(
    () => ({
      ...state,
      loggedIn: Boolean(userId), attended: att.week, todayIndex: att.todayIndex, attendedToday: att.checkedToday, streak: att.streak,
      attendanceStatus: att.status, attendanceError: att.error,
      quizzes, quizStatus: quiz.status, quizReward: quiz.reward, quizBonus: quiz.bonus, quizEarned, quizError: quiz.error,
      quizAllDone: Boolean(quiz.allDone), // 준비된 퀴즈를 모두 맞힘 (quizzes가 비어 있으면 오늘 풀 문제도 없음)
      answeredCount, correctCount, allCorrect, nextQuizIndex, doneCount: answeredCount, attend, answerQuiz,
    }),
    [state, userId, att, quizzes, quiz.status, quiz.reward, quiz.bonus, quizEarned, quiz.error, quiz.allDone, answeredCount, correctCount, allCorrect, nextQuizIndex, attend, answerQuiz],
  );
  return <EventsContext.Provider value={value}>{children}</EventsContext.Provider>;
}
