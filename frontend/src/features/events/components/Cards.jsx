import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRanking } from "../api";
import useIsPc from "../../../lib/useIsPc";
import { OTHER_MISSIONS, WEEK } from "../data";
import { useEvents } from "../useEvents";
import { Chevron, Coin, Drop, Tree } from "./Icons";

/** 출석 체크 카드 (초록). 로그인 안 했으면 스탬프 달력 소개 카드(AttendanceIntro)를 보여 줍니다.
    출석 칸은 서버(GET /points/attendance) 값, 오늘 칸 = 한국 날짜 기준 실제 요일 */
export function AttendanceCard({ onAttend, busy = false }) {
  const { loggedIn, attended, streak, attendedToday, todayIndex, attendanceStatus } = useEvents();
  if (!loggedIn) return <AttendanceIntro />;
  const loading = attendanceStatus === "loading" || attendanceStatus === "idle";
  // 이번 주 월요일부터 하루도 안 빠졌을 때만 "○일째 연속 출석 중!" (= 아직 1주일 2배 미션을 받을 수 있음)
  const fromMonday = streak > 0 && streak === (attendedToday ? todayIndex + 1 : todayIndex);
  return (
    <section className="ev-card ev-attend" aria-labelledby="ev-attend-title">
      <div className="ev-cardHead">
        <span id="ev-attend-title" className="ev-attendTitle">{fromMonday ? `${streak}일째 연속 출석 중!` : "이번 주 출석체크"}</span>
        <span className="ev-attendSub">매일 물방울 +1 · 월~일 모두 출석하면 2배!</span>
      </div>
      <ol className="ev-week">
        {WEEK.map((d, i) => (
          <li key={d} className={i === todayIndex ? "ev-today" : undefined} aria-current={i === todayIndex ? "date" : undefined}>
            <span className={"ev-dayDot" + (attended[i] ? " ev-on" : "")}>{attended[i] && <Drop />}</span>
            <span className="ev-dayName">{d}{attended[i] ? <span className="ev-srOnly"> 출석</span> : null}</span>
          </li>
        ))}
      </ol>
      <button type="button" className="ev-limeBtn" onClick={onAttend} disabled={attendedToday || loading || busy}>
        {attendedToday ? "오늘 출석 완료! 내일 또 만나요!" : <><Drop />오늘 출석하고 물방울 받기</>}
      </button>
    </section>
  );
}

/** 출석 도장 (물방울 모양) */
function StampDrop({ size }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 2.5S5 10.4 5 15a7 7 0 0 0 14 0c0-4.6-7-12.5-7-12.5z" fill="#FFFFFF" />
      <circle cx="9.5" cy="15" r="1.6" fill="#FFFFFF" opacity="0.7" />
    </svg>
  );
}

/** 오늘(한국 날짜) → { 요일 칸 0=월 … 6=일, "10월 3주차" } */
function kstWeekInfo() {
  const now = new Date(Date.now() + 9 * 3600 * 1000);
  return { dayIndex: (now.getUTCDay() + 6) % 7, label: `${now.getUTCMonth() + 1}월 ${Math.ceil(now.getUTCDate() / 7)}주차` };
}

/**
 * 로그인 전 출석 카드 (v5 실사 세련 시안 홈 "매일 출석체크" 박스 그대로).
 * 박스 아무 데나 누르면 로그인 화면으로 가고, 로그인하면 이벤트 화면으로 돌아옵니다.
 * PC: 위 스탬프 달력 그림(월~일) + 아래 글 / 모바일: 왼쪽 작은 달력 + 오른쪽 글
 */
