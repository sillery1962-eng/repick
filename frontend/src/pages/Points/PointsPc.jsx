// 2026-10-20: 어제 통계 브리핑 자동 갱신·위치 변경·품목 구분선 제거·적립/사용 색상 통일.
// 2026-10-20: 기존 카드 복구, 달력 기준 주별 집계, 선택한 구간의 접힌 상세내역.
// 2026-10-20: 적립·사용 카드는 같은 기간 선택·그래프·상세내역 UI를 사용합니다.
import { Link } from 'react-router-dom'

const SCAN_CLASSES = [
  ['PAPER', '종이', '#C9A06A'],
  ['CAN', '캔', '#8D9B91'],
  ['PET', '페트병', '#80B4C7'],
  ['PLASTIC', '플라스틱', '#72A5C4'],
  ['VINYL', '비닐', '#76A98B'],
  ['BATTERY', '건전지', '#A798B8'],
]

function ActivityCard({ panel: P }) {
  const earned = P.flow === 'earned'
  return (
    <section style={{ background:'#FFFFFF', borderRadius:24, padding:24, minWidth:0 }}>
      <h2 style={{ fontSize:20, margin:'0 0 16px' }}>{earned ? '포인트 적립현황' : '포인트 사용현황'}</h2>
      <div style={{ display:'flex', flexWrap:'wrap', gap:6, marginBottom:16 }}>
        {[['day','일별'],['week','주별'],['month','월별']].map(([key,label]) => <button type="button" key={key} aria-pressed={P.mode===key} onClick={()=>P.changeMode(key)} style={{ border:0, borderRadius:12, padding:'9px 14px', background:P.mode===key?(earned?'#78AE8C':'#86AEC2'):(earned?'#EAF5EC':'#E8F1F6'), color:earned?'#173D2A':'#174454', fontWeight:700 }}>{label}</button>)}
        {P.mode==='month' ? <select aria-label={`${earned?'적립':'사용'} 조회 연도`} value={P.year} onChange={e=>P.changeYear(e.target.value)} style={{ border:'1px solid #DDE2D9', borderRadius:12, padding:8, background:'#FFFFFF', font:'inherit' }}>{P.years.map(year=><option key={year} value={year}>{year}년</option>)}</select> : <input type="month" aria-label={`${earned?'적립':'사용'} 조회 월`} value={P.month} onChange={e=>P.changeMonth(e.target.value)} style={{ minWidth:0, maxWidth:'100%', border:'1px solid #DDE2D9', borderRadius:12, padding:8, font:'inherit', background:'#FFFFFF' }} />}
      </div>
      {P.loading ? <p role="status">현황을 불러오는 중이에요…</p> : P.error ? <div role="alert"><p>{P.error}</p><button type="button" onClick={P.retry}>다시 불러오기</button></div> : <>
        <div style={{ textAlign:'right', color:'#121614', fontWeight:800, marginBottom:12 }}>기간 {earned?'적립':'사용'} 합계 {P.total}P</div>
        <div style={{ display:'flex', alignItems:'center', gap:6 }}>
          <button type="button" aria-label="이전 조회 구간" disabled={!P.canBack} onClick={()=>P.shift(-1)} style={{ flex:'0 0 30px', height:48, border:0, borderRadius:10, background:earned?'#EAF5EC':'#E8F1F6', color:earned?'#173D2A':'#174454', opacity:P.canBack?1:.4, cursor:P.canBack?'pointer':'default' }}>〈</button>
          <div style={{ flex:1, minWidth:0, overflowX:'auto' }}>
          <div role="group" aria-label={earned?'포인트 적립 그래프':'포인트 사용 그래프'} style={{ display:'grid', gridTemplateColumns:`repeat(${P.bars.length}, minmax(0, 1fr))`, gap:8, minWidth:P.mode==='month'?480:0 }}>
            {P.bars.map(bar=><button type="button" key={bar.key} disabled={bar.isFuture} aria-label={`${bar.label} ${bar.isFuture?'예정':`${bar.detail || bar.start} ${bar.text}포인트 상세 기간 선택`}`} aria-pressed={P.selectedKey===bar.key} onClick={()=>P.selectBar(bar.key)} style={{ textAlign:'center', minWidth:0, border:0, padding:'6px 4px', background:P.selectedKey===bar.key?(earned?'#EAF5EC':'#E8F1F6'):'transparent', color:'#121614', borderRadius:12, cursor:bar.isFuture?'default':'pointer', font:'inherit', opacity:bar.isFuture?.45:1 }}>
              <div style={{ display:'flex', flexDirection:'column', justifyContent:'flex-end', height:175 }}><strong style={{ fontSize:11, marginBottom:6, overflowWrap:'anywhere' }}>{bar.isFuture?'—':bar.text}</strong><div style={{ height:bar.height, minHeight:bar.value?4:0, background:earned?'#78AE8C':'#86AEC2', borderRadius:'8px 8px 0 0' }} /></div>
              <div style={{ borderTop:'1px solid #DDE2D9', paddingTop:8, fontSize:12 }}><span style={{ display:'inline-block', position:'relative', zIndex:bar.isToday?1:0, fontSize:bar.isToday?15:12, fontWeight:bar.isToday?800:400, color:bar.isToday?'#1F5C3F':'#121614', transform:bar.isToday?'translateY(-2px)':'none', transition:'transform .2s ease' }}>{bar.label}</span></div>
              {bar.detail && <div style={{ fontSize:10, color:'#6B716D', marginTop:4 }}>{bar.detail}</div>}
            </button>)}
          </div>
          </div>
          <button type="button" aria-label="다음 조회 구간" disabled={!P.canForward} onClick={()=>P.shift(1)} style={{ flex:'0 0 30px', height:48, border:0, borderRadius:10, background:earned?'#EAF5EC':'#E8F1F6', color:earned?'#173D2A':'#174454', opacity:P.canForward?1:.4, cursor:P.canForward?'pointer':'default' }}>〉</button>
        </div>
        <p style={{fontSize:13,color:'#6B716D',minHeight:22,margin:'12px 0 0'}}>{P.empty ? `선택한 기간에는 ${earned?'적립':'사용'} 기록이 없어요.` : '막대를 눌러 날짜별 내역을 확인해 보세요.'}</p>
        {/* 선택 전에는 목록을 표시하지 않습니다. 막대 선택 후에도 접힌 상태로 시작합니다. */}
        <div style={{ borderTop:'1px solid #E8ECE3', marginTop:20, paddingTop:16 }}>
          {!P.selectedKey ? <p style={{ margin:0, fontSize:13, color:'#6B716D' }}>그래프를 누르면 해당 기간의 상세내역을 확인할 수 있어요.</p> : <>
            <button type="button" aria-expanded={P.expanded} onClick={P.toggleDetail} style={{ width:'100%', display:'flex', alignItems:'center', justifyContent:'space-between', gap:12, border:0, borderRadius:12, padding:'14px 12px', background:'#F6F8F4', color:'#1F5C3F', font:'inherit', textAlign:'left', cursor:'pointer' }}>
              <span><strong style={{ display:'block', fontSize:14 }}>{earned?'적립':'사용'} 상세내역 {P.expanded?'접기':'보기'}</strong><span style={{ display:'block', fontSize:12, marginTop:5 }}>{P.selectedRange}</span></span><span aria-hidden="true">{P.expanded?'▴':'▾'}</span>
            </button>
            {P.expanded && <div>
              {P.detailLoading ? <p role="status">상세내역을 불러오는 중이에요…</p> : P.detailError ? <div role="alert"><p>{P.detailError}</p><button type="button" onClick={P.retryDetail}>다시 불러오기</button></div> : <>
                {P.records.length===0 && <p style={{ fontSize:13, color:'#6B716D' }}>이 기간에는 {earned?'적립':'사용'} 내역이 없어요.</p>}
                {P.records.map(record=><div key={record.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:10, padding:'14px 0', borderBottom:'1px solid #F0F1EC' }}><div><strong style={{ fontSize:14 }}>{record.title}</strong><div style={{ fontSize:12, color:'#6B716D', marginTop:4 }}>{record.date}</div></div><strong style={{ fontSize:15, color:earned?'#1F5C3F':'#396D86', whiteSpace:'nowrap' }}>{record.amount}</strong></div>)}
                {(P.canPrevious || P.canNext) && <nav aria-label={`${earned?'적립':'사용'} 내역 페이지`} style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginTop:14 }}>
                  <button type="button" disabled={!P.canPrevious} onClick={P.onPrevious} style={{ border:0, borderRadius:12, padding:'10px 18px', background:'#EAF5EC', color:'#1F5C3F', opacity:P.canPrevious?1:.4 }}>이전</button><span style={{ fontSize:12 }}>{P.page}페이지</span><button type="button" disabled={!P.canNext} onClick={P.onNext} style={{ border:0, borderRadius:12, padding:'10px 18px', background:'#EAF5EC', color:'#1F5C3F', opacity:P.canNext?1:.4 }}>다음</button>
                </nav>}
              </>}
            </div>}
          </>}
        </div>
      </>}
    </section>
  )
}
function EarningGuide() {
  return <section style={{ background:'#EAF7EE', borderRadius:24, padding:22 }}>
    <h2 style={{ fontSize:17, color:'#1F5C3F', margin:'0 0 12px' }}>포인트 모으는 방법</h2>
    <div style={{ display:'grid', gap:12 }}>
      {[
        ['♻','AI 분리배출 인증','10~40P','하루 적립 5회 · 최고 보상 품목 1개 기준'],
        ['✓','AI 적립 5회 달성','+100P','하루 1회 · 인증 보상과 별도'],
        ['?','오늘의 퀴즈','최대 80P','정답 30P + 모두 정답 보너스 50P'],
        ['＋','친구 초대','1,000P','친구 5명 달성할 때마다'],
        ['▧','커뮤니티 인증글','1P','하루 적립 5회'],
      ].map(([icon,title,amount,detail])=><div key={title} style={{ display:'flex', alignItems:'center', gap:9 }}><span aria-hidden="true" style={{ width:32, height:32, flexShrink:0, borderRadius:10, background:'#FFFFFF', display:'flex', alignItems:'center', justifyContent:'center', color:'#1F5C3F', fontWeight:800 }}>{icon}</span><div style={{ flex:1, minWidth:0 }}><div style={{ display:'flex', flexWrap:'wrap', justifyContent:'space-between', gap:6, fontSize:14 }}><strong>{title}</strong><strong style={{ color:'#1F7A3A' }}>{amount}</strong></div><div style={{ fontSize:12, lineHeight:1.5, color:'#6B716D', marginTop:3 }}>{detail}</div></div></div>)}
    </div>
  </section>
}

