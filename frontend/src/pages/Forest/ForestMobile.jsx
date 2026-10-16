/* 자동 변환: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45pm_Forest.dc.html
   화면 모양은 시안 그대로입니다. 문구·데이터를 바꿀 때는 아래 JSX와 Component.renderVals()를 고치세요. */
import { Link } from 'react-router-dom'
import { Fragment } from 'react'
import { DCLogic, useDcLogic, css } from '../../lib/dc'

// 시안의 화면 로직 (상태·버튼 동작). renderVals()가 돌려준 값을 V.이름 으로 씁니다.
// eslint-disable-next-line
class Component extends DCLogic {
constructor(props) {
super(props);
const S = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']; const NEED = [5, 10, 15, 20, 30, 40];
let st = S.indexOf(props.startStage ?? '묘목'); if (st < 0) st = 3;
this.state = { stage: st, progress: st < 6 ? Math.floor(NEED[st] * 0.4) : 0, drops: 12, nutrients: 1, attended: false,
  harvested: [{ fruit: 0, date: '2026.08.14' }], modal: false, fruit: 0, toast: '', splash: false, splashN: 1 };
}
componentWillUnmount() { clearTimeout(this.t1); clearTimeout(this.t2); }
say(msg) { clearTimeout(this.t1); this.setState({ toast: msg }); this.t1 = setTimeout(() => this.setState({ toast: '' }), 2000); }
give(n) {
const S = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']; const NEED = [5, 10, 15, 20, 30, 40];
let { stage, progress, drops } = this.state; if (stage >= 6 || drops <= 0) return;
const use = Math.min(n, drops); drops -= use; progress += use; const before = stage;
while (stage < 6 && progress >= NEED[stage]) { progress -= NEED[stage]; stage++; }
if (stage === 6) progress = 0;
clearTimeout(this.t2); this.setState({ stage, progress, drops, splash: true, splashN: use }); this.t2 = setTimeout(() => this.setState({ splash: false }), 900);
if (stage > before) this.say('‘' + S[stage] + '’ 단계로 자랐어요!');
}
renderVals() {
const S = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']; const NEED = [5, 10, 15, 20, 30, 40];
const { stage, progress, drops, nutrients, attended, harvested, modal, fruit, toast, splash, splashN } = this.state;
const FR = ['사과나무', '배나무', '감나무'];
const o = {}; for (let k = 0; k < 7; k++) o['t' + k] = stage === k;
const track = S.map((name, i) => { const s = { name }; for (let k = 0; k < 7; k++) s['k' + k] = i === k;
  s.ring = 'width: ' + 44 + 'px; height: ' + 44 + 'px; border-radius: 50%; display: flex; align-items: center; justify-content: center; ' + (i === stage ? 'background: #FFFFFF; box-shadow: 0 0 0 3px #121614;' : i < stage ? 'background: rgba(255,255,255,0.7);' : 'background: rgba(255,255,255,0.35); opacity: 0.45;');
  s.label = 'font-size: 11px; text-align: center; ' + (i === stage ? 'font-weight: 800;' : 'color: #5E645F;'); return s; });
const need = stage < 6 ? NEED[stage] : 0;
const days = ['월','화','수','목','금','토','일'].map((label, i) => { const on = i < 2 || (i === 2 && attended);
  return { label, on, ring: 'width: 34px; height: 34px; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-sizing: border-box; ' + (on ? 'background: #FFFFFF;' : i === 2 ? 'border: 2px solid #CDEB45;' : 'border: 1.5px dashed rgba(255,255,255,0.4);') }; });
const fo = {}; for (let k = 0; k < 3; k++) fo['f' + k] = fruit === k;
return { ...o, ...fo, track, days, drops, nutrients, splash, splashN, modal,
  stageNum: stage + 1, stageName: S[stage],
  caption: stage < 6 ? '물방울을 주면 쑥쑥 자라요' : '열매가 주렁주렁! 수확할 때가 됐어요',
  pct: stage < 6 ? Math.round(progress / need * 100) + '%' : '100%',
  nextLine: stage < 6 ? '다음 단계 ‘' + S[stage + 1] + '’까지 ' + progress + ' / ' + need + ' (물방울 ' + (need - progress) + '개 더)' : '7단계 완성! 수확하면 랜덤 과일나무가 열려요',
  growing: stage < 6, canHarvest: stage === 6,
  attended, notAttended: !attended,
  harvested: harvested.map((h) => ({ name: FR[h.fruit], date: h.date, f0: h.fruit === 0, f1: h.fruit === 1, f2: h.fruit === 2 })),
  harvestCount: harvested.length, fruitName: FR[fruit], hasToast: !!toast, toast,
  onWater: () => this.give(1), onWaterAll: () => this.give(this.state.drops),
  onNutrient: () => { if (nutrients <= 0) { this.say('영양제가 없어요. 친구를 초대해 보세요'); return; } this.setState({ nutrients: nutrients - 1, stage: stage + 1, progress: 0 }); this.say('영양제 효과! ‘' + S[stage + 1] + '’ 단계로 자랐어요'); },
  onAttend: () => { if (attended) return; this.setState({ attended: true, drops: drops + 1 }); this.say('출석 완료! 물방울 1개를 받았어요'); },
  onHarvest: () => { const f = Math.floor(Math.random() * 3); this.setState({ fruit: f, modal: true, harvested: [...harvested, { fruit: f, date: '2026.10.07' }] }); },
  onRestart: () => this.setState({ modal: false, stage: 0, progress: 0 })
};
}
}

