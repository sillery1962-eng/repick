import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { fetchRanking, fetchRecentPointEarned } from "../api";
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

// 명예의 전당 4~10위 한 줄 최소 높이 (events.css의 .ev-rankMore .ev-rankList li min-height와 같게)
const RANK_ROW_PX = 50;
// 두 칸 화면 기준 (events.css의 @media (min-width: 901px)와 같게)
const TWO_COLUMN = "(min-width: 901px)";

/** 이달의 적립왕 · 명예의 전당 — 실제 순위 (GET /events/ranking). 로그인했으면 내 순위도 */
export function RankingCard() {
  const { loggedIn } = useEvents();
  const [data, setData] = useState({ status: "loading", top: [], me: null, month: "", error: "" });
  // PC(두 칸): 카드 높이 = 왼쪽 열 높이. 4~10위는 들어가는 줄 수(fitCount)만 보이고 나머지는 [더보기]
  // 퀴즈를 다 풀어 왼쪽이 짧아지면 줄 수가 줄어듦. 폰(한 칸)·더보기를 누른 뒤에는 모두 보임(null)
  const [expanded, setExpanded] = useState(false);
  const [fitCount, setFitCount] = useState(null);
  const moreRef = useRef(null);

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
  const myRank = loggedIn && me?.rank ? me.rank : null; // 순위 안에 있으면 그 자리를 연두로 칠함 (아래 내 순위 칸과 같은 색)

  // 남은 높이에 4~10위가 몇 줄 들어가는지 잼 (창 크기·왼쪽 열 높이가 바뀔 때마다 다시)
  useLayoutEffect(() => {
    const box = moreRef.current;
    const mq = window.matchMedia(TWO_COLUMN);
    if (!box || expanded) { setFitCount(null); return undefined; }
    const measure = () => {
      if (!mq.matches) { setFitCount(null); return; }
      const listTop = parseFloat(getComputedStyle(box.firstElementChild).marginTop) || 0;
      setFitCount(Math.max(0, Math.floor((box.clientHeight - listTop) / RANK_ROW_PX)));
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(box);
    mq.addEventListener("change", measure);
    return () => { ro.disconnect(); mq.removeEventListener("change", measure); };
  }, [expanded, rest.length]);

  const fitting = !expanded && fitCount != null; // 높이에 맞춰 자르는 중
  const shownRest = fitting ? rest.slice(0, fitCount) : rest;
  const hiddenCount = rest.length - shownRest.length;
  // 10위 안이고 화면에 내 자리가 보이면 칠하기만 하고 아래 내 순위 칸은 숨김 (더보기에 가려졌으면 아래 칸으로 보여 줌)
  const meShown = myRank != null && (myRank <= 3 ? podium.some((p) => p.rank === myRank) : shownRest.some((r) => r.rank === myRank));
  return (
    // ev-rankCard: PC에서는 왼쪽 열(출석·포인트 미션)과 아래 끝선을 맞춤, ev-rankFit = 높이에 맞춰 자르는 중 (events.css)
    <section className={"ev-card ev-rankCard" + (expanded ? "" : " ev-rankFit")} aria-labelledby="ev-rank-title">
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
                  <span className={"ev-podiumName" + (p.rank === myRank ? " ev-podiumMe" : "")}>{p.name}{p.rank === myRank && " (나)"}</span>
                  <span className={"ev-step" + (p.rank === 1 ? " ev-first" : "")} style={{ height: heights[p.rank] }}>
                    <span className="ev-medal" aria-label={`${p.rank}위`}>{p.rank}</span>
                    <span className="ev-stepPts">{p.points.toLocaleString("ko-KR")}P</span>
                  </span>
                </div>
              ))}
            </div>
          </div>
          {/* 4~10위: PC는 카드 높이에 들어가는 만큼만, 나머지는 [더보기] */}
          {rest.length > 0 && (
            <div className="ev-rankMore" ref={moreRef}>
              <ol className="ev-rankList" start={4}>
                {shownRest.map((r) => (
                  <li key={r.rank} className={r.rank === myRank ? "ev-rankMe" : undefined}>
                    <b className="ev-rankNo">{r.rank}</b>
                    <span className="ev-avatarSm"><Tree stage={treeOf(r.stage)} size={32} /></span>
                    <span className="ev-rankText"><span className="ev-rankName">{r.name}{r.rank === myRank && " (나)"}</span><span className="ev-muted">{r.stage_name || ""}</span></span>
                    <b>{r.points.toLocaleString("ko-KR")}P</b>
                  </li>
                ))}
              </ol>
            </div>
          )}
          {(hiddenCount > 0 || expanded) && (
            <button type="button" className={"ev-rankToggle" + (expanded ? " ev-open" : "")} aria-expanded={expanded} onClick={() => setExpanded((o) => !o)}>
              {expanded ? "접기" : `더보기 (${hiddenCount}명)`} <Chevron />
            </button>
          )}
        </>
      )}
      {data.status === "ready" && !meShown && (
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
      {/* 숫자는 서버 backend/app/routers/ranking.py의 RANK_REWARDS와 같게 */}
      <p className="ev-note"><b>이달의 보상</b> 1위 500P · 2위 300P · 3위 200P · 4~10위 100P<br />다음 달 1일에 포인트로 지급돼요</p>
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
      <span className="ev-darkBtn ev-bannerBtn">{event.cta} <span className="ev-bannerArrow" aria-hidden="true">››››</span></span>
      <span className="ev-bannerImg"><img src={image} alt="숲길을 함께 걷는 친구들 사진" /></span>
    </Link>
  );
}

