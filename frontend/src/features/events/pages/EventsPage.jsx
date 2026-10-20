import { Link } from "react-router-dom";
import inviteHero from "../assets/invite-hero.jpg";
import { AttendanceCard, EventBanner, MissionRows, RankingCard, RewardChip } from "../components/Cards";
import { Chevron } from "../components/Icons";
import { useToast } from "../components/Toast";
import { EVENTS, QUIZ_TITLE } from "../data";
import { useEvents } from "../useEvents";

/**
 * 이벤트 · 챌린지 첫 화면 (v4.5 실사 시안 그대로).
 * 오늘의 포인트 미션과 진행중인 이벤트는 눌렀을 때 각각의 페이지로 이동합니다.
 */
export default function EventsPage() {
  const { attend, quizzes, quizStatus, quizReward, quizEarned, quizError, answeredCount, correctCount, nextQuizIndex, quizAllDone } = useEvents();
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
    </div>
  );
}