export function AttendanceIntro() {
  const isPc = useIsPc();
  const { dayIndex, label } = kstWeekInfo();
  return (
    <Link to="/login" state={{ from: "/events" }} className={"ev-attendIntro " + (isPc ? "ev-attendIntroPc" : "ev-attendIntroM")} aria-label="매일 출석체크: 하루 한 번, 나무에게 물 한 방울. 로그인하고 출석하기">
      <span className="ev-attendIntroArt" aria-hidden="true">
        {isPc ? (
          <>
            <span className="ev-attendIntroBubble" />
            <span className="ev-attendIntroCal">
              <span className="ev-attendIntroCalHead"><b>ATTENDANCE</b><span>{label}</span></span>
              <span className="ev-attendIntroDays">
                {WEEK.map((d, i) => (
                  <span key={d} className="ev-attendIntroDay">
                    <span className="ev-attendIntroDayName">{d}</span>
                    {i === dayIndex ? (
                      <span className="ev-attendIntroStamp ev-stampToday">오늘</span>
                    ) : (
                      <span className="ev-attendIntroStamp ev-stampEmpty" />
                    )}
                  </span>
                ))}
              </span>
              <span className="ev-attendIntroLine" />
              <span className="ev-attendIntroStreak">
                <svg width="14" height="14" viewBox="0 0 24 24"><path d="M12 2.5S5 10.4 5 15a7 7 0 0 0 14 0c0-4.6-7-12.5-7-12.5z" fill="#2F6FA3" /></svg>
                오늘 첫 도장을 찍어 보세요
              </span>
            </span>
          </>
        ) : (
          <span className="ev-attendIntroMini">
            <b>ATTEND</b>
            <span className="ev-attendIntroGrid">
              {["on", "on", "on", "today", "empty", "empty"].map((s, i) => (
                <span key={i} className={"ev-attendIntroDot ev-dot-" + s}>{s === "on" && <StampDrop size={10} />}</span>
              ))}
            </span>
          </span>
        )}
      </span>
      <span className="ev-attendIntroBody">
        <span className="ev-attendIntroPill">물방울 +1</span>
        <span className="ev-attendIntroTitle">매일 출석체크</span>
        <span className="ev-attendIntroText">하루 한 번, 나무에게 물 한 방울.</span>
      </span>
    </Link>
  );
}

/** 트로피 (명예의 전당 제목 앞) */
function Trophy() {
  return (
    <svg width="26" height="26" viewBox="0 0 24 24" aria-hidden="true">
      <path d="M7 4h10v4a5 5 0 0 1-10 0z" fill="#F5C33B" />
      <path d="M7 5H4v1.5A3.5 3.5 0 0 0 7.5 10M17 5h3v1.5A3.5 3.5 0 0 1 16.5 10" fill="none" stroke="#E0A419" strokeWidth="1.6" />
      <path d="M10.5 13h3v3h-3z" fill="#E0A419" />
      <rect x="8" y="16" width="8" height="3" rx="1" fill="#C98A0E" />
      <path d="M9.5 5.5v2.5" stroke="#FFF3C4" strokeWidth="1.4" strokeLinecap="round" />
    </svg>
  );
}

/** 1위 왕관 */
function Crown() {
  return (
    <svg className="ev-crown" width="40" height="30" viewBox="0 0 40 30" aria-hidden="true">
      <path d="M4 24 2 7l10 8 8-13 8 13 10-8-2 17z" fill="#F5C33B" stroke="#E0A419" strokeWidth="1.5" strokeLinejoin="round" />
      <rect x="4" y="23" width="32" height="5" rx="2" fill="#E0A419" />
      <circle cx="20" cy="15" r="2.6" fill="#FF7A59" />
      <circle cx="11" cy="17" r="1.8" fill="#3E9BEA" />
      <circle cx="29" cy="17" r="1.8" fill="#3E9BEA" />
    </svg>
  );
}

/** 나무 단계(1~7, 나의 숲) → 나무 그림. 그림은 5가지라 새싹·떡잎·줄기는 같은 그림 */
const TREE_ICON = { 1: "stem", 2: "stem", 3: "stem", 4: "sapling", 5: "youngTree", 6: "bigTree", 7: "fruitTree" };
const treeOf = (stage) => TREE_ICON[stage] || "stem";

