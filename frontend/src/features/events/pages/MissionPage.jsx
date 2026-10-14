import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { RewardChip } from "../components/Cards";
import { Back, Chevron, Coin } from "../components/Icons";
import { OTHER_MISSIONS, QUIZ_REWARD, QUIZ_TITLE, TODAY_QUIZZES } from "../data";
import { useEvents } from "../useEvents";

const TOTAL = TODAY_QUIZZES.length;

/** 오늘의 포인트 미션 페이지: 하루 3문제 퀴즈를 차례로 풀고, 나머지 미션 진행 상황을 봅니다. */
export default function MissionPage() {
  const { answers, answeredCount, correctCount, nextQuizIndex, points, answerQuiz } = useEvents();
  // 지금 보고 있는 문제 (TOTAL이면 결과 화면). 처음엔 아직 안 푼 첫 문제부터
  const [index, setIndex] = useState(() => (nextQuizIndex === -1 ? TOTAL : nextQuizIndex));
  const [modal, setModal] = useState(false);
  const [shown, setShown] = useState(points);
  const timers = useRef({ open: null, count: null });
  useEffect(() => () => { clearTimeout(timers.current.open); clearInterval(timers.current.count); }, []);

  const quiz = TODAY_QUIZZES[index];
  const picked = quiz ? answers[quiz.id] : null;
  const answered = !!picked;
  const correct = answered && picked === quiz.answer;
  const isLast = index === TOTAL - 1;

  /** 정답이면 잠깐 뒤 보상 창을 열고, 포인트 숫자를 올라가는 애니메이션으로 보여 줍니다 */
  const openReward = (from, to) => {
    setShown(from);
    setModal(true);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(to); return; }
    let v = from;
    clearInterval(timers.current.count);
    timers.current.count = setInterval(() => {
      v = Math.min(to, v + 2);
      setShown(v);
      if (v >= to) clearInterval(timers.current.count);
    }, 30);
  };

  const pick = (key) => {
    if (answered) return;
    if (answerQuiz(quiz.id, key)) {
      const from = points;
      timers.current.open = setTimeout(() => openReward(from, from + QUIZ_REWARD), 450);
    }
  };

  const goNext = () => { setModal(false); setIndex((i) => Math.min(TOTAL, i + 1)); };

  return (
    <div className="ev">
      <div className="ev-wrap">
        <Link to="/events" className="ev-back"><Back />이벤트 · 챌린지</Link>
        <div className="ev-pageHead">
          <h1 className="ev-title">오늘의 포인트 미션</h1>
          <span className="ev-myPoints"><Coin />{points.toLocaleString("ko-KR")}P</span>
        </div>

        <div className="ev-progress">
          <div className="ev-progressText">
            <b>오늘의 퀴즈 {answeredCount}/{TOTAL} 완료</b>
            <span className="ev-muted2">맞힌 문제 {correctCount}개 · +{correctCount * QUIZ_REWARD}P 적립 (하루 최대 {TOTAL * QUIZ_REWARD}P)</span>
          </div>
          <ol className="ev-steps3" aria-label="문제 진행">
            {TODAY_QUIZZES.map((q, i) => {
              const a = answers[q.id];
              const cls = a ? (a === q.answer ? "ev-s-right" : "ev-s-wrong") : i === index ? "ev-s-now" : "";
              return (
                <li key={q.id} className={cls}>
                  <button type="button" onClick={() => a && setIndex(i)} disabled={!a && i !== index} aria-current={i === index ? "step" : undefined}>
                    문제 {i + 1}{a ? (a === q.answer ? " · 정답" : " · 오답") : i === index ? " · 푸는 중" : ""}
                  </button>
                </li>
              );
            })}
          </ol>
        </div>

        <div className="ev-stack">
          {quiz ? (
            <section className="ev-quiz ev-quizBig" aria-labelledby="ev-q">
              <div className="ev-quizHead">
                <span className="ev-pill">{QUIZ_TITLE} · {index + 1}/{TOTAL}</span>
                <RewardChip points={QUIZ_REWARD} />
              </div>
              <h2 id="ev-q" className="ev-question">{quiz.question}</h2>
              <div className="ev-options" role="group" aria-label="보기">
                {quiz.options.map((o) => {
                  const right = answered && o.key === quiz.answer;
                  const wrong = answered && o.key === picked && o.key !== quiz.answer;
                  return (
                    <button key={o.key} type="button" className={"ev-option" + (right ? " ev-right" : wrong ? " ev-wrong" : "")} onClick={() => pick(o.key)} disabled={answered} aria-pressed={o.key === picked}>
                      <span className="ev-badge">{o.key}</span>
                      <span className="ev-optText">{o.text}</span>
                    </button>
                  );
                })}
              </div>
              {answered && (
                <>
                  <p className="ev-explain" role="status">
                    <b>{correct ? `정답이에요! +${QUIZ_REWARD}P` : `아쉬워요, 정답은 ${quiz.answer}예요.`}</b> {quiz.explain}
                  </p>
                  <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={goNext}>
                    {isLast ? "오늘의 퀴즈 결과 보기" : "다음 문제"} <Chevron />
                  </button>
                </>
              )}
            </section>
          ) : (
            <section className="ev-card ev-doneCard" aria-labelledby="ev-done">
              <span className="ev-pill">{QUIZ_TITLE}</span>
              <h2 id="ev-done" className="ev-doneTitle">오늘의 퀴즈를 모두 풀었어요!</h2>
              <p className="ev-muted2">{TOTAL}문제 중 {correctCount}문제 정답 · <b className="ev-goldText">+{correctCount * QUIZ_REWARD}P</b> 적립. 내일 새 문제가 열려요.</p>
              <ol className="ev-review">
                {TODAY_QUIZZES.map((q, i) => {
                  const ok = answers[q.id] === q.answer;
                  return (
                    <li key={q.id}>
                      <span className={"ev-mark " + (ok ? "ev-markOk" : "ev-markNo")}>{ok ? "O" : "X"}</span>
                      <span className="ev-rankText">
                        <span className="ev-missionName">{i + 1}. {q.question}</span>
                        <span className="ev-muted2">정답 {q.answer}. {q.options.find((o) => o.key === q.answer).text}</span>
                      </span>
                    </li>
                  );
                })}
              </ol>
              <Link to="/events" className="ev-darkBtn">이벤트 · 챌린지로 돌아가기</Link>
            </section>
          )}

          <section className="ev-card" aria-labelledby="ev-other">
            <div className="ev-cardHead"><h2 id="ev-other">다른 미션</h2></div>
            <div className="ev-missionList">
              {OTHER_MISSIONS.map((m) => (
                <a key={m.id} id={m.id} href={m.to} className="ev-missionRow">
                  <span className="ev-rankText"><span className="ev-missionName">{m.title}</span><span className="ev-muted2">{m.progress}</span></span>
                  <b className="ev-gold">+{m.reward}P</b>
                </a>
              ))}
            </div>
            <p className="ev-note">퀴즈와 미션은 매일 자정에 새로 바뀌어요.</p>
          </section>
        </div>
      </div>

      {modal && (
        <div className="ev-modalBack" role="presentation" onClick={() => setModal(false)}>
          <div className="ev-modal" role="dialog" aria-modal="true" aria-labelledby="ev-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="ev-coins" aria-hidden="true"><Coin size={40} /><Coin size={56} /><Coin size={40} /></div>
            <div id="ev-modal-title" className="ev-modalTitle">와, 정답입니다!</div>
            <div className="ev-modalSub">포인트 {QUIZ_REWARD}P가 적립되었어요</div>
            <div className="ev-total">
              <div className="ev-muted2">내 총 포인트</div>
              <div className="ev-totalNum">{shown.toLocaleString("ko-KR")}<span> P</span></div>
            </div>
            <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={goNext} autoFocus>
              {isLast ? "결과 보기" : `다음 문제 풀기 (${index + 2}/${TOTAL})`}
            </button>
            <button type="button" className="ev-textBtn" onClick={() => setModal(false)}>해설 먼저 보기</button>
          </div>
        </div>
      )}
    </div>
  );
}
