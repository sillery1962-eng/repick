import { Link } from "react-router-dom";
import inviteHero from "../assets/invite-hero.jpg";
import { Back, Coin, Tree } from "../components/Icons";
import { useToast } from "../components/Toast";
import { DROPS_PER_FRIEND, GOAL_FRIENDS, GOAL_REWARD, INVITE_STEPS } from "../data";

// 시안 값. API(GET /api/v1/friends/me)가 연결되면 내 8자리 코드와 친구 수로 바뀝니다.
const INVITE_CODE = "3FA9C21B";
const INVITED = 2;

/** 진행중인 이벤트 상세: 친구 초대 미션 (v4.5 실사 시안 "친구 초대") */
export default function InvitePage() {
  const [toast, say] = useToast();

  const copy = async (what) => {
    try { await navigator.clipboard.writeText(INVITE_CODE); say(`${what}을(를) 복사했어요`); }
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
          <p className="ev-heroSub">친구가 내 초대 코드로 가입하면 1명당 <b>물방울 {DROPS_PER_FRIEND}개</b>,<br />친구 {GOAL_FRIENDS}명을 모으면 <b>{GOAL_REWARD}P</b>를 드려요.</p>
          <div className="ev-codeBox">
            <div className="ev-muted2">내 초대 코드</div>
            <div className="ev-codeRow">
              <b className="ev-code">{INVITE_CODE}</b>
              <button type="button" className="ev-darkBtn" onClick={() => copy("초대 코드")}>복사</button>
            </div>
          </div>
          <div className="ev-share">
            <button type="button" onClick={() => copy("초대 메시지")}>메시지로 초대</button>
            <button type="button" onClick={() => copy("초대 링크")}>링크 복사</button>
            <button type="button" onClick={() => say("QR 코드는 앱에서 보여 드릴 예정이에요")}>QR 보여주기</button>
          </div>
          <span className="ev-heroImg"><img src={inviteHero} alt="흙과 새싹을 든 손 사진" /></span>
        </section>

        <div className="ev-grid2 ev-gapTop">
          <section className="ev-card" aria-labelledby="ev-status">
            <div className="ev-cardHead"><h2 id="ev-status">내 초대 현황</h2><span className="ev-muted2">이번 달</span></div>
            <div className="ev-stats">
              <div><div className="ev-muted2">초대한 친구</div><b className="ev-statNum">{INVITED}명</b></div>
              <div><div className="ev-muted2">받은 물방울</div><b className="ev-statNum">{INVITED * DROPS_PER_FRIEND}개</b></div>
            </div>
            <div className="ev-goalLine">{GOAL_FRIENDS}명 초대하면 {GOAL_REWARD}P</div>
            <ol className="ev-slots" aria-label={`${GOAL_FRIENDS}명 중 ${INVITED}명 초대`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className={i < INVITED ? "ev-slotOn" : i === 4 ? "ev-slotGift" : "ev-slotEmpty"}>
                  {i < INVITED ? <Tree stage="sapling" size={30} /> : i === 4 ? (
                    <Coin size={26} />
                  ) : <span aria-hidden="true">+</span>}
                </li>
              ))}
            </ol>
            <p className="ev-note">{GOAL_FRIENDS}번째 친구가 가입하면 {GOAL_REWARD}P가 한 번에 들어와요.</p>
          </section>

          <section className="ev-card" aria-labelledby="ev-how">
            <div className="ev-cardHead"><h2 id="ev-how">이렇게 참여해요</h2></div>
            <ol className="ev-steps">
              {INVITE_STEPS.map(([t, d], i) => (
                <li key={t}><span className="ev-stepNo">{i + 1}</span><span className="ev-rankText"><b>{t}</b><span className="ev-muted2">{d}</span></span></li>
              ))}
            </ol>
            <div className="ev-caution">
              <b>유의사항</b>
              <ul>
                <li>초대 보상은 한 달에 최대 [N]명까지 받을 수 있어요.</li>
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
