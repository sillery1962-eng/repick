// 2026-10-21: 나무선물 5칸·선물 아이콘·과일나무 확대·물방울 최대 적립 안내. DB 정책은 유지.
// 2026-10-21: 물방울 모으는 방법 삭제·모아 둔 나무 보상 영역을 해당 자리로 이동.
// 2026-10-21: 지난 성장 단계 2초 미리보기·물방울 적립 화면 바로가기. DB 변경 없음.
// 2026-10-20: 물주기 성공 후 나무 위에 약 2초간 비를 표시합니다. DB 변경 없음.
// 2026-10-20: 성장·수확·컬렉션을 실사 PNG에 연결합니다. DB 변경 없음.
// 2026-10-20: 수확 후 선물 선택·더 모으기, 5그루 자동 보상 확인 버튼. DB 변경 없음.
// 2026-10-20: DB 007의 자동 보상 안내. 기존 나무·컬렉션·화면 배치는 유지합니다.
// 2026-10-19: 팀 API로 연결. 기존 나무 SVG·반응형 배치는 유지합니다.
import { Link } from 'react-router-dom'
import { Fragment } from 'react'
import { css } from '../../lib/dc'
import useStagePreview from './useStagePreview'
import ForestGifts from './ForestGifts'
import ForestSharePicker from './ForestSharePicker'
import useWallet from '../../components/useWallet' // 위 막대 ⭐: 실제 GET /points 값 (홈·커뮤니티와 같음)
import { TreePhoto } from '../Community/parts' // 위 막대 프로필 = 지금 키우는 나무 사진

// public/images/trees의 이미지를 표시합니다. DB·물주기 처리는 변경하지 않습니다.
function TreeImage({ file, label, size, lazy = false }) {
  return (
    <img
      src={`/images/trees/${file}.png`}
      alt={label}
      width={size}
      height={size}
      loading={lazy ? 'lazy' : 'eager'}
      decoding="async"
      style={{ display: 'block', width: size, maxWidth: '100%', height: size, objectFit: 'contain', objectPosition: 'center bottom' }}
    />
  )
}

// 비 효과는 물주기 성공 후에만 표시됩니다. 장식 영역이라 클릭을 가로막지 않습니다.
function TreeRain() {
  return (
    <div className="repick-tree-rain" aria-hidden="true">
      <style>{`
        @keyframes repickTreeRainFall {
          0% { transform: translate3d(0, -24px, 0) rotate(12deg); opacity: 0; }
          12% { opacity: .85; }
          85% { opacity: .7; }
          100% { transform: translate3d(-22px, var(--rain-distance), 0) rotate(12deg); opacity: 0; }
        }
        @keyframes repickTreeRainFade {
          0% { opacity: 0; }
          12%, 72% { opacity: 1; }
          100% { opacity: 0; }
        }
        .repick-tree-rain {
          --rain-distance: 560px;
          position: absolute; inset: 0; margin: 0 auto;
          width: 100%; height: 100%; overflow: hidden;
          pointer-events: none; z-index: 1;
          animation: repickTreeRainFade 2.3s ease both;
        }
        .repick-tree-rain > i {
          position: absolute; top: -18px; display: block;
          border-radius: 100% 100% 65% 65%; opacity: 0;
          background: linear-gradient(to bottom, rgba(148,216,255,.2), #65B9EC);
          animation: repickTreeRainFall var(--rain-speed) linear var(--rain-delay) infinite;
        }
        @media (max-width: 767px) {
          .repick-tree-rain { --rain-distance: 500px; }
        }
        @media (prefers-reduced-motion: reduce) {
          .repick-tree-rain { display: none; }
        }
      `}</style>
      {Array.from({ length: 48 }, (_, index) => (
        <i key={index} style={{
          left: `${6 + (index * 31 % 90)}%`,
          width: `${2 + index % 2}px`,
          height: `${12 + index * 7 % 13}px`,
          '--rain-speed': `${.65 + index % 6 * .07}s`,
          '--rain-delay': `${index % 9 * -.09}s`,
        }} />
      ))}
    </div>
  )
}

