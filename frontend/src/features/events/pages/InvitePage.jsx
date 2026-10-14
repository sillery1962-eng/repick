import { Link } from "react-router-dom";
import inviteHero from "../assets/invite-hero.jpg";
import { Back, Tree } from "../components/Icons";
import { useToast } from "../components/Toast";
import { INVITE_STEPS } from "../data";

const INVITE_CODE = "[초대코드]";
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
          <p className="ev-heroSub">친구가 내 초대 코드로 가입하면 둘 다 <b>[N]P</b>,<br />친구 5명을 모으면 <b>식물영양제</b>를 드려요.</p>
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
              <div><div className="ev-muted2">받은 포인트</div><b className="ev-statNum ev-goldText">[N]P</b></div>
            </div>
            <div className="ev-goalLine">5명 초대하면 식물영양제 1개</div>
            <ol className="ev-slots" aria-label={`5명 중 ${INVITED}명 초대`}>
              {[0, 1, 2, 3, 4].map((i) => (
                <li key={i} className={i < INVITED ? "ev-slotOn" : i === 4 ? "ev-slotGift" : "ev-slotEmpty"}>
                  {i < INVITED ? <Tree stage="sapling" size={30} /> : i === 4 ? (
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <rect x="9" y="2.5" width="6" height="3" rx="1" fill="#7E4FD0" />
                      <path d="M8.5 6h7l1 3.5V19a2.5 2.5 0 0 1-2.5 2.5h-4A2.5 2.5 0 0 1 7.5 19V9.5z" fill="#B48CF0" />
                      <path d="M10 13h4M12 11v4" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" />
                    </svg>
                  ) : <span aria-hidden="true">+</span>}
                </li>
              ))}
            </ol>
            <p className="ev-note">영양제를 쓰면 나무가 바로 다음 단계로 자라요.</p>
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