export function RewardChip({ points }) {
  return <span className="ev-reward"><Coin />+{points}P</span>;
}

/** 퀴즈 외 미션 목록. 누르면 해당 화면(AI 인증 → /scan)으로, 준비 중인 미션은 누를 수 없게 표시 */
/** 통장 type → 화면 이름 (ref_id로 더 나뉘는 것: 퀴즈 보너스 bonus-날짜, 적립왕 보상 rank-달) */
const POINT_LABELS = { scan: "AI 분리배출 인증", quiz: "퀴즈 정답", post_verify: "커뮤니티 인증글", referral_bonus: "친구 5명 초대 달성", mission: "미션 달성", convert: "물방울 전환", tree_reward: "나무 보상", event: "이벤트" };

function pointLabel(t) {
  const ref = String(t.ref_id || "");
  if (t.type === "quiz" && ref.startsWith("bonus-")) return "퀴즈 모두 정답 보너스";
  if (t.type === "event" && ref.startsWith("rank-")) return "이달의 적립왕 보상";
  return POINT_LABELS[t.type] || "포인트 적립";
}

/** 10월 22일 14:30 (한국 시간) */
function whenKst(iso) {
  return new Intl.DateTimeFormat("ko-KR", { timeZone: "Asia/Seoul", month: "long", day: "numeric", hour: "2-digit", minute: "2-digit", hour12: false }).format(new Date(iso));
}

/** 최근 받은 포인트 한 줄 — 실제 통장(GET /points/history). 잔액이 바뀌면(퀴즈 정답 등) 다시 불러옴. 누르면 포인트 내역 */
function RecentPointRow() {
  const { loggedIn, points } = useEvents();
  const [recent, setRecent] = useState({ status: "loading", item: null });

  useEffect(() => {
    if (!loggedIn) return;
    let alive = true;
    fetchRecentPointEarned()
      .then((item) => alive && setRecent({ status: "ok", item }))
      .catch(() => alive && setRecent((r) => ({ status: r.item ? "ok" : "error", item: r.item })));
    return () => { alive = false; };
  }, [loggedIn, points]);

  if (!loggedIn) {
    return (
      <Link to="/login" className="ev-missionRow">
        <span className="ev-rankText"><span className="ev-missionName">최근 받은 포인트</span><span className="ev-muted2">로그인하면 내가 받은 포인트가 보여요</span></span>
        <Chevron />
      </Link>
    );
  }
  const { status, item } = recent;
  const sub = status === "loading" ? "불러오는 중이에요…" : status === "error" ? "내역을 불러오지 못했어요" : item ? `${pointLabel(item)} · ${whenKst(item.created_at)}` : "아직 받은 포인트가 없어요. 퀴즈부터 풀어 볼까요?";
  return (
    <Link to="/points" className="ev-missionRow" aria-label={item ? `최근 받은 포인트: ${sub}, ${item.amount}포인트. 포인트 내역 보기` : `최근 받은 포인트: ${sub}`}>
      <span className="ev-rankText"><span className="ev-missionName">최근 받은 포인트</span><span className="ev-muted2">{sub}</span></span>
      {item ? <b className="ev-gold">+{item.amount.toLocaleString("ko-KR")}P</b> : <Chevron />}
    </Link>
  );
}

export function MissionRows() {
  return (
    <div className="ev-missionList">
      <RecentPointRow />
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