export default function ForestMobile({ forest: V }) {
  const W = useWallet()
  const preview = useStagePreview(V)
  if (V.loading) return <p role="status" style={{ padding: 24 }}>나무 상태를 불러오는 중이에요…</p>
  if (V.error) return <div role="alert" style={{ padding: 24 }}><p>{V.error.message}</p><button onClick={V.retry}>다시 불러오기</button></div>
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
            {V.drops}
          </Link>
          <Link to="/points" title="포인트" style={{ height: "34px", padding: "0 10px 0 5px", borderRadius: "999px", background: "#F2F3EE", display: "flex", alignItems: "center", gap: "5px", fontSize: "14px", fontWeight: "800" }}>
            <span style={{ width: "22px", height: "22px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "11px", fontWeight: "800" }}>
              P
            </span>
            {W.pointsText}
          </Link>
          <Link to="/mypage" aria-label="마이페이지" style={{ width: "36px", height: "36px", borderRadius: "50%", background: "#CDEB45", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
            <TreePhoto src={`/images/trees/stage-${Math.min(Math.max(V.stageNum || 1, 1), 6)}.png`} alt={`내 나무 ${V.stageNum || 1}단계`} size={36} bg="#E8F3E4" />
          </Link>
        </div>
      </div>
      <main style={{ padding: "8px 20px 130px", boxSizing: "border-box" }}>
        <div style={{ position: "relative", borderRadius: "24px", background: "linear-gradient(180deg, #DDF0FB 0%, #EEF7E6 70%, #F6EEDB 100%)", padding: "20px", boxSizing: "border-box", overflow: "hidden" }}>
            {/* 카드 전체에 비를 표시합니다. 장식 영역은 클릭을 통과시킵니다. */}
            {V.splash && <TreeRain key={V.drops} />}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <span style={{ height: "32px", padding: "0 14px", borderRadius: "999px", background: "#121614", color: "#CDEB45", fontSize: "13px", fontWeight: "800", display: "flex", alignItems: "center" }}>
                {preview.displayStage}{" / 7단계 · "}{preview.displayName}
            </span>
            
          </div>
          <div style={{ display: "flex", justifyContent: "center", position: "relative", marginTop: "8px" }}>
            {/* 1~6단계는 공통 이미지, 7단계도 수확 전까지 종류를 숨깁니다. */}
              <TreeImage file={`stage-${Math.min(preview.displayStage, 6)}`} label={`${preview.displayStage}단계 · ${preview.displayName}${preview.previewing ? ' 미리보기' : ''}`} size={280} />
          </div>
          <div style={{ fontSize: "18px", fontWeight: "800", textAlign: "center", marginTop: "4px" }}>
            {preview.animating ? `${preview.displayName}로 자라는 중` : preview.previewing ? `${preview.displayName} · 미리보기` : '나의 나무'}
          </div>
          <div style={{ fontSize: "14px", color: "#454B47", textAlign: "center", marginTop: "4px" }}>
            {preview.animating ? '비가 그치고 햇살 아래 나무가 자라고 있어요.' : preview.previewing ? '2초 후 현재 키우는 나무로 돌아갑니다.' : V.caption}
            {!V.mutationReady && <p role="status" style={{ fontSize: 13 }}>실제 성장 상태를 조회했습니다. 물주기·수확은 DB 처리 함수 연결 후 사용할 수 있어요.</p>}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(7, minmax(0, 1fr))", gap: "4px", marginTop: "20px" }}>
            {(V.track || []).map((s, $index) => (
              <Fragment key={$index}>
                <button
                    type="button"
                    aria-label={`${s.name}${$index+1 > V.stageNum ? ' · 아직 도달하지 않은 단계' : $index+1 === V.stageNum ? ' · 현재 단계' : ' · 2초 미리보기'}`}
                    aria-pressed={preview.displayStage === $index+1}
                    disabled={$index+1 > V.stageNum || V.busy || V.loading}
                    onClick={()=>preview.onPreviewStage($index+1)}
                    style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:6, minWidth:0, padding:0, border:0, background:'transparent', color:'inherit', font:'inherit', cursor:$index+1 > V.stageNum || V.busy ? 'default' : 'pointer' }}
                  >
                  <span style={{ ...css(s.ring), boxShadow: preview.displayStage === $index+1 ? (preview.previewing ? '0 0 0 3px #2F8F4E' : '0 0 0 3px #121614') : 'none' }}>
                    <TreeImage file={`stage-${Math.min($index + 1, 6)}`} label={s.name} size={32} lazy />
                  </span>
                  <span style={{ ...css(s.label), fontWeight:preview.displayStage === $index+1 ? 800 : 500 }}>
                    {s.name}
                  </span>
                </button>
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
                  <button onClick={V.onWater} disabled={!V.canWater} style={{ height: "54px", borderRadius: "16px", border: "none", background: "#3E9BEA", color: "#FFFFFF", fontSize: "16px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center", gap: "6px" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                      <path d="M12 2.5c-3.2 4.6-6.5 8.4-6.5 11.8a6.5 6.5 0 0 0 13 0c0-3.4-3.3-7.2-6.5-11.8z" fill="#FFFFFF" />
                      <path d="M9 14.5a3 3 0 0 0 3 3" stroke="#FFFFFF" strokeWidth="1.8" strokeLinecap="round" opacity="0.8" />
                    </svg>
                    물 주기
                  </button>
                  <button onClick={V.onWaterAll} disabled={!V.canWater} style={{ height: "54px", borderRadius: "16px", border: "1.5px solid #3E9BEA", background: "#FFFFFF", color: "#17507F", fontSize: "15px", fontWeight: "800" }}>
                    수확까지 한 번에 주기
                  </button>
                </div>
                
              </>
            ) : null}
            {V.canHarvest ? (
              <>
                <div style={{ marginTop: 18, textAlign: 'center' }}>
                    <strong style={{ fontSize: 19 }}>어떤 나무로 자랐을까요?</strong>
                    <p style={{ margin: '8px 0 0', fontSize: 14, lineHeight: 1.6, color: '#454B47' }}>정성껏 키운 나무의 열매를 확인해 보세요.</p>
                  </div>
                  <button onClick={V.onHarvest} disabled={V.busy || !V.mutationReady} style={{ marginTop: "16px", width: "100%", height: "60px", borderRadius: "18px", border: "none", background: "#CDEB45", color: "#121614", fontSize: "17px", fontWeight: "800", boxShadow: "0 0 0 3px #121614" }}>
                  수확하기
                </button>
              </>
            ) : null}
          </div>
          <section aria-label="물방울 모으러 가기" style={{ padding:20, borderRadius:22, background:'#EAF5EC', color:'#1F5C3F' }}>
              <h3 style={{ margin:'0 0 14px', fontSize:17, fontWeight:800 }}>물방울 모으러 가기</h3>
              <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:12 }}>
                {[
                  { to:'/scan', icon:'♻️', label:'AI 인증', reward:'하루 최대 20개' },
                  { to:'/events', icon:'📅', label:'출석', reward:'하루 1개' },
                  { to:'/events/invite', icon:'🤝', label:'친구 초대', reward:'친구당 2개' },
                  { to:'/community', icon:'📸', label:'인증글', reward:'하루 최대 5개' },
                ].map(item=><Link key={item.to} to={item.to} aria-label={`${item.label}로 물방울 모으러 가기`} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:7, padding:'12px 4px', borderRadius:14, background:'#FFFFFF', color:'#1F5C3F', textDecoration:'none', textAlign:'center' }}>
                  <span aria-hidden="true" style={{ fontSize:24, lineHeight:1.4 }}>{item.icon}</span>
                  <span style={{ fontSize:12, lineHeight:1.5, fontWeight:700 }}>{item.label}</span>
                  <span style={{fontSize:11,lineHeight:1.6,color:'#53765A'}}>💧 {item.reward}</span>
                </Link>)}
              </div>
            </section>
          
          <ForestGifts forest={V} />
          <div style={{ background: "#FFFFFF", borderRadius: "22px", padding: "20px", boxSizing: "border-box" }}>
            <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom:16 }}>
              <div style={{ display:'flex', alignItems:'baseline', gap:8, whiteSpace:'nowrap' }}>
                <span style={{ fontSize:20, fontWeight:800 }}>나의 과일나무</span>
                <span style={{ fontSize:13, color:'#454B47' }}>{V.harvestCount}그루 수확</span>
              </div>
              <button type="button" disabled={!V.harvestCount || V.busy} onClick={() => V.onShareHarvestedTree()} style={{ border:'1px solid #C9DEC8', borderRadius:10, background:'#EAF5EC', color:'#1F5C3F', padding:'7px 10px', fontSize:12, fontWeight:800, whiteSpace:'nowrap', cursor:'pointer' }}>💬 커뮤니티 업로드</button>
            </div>
            <div style={{ fontSize: "13px", color: "#454B47", margin: "-8px 0 16px" }}>
              7단계를 완료하고 수확하면 사과·배·감나무 중 하나가 랜덤으로 공개됩니다.
            </div>
            <div aria-label={`수확한 나무 ${V.harvestPage} / ${V.harvestPageCount} 페이지`} style={{ display:'grid', gridTemplateColumns:V.harvestPageCount>1?'28px minmax(0, 1fr) 28px':'minmax(0, 1fr)', alignItems:'center', gap:4 }}>
              {V.harvestPageCount>1 && <button type="button" onClick={V.onPreviousHarvestPage} disabled={V.harvestPage===1} aria-label="이전 나무 페이지" style={{ width:28, height:44, border:0, borderRadius:10, background:'#EAF5EC', opacity:V.harvestPage===1 ? .35 : 1, fontSize:22, cursor:'pointer' }}>‹</button>}
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, minmax(0, 1fr))", gap: "10px" }}>
              {(V.harvestedPageItems || []).map((h, $index) => (
                <Fragment key={h.id ?? $index}>
                  <div style={{ borderRadius: "18px", background: "linear-gradient(180deg, #DDF0FB 0%, #EEF7E6 70%, #F6EEDB 100%)", padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", gap: "4px" }}>
                    <TreeImage file={h.f0 ? 'apple' : h.f1 ? 'pear' : 'persimmon'} label={h.name} size={84} lazy />
                    <span style={{ fontSize: "13px", fontWeight: "700" }}>
                      {h.name}
                    </span>
                    <span style={{ fontSize: "11px", color: "#6B716D" }}>
                      {h.date}
                    </span>
                  </div>
                </Fragment>
              ))}
              {V.harvestPage === V.harvestPageCount && (V.harvestedPageItems || []).length < 8 && <div style={{ borderRadius: "18px", border: "1.5px dashed #C9CCC6", padding: "10px 6px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "6px", minHeight: "126px", boxSizing: "border-box" }}>
                <span style={{ fontSize: "28px", fontWeight: "800", color: "#B9BDB8" }}>
                  ?
                </span>
                <span style={{ fontSize: "12px", color: "#6B716D" }}>
                  키우는 중
                </span>
              </div>}
              </div>
              {V.harvestPageCount>1 && <button type="button" onClick={V.onNextHarvestPage} disabled={V.harvestPage===V.harvestPageCount} aria-label="다음 나무 페이지" style={{ width:28, height:44, border:0, borderRadius:10, background:'#EAF5EC', opacity:V.harvestPage===V.harvestPageCount ? .35 : 1, fontSize:22, cursor:'pointer' }}>›</button>}
            </div>
          </div>
          
        </div>
      </main>
      {V.modal ? (
        <>
          <div style={{ position: "fixed", inset: "0", background: "rgba(18,22,20,0.55)", zIndex: "10", display: "flex", justifyContent: "center", alignItems: "center", padding: "20px 16px", boxSizing: "border-box", animation: "rpFade .25s ease" }}>
            <div style={{ width: "340px", maxWidth: "100%", maxHeight: "calc(100dvh - 40px)", overflowY: "auto", borderRadius: "30px", background: "#FFFFFF", padding: "28px 24px 22px", boxSizing: "border-box", textAlign: "center", animation: "rpPop .5s ease" }}>
              <div style={{ fontSize: "13px", fontWeight: "800", color: "#1F5C3F" }}>
                수확 완료
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "6px", borderRadius: "24px", background: "linear-gradient(180deg, #DDF0FB, #EEF7E6)" }}>
                <TreeImage file={V.f0 ? 'apple' : V.f1 ? 'pear' : 'persimmon'} label={V.fruitName} size={240} />
              </div>
              <div style={{ fontSize: "24px", fontWeight: "800", marginTop: "16px" }}>
                {V.fruitTitle}
              </div>
              <div style={{ fontSize: "14px", color: "#454B47", lineHeight: "1.5", marginTop: "8px" }}>
                작은 물방울이 모여 {V.fruitName} 한 그루가 되었어요.
                <br />
                함께 키운 나무는 나의 숲에 소중히 간직할게요.
              </div>
              {/* 5그루 자동 보상은 확인만 합니다. 중복 지급 요청을 보내지 않습니다. */}
              {V.autoReward ? (
                <div style={{ marginTop: 20 }}>
                  <div style={{ padding: 16, borderRadius: 18, background: '#EAF5EC', lineHeight: 1.6 }}>
                    <strong style={{ color: '#1F5C3F' }}>나무 다섯 그루, 초록빛 결실!</strong>
                    <p style={{ margin: '8px 0 0', fontSize: 14 }}>
                      꾸준한 실천으로 {V.autoReward.item} 보상이 기록되었어요.
                    </p>
                    <p style={{ margin: '6px 0 0', fontSize: 12, color: '#454B47' }}>
                      나무 5그루를 사용해 텀블러 쿠폰 카드를 받았어요. 마이페이지 쿠폰함에서 확인하세요.
                    </p>
                  </div>
                  <button type="button" onClick={V.onReceiveAutoReward} style={{ width: '100%', minHeight: 48, borderRadius: 16, border: 'none', padding: '12px 14px', fontSize: 14, fontWeight: 800, cursor: V.busy ? 'wait' : 'pointer', opacity: V.busy ? 0.55 : 1, marginTop: 14, background: '#CDEB45', color: '#121614' }}>
                    보상 받기
                  </button>
                </div>
              ) : V.choosingGift ? (
                <div style={{ marginTop: 20 }}>
                  <strong style={{ fontSize: 17 }}>초록빛 실천을 선물로 바꿔 보세요</strong>
                  <p style={{ fontSize: 13, lineHeight: 1.6, color: '#454B47' }}>
                    고른 선물에 필요한 나무만 사용하고, 남은 나무는 계속 모을 수 있어요.
                  </p>
                  <div style={{ display: 'grid', gap: 8 }}>
                    {V.availableGifts.map(gift => (
                      <button type="button" key={gift.tier} disabled={V.busy} onClick={() => V.onClaim(gift.tier)} style={{ width: '100%', minHeight: 48, borderRadius: 16, border: 'none', padding: '12px 14px', fontSize: 14, fontWeight: 800, cursor: V.busy ? 'wait' : 'pointer', opacity: V.busy ? 0.55 : 1, background: '#EAF5EC', color: '#1F5C3F' }}>
                        {gift.item} · {gift.tier}그루부터
                      </button>
                    ))}
                  </div>
                  {!V.availableGifts.length && <p role="status">받을 수 있는 선물을 확인 중이에요. 잠시 후 다시 확인해 주세요.</p>}
                  <p style={{ margin: '12px 0', fontSize: 12, color: '#454B47' }}>받은 쿠폰 카드는 마이페이지 쿠폰함에서 확인하세요.</p>
                  <button type="button" disabled={V.busy} onClick={V.onBackToHarvest} style={{ width: '100%', minHeight: 48, borderRadius: 16, border: 'none', padding: '12px 14px', fontSize: 14, fontWeight: 800, cursor: V.busy ? 'wait' : 'pointer', opacity: V.busy ? 0.55 : 1, background: 'transparent', color: '#454B47' }}>돌아가기</button>
                </div>
              ) : (
                <div style={{ marginTop: 22 }}>
                  <strong style={{ fontSize: 18 }}>친환경 선물로 바꿔 볼까요?</strong>
                  <p style={{ margin: '8px 0 16px', fontSize: 13, lineHeight: 1.6, color: '#454B47' }}>
                    나무를 더 모으면 다른 선물도 선택할 수 있어요.
                  </p>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                    <button type="button" disabled={V.busy} onClick={V.onChooseGift} style={{ width: '100%', minHeight: 48, borderRadius: 16, border: 'none', padding: '12px 14px', fontSize: 14, fontWeight: 800, cursor: V.busy ? 'wait' : 'pointer', opacity: V.busy ? 0.55 : 1, background: '#CDEB45', color: '#121614' }}>선물 고르기</button>
                    <button type="button" disabled={V.busy} onClick={V.onRestart} style={{ width: '100%', minHeight: 48, borderRadius: 16, border: 'none', padding: '12px 14px', fontSize: 14, fontWeight: 800, cursor: V.busy ? 'wait' : 'pointer', opacity: V.busy ? 0.55 : 1, background: '#EAF5EC', color: '#1F5C3F' }}>더 모을래요</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </>
      ) : null}
      <ForestSharePicker forest={V} />
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