export default function ForestMobile() {
  const V = useDcLogic(Component)
  return (
    <div style={{ boxSizing: "border-box", position: "relative", background: "#F7F8F4", color: "#121614", fontFamily: "var(--font-base)", letterSpacing: "-0.3px", width: "100%", maxWidth: "560px", margin: "0 auto", minHeight: "100%" }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 20px 8px" }}>
        <Link to="/" style={{ display: "flex", alignItems: "center", gap: "2px" }}>
          <span style={{ fontSize: "24px", fontWeight: "800", letterSpacing: "-0.5px", display: "inline-flex", alignItems: "baseline" }} aria-label="RePick">
            Rep
            <svg viewBox="0 0 20 44" aria-hidden="true" style={{ height: "1.1em", width: "0.5em", margin: "0 -0.04em", overflow: "visible" }}>
              <path d="M10 24V12" stroke="#1F5C3F" strokeWidth="2" strokeLinecap="round" />
              <path d="M10 16.5C10 10.8 6.4 7.2 1 7.2c0 5.5 3.6 9.3 9 9.3z" fill="#CDEB45" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
              <path d="M10 13.6C10 7.9 13.4 4.4 19 4.4c0 5.6-3.4 9.2-9 9.2z" fill="#9BD37A" stroke="#1F5C3F" strokeWidth="1.5" strokeLinejoin="round" />
              <rect x="7.4" y="22.4" width="5.2" height="21.6" rx="1.4" fill="currentColor" />
            </svg>
            ck
          </span>
        </Link>
        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
          <Link to="/forest" title="물방울" style={{ height: "34px", padding: "0 10px 0 6px", borderRadius: "999px", background: "#E3F1FC", display: "flex", alignItems: "center", gap: "4px", fontSize: "14px", fontWeight: "800", color: "#17507F" }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
              <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
            </svg>
            12
          </Link>
          <Link to="/points" title="포인트" style={{ height: "34px", padding: "0 10px 0 5px", borderRadius: "999px", background: "#F2F3EE", display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", fontWeight: "800" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>
              P
            </span>
            6,170
          </Link>
          <Link to="/mypage" aria-label="마이페이지" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
              <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
              <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
              <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
              <path d="M60 22l22 30H38z" fill="#3FA35A" />
              <path d="M60 38l27 34H33z" fill="#2E8B4E" />
            </svg>
          </Link>
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <div style={{ position: "relative", borderRadius: "24px", background: "linear-gradient(180deg, #DDF0FB 0%, #EEF7E6 70%, #F6EEDB 100%)", padding: "20px", boxSizing: "border-box", overflow: "hidden" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ height: "32px", padding: "0 14px", borderRadius: "999px", background: "#121614", color: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center" }}>
              {V.stageNum}{" / 7단계 · "}{V.stageName}
            </span>
            <span style={{ height: "32px", padding: "0 12px 0 8px", borderRadius: "999px", background: "rgba(255,255,255,0.8)", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "4px" }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="8" y="2" width="8" height="4" rx="1.2" fill="#7A4FC9" />
                <path d="M9 6h6v3l3 4v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7l3-4z" fill="#B48CF0" />
                <path d="M12 18v-4M12 15c0-1.8 1.3-2.8 3-2.8 0 1.8-1.3 2.8-3 2.8zM12 16c0-1.5-1.1-2.4-2.6-2.4 0 1.5 1.1 2.4 2.6 2.4z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              {"영양제 "}{V.nutrients}개
            </span>
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative", marginTop: "8px" }}>
            {V.t0 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <path d="M60 106V90" stroke="#3E8E45" strokeWidth="3.5" strokeLinecap="round" />
                  <path d="M60 94c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
                  <path d="M60 92c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
                </svg>
              </>
            ) : null}
            {V.t1 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <path d="M60 106V78" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                  <ellipse cx="46" cy="76" rx="15" ry="8.5" transform="rotate(-24 46 76)" fill="#6CC25F" />
                  <ellipse cx="74" cy="74" rx="15" ry="8.5" transform="rotate(24 74 74)" fill="#4EAE52" />
                </svg>
              </>
            ) : null}
            {V.t2 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <path d="M60 106V52" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                  <path d="M60 92c0-9-7-14-16-14 0 9 7 14 16 14z" fill="#6CC25F" />
                  <path d="M60 80c0-9 7-14 16-14 0 9-7 14-16 14z" fill="#4EAE52" />
                  <path d="M60 68c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
                  <path d="M60 58c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
                </svg>
              </>
            ) : null}
            {V.t3 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                  <path d="M60 22l22 30H38z" fill="#3FA35A" />
                  <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                </svg>
              </>
            ) : null}
            {V.t4 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="56.5" y="70" width="7" height="36" rx="2.5" fill="#8A5A3C" />
                  <circle cx="60" cy="58" r="20" fill="#3FA35A" />
                  <circle cx="44" cy="68" r="12" fill="#3FA35A" />
                  <circle cx="76" cy="68" r="12" fill="#3FA35A" />
                  <circle cx="54" cy="52" r="7" fill="#5DB85A" />
                </svg>
              </>
            ) : null}
            {V.t5 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                  <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                  <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                  <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                  <circle cx="52" cy="36" r="10" fill="#45A862" />
                </svg>
              </>
            ) : null}
            {V.t6 ? (
              <>
                <svg width="240" height="240" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                  <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                  <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                  <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                  <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                  <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                  <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                  <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                  <circle cx="52" cy="36" r="10" fill="#45A862" />
                  <circle cx="46" cy="44" r="5" fill="#FFFFFF" />
                  <circle cx="70" cy="34" r="5" fill="#FFFFFF" />
                  <circle cx="64" cy="58" r="5" fill="#FFFFFF" />
                  <circle cx="36" cy="62" r="5" fill="#FFFFFF" />
                  <circle cx="84" cy="56" r="5" fill="#FFFFFF" />
                  <circle cx="56" cy="24" r="5" fill="#FFFFFF" />
                  <circle cx="46" cy="44" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                  <circle cx="70" cy="34" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                  <circle cx="64" cy="58" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                  <circle cx="36" cy="62" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                  <circle cx="84" cy="56" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                  <circle cx="56" cy="24" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                </svg>
              </>
            ) : null}
            {V.splash ? (
              <>
                <span style={{ position: "absolute", left: "50%", top: "30%", marginLeft: "-40px", width: "80px", display: "flex", justifyContent: "center", alignItems: "center", gap: "2px", fontSize: "22px", fontWeight: "800", color: "#17507F", animation: "rpRise 0.9s ease forwards" }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  +{V.splashN}
                </span>
              </>
            ) : null}
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", textAlign: "center", marginTop: "4px" }}>
            [이름]님의 나무
          </div>
          <div style={{ fontSize: "14px", color: "#454B47", textAlign: "center", marginTop: "4px" }}>
            {V.caption}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "4px", marginTop: "20px" }}>
            {(V.track || []).map((s, $index) => (
              <Fragment key={$index}>
                <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                  <span style={css(s.ring)}>
                    {s.k0 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <path d="M60 106V90" stroke="#3E8E45" strokeWidth="3.5" strokeLinecap="round" />
                          <path d="M60 94c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
                          <path d="M60 92c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
                        </svg>
                      </>
                    ) : null}
                    {s.k1 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <path d="M60 106V78" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                          <ellipse cx="46" cy="76" rx="15" ry="8.5" transform="rotate(-24 46 76)" fill="#6CC25F" />
                          <ellipse cx="74" cy="74" rx="15" ry="8.5" transform="rotate(24 74 74)" fill="#4EAE52" />
                        </svg>
                      </>
                    ) : null}
                    {s.k2 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <path d="M60 106V52" stroke="#3E8E45" strokeWidth="4" strokeLinecap="round" />
                          <path d="M60 92c0-9-7-14-16-14 0 9 7 14 16 14z" fill="#6CC25F" />
                          <path d="M60 80c0-9 7-14 16-14 0 9-7 14-16 14z" fill="#4EAE52" />
                          <path d="M60 68c0-8-6-12-14-12 0 8 6 12 14 12z" fill="#6CC25F" />
                          <path d="M60 58c0-7 5-11 12-11 0 7-5 11-12 11z" fill="#4EAE52" />
                        </svg>
                      </>
                    ) : null}
                    {s.k3 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="57" y="66" width="6" height="40" rx="2" fill="#8A5A3C" />
                          <path d="M60 22l22 30H38z" fill="#3FA35A" />
                          <path d="M60 38l27 34H33z" fill="#2E8B4E" />
                        </svg>
                      </>
                    ) : null}
                    {s.k4 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="56.5" y="70" width="7" height="36" rx="2.5" fill="#8A5A3C" />
                          <circle cx="60" cy="58" r="20" fill="#3FA35A" />
                          <circle cx="44" cy="68" r="12" fill="#3FA35A" />
                          <circle cx="76" cy="68" r="12" fill="#3FA35A" />
                          <circle cx="54" cy="52" r="7" fill="#5DB85A" />
                        </svg>
                      </>
                    ) : null}
                    {s.k5 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                          <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                          <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="52" cy="36" r="10" fill="#45A862" />
                        </svg>
                      </>
                    ) : null}
                    {s.k6 ? (
                      <>
                        <svg width="34" height="34" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                          <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                          <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="52" cy="36" r="10" fill="#45A862" />
                          <circle cx="46" cy="44" r="5" fill="#FFFFFF" />
                          <circle cx="70" cy="34" r="5" fill="#FFFFFF" />
                          <circle cx="64" cy="58" r="5" fill="#FFFFFF" />
                          <circle cx="36" cy="62" r="5" fill="#FFFFFF" />
                          <circle cx="84" cy="56" r="5" fill="#FFFFFF" />
                          <circle cx="56" cy="24" r="5" fill="#FFFFFF" />
                          <circle cx="46" cy="44" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                          <circle cx="70" cy="34" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                          <circle cx="64" cy="58" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                          <circle cx="36" cy="62" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                          <circle cx="84" cy="56" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                          <circle cx="56" cy="24" r="5" fill="none" stroke="#F5C33B" strokeWidth="1.5" />
                        </svg>
                      </>
                    ) : null}
                  </span>
                  <span style={css(s.label)}>
                    {s.name}
                  </span>
                </div>
              </Fragment>
            ))}
          </div>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: "14px", marginTop: "14px" }}>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                물 주기
              </span>
              <span style={{ fontSize: "13px", color: "#454B47" }}>
                물방울 1개 = 성장 1칸
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "14px" }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              <span style={{ fontSize: "36px", fontWeight: "800", color: "#17507F" }}>
                {V.drops}
              </span>
              <span style={{ fontSize: "16px", fontWeight: "700", color: "#454B47", marginTop: "8px" }}>
                개 보유
              </span>
            </div>
            <div style={{ height: "12px", borderRadius: "999px", background: "#EEF0EA", marginTop: "16px", overflow: "hidden" }}>
              <div style={css(`height: 100%; border-radius: 999px; background: #3E9BEA; width: ${V.pct}; transition: width .4s`)} />
            </div>
            <div style={{ fontSize: "13px", color: "#454B47", marginTop: "8px" }}>
              {V.nextLine}
            </div>
            {V.growing ? (
              <>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "16px" }}>
                  <button onClick={V.onWater} style={{ height: "54px", borderRadius: "16px", border: "none", background: "#3E9BEA", color: "#FFFFFF", fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#FFFFFF" />
                      <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                    </svg>
                    물 주기
                  </button>
                  <button onClick={V.onWaterAll} style={{ height: "54px", borderRadius: "16px", border: "1.5px solid #3E9BEA", background: "#FFFFFF", color: "#17507F", fontSize: "15px", fontWeight: "800" }}>
                    한 번에 다 주기
                  </button>
                </div>
                <button onClick={V.onNutrient} style={{ marginTop: "8px", width: "100%", height: "50px", borderRadius: "16px", border: "none", background: "#F1E8FD", color: "#5B34A8", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="8" y="2" width="8" height="4" rx="1.2" fill="#7A4FC9" />
                    <path d="M9 6h6v3l3 4v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7l3-4z" fill="#B48CF0" />
                    <path d="M12 18v-4M12 15c0-1.8 1.3-2.8 3-2.8 0 1.8-1.3 2.8-3 2.8zM12 16c0-1.5-1.1-2.4-2.6-2.4 0 1.5 1.1 2.4 2.6 2.4z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  식물영양제 쓰기 · 바로 다음 단계로 ({V.nutrients}개)
                </button>
              </>
            ) : null}
            {V.canHarvest ? (
              <>
                <button onClick={V.onHarvest} style={{ marginTop: "16px", width: "100%", height: "60px", borderRadius: "18px", border: "none", background: "#CDEB45", color: "#121614", fontSize: "17px", fontWeight: "800", boxShadow: "0 0 0 3px #121614" }}>
                  열매 수확하기 · 어떤 나무일까요?
                </button>
              </>
            ) : null}
          </div>
          <div id="attend" style={{ background: "#1F5C3F", borderRadius: "22px", padding: "20px", boxSizing: "border-box", color: "#FFFFFF" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontSize: "18px", fontWeight: "800" }}>
                매일 출석체크
              </span>
              <span style={{ fontSize: "12px", color: "#D7EBDD" }}>
                하루 1번 · 물방울 +1
              </span>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "6px", marginTop: "14px" }}>
              {(V.days || []).map((d, $index) => (
                <Fragment key={$index}>
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "6px" }}>
                    <span style={css(d.ring)}>
                      {d.on ? (
                        <>
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                            <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                            <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                          </svg>
                        </>
                      ) : null}
                    </span>
                    <span style={{ fontSize: "11px", color: "#D7EBDD" }}>
                      {d.label}
                    </span>
                  </div>
                </Fragment>
              ))}
            </div>
            {V.notAttended ? (
              <>
                <button onClick={V.onAttend} style={{ marginTop: "16px", width: "100%", height: "52px", borderRadius: "16px", border: "none", background: "#CDEB45", color: "#121614", fontSize: "16px", fontWeight: "800" }}>
                  오늘 출석하고 물방울 받기
                </button>
              </>
            ) : null}
            {V.attended ? (
              <>
                <div style={{ marginTop: "16px", height: "52px", borderRadius: "16px", background: "rgba(255,255,255,0.12)", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  오늘 출석 완료 · 내일 또 만나요
                </div>
              </>
            ) : null}
          </div>
          <Link to="/events/invite" style={{ background: "#F1E8FD", borderRadius: "22px", padding: "20px", boxSizing: "border-box", display: "flex", alignItems: "center", gap: "14px" }}>
            <span style={{ width: "56px", height: "56px", borderRadius: "18px", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
              <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <rect x="8" y="2" width="8" height="4" rx="1.2" fill="#7A4FC9" />
                <path d="M9 6h6v3l3 4v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7l3-4z" fill="#B48CF0" />
                <path d="M12 18v-4M12 15c0-1.8 1.3-2.8 3-2.8 0 1.8-1.3 2.8-3 2.8zM12 16c0-1.5-1.1-2.4-2.6-2.4 0 1.5 1.1 2.4 2.6 2.4z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "6px" }}>
              <span style={{ fontSize: "16px", fontWeight: "800" }}>
                친구 5명 초대하면 식물영양제
              </span>
              <span style={{ height: "8px", borderRadius: "999px", background: "#FFFFFF", overflow: "hidden" }}>
                <span style={{ display: "block", height: "100%", width: "40%", background: "#7A4FC9", borderRadius: "999px" }} />
              </span>
              <span style={{ fontSize: "12px", color: "#5B34A8", fontWeight: "700" }}>
                2 / 5명 초대 완료
              </span>
            </span>
            <span style={{ fontSize: "20px", color: "#5B34A8" }}>
              ›
            </span>
          </Link>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                물방울 모으는 방법
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              <Link to="/scan" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "18px", background: "#F7F8F4" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#E3F1FC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    폐기물 사진 등록 (AI 인식)
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    사진 한 장이면 끝
                  </span>
                </span>
                <span style={{ height: "30px", padding: "0 10px", borderRadius: "999px", background: "#E3F1FC", color: "#17507F", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  +1
                </span>
              </Link>
              <Link to="/community" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "18px", background: "#F7F8F4" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#E3F1FC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    실천 인증 사진 게시
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    실제로 버리는 모습을 올려요
                  </span>
                </span>
                <span style={{ height: "30px", padding: "0 10px", borderRadius: "999px", background: "#E3F1FC", color: "#17507F", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  +5
                </span>
              </Link>
              <a href="#attend" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "18px", background: "#F7F8F4" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#E3F1FC", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    매일 출석체크
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    하루 한 번 버튼 누르기
                  </span>
                </span>
                <span style={{ height: "30px", padding: "0 10px", borderRadius: "999px", background: "#E3F1FC", color: "#17507F", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px" }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#3E9BEA" />
                    <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                  </svg>
                  +1
                </span>
              </a>
              <Link to="/events/invite" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "14px", borderRadius: "18px", background: "#F7F8F4" }}>
                <span style={{ width: "42px", height: "42px", borderRadius: "14px", background: "#F1E8FD", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                    <rect x="8" y="2" width="8" height="4" rx="1.2" fill="#7A4FC9" />
                    <path d="M9 6h6v3l3 4v7a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-7l3-4z" fill="#B48CF0" />
                    <path d="M12 18v-4M12 15c0-1.8 1.3-2.8 3-2.8 0 1.8-1.3 2.8-3 2.8zM12 16c0-1.5-1.1-2.4-2.6-2.4 0 1.5 1.1 2.4 2.6 2.4z" stroke="#FFFFFF" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                <span style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "15px", fontWeight: "700" }}>
                    친구 5명 초대
                  </span>
                  <span style={{ fontSize: "12px", color: "#454B47" }}>
                    누적 5명마다 지급
                  </span>
                </span>
                <span style={{ height: "30px", padding: "0 10px", borderRadius: "999px", background: "#F1E8FD", color: "#5B34A8", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center", gap: "3px" }}>
                  영양제
                </span>
              </Link>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                나의 과일나무
              </span>
              <span style={{ fontSize: "13px", color: "#454B47", whiteSpace: "nowrap" }}>
                {V.harvestCount}그루 수확
              </span>
            </div>
            <div style={{ fontSize: "13px", color: "#454B47", margin: "-8px 0 16px" }}>
              7단계를 다 키우면 사과·배·감나무 중 하나가 랜덤으로 열려요.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "10px" }}>
              {(V.harvested || []).map((h, $index) => (
                <Fragment key={$index}>
                  <div style={{ borderRadius: "18px", background: "#F7F8F4", padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    {h.f0 ? (
                      <>
                        <svg width="72" height="72" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                          <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                          <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="52" cy="36" r="10" fill="#45A862" />
                          <circle cx="46" cy="44" r="5" fill="#E2483D" />
                          <circle cx="70" cy="34" r="5" fill="#E2483D" />
                          <circle cx="64" cy="58" r="5" fill="#E2483D" />
                          <circle cx="36" cy="62" r="5" fill="#E2483D" />
                          <circle cx="84" cy="56" r="5" fill="#E2483D" />
                          <circle cx="56" cy="24" r="5" fill="#E2483D" />
                        </svg>
                      </>
                    ) : null}
                    {h.f1 ? (
                      <>
                        <svg width="72" height="72" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                          <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                          <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="52" cy="36" r="10" fill="#45A862" />
                          <circle cx="46" cy="44" r="5" fill="#E3CB5C" />
                          <circle cx="70" cy="34" r="5" fill="#E3CB5C" />
                          <circle cx="64" cy="58" r="5" fill="#E3CB5C" />
                          <circle cx="36" cy="62" r="5" fill="#E3CB5C" />
                          <circle cx="84" cy="56" r="5" fill="#E3CB5C" />
                          <circle cx="56" cy="24" r="5" fill="#E3CB5C" />
                        </svg>
                      </>
                    ) : null}
                    {h.f2 ? (
                      <>
                        <svg width="72" height="72" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                          <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                          <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                          <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                          <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                          <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                          <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                          <circle cx="52" cy="36" r="10" fill="#45A862" />
                          <circle cx="46" cy="44" r="5" fill="#F08A24" />
                          <circle cx="70" cy="34" r="5" fill="#F08A24" />
                          <circle cx="64" cy="58" r="5" fill="#F08A24" />
                          <circle cx="36" cy="62" r="5" fill="#F08A24" />
                          <circle cx="84" cy="56" r="5" fill="#F08A24" />
                          <circle cx="56" cy="24" r="5" fill="#F08A24" />
                        </svg>
                      </>
                    ) : null}
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>
                      {h.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6B716D" }}>
                      {h.date}
                    </span>
                  </div>
                </Fragment>
              ))}
              <div style={{ borderRadius: "18px", border: "1.5px dashed #C9CCC6", padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "126px", boxSizing: "border-box" }}>
                <span style={{ fontSize: "28px", fontWeight: "800", color: "#B9BDB8" }}>
                  ?
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  키우는 중
                </span>
              </div>
            </div>
          </div>
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "16px" }}>
              <span style={{ fontSize: "20px", fontWeight: "800" }}>
                최근 물방울 내역
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    AI 인식 · 투명 페트병
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    오늘 09:12
                  </span>
                </span>
                <b style={{ fontSize: "15px", color: "#17507F" }}>
                  +1
                </b>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    출석체크
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    어제 08:40
                  </span>
                </span>
                <b style={{ fontSize: "15px", color: "#17507F" }}>
                  +1
                </b>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    실천 인증 게시
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    10.05
                  </span>
                </span>
                <b style={{ fontSize: "15px", color: "#17507F" }}>
                  +5
                </b>
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "12px 0", borderBottom: "1px solid #F0F1EC" }}>
                <span style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    나무에 물 주기
                  </span>
                  <span style={{ fontSize: "12px", color: "#6B716D" }}>
                    10.05
                  </span>
                </span>
                <b style={{ fontSize: "15px", color: "#454B47" }}>
                  -6
                </b>
              </div>
            </div>
          </div>
        </div>
      </main>
      {V.modal ? (
        <>
          <div style={{ position: "fixed", inset: "0", background: "rgba(18,22,20,0.55)", zIndex: "10", display: "flex", justifyContent: "center", alignItems: "flex-start", paddingTop: "160px", animation: "rpFade .25s ease" }}>
            <div style={{ width: "340px", borderRadius: "30px", background: "#FFFFFF", padding: "28px 24px 22px", boxSizing: "border-box", textAlign: "center", animation: "rpPop .5s ease" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#1F5C3F" }}>
                수확 완료
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "6px", borderRadius: "24px", background: "linear-gradient(180deg, #DDF0FB, #EEF7E6)" }}>
                {V.f0 ? (
                  <>
                    <svg width="200" height="200" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                      <circle cx="46" cy="44" r="5" fill="#E2483D" />
                      <circle cx="70" cy="34" r="5" fill="#E2483D" />
                      <circle cx="64" cy="58" r="5" fill="#E2483D" />
                      <circle cx="36" cy="62" r="5" fill="#E2483D" />
                      <circle cx="84" cy="56" r="5" fill="#E2483D" />
                      <circle cx="56" cy="24" r="5" fill="#E2483D" />
                    </svg>
                  </>
                ) : null}
                {V.f1 ? (
                  <>
                    <svg width="200" height="200" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                      <circle cx="46" cy="44" r="5" fill="#E3CB5C" />
                      <circle cx="70" cy="34" r="5" fill="#E3CB5C" />
                      <circle cx="64" cy="58" r="5" fill="#E3CB5C" />
                      <circle cx="36" cy="62" r="5" fill="#E3CB5C" />
                      <circle cx="84" cy="56" r="5" fill="#E3CB5C" />
                      <circle cx="56" cy="24" r="5" fill="#E3CB5C" />
                    </svg>
                  </>
                ) : null}
                {V.f2 ? (
                  <>
                    <svg width="200" height="200" viewBox="0 0 120 120" fill="none" aria-hidden="true">
                      <ellipse cx="60" cy="108" rx="44" ry="7" fill="#E7DABC" />
                      <path d="M26 108c10-11 58-11 68 0z" fill="#C9AE7C" />
                      <rect x="55" y="62" width="10" height="44" rx="3" fill="#8A5A3C" />
                      <path d="M60 84l-12-10M60 78l12-9" stroke="#8A5A3C" strokeWidth="4" strokeLinecap="round" />
                      <circle cx="60" cy="44" r="26" fill="#2E8B4E" />
                      <circle cx="37" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="83" cy="58" r="17" fill="#2E8B4E" />
                      <circle cx="52" cy="36" r="10" fill="#45A862" />
                      <circle cx="46" cy="44" r="5" fill="#F08A24" />
                      <circle cx="70" cy="34" r="5" fill="#F08A24" />
                      <circle cx="64" cy="58" r="5" fill="#F08A24" />
                      <circle cx="36" cy="62" r="5" fill="#F08A24" />
                      <circle cx="84" cy="56" r="5" fill="#F08A24" />
                      <circle cx="56" cy="24" r="5" fill="#F08A24" />
                    </svg>
                  </>
                ) : null}
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "16px" }}>
                {V.fruitName}가 열렸어요!
              </div>
              <div style={{ fontSize: "14px", color: "#454B47", lineHeight: "1.5", marginTop: "8px" }}>
                랜덤으로 배정된 나만의 과일나무예요.
                <br />
                프로필에 걸고 커뮤니티에 자랑해 보세요.
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "20px" }}>
                <Link to="/community" style={{ height: "52px", borderRadius: "16px", background: "#121614", color: "#FFFFFF", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  커뮤니티에 자랑
                </Link>
                <Link to="/mypage" style={{ height: "52px", borderRadius: "16px", background: "#CDEB45", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  프로필에 걸기
                </Link>
              </div>
              <button onClick={V.onRestart} style={{ marginTop: "10px", width: "100%", height: "46px", border: "none", background: "transparent", fontSize: "14px", fontWeight: "700", color: "#454B47" }}>
                새 새싹 심기
              </button>
            </div>
          </div>
        </>
      ) : null}
      {V.hasToast ? (
        <>
          <div style={{ position: "fixed", left: "50%", bottom: "120px", marginLeft: "-200px", width: "400px", zIndex: "9", display: "flex", justifyContent: "center", animation: "rpToast 2s ease forwards" }}>
            <span style={{ padding: "14px 22px", borderRadius: "999px", background: "#121614", color: "#FFFFFF", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", gap: "8px" }}>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#7CC4FF" />
                <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
              </svg>
              {V.toast}
            </span>
          </div>
        </>
      ) : null}
    </div>
  )
}
