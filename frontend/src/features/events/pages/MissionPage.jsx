import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MissionRows, RewardChip } from "../components/Cards";
import { Back, Chevron, Coin } from "../components/Icons";
import { QUIZ_TITLE } from "../data";
import { useEvents } from "../useEvents";

/** 오늘의 포인트 미션 페이지: 하루 3문제 퀴즈를 차례로 풀고, 나머지 미션 진행 상황을 봅니다. */
export default function MissionPage() {
  const { quizzes, quizStatus, quizReward, quizBonus, quizEarned, quizError, answers, answeredCount, correctCount, allCorrect, nextQuizIndex, points, answerQuiz } = useEvents();
  const total = quizzes.length;
  // 지금 보고 있는 문제 (total이면 결과 화면). null이면 아직 안 푼 첫 문제부터
  const [chosen, setChosen] = useState(null);
  const index = chosen ?? (nextQuizIndex === -1 ? total : nextQuizIndex);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // 보상 창: { reward, bonus } (닫혀 있으면 null)
  const [retrying, setRetrying] = useState(false); // 틀린 문제를 다시 고르는 중
  const [shown, setShown] = useState(points);
  const timers = useRef({ open: null, count: null });
  useEffect(() => () => { clearTimeout(timers.current.open); clearInterval(timers.current.count); }, []);

  const quiz = quizzes[index];
  const result = quiz ? answers[quiz.id] : null; // 채점 결과 { answer, is_correct(처음 답), correct_answer, explain, solved, last, retried }
  const answered = !!result;
  const solved = answered && (result.solved ?? result.is_correct);
  const last = result?.last ?? result; // 가장 최근에 고른 답 { answer, is_correct }
  const locked = answered && !retrying; // 결과를 보여 주는 중 (보기를 누를 수 없음)
  const isLast = index === total - 1;

  /** 정답이면 잠깐 뒤 보상 창을 열고, 포인트 숫자를 올라가는 애니메이션으로 보여 줍니다 */
  const openReward = (from, gain) => {
    const to = from + gain.reward + gain.bonus;
    setShown(from);
    setModal(gain);
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(to); return; }
    let v = from;
    clearInterval(timers.current.count);
    timers.current.count = setInterval(() => {
      v = Math.min(to, v + 1);
      setShown(v);
      if (v >= to) clearInterval(timers.current.count);
    }, 40);
  };

  const pick = async (key) => {
    if (locked || busy) return;
    setBusy(true);
    setError("");
    try {
      const from = points;
      const r = await answerQuiz(quiz.id, key);
      setRetrying(false);
      if (r.reward + r.bonus > 0) timers.current.open = setTimeout(() => openReward(from, r), 450);
    } catch (e) {
      setError(e.message || "답을 보내지 못했어요. 잠시 후 다시 시도해 주세요.");
    } finally {
      setBusy(false);
    }
  };

  const goTo = (i) => { setModal(null); setRetrying(false); setError(""); setChosen(i); };
  const goNext = () => goTo(Math.min(total, index + 1));
  const keyText = (q, key) => q.options.find((o) => o.key === key)?.text ?? "";

  return (
    <div className="ev">
      <div className="ev-wrap">
        <Link to="/events" className="ev-back"><Back />이벤트 · 챌린지</Link>
        <div className="ev-pageHead">
          <h1 className="ev-title">오늘의 포인트 미션</h1>
          <span className="ev-myPoints"><Coin />{points.toLocaleString("ko-KR")}P</span>
        </div>

        {quizStatus === "ready" && (
          <div className="ev-progress">
            <div className="ev-progressText">
              <b>오늘의 퀴즈 {answeredCount}/{total} 완료</b>
              <span className="ev-muted2">맞힌 문제 {correctCount}개 · +{quizEarned}P 적립 (정답마다 {quizReward}P, {total}문제 모두 맞히면 보너스 +{quizBonus}P)</span>
            </div>
            <ol className="ev-steps3" aria-label="문제 진행">
              {quizzes.map((q, i) => {
                const a = answers[q.id];
                const ok = a && (a.solved ?? a.is_correct);
                const cls = a ? (ok ? "ev-s-right" : "ev-s-wrong") : i === index ? "ev-s-now" : "";
                return (
                  <li key={q.id} className={cls}>
                    <button type="button" onClick={() => a && goTo(i)} disabled={!a && i !== index} aria-current={i === index ? "step" : undefined}>
                      문제 {i + 1}{a ? (ok ? " · 정답" : " · 오답") : i === index ? " · 푸는 중" : ""}
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>
        )}

        <div className="ev-stack">
          {quizStatus !== "ready" ? (
            <section className="ev-card ev-doneCard" aria-live="polite">
              <span className="ev-pill">{QUIZ_TITLE}</span>
              <p className="ev-muted2">{quizStatus === "loading" ? "오늘의 퀴즈를 불러오는 중이에요…" : quizError || "퀴즈를 불러오지 못했어요. 잠시 후 다시 들어와 주세요."}</p>
            </section>
          ) : quiz ? (
            <section className="ev-quiz ev-quizBig" aria-labelledby="ev-q">
              <div className="ev-quizHead">
                <span className="ev-pill">{QUIZ_TITLE} · {index + 1}/{total}</span>
                <RewardChip points={quizReward} />
              </div>
              <h2 id="ev-q" className="ev-question">{quiz.question}</h2>
              <div className="ev-options" role="group" aria-label="보기">
                {quiz.options.map((o) => {
                  // 틀렸을 때는 정답을 숨기고 내가 고른 답만 표시 (다시 풀 수 있게)
                  const right = locked && solved && o.key === result.correct_answer;
                  const wrong = locked && o.key === last.answer && !last.is_correct;
                  return (
                    <button key={o.key} type="button" className={"ev-option" + (right ? " ev-right" : wrong ? " ev-wrong" : "")} onClick={() => pick(o.key)} disabled={locked || busy} aria-pressed={locked ? o.key === last.answer : undefined}>
                      <span className="ev-badge">{o.key}</span>
                      <span className="ev-optText">{o.text}</span>
                    </button>
                  );
                })}
              </div>
              {error && <p className="ev-explain" role="alert"><b>{error}</b></p>}
              {retrying && <p className="ev-explain" role="status">다시 골라 보세요. 맞히면 {quizReward}P를 받아요.</p>}
              {locked && solved && (
                <>
                  <p className="ev-explain" role="status">
                    <b>{result.retried ? `다시 풀어 맞혔어요! +${quizReward}P` : `정답이에요! +${result.reward}P${result.bonus ? ` · 모두 정답 보너스 +${result.bonus}P` : ""}`}</b> {result.explain}
                  </p>
                  <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={goNext}>
                    {isLast ? "오늘의 퀴즈 결과 보기" : "다음 문제"} <Chevron />
                  </button>
                </>
              )}
              {locked && !solved && (
                <>
                  <p className="ev-explain" role="status">
                    <b>아쉬워요, 틀렸어요.</b> 다시 풀어 맞히면 {quizReward}P를 받을 수 있어요.
                  </p>
                  <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={() => setRetrying(true)}>다시 풀기</button>
                  <button type="button" className="ev-textBtn" onClick={goNext}>{isLast ? "결과 보기" : "다음 문제로 넘어가기"}</button>
                </>
              )}
            </section>
          ) : (
            <section className="ev-card ev-doneCard" aria-labelledby="ev-done">
              <span className="ev-pill">{QUIZ_TITLE}</span>
              <h2 id="ev-done" className="ev-doneTitle">오늘의 퀴즈를 모두 풀었어요!</h2>
              <p className="ev-muted2">{total}문제 중 {correctCount}문제 정답 · <b className="ev-goldText">+{quizEarned}P</b> 적립{allCorrect ? ` (보너스 ${quizBonus}P 포함)` : ""}. {correctCount < total ? "틀린 문제는 위의 문제 번호를 눌러 다시 풀 수 있어요." : "내일 새 문제가 열려요."}</p>
              <ol className="ev-review">
                {quizzes.map((q, i) => {
                  const a = answers[q.id];
                  const ok = a && (a.solved ?? a.is_correct);
                  return (
                    <li key={q.id}>
                      <span className={"ev-mark " + (ok ? "ev-markOk" : "ev-markNo")}>{ok ? "O" : "X"}</span>
                      <span className="ev-rankText">
                        <span className="ev-missionName">{i + 1}. {q.question}</span>
                        {ok ? <span className="ev-muted2">정답 {a.correct_answer}. {keyText(q, a.correct_answer)}</span> : <span className="ev-muted2">아직 못 맞혔어요. 다시 풀어 볼까요?</span>}
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
            <MissionRows />
            <p className="ev-note">퀴즈와 미션은 매일 자정에 새로 바뀌어요.</p>
          </section>
        </div>
      </div>

      {modal && (
        <div className="ev-modalBack" role="presentation" onClick={() => setModal(null)}>
          <div className="ev-modal" role="dialog" aria-modal="true" aria-labelledby="ev-modal-title" onClick={(e) => e.stopPropagation()}>
            <div className="ev-coins" aria-hidden="true"><Coin size={40} /><Coin size={56} /><Coin size={40} /></div>
            <div id="ev-modal-title" className="ev-modalTitle">{modal.bonus ? `와, ${total}문제 모두 정답!` : "와, 정답입니다!"}</div>
            <div className="ev-modalSub">포인트 {modal.reward}P{modal.bonus ? ` + 보너스 ${modal.bonus}P` : ""}가 적립되었어요</div>
            <div className="ev-total">
              <div className="ev-muted2">내 총 포인트</div>
              <div className="ev-totalNum">{shown.toLocaleString("ko-KR")}<span> P</span></div>
            </div>
            <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={goNext} autoFocus>
              {isLast ? "결과 보기" : `다음 문제 풀기 (${index + 2}/${total})`}
            </button>
            <button type="button" className="ev-textBtn" onClick={() => setModal(null)}>해설 먼저 보기</button>
          </div>
        </div>
      )}
    </div>
  );
}