/** 이달의 적립왕 · 명예의 전당 — 실제 순위 (GET /events/ranking). 로그인했으면 내 순위도 */
export function RankingCard() {
  const { loggedIn } = useEvents();
  const [data, setData] = useState({ status: "loading", top: [], me: null, month: "", error: "" });

  useEffect(() => {
    let alive = true;
    fetchRanking()
      .then((d) => alive && setData({ status: "ready", top: d.top, me: d.me, month: d.month, error: "" }))
      .catch((e) => alive && setData((s) => ({ ...s, status: "error", error: e.message })));
    return () => { alive = false; };
  }, [loggedIn]); // 로그인·로그아웃하면 내 순위를 다시 받아 옴

  const heights = { 1: 120, 2: 90, 3: 72 };
  const podium = [2, 1, 3].map((n) => data.top[n - 1]).filter(Boolean); // 단상 순서: 2위 · 1위 · 3위
  const rest = data.top.slice(3);
  const monthNo = data.month ? Number(data.month.slice(5)) : new Date(Date.now() + 9 * 3600 * 1000).getUTCMonth() + 1;
  const me = data.me;
  return (
    <section className="ev-card" aria-labelledby="ev-rank-title">
      <div className="ev-cardHead">
        <h2 id="ev-rank-title" className="ev-rankTitle"><Trophy />이달의 적립왕 · 명예의 전당</h2>
      </div>
      <p className="ev-cardSub">{monthNo}월 적립 포인트 기준 · 매달 1일 초기화</p>
      {data.status !== "ready" ? (
        <p className="ev-rankEmpty" aria-live="polite">{data.status === "loading" ? "순위를 불러오는 중이에요…" : data.error || "순위를 불러오지 못했어요."}</p>
      ) : data.top.length === 0 ? (
        <p className="ev-rankEmpty">아직 이번 달 순위가 없어요. 첫 주인공이 되어 보세요!</p>
      ) : (
        <>
          {/* 시상대 무대: 스포트라이트 + 1위 왕관·반짝이 + 금·은·동 메달 */}
          <div className="ev-stage">
            <span className="ev-spot" aria-hidden="true" />
            <div className="ev-podium">
              {podium.map((p) => (
                <div key={p.rank} className={`ev-podiumCol ev-place${p.rank}`}>
                  {p.rank === 1 && <Crown />}
                  {p.rank === 1 && <span className="ev-sparkles" aria-hidden="true"><i /><i /><i /><i /></span>}
                  <span className={"ev-avatar ev-medalRing" + (p.rank === 1 ? " ev-gold" : "")} title={p.stage_name || undefined}><Tree stage={treeOf(p.stage)} /></span>
                  <span className="ev-podiumName">{p.name}</span>
                  <span className={"ev-step" + (p.rank === 1 ? " ev-first" : "")} style={{ height: heights[p.rank] }}>
                    <span className="ev-medal" aria-label={`${p.rank}위`}>{p.rank}</span>
                    <span className="ev-stepPts">{p.points.toLocaleString("ko-KR")}P</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          {rest.length > 0 && (
            <ol className="ev-rankList" start={4}>
              {rest.map((r) => (
                <li key={r.rank}>
                  <b className="ev-rankNo">{r.rank}</b>
                  <span className="ev-avatarSm"><Tree stage={treeOf(r.stage)} size={32} /></span>
                  <span className="ev-rankText"><span className="ev-rankName">{r.name}</span><span className="ev-muted">{r.stage_name || ""}</span></span>
                  <b>{r.points.toLocaleString("ko-KR")}P</b>
                </li>
              ))}
            </ol>
          )}
        </>
      )}
      {data.status === "ready" && (
        !loggedIn || !me ? (
          <Link to="/login" state={{ from: "/events" }} className="ev-myRank ev-myRankLogin">
            <span className="ev-rankText"><span className="ev-rankName">로그인하면 내 순위를 볼 수 있어요</span></span>
            <Chevron />
          </Link>
        ) : (
          <div className="ev-myRank">
            <b className="ev-lime">{me.rank ? `${me.rank}위` : "-"}</b>
            <span className="ev-rankText">
              <span className="ev-rankName">나 ({me.name})</span>
              <span className="ev-myHint">{!me.rank ? "포인트를 모으면 순위에 올라요" : me.to_top10 > 0 ? `10위까지 ${me.to_top10.toLocaleString("ko-KR")}P 남았어요` : "TOP 10 안에 있어요!"}</span>
            </span>
            <b>{me.points.toLocaleString("ko-KR")}P</b>
          </div>
        )
      )}
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
