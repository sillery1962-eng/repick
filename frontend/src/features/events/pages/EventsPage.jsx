import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import inviteHero from "../assets/invite-friends.jpg"; // 숲길을 함께 걷는 친구들 (CC0, Wikimedia Commons "A group of friends on a casual hike")
import { AttendanceCard, EventBanner, MissionRows, RankingCard, RewardChip } from "../components/Cards";
import { Chevron, Drop } from "../components/Icons";
import { useToast } from "../components/Toast";
import { EVENTS, QUIZ_TITLE, WEEK } from "../data";
import { useEvents } from "../useEvents";

/**
 * 이벤트 · 챌린지 첫 화면 (v4.5 실사 시안 그대로).
 * 오늘의 포인트 미션과 진행중인 이벤트는 눌렀을 때 각각의 페이지로 이동합니다.
 */
export default function EventsPage() {
  const { attend, loggedIn, quizzes, quizStatus, quizReward, quizEarned, quizError, answeredCount, correctCount, nextQuizIndex, quizAllDone } = useEvents();
  const [toast, say] = useToast();
  const total = quizzes.length;
  const ready = quizStatus === "ready";
  const allDone = ready && nextQuizIndex === -1;
  // 준비된 퀴즈를 모두 맞혀 오늘 풀 문제가 없음 → 회색 카드
  const over = ready && total === 0;
  // 미리보기: 아직 안 푼 다음 문제 (다 풀었으면 없음)
  const preview = ready && !allDone ? quizzes[nextQuizIndex] : null;
  const headline = !ready ? (quizStatus === "loading" ? "오늘의 퀴즈를 불러오는 중이에요…" : quizError || "퀴즈를 불러오지 못했어요.")
    : over ? (quizAllDone ? "준비된 퀴즈를 모두 풀었어요" : "오늘은 풀 문제가 없어요")
    : allDone ? "오늘의 퀴즈를 모두 풀었어요!" : preview.question;

  const navigate = useNavigate();
  const [attending, setAttending] = useState(false);
  const [weekBonus, setWeekBonus] = useState(0); // 1주일 출석 완료 팝업에 보여 줄 보너스 물방울 (0이면 닫힘)

  /** 출석 버튼: 로그인 안 했으면 로그인 화면으로 (로그인 후 이벤트 화면으로 돌아옴), 했으면 서버에 출석 */
  const onAttend = async () => {
    if (!loggedIn) { navigate("/login", { state: { from: "/events" } }); return; }
    if (attending) return;
    setAttending(true);
    const r = await attend();
    setAttending(false);
    if (r.result === "done" && r.weekBonus > 0) setWeekBonus(r.weekBonus);
    else if (r.result === "done") say("출석 완료! 물방울 1개를 받았어요");
    else if (r.result === "already") say("오늘은 이미 출석했어요");
    else say(r.message);
  };

  return (
    <div className="ev">
      <div className="ev-wrap">
        <h1 className="ev-title">이벤트 · 챌린지</h1>

        <div className="ev-grid2">
          <div className="ev-col">
            <AttendanceCard onAttend={onAttend} busy={attending} />

            <section className="ev-card" aria-labelledby="ev-mission-title">
              <div className="ev-cardHead">
                <h2 id="ev-mission-title">오늘의 포인트 미션</h2>
                <Link to="/events/mission" className="ev-more">{ready && !over ? `${answeredCount}/${total} 완료` : "보기"} <Chevron /></Link>
              </div>

              {/* 퀴즈 미리보기: 누르면 미션 페이지로 이동해서 풉니다 */}
              <Link to="/events/mission" className={"ev-quiz ev-quizLink" + (over ? " ev-quizOver" : "")} aria-label={preview ? `${QUIZ_TITLE} ${nextQuizIndex + 1}번: ${preview.question} 풀러 가기` : `${QUIZ_TITLE}: ${headline}`}>
                <div className="ev-quizHead">
                  <span className="ev-pill">{QUIZ_TITLE}{ready && !over ? ` · ${allDone ? total : nextQuizIndex + 1}/${total}` : ""}</span>
                  {!over && <RewardChip points={quizReward} />}
                </div>
                <div className="ev-question">{headline}</div>
                {preview && (
                  <div className="ev-options" aria-hidden="true">
                    {preview.options.map((o) => (
                      <span key={o.key} className="ev-option">
                        <span className="ev-badge">{o.key}</span>
                        <span className="ev-optText">{o.text}</span>
                      </span>
                    ))}
                  </div>
                )}
                <span className="ev-quizCta">
                  {over ? (quizAllDone ? "퀴즈 포인트를 모두 받았어요" : "풀 수 있는 문제가 없어요") : allDone ? `${correctCount}문제 정답 · +${quizEarned}P · 결과 보기` : answeredCount ? `이어서 풀기 (${answeredCount + 1}번째 문제)` : "퀴즈 풀러 가기"} <Chevron />
                </span>
              </Link>

              <MissionRows />
            </section>
          </div>

          <RankingCard />
        </div>

        <section className="ev-events" aria-labelledby="ev-events-title">
          <h2 id="ev-events-title" className="ev-sectionTitle">진행중인 이벤트</h2>
          {EVENTS.map((e) => <EventBanner key={e.id} event={e} image={inviteHero} />)}
        </section>
      </div>
      {toast}

      {/* 1주일 출석 완료 팝업 (퀴즈 완료 팝업과 같은 모양) */}
      {weekBonus > 0 && (
        <div className="ev-modalBack" role="presentation" onClick={() => setWeekBonus(0)}>
          <div className="ev-modal ev-weekModal" role="dialog" aria-modal="true" aria-labelledby="ev-week-title" aria-describedby="ev-week-desc" onClick={(e) => e.stopPropagation()} onKeyDown={(e) => e.key === "Escape" && setWeekBonus(0)}>
            <ol className="ev-weekModalDays" aria-label="이번 주 출석 7일 모두 완료">
              {WEEK.map((d) => (
                <li key={d}>
                  <span className="ev-weekModalDot"><Drop size={16} color="#FFFFFF" /></span>
                  <span className="ev-weekModalName">{d}</span>
                </li>
              ))}
            </ol>
            <div id="ev-week-title" className="ev-modalTitle">1주일 출석체크 미션 완료!</div>
            <div id="ev-week-desc">
              <div className="ev-modalSub">7일 모두 출석했어요. <b className="ev-weekX2">물방울 2배 적립!</b></div>
              {/* 받은 물방울: 출석 7 + 보너스 7 = 14 (보너스를 크게) */}
              <div className="ev-weekSum">
                <span className="ev-weekSumItem"><span className="ev-weekSumLabel">출석</span><span className="ev-weekSumNum"><Drop size={18} />7</span></span>
                <span className="ev-weekSumOp" aria-hidden="true">+</span>
                <span className="ev-weekSumItem ev-weekSumBonus"><span className="ev-weekSumLabel">보너스</span><span className="ev-weekSumNum"><Drop size={22} color="#FFFFFF" />+{weekBonus}</span></span>
                <span className="ev-weekSumOp" aria-hidden="true">=</span>
                <span className="ev-weekSumItem"><span className="ev-weekSumLabel">총</span><span className="ev-weekSumNum ev-weekSumTotal"><Drop size={18} />{7 + weekBonus}</span></span>
              </div>
            </div>
            <button type="button" className="ev-darkBtn ev-full ev-tall ev-modalOk ev-weekModalOk" onClick={() => setWeekBonus(0)} autoFocus>확인</button>
          </div>
        </div>
      )}
    </div>
  );
}
