import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../../lib/AuthContext";
import { fetchMyFriends } from "../api";
import inviteHero from "../assets/invite-hero.jpg";
import { Back, Coin, Tree } from "../components/Icons";
import { useToast } from "../components/Toast";
import { DROPS_PER_FRIEND, GOAL_FRIENDS, GOAL_REWARD, INVITE_STEPS } from "../data";

// 내 초대 코드·친구 수는 서버(GET /api/v1/friends/me)에서. 로그인 안 했으면 서버를 부르지 않고 로그인 안내.
const FRIEND_PREVIEW = 5; // "초대한 친구"에 이름을 보여 줄 최근 친구 수

/** "2026.10.20" (한국 날짜) */
const dateText = (iso) => new Date(new Date(iso).getTime() + 9 * 3600 * 1000).toISOString().slice(0, 10).replaceAll("-", ".");

/** 진행중인 이벤트 상세: 친구 초대 미션 (v4.5 실사 시안 "친구 초대") */
export default function InvitePage() {
  const [toast, say] = useToast();
  const { user, loading: authLoading } = useAuth();
  const [mine, setMine] = useState({ status: "idle", data: null, error: "" });

  useEffect(() => {
    if (authLoading) return undefined;
    if (!user) { setMine({ status: "idle", data: null, error: "" }); return undefined; }
    let alive = true;
    setMine((m) => ({ ...m, status: "loading" }));
    fetchMyFriends()
      .then((data) => alive && setMine({ status: "ready", data, error: "" }))
      .catch((e) => alive && setMine({ status: "error", data: null, error: e.message }));
    return () => { alive = false; };
  }, [authLoading, user]);

  const d = mine.data;
  const code = d?.invite_code ?? "";
  const invited = d?.friend_count ?? 0;
  const progress = d?.progress ?? 0; // 다음 보상까지 모은 친구 수 (5명마다 보상 후 0명부터 다시)
  const signupLink = `${window.location.origin}/signup?invite=${code}`;
  const texts = {
    "초대 코드": code,
    "초대 메시지": `RePick에서 같이 분리배출하고 나무 키워요 🌱\n가입할 때 내 초대 코드 ${code} 를 입력해 주세요!\n${signupLink}`,
    "초대 링크": signupLink,
  };

  const copy = async (what) => {
    if (!code) return;
    try { await navigator.clipboard.writeText(texts[what]); say(`${what}을(를) 복사했어요`); }
    catch { say("복사하지 못했어요. 코드를 길게 눌러 직접 복사해 주세요"); }
  };

  return (
    <div className="ev">
      <div className="ev-wrap">
        <Link to="/events" className="ev-back"><Back />이벤트 · 챌린지</Link>
        <h1 className="ev-title">친구 초대</h1>

        <section className="ev-hero" aria-labelledby="ev-hero-title">
          <span className="ev-tag">친구 초대 미션</span>
          <h2 id="ev-hero-title" className="ev-heroTitle">함께하면 더<br />아름다운 지구가 돼요!</h2>
          <p className="ev-heroSub">친구가 내 초대 코드로 가입하면 1명당 <b>물방울 {DROPS_PER_FRIEND}개</b>,<br />친구 {GOAL_FRIENDS}명 모일 때마다 <b>{GOAL_REWARD}P</b>를 드려요.</p>
          <div className="ev-codeBox">
            <div className="ev-muted2">내 초대 코드</div>
            <div className="ev-codeRow">
              {!user && !authLoading ? (
                <Link to="/login" state={{ from: "/events/invite" }} className="ev-darkBtn">로그인하고 내 코드 보기</Link>
              ) : (
                <>
                  <b className="ev-code">{code || (mine.status === "error" ? "—" : "불러오는 중…")}</b>
                  <button type="button" className="ev-darkBtn" onClick={() => copy("초대 코드")} disabled={!code}>복사</button>
                </>
              )}
            </div>
            {mine.status === "error" && <div className="ev-muted2" role="alert">{mine.error}</div>}
          </div>
          <div className="ev-share">
            <button type="button" onClick={() => copy("초대 메시지")} disabled={!code}>메시지로 초대</button>
            <button type="button" onClick={() => copy("초대 링크")} disabled={!code}>링크 복사</button>
            <button type="button" onClick={() => say("QR 코드는 앱에서 보여 드릴 예정이에요")}>QR 보여주기</button>
          </div>
          <span className="ev-heroImg"><img src={inviteHero} alt="흙과 새싹을 든 손 사진" /></span>
        </section>

        <div className="ev-grid2 ev-gapTop">
          <section className="ev-card" aria-labelledby="ev-status">
            <div className="ev-cardHead"><h2 id="ev-status">내 초대 현황</h2><span className="ev-muted2">전체</span></div>
            <div className="ev-stats">
              <div><div className="ev-muted2">초대한 친구</div><b className="ev-statNum">{user ? `${invited}명` : "-"}</b></div>
              <div><div className="ev-muted2">받은 물방울</div><b className="ev-statNum">{user ? `${d?.earned_drops ?? 0}개` : "-"}</b></div>
            </div>
            <div className="ev-goalLine">{GOAL_FRIENDS}명 모일 때마다 {GOAL_REWARD}P{d?.bonus_count ? ` · 지금까지 ${d.bonus_count}번 받았어요` : ""}</div>
            <ol className="ev-slots" aria-label={`${GOAL_FRIENDS}명 중 ${progress}명 모음`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className={i < progress ? "ev-slotOn" : i === 4 ? "ev-slotGift" : "ev-slotEmpty"}>
                  {i < progress ? <Tree stage="sapling" size={30} /> : i === 4 ? (
                    <Coin size={26} />
                  ) : <span aria-hidden="true">+</span>}
                </li>
              ))}
            </ol>
            <p className="ev-note">{GOAL_FRIENDS}번째 친구가 가입하면 {GOAL_REWARD}P가 들어오고, 다시 0명부터 모아요.</p>
            {d?.friends?.length > 0 && (
              <p className="ev-note">
                최근 함께한 친구: {d.friends.slice(0, FRIEND_PREVIEW).map((f) => `${f.nickname}(${dateText(f.joined_at)})`).join(" · ")}
                {d.friends.length > FRIEND_PREVIEW ? ` 외 ${invited - FRIEND_PREVIEW}명` : ""}
              </p>
            )}
            {d?.referrer_nickname && <p className="ev-note">나는 <b>{d.referrer_nickname}</b>님의 초대로 함께하고 있어요 🌱</p>}
          </section>

          <section className="ev-card" aria-labelledby="ev-how">
            <div className="ev-cardHead"><h2 id="ev-how">이렇게 참여해요</h2></div>
            <ol className="ev-steps">
              {INVITE_STEPS.map(([t, desc], i) => (
                <li key={t}><span className="ev-stepNo">{i + 1}</span><span className="ev-rankText"><b>{t}</b><span className="ev-muted2">{desc}</span></span></li>
              ))}
            </ol>
            <div className="ev-caution">
              <b>유의사항</b>
              <ul>
                <li>이미 가입한 친구는 초대할 수 없어요.</li>
                <li>부정한 방법으로 받은 보상은 회수될 수 있어요.</li>
              </ul>
            </div>
          </section>
        </div>
      </div>
      {toast}
    </div>
  );
}
