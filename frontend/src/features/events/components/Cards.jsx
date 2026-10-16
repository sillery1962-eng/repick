import { Link } from "react-router-dom";
import { MY_RANK, OTHER_MISSIONS, PODIUM, RANK_LIST, WEEK } from "../data";
import { useEvents } from "../useEvents";
import { Coin, Drop, Tree } from "./Icons";

/** 출석 체크 카드 (초록) */
export function AttendanceCard({ onAttend }) {
  const { attended, streak, attendedToday, todayIndex } = useEvents();
  return (
    <section className="ev-card ev-attend" aria-labelledby="ev-attend-title">
      <div className="ev-cardHead">
        <span id="ev-attend-title" className="ev-attendTitle">{streak}일째 연속 출석 중!</span>
        <span className="ev-attendSub">매일 출석하면 물방울 +1</span>
      </div>
      <ol className="ev-week">
        {WEEK.map((d, i) => (
          <li key={d} className={i === todayIndex ? "ev-today" : undefined}>
            <span className={"ev-dayDot" + (attended[i] ? " ev-on" : "")}>{attended[i] && <Drop />}</span>
            <span className="ev-dayName">{d}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="ev-limeBtn" onClick={onAttend} disabled={attendedToday}>
        {attendedToday ? "이번 주 출석을 모두 마쳤어요" : "오늘 출석하고 물방울 받기"}
      </button>
    </section>
  );
}

/** 이달의 적립왕 · 명예의 전당 */
export function RankingCard() {
  const heights = { 1: 120, 2: 90, 3: 72 };
  return (
    <section className="ev-card" aria-labelledby="ev-rank-title">
      <div className="ev-cardHead">
        <h2 id="ev-rank-title">이달의 적립왕 · 명예의 전당</h2>
      </div>
      <p className="ev-cardSub">10월 적립 포인트 기준 · 매달 1일 초기화</p>
      <div className="ev-podium">
        {PODIUM.map((p) => (
          <div key={p.rank} className="ev-podiumCol">
            <span className={"ev-avatar" + (p.rank === 1 ? " ev-gold" : "")}><Tree stage={p.stage} /></span>
            <span className="ev-podiumName">{p.name}</span>
            <span className={"ev-step" + (p.rank === 1 ? " ev-first" : "")} style={{ height: heights[p.rank] }}>
              <b>{p.rank}</b>
              <span>{p.points.toLocaleString("ko-KR")}P</span>
            </span>
          </div>
        ))}
      </div>
      <ol className="ev-rankList" start={4}>
        {RANK_LIST.map((r) => (
          <li key={r.rank}>
            <b className="ev-rankNo">{r.rank}</b>
            <span className="ev-avatarSm"><Tree stage={r.stage} size={32} /></span>
            <span className="ev-rankText"><span className="ev-rankName">{r.name}</span><span className="ev-muted">{r.label}</span></span>
            <b>{r.points.toLocaleString("ko-KR")}P</b>
          </li>
        ))}
      </ol>
      <div className="ev-myRank">
        <b className="ev-lime">{MY_RANK.rank}위</b>
        <span className="ev-rankText"><span className="ev-rankName">나 ({MY_RANK.name})</span><span className="ev-myHint">10위까지 {MY_RANK.toTop10}P 남았어요</span></span>
        <b>{MY_RANK.points}P</b>
      </div>
      <p className="ev-note"><b>이달의 보상</b> 1위 [N]P · 2위 [N]P · 3위 [N]P · 4~10위 [N]P · 명예의 전당 배지</p>
    </section>
  );
}

/** 진행중인 이벤트 배너 (누르면 이벤트 상세 페이지로) */
export function EventBanner({ event, image }) {
  return (
    <Link to={`/events/${event.id}`} className="ev-banner">
      <span className="ev-tag">{event.tag}</span>
      <span className="ev-bannerTitle">{event.title}</span>
      <span className="ev-bannerSub">{event.summary}</span>
      <span className="ev-darkBtn">{event.cta} ›</span>
      <span className="ev-bannerImg"><img src={image} alt="흙과 새싹을 든 손 사진" /></span>
    </Link>
  );
}

export function RewardChip({ points }) {
  return <span className="ev-reward"><Coin />+{points}P</span>;
}

/** 퀴즈 외 미션 목록. 누르면 해당 화면(AI 인증 → /scan)으로, 준비 중인 미션은 누를 수 없게 표시 */
export function MissionRows() {
  return (
    <div className="ev-missionList">
      {OTHER_MISSIONS.map((m) => {
        const body = <span className="ev-rankText"><span className="ev-missionName">{m.title}</span><span className="ev-muted2">{m.progress}</span></span>;
        if (m.ready === false) {
          return (
            <div key={m.id} id={m.id} className="ev-missionRow ev-missionSoon" aria-disabled="true">
              {body}
              <span className="ev-pill">구현 준비 중</span>
            </div>
          );
        }
        return (
          <Link key={m.id} id={m.id} to={m.to} className="ev-missionRow">
            {body}
            <b className="ev-gold">+{m.reward}P</b>
          </Link>
        );
      })}
    </div>
  );
}
