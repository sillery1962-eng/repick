// 2026-10-21: 기존 DB의 모아 둔 나무와 보상 함수를 표시합니다. 차감 정책은 변경하지 않습니다.
const GIFTS = [
  { tier:1, name:'친환경 쿠폰', kind:'coupon' },
  { tier:2, name:'재활용 노트', kind:'notebook' },
  { tier:3, name:'에코백', kind:'bag' },
  { tier:4, name:'한 그루 더!', kind:'grow' },
  { tier:5, name:'텀블러', kind:'tumbler' },
]

// 별도 이미지 다운로드 없이 사용하는 선물 SVG입니다.
function GiftIcon({ kind }) {
  let shape
  switch(kind) {
    case 'coupon': shape=<><path d="M8 13h40v10a6 6 0 0 0 0 12v10H8V35a6 6 0 0 0 0-12z" fill="#FFFFFF"/><path d="M34 14v6m0 5v6m0 5v8" strokeDasharray="2 3"/><path d="m17 29 4 4 7-9"/></>;break
    case 'notebook': shape=<><rect x="13" y="8" width="32" height="42" rx="4" fill="#FFFFFF"/><path d="M20 9v40M9 17h8M9 27h8M9 37h8M27 22h11M27 30h9"/></>;break
    case 'bag': shape=<><path d="M12 20h32l4 29H8z" fill="#FFFFFF"/><path d="M20 24V15a8 8 0 0 1 16 0v9"/><path d="M23 35c8-8 14-5 11 2-2 5-9 5-11-2zm1 6 7-8" fill="#DDEDDC"/></>;break
    case 'tumbler': shape=<><path d="M17 15h23l-3 35H20z" fill="#FFFFFF"/><rect x="14" y="9" width="29" height="7" rx="3" fill="#DDEDDC"/><path d="M25 9V5h12M20 25h18M21 40h16"/></>;break
    default: shape=<><path d="M28 48V28M28 33C12 34 10 22 10 17c12 0 18 5 18 16z" fill="#DDEDDC"/><path d="M28 26C28 12 39 9 47 10c0 11-6 17-19 16z" fill="#FFFFFF"/></>
  }
  return <svg viewBox="0 0 56 56" width="44" height="44" fill="none" stroke="#397B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shape}</svg>
}
function EmptyTree() {
  return <svg viewBox="0 0 44 44" width="36" height="36" fill="none" stroke="#A9BDAA" strokeWidth="2" strokeLinecap="round" aria-hidden="true"><path d="M22 34V18M22 23c-8 0-12-5-12-11 8 0 12 4 12 11zm0-5c0-8 5-12 12-12 0 7-4 12-12 12zM12 36h20"/></svg>
}

export default function ForestGifts({ forest: V }) {
  const saved = Math.max(0,Math.floor(Number(V.savedTrees)||0))
  // DB 007은 수확 내역을 최신순으로 반환합니다. 사용하지 않은 최근 나무만 골라 수확순으로 표시합니다.
  const waitingTrees = (V.harvested || []).slice(0,saved).reverse()
  return <section aria-label="나의 나무선물" style={{ background:'#EAF5EC', borderRadius:28, padding:22, boxSizing:'border-box', minWidth:0 }}>
    <h2 style={{ margin:0, fontSize:20, fontWeight:800, color:'#244A32' }}>나의 나무선물</h2>
    <p style={{ margin:'9px 0 18px', fontSize:13, lineHeight:1.7, color:'#53695A' }}>수확한 나무로 나만의 선물을 만나보세요.</p>
    <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', flexWrap:'wrap', gap:8, marginBottom:16 }}>
      <span style={{ fontSize:13, color:'#53695A' }}>모아 둔 나무</span>
      <strong style={{ fontSize:21, color:'#2F8F4E' }}>{saved}그루</strong>
    </div>
    <div style={{ display:'grid', gridTemplateColumns:'repeat(5, minmax(0, 1fr))', gap:6 }}>
      {GIFTS.map((gift,index)=>{
        const tree = waitingTrees[index]
        const filled = index < saved
        const file = tree?.f0?'apple':tree?.f1?'pear':tree?.f2?'persimmon':null
        const claimable = [1,2,3].includes(gift.tier) && saved>=gift.tier && V.mutationReady && !V.busy
        return <div key={gift.tier} style={{ display:'flex', flexDirection:'column', alignItems:'center', minWidth:0 }}>
          <div aria-label={`${gift.tier}번째 나무 ${filled?'수확 완료':'모으는 중'}`} style={{ width:'100%', aspectRatio:'1', borderRadius:14, display:'flex', alignItems:'center', justifyContent:'center', background:filled?'#FFFFFF':'rgba(255,255,255,.45)', border:filled?'1px solid #B8D8BB':'1px dashed #BDD0BE', overflow:'hidden', boxSizing:'border-box' }}>
            {filled && file ? <img src={`/images/trees/${file}.png`} alt={tree.name} style={{ width:'100%', height:'100%', objectFit:'contain' }} loading="lazy" decoding="async" /> : <EmptyTree />}
          </div>
          <span style={{ fontSize:11, color:'#53695A', margin:'7px 0 12px' }}>{gift.tier}그루</span>
          <button
            type="button"
            disabled={!claimable}
            onClick={()=>{if(claimable)V.onClaim(gift.tier)}}
            aria-label={gift.tier===4?'텀블러까지 한 그루 더':gift.tier===5?'텀블러 · 5그루째 수확 시 자동 보상':`${gift.name} 교환 · ${gift.tier}그루부터 선택 가능`}
            style={{ width:'100%', minHeight:90, padding:'8px 2px', border:claimable?'1px solid #7EBA88':'1px solid transparent', borderRadius:12, background:claimable?'#FFFFFF':'transparent', color:'#315F3E', display:'flex', flexDirection:'column', alignItems:'center', gap:7, cursor:claimable?'pointer':'default', opacity:gift.tier===4||saved>=gift.tier?1:.5, font:'inherit' }}
          >
            <GiftIcon kind={gift.kind}/>
            <span style={{ fontSize:11, lineHeight:1.5, fontWeight:700, overflowWrap:'anywhere' }}>{gift.name}</span>
          </button>
        </div>
      })}
    </div>
    <p style={{ margin:'18px 0 0', fontSize:12, lineHeight:1.8, color:'#53695A' }}>선물을 선택하면 모아 둔 나무를 모두 사용해요.<br />5그루째 수확하면 텀블러 보상이 자동으로 기록돼요.</p>
  </section>
}
