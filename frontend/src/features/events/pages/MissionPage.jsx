import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { MissionRows, RewardChip } from "../components/Cards";
import { Back, Chevron, Coin } from "../components/Icons";
import { QUIZ_TITLE } from "../data";
import { useEvents } from "../useEvents";

/** 정답 안내 줄의 체크 아이콘 */
function Check() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M5 12.5l4.5 4.5L19 7.5" />
    </svg>
  );
}

/** 오늘의 포인트 미션 페이지: 하루 3문제 퀴즈를 차례로 풀고, 나머지 미션 진행 상황을 봅니다.
    문제를 맞히거나 틀리면 보기 아래에 한 줄 안내만 보여 주고, 팝업은 3문제를 모두 맞혀 보너스를 받은 순간이나
    준비된 퀴즈를 모두 맞힌 순간에만 띄웁니다. 모두 맞힌 뒤에는 회색 카드로 "더 풀 문제 없음"을 보여 줍니다. */
export default function MissionPage() {
  const { quizzes, quizStatus, quizReward, quizBonus, quizEarned, quizError, answers, answeredCount, correctCount, allCorrect, nextQuizIndex, points, answerQuiz, quizAllDone } = useEvents();
  const total = quizzes.length;
  // 지금 보고 있는 문제 (total이면 결과 화면). null이면 아직 안 푼 첫 문제부터
  const [chosen, setChosen] = useState(null);
  const index = chosen ?? (nextQuizIndex === -1 ? total : nextQuizIndex);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [modal, setModal] = useState(null); // 팝업 { bonus: 받은 보너스, allDone: 준비된 퀴즈를 모두 맞힘 } (닫혀 있으면 null)
  const [tries, setTries] = useState(0); // 답을 낼 때마다 +1 → 안내 줄 애니메이션을 다시 보여 줌
  const [retrying, setRetrying] = useState(false); // 틀린 문제를 [다시 풀기]로 다시 고르는 중
  const [shown, setShown] = useState(points); // 팝업의 "내 총 포인트" (올라가는 숫자)
  const timer = useRef(null);
  const counter = useRef(null);
  useEffect(() => () => { clearTimeout(timer.current); clearInterval(counter.current); }, []);

  /** 팝업을 열고, 보너스가 있으면 총 포인트가 보너스만큼 올라가는 모습을 보여 줍니다 (약 1초) */
  const openModal = (bonus, allDone, to) => {
    const from = to - bonus;
    setModal({ bonus, allDone });
    clearInterval(counter.current);
    if (!bonus || window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) { setShown(to); return; }
    setShown(from);
    let v = from;
    counter.current = setInterval(() => {
      v = Math.min(to, v + 1);
      setShown(v);
      if (v >= to) clearInterval(counter.current);
    }, 20);
  };

  const quiz = quizzes[index];
  const result = quiz ? answers[quiz.id] : null; // 채점 결과 { answer, is_correct(처음 답), correct_answer, explain, solved, last, retried }
  const answered = !!result;
  const solved = answered && (result.solved ?? result.is_correct);
  const last = result?.last ?? result; // 가장 최근에 고른 답 { answer, is_correct, reward }
  const locked = answered && !retrying; // 결과를 보여 주는 중 (보기를 누를 수 없음)
  const isLast = index === total - 1;

  const pick = async (key) => {
    if (locked || busy) return;
    setBusy(true);
    setError("");
    try {
      const r = await answerQuiz(quiz.id, key);
      setChosen(index); // 답을 낸 문제에 머무름 (다음 문제로 저절로 넘어가지 않게)
      setRetrying(false);
      setTries((n) => n + 1);
      // 보너스·모두 맞힘은 안내 줄을 잠깐 본 뒤 팝업으로
      const after = points + r.reward + r.bonus; // 이번 답까지 반영한 내 총 포인트
      if (r.bonus > 0 || r.all_done) timer.current = setTimeout(() => openModal(r.bonus, r.all_done, after), 450);
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

        {quizStatus === "ready" && total > 0 && (
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
          ) : total === 0 ? (
            // 준비된 퀴즈를 모두 맞혀 더 풀 문제가 없음 (회색)
            <section className="ev-card ev-doneCard ev-quizOver" aria-labelledby="ev-over">
              <span className="ev-pill">{QUIZ_TITLE}</span>
              <h2 id="ev-over" className="ev-doneTitle">{quizAllDone ? "준비된 퀴즈를 모두 풀었어요" : "오늘은 풀 문제가 없어요"}</h2>
              <p className="ev-muted2">{quizAllDone ? "퀴즈로 받을 수 있는 포인트를 모두 받았어요. 다른 미션에도 참여해 보세요." : "다른 미션에 참여해 보세요."}</p>
              <span className="ev-overBtn" aria-disabled="true">풀 수 있는 문제가 없어요</span>
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
                  // 틀렸을 때는 정답을 숨기고 내가 고른 답만 표시 ([다시 풀기]를 누르면 다시 고를 수 있게)
                  const right = locked && solved && o.key === result.correct_answer;
                  const wrong = locked && !solved && o.key === last.answer;
                  return (
                    <button key={o.key} type="button" className={"ev-option" + (right ? " ev-right" : wrong ? " ev-wrong" : "")} onClick={() => pick(o.key)} disabled={locked || busy} aria-pressed={locked ? o.key === last.answer : undefined}>
                      <span className="ev-badge">{o.key}</span>
                      <span className="ev-optText">{o.text}</span>
                    </button>
                  );
                })}
              </div>
              {error && <p className="ev-explain" role="alert"><b>{error}</b></p>}
              {/* 보기 바로 아래 한 줄 안내 (role="status": 화면 읽기 프로그램도 읽어 줌) */}
              <div role="status">
                {retrying && (
                  <div className="ev-feedback">
                    <p className="ev-fbLine ev-fbNo"><span className="ev-fbText">다시 골라 보세요. 맞히면 +{quizReward}P를 받아요</span></p>
                  </div>
                )}
                {locked && (
                  <div key={`${quiz.id}-${tries}`} className="ev-feedback">
                    {solved ? (
                      last.reward > 0 ? (
                        <p className="ev-fbLine ev-fbOk">
                          <span className="ev-fbIcon"><Check /></span>
                          <span className="ev-fbText">정답이에요! +{last.reward}P 적립했어요</span>
                          <b className="ev-fbPts">+{last.reward}P</b>
                        </p>
                      ) : (
                        <p className="ev-fbLine ev-fbOk">
                          <span className="ev-fbIcon"><Check /></span>
                          <span className="ev-fbText">이미 포인트를 받은 문제예요</span>
                        </p>
                      )
                    ) : (
                      <p className="ev-fbLine ev-fbNo"><span className="ev-fbText">아쉬워요, 다시 골라 보세요</span></p>
                    )}
                    {solved && result.explain && <p className="ev-fbExplain">{result.explain}</p>}
                  </div>
                )}
              </div>
              {locked && solved && (
                <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={goNext}>
                  {isLast ? "오늘의 퀴즈 결과 보기" : "다음 문제"} <Chevron />
                </button>
              )}
              {locked && !solved && (
                <>
                  <button type="button" className="ev-darkBtn ev-full ev-tall" onClick={() => setRetrying(true)}>다시 풀기</button>
                  <button type="button" className="ev-textBtn" onClick={goNext}>{isLast ? "결과 보기" : "다음 문제로 넘어가기"}</button>
                </>
              )}
            </section>
          ) : (
            <section className="ev-card ev-doneCard" aria-labelledby="ev-done">
              <span className="ev-pill">{QUIZ_TITLE}</span>
              <h2 id="ev-done" className="ev-doneTitle">오늘의 퀴즈를 모두 풀었어요!</h2>
              <p className="ev-muted2">{total}문제 중 {correctCount}문제 정답 · <b className="ev-goldText">+{quizEarned}P</b> 적립{allCorrect ? ` (보너스 ${quizBonus}P 포함)` : ""}. {correctCount < total ? "틀린 문제는 위의 문제 번호를 눌러 다시 풀 수 있어요." : quizAllDone ? "준비된 퀴즈를 모두 풀어서 내일부터는 새 문제가 없어요." : "내일 새 문제가 열려요."}</p>
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

      {/* 팝업: 오늘 3문제를 모두 맞혀 보너스를 받은 순간, 또는 준비된 퀴즈를 모두 맞힌 순간에만 */}
      {modal && (
        <div className="ev-modalBack" role="presentation" onClick={() => setModal(null)}>
          <div className="ev-modal" role="dialog" aria-modal="true" aria-labelledby="ev-modal-title" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && setModal(null)}>
            <div className="ev-coins" aria-hidden="true"><Coin size={40} /><Coin size={56} /><Coin size={40} /></div>
            <div id="ev-modal-title" className="ev-modalTitle">{modal.bonus > 0 ? `오늘 퀴즈 완료! 보너스 +${modal.bonus}P` : "준비된 퀴즈를 모두 풀었어요!"}</div>
            {modal.allDone && (
              <div className="ev-modalSub">
                {modal.bonus > 0 && <>준비된 퀴즈를 모두 풀었어요!<br /></>}
                퀴즈로 받을 수 있는 포인트를 모두 받았어요
              </div>
            )}
            <div className="ev-total">
              <div className="ev-muted2">내 총 포인트</div>
              <div className="ev-totalNum" aria-live="off">{shown.toLocaleString("ko-KR")}<span> P</span></div>
            </div>
            <button type="button" className="ev-darkBtn ev-full ev-tall ev-modalOk" onClick={() => setModal(null)} autoFocus>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
