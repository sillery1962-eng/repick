import { Link } from "react-router-dom";
import inviteHero from "../assets/invite-hero.jpg";
import { AttendanceCard, EventBanner, RankingCard, RewardChip } from "../components/Cards";
import { Chevron } from "../components/Icons";
import { useToast } from "../components/Toast";
import { EVENTS, OTHER_MISSIONS, QUIZ_REWARD, QUIZ_TITLE, TODAY_QUIZZES } from "../data";
import { useEvents } from "../useEvents";

/**
 * 이벤트 · 챌린지 첫 화면 (v4.5 실사 시안 그대로).
 * 오늘의 포인트 미션과 진행중인 이벤트는 눌렀을 때 각각의 페이지로 이동합니다.
 */
export default function EventsPage() {
  const { attend, answeredCount, correctCount, nextQuizIndex } = useEvents();
  const [toast, say] = useToast();
  const total = TODAY_QUIZZES.length;
  const allDone = nextQuizIndex === -1;
  // 미리보기: 아직 안 푼 다음 문제 (다 풀었으면 첫 문제)
  const preview = TODAY_QUIZZES[allDone ? 0 : nextQuizIndex];

  const onAttend = () => { attend(); say("출석 완료! 물방울 1개를 받았어요"); };

  return (
    <div className="ev">
      <div className="ev-wrap">
        <h1 className="ev-title">이벤트 · 챌린지</h1>

        <div className="ev-grid2">
          <div className="ev-col">
            <AttendanceCard onAttend={onAttend} />

            <section className="ev-card" aria-labelledby="ev-mission-title">
              <div className="ev-cardHead">
                <h2 id="ev-mission-title">오늘의 포인트 미션</h2>
                <Link to="/events/mission" className="ev-more">{answeredCount}/{total} 완료 <Chevron /></Link>
              </div>

              {/* 퀴즈 미리보기: 누르면 미션 페이지로 이동해서 풉니다 */}
              <Link to="/events/mission" className="ev-quiz ev-quizLink" aria-label={allDone ? "오늘의 퀴즈 결과 보기" : `${QUIZ_TITLE} ${nextQuizIndex + 1}번: ${preview.question} 풀러 가기`}>
                <div className="ev-quizHead">
                  <span className="ev-pill">{QUIZ_TITLE} · {allDone ? total : nextQuizIndex + 1}/{total}</span>
                  <RewardChip points={QUIZ_REWARD} />
                </div>
                <div className="ev-question">{allDone ? "오늘의 퀴즈를 모두 풀었어요!" : preview.question}</div>
                {!allDone && (
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
                  {allDone ? `${correctCount}문제 정답 · +${correctCount * QUIZ_REWARD}P · 결과 보기` : answeredCount ? `이어서 풀기 (${answeredCount + 1}번째 문제)` : "퀴즈 풀러 가기"} <Chevron />
                </span>
              </Link>

              <div className="ev-missionList">
                {OTHER_MISSIONS.map((m) => (
                  <Link key={m.id} to={`/events/mission#${m.id}`} className="ev-missionRow">
                    <span className="ev-rankText"><span className="ev-missionName">{m.title}</span><span className="ev-muted2">{m.progress}</span></span>
                    <b className="ev-gold">+{m.reward}P</b>
                  </Link>
                ))}
              </div>
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
    </div>
  );
}