export default function PointsPc({ points: V }) {
  const maxScanCount = Math.max(1, ...SCAN_CLASSES.map(([code]) => Number(V.scanCounts?.[code]) || 0))
  return <div style={{ background:'#F7F8F4', color:'#121614', fontFamily:'var(--font-base)', width:'100%', boxSizing:'border-box' }}>
    <main style={{ maxWidth:1120, margin:'0 auto', padding:'32px 20px 60px', boxSizing:'border-box' }}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', gap:12, marginBottom:20 }}><h1 style={{ margin:0, fontSize:30 }}>포인트</h1><button type="button" onClick={V.refresh} style={{ border:0, borderRadius:12, padding:'10px 14px', background:'#EAF5EC', color:'#1F5C3F' }}>새로고침</button></div>
      {/* 왼쪽: 기존 잔액 + 적립방법 / 오른쪽: 어제의 포인트 브리핑 + 기존 품목 */}
      <div style={{ display:'grid', gridTemplateColumns:'420px minmax(0, 1fr)', gap:24, alignItems:'start' }}>
        <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
          <div style={{ background: "linear-gradient(145deg, #EAF5EC 0%, #F1F8EF 66%, #F6EEDB 100%)", borderRadius: "28px", padding: "28px", boxSizing: "border-box", color: "#121614", position: "relative", overflow: "hidden" }}>
              {V.balanceLoading && <p role="status" style={{ fontSize: 12 }}>잔액을 불러오는 중이에요…</p>}
              {V.balanceError && <div role="alert"><p>{V.balanceError}</p><button type="button" onClick={V.refresh}>다시 불러오기</button></div>}
              <div style={{ display:'grid', gridTemplateColumns:'minmax(0, 1.3fr) minmax(0, 1fr)', gap:12, alignItems:'center' }}>
                <div style={{ minWidth:0 }}>
                  <div style={{ fontSize:14, color:'#315D45' }}>보유 포인트</div>
                  <div style={{ display:'flex', alignItems:'baseline', gap:6, marginTop:6 }}>
                    <span style={{ fontSize:52, fontWeight:800, letterSpacing:-1, color:'#1F5C3F' }}>{V.pointsText}</span>
                    <span style={{ fontSize:20, fontWeight:800 }}>P</span>
                  </div>
                </div>
                <div style={{ minWidth:0, padding:'12px 10px', borderRadius:16, background:'#FFFFFF', textAlign:'center' }}>
                  <div style={{ fontSize:12, color:'#315D45' }}>누적 배출</div>
                  <div style={{ fontSize:20, fontWeight:800, color:'#1F5C3F', marginTop:4 }}>{V.scanTotalText}개</div>
                </div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px", marginTop: "18px" }}>
                <Link to="/donate" style={{ height: "48px", borderRadius: "14px", background: "#CDEB45", color: "#121614", fontSize: "15px", fontWeight: "800", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  기부하기
                </Link>
                <a href="#shop" style={{ height: "48px", borderRadius: "14px", border: "1.5px solid #A9C9B2", color: "#1F5C3F", fontSize: "15px", fontWeight: "700", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  제품 소개 시안
                </a>
              </div>
            </div>
          <EarningGuide />
        </div>
        <div style={{ display:'flex', flexDirection:'column', gap:16, minWidth:0 }}>
          <div style={{ background: "#EAF7EE", borderRadius: "28px", padding: "28px", boxSizing: "border-box", display: "flex", gap: "14px", alignItems: "flex-start" }}>
              <span style={{ width: "48px", height: "48px", borderRadius: "50%", background: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: "0" }}>
                <svg width="30" height="30" viewBox="0 0 32 32" fill="none" aria-hidden="true">
                  <path d="M5 5v22h23" stroke="#2F8F4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <rect x="9" y="17" width="4" height="7" rx="1.5" fill="#8CC89A" />
                  <rect x="16" y="12" width="4" height="12" rx="1.5" fill="#59A76E" />
                  <rect x="23" y="7" width="4" height="17" rx="1.5" fill="#2F8F4E" />
                </svg>
              </span>
              <span style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                <span style={{ fontSize: "13px", fontWeight: "800", color: "#1F7A3A" }}>
                  나의 포인트 브리핑
                </span>
                <span style={{ fontSize: "15px", fontWeight: "400", lineHeight: "1.7" }}>
                  {V.briefing.loading ? <span role="status">어제의 포인트 활동을 확인하고 있어요…</span> : V.briefing.error ? <span role="alert">{V.briefing.error}<button type="button" onClick={V.briefing.retry} style={{display:'block',marginTop:8,border:0,borderRadius:10,padding:'8px 12px',background:'#FFFFFF',color:'#1F5C3F',font:'inherit',cursor:'pointer'}}>다시 불러오기</button></span> : <><span style={{display:'block',fontSize:12,color:'#5E645F',marginBottom:6}}>{V.briefing.date} · 어제의 활동</span><strong style={{display:'block',fontSize:16,fontWeight:700,lineHeight:1.6}}>{V.briefing.headline}</strong><span style={{display:'block',marginTop:6,fontSize:14,color:'#454B47'}}>{V.briefing.message}</span></>}
                </span>
              </span>
            </div>
          <div style={{ background: '#FFFFFF', borderRadius: 24, padding: 28, boxSizing: 'border-box' }}>
            <strong style={{ fontSize: 20 }}>내가 분리배출한 품목</strong>
            <p style={{ margin: '8px 0 18px', fontSize: 12, color: '#6B716D', lineHeight: 1.6 }}>AI 인증에서 판별된 품목의 누적 개수예요. 품목별 기록을 시작한 뒤의 인증부터 집계됩니다.</p>
            {V.scanLoading && <p role="status">품목 통계를 불러오는 중이에요…</p>}
            {V.scanError && <p role="alert">{V.scanError} <button type="button" onClick={V.retryScans}>다시 불러오기</button></p>}
            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {SCAN_CLASSES.map(([code, label, color]) => {
                const count = Number(V.scanCounts?.[code]) || 0
                return <div key={code}>
                  <div style={{ display:'flex', alignItems:'baseline', justifyContent:'space-between', gap:12, marginBottom:8 }}>
                    <strong style={{ fontSize:14 }}>{label}</strong>
                    <span style={{ fontSize:13, fontWeight:700, color:'#1F5C3F' }}>{V.scanCounts?.[code] == null ? '—' : `${count.toLocaleString('ko-KR')}개`}</span>
                  </div>
                  <div role="progressbar" aria-label={`${label} 누적 분리배출`} aria-valuenow={count} aria-valuemin={0} aria-valuemax={maxScanCount} style={{ height:7, borderRadius:999, background:'#EEF0EA', overflow:'hidden' }}>
                    <div style={{ width:`${count / maxScanCount * 100}%`, height:'100%', borderRadius:999, background:color }} />
                  </div>
                </div>
              })}
            </div>
          </div>
          
        </div>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, minmax(0, 1fr))', gap:24, marginTop:24, alignItems:'start' }}>
        <ActivityCard panel={V.earned} />
        <ActivityCard panel={V.spent} />
      </div>
      <div style={{ marginTop:24 }}><div id="shop" style={{ background: "#EEF0EA", borderRadius: "28px", padding: "28px", boxSizing: "border-box" }}>
            <span style={{ height: "26px", padding: "0 10px", borderRadius: "999px", background: "#CDEB45", fontSize: "12px", fontWeight: "800", display: "inline-flex", alignItems: "center" }}>
              제품 소개 시안 · 구매·적립 미연결
            </span>
            <div style={{ fontSize: "24px", fontWeight: "800", lineHeight: "1.35", marginTop: "12px" }}>
              모은 포인트로 저탄소 제품과 함께해요
            </div>
            <div style={{ fontSize: "14px", color: "#454B47", marginTop: "6px" }}>
              현재는 연결되지 않은 제품 소개 시안입니다. 포인트 결제·구매 보상 기능은 제공하지 않습니다.
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px", marginTop: "18px" }}>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "150px", background: "#E8F3E4", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/3751b0f61bc5806919065836a8b923f2.jpg" alt="바구니에 담긴 채소 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    자연상점 · 친환경인증
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 보상 미연결
                  </span>
                </span>
              </a>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "150px", background: "#E6F0FB", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/4fd29259087713176c80dcc3fb3c4e43.jpg" alt="초록 텀블러 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    올가홀푸드 · 환경표지
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 보상 미연결
                  </span>
                </span>
              </a>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "150px", background: "#FFF3D6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/168a7e44e8a1d376f6292f58ccc86bac.jpg" alt="제철 채소와 과일 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    두레생협 · 리필
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 보상 미연결
                  </span>
                </span>
              </a>
              <a href="#product" style={{ borderRadius: "22px", background: "#FFFFFF", overflow: "hidden", display: "flex", flexDirection: "column" }}>
                <span style={{ height: "150px", background: "#FFEEE6", display: "flex", alignItems: "center", justifyContent: "center", position: "relative", overflow: "hidden", isolation: "isolate" }}>
                  <img src="/design/6533f2ecb04c60d2eadd60301f7d8bac.jpg" alt="채소 진열대 사진" style={{ position: "absolute", inset: "0", width: "100%", height: "100%", objectFit: "cover", zIndex: "-1" }} />
                </span>
                <span style={{ padding: "12px 14px 14px", display: "flex", flexDirection: "column", gap: "4px" }}>
                  <span style={{ fontSize: "12px", color: "#5E645F" }}>
                    농협하나로유통 · 무포장
                  </span>
                  <span style={{ fontSize: "14px", fontWeight: "700" }}>
                    [제품명]
                  </span>
                  <span style={{ fontSize: "15px", fontWeight: "800" }}>
                    [가격]원
                  </span>
                  <span style={{ fontSize: "12px", fontWeight: "800", color: "#1F5C3F" }}>
                    구매 보상 미연결
                  </span>
                </span>
              </a>
            </div>
            <a href="#shop-home" style={{ marginTop: "18px", height: "58px", borderRadius: "18px", background: "#121614", color: "#FFFFFF", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 20px", fontSize: "16px", fontWeight: "800" }}>
              저탄소샵 둘러보기
              <span>
                ›
              </span>
            </a>
          </div></div>
    </main>
  </div>
}
