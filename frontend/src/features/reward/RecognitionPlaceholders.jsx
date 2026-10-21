// 2026-10-20: AI 인증의 분석 전 안내 전용. 보상 지급·물주기 요청은 하지 않습니다.
import { useEffect, useState } from 'react'
import { api } from '../../api/client'
import { useAuth } from '../../lib/AuthContext'
import './RecognitionPlaceholders.css'

const TREE_NAMES = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']
const ITEMS = [
  {kind:'PAPER',label:'종이'}, {kind:'CAN',label:'캔'}, {kind:'PET',label:'페트병'},
  {kind:'PLASTIC',label:'플라스틱'}, {kind:'VINYL',label:'비닐'}, {kind:'BATTERY',label:'건전지'},
]

// 나의 숲과 같은 API·이미지를 사용합니다. 7단계도 수확 전까지 종류를 공개하지 않습니다.
export function CurrentTreePreview() {
  const { user, loading:authLoading } = useAuth()
  const userId = user?.id || null
  const [state,setState] = useState({userId:null,data:null,loading:true,error:''})
  const [retryKey,setRetryKey] = useState(0)
  const [imageFailed,setImageFailed] = useState(false)
  useEffect(()=>{
    if(authLoading)return
    if(!userId){setState({userId:null,data:null,loading:false,error:'로그인하면 현재 키우는 나무를 볼 수 있어요.'});return}
    let alive=true
    setState({userId,data:null,loading:true,error:''})
    api.get('/forest').then(data=>{
      if(!alive)return
      if(!Number.isInteger(data?.stage)||data.stage<1||data.stage>7||data.is_mock)throw Error('현재 나무의 성장 단계를 확인하지 못했어요.')
      setState({userId,data,loading:false,error:''})
    }).catch(error=>{if(alive)setState({userId,data:null,loading:false,error:error.message||'나무를 불러오지 못했어요.'})})
    return ()=>{alive=false}
  },[userId,authLoading,retryKey])
  const current = state.userId===userId&&!authLoading
  const tree = current?state.data:null
  const file = tree?`/images/trees/stage-${Math.min(tree.stage,6)}.png`:null
  useEffect(()=>{setImageFailed(false)},[file,userId])
  return <div className="repick-empty-preview repick-current-tree">
    <div className="repick-current-tree-art">
      {authLoading||!current||state.loading ? <p role="status">나의 나무를 불러오는 중이에요…</p> : state.error ? <div role="status"><p>{state.error}</p>{userId&&<button type="button" className="repick-welcome-retry" onClick={()=>setRetryKey(n=>n+1)}>다시 불러오기</button>}</div> : imageFailed ? <p>나무 이미지 파일을 확인해 주세요.</p> : <img src={file} alt={`${tree.stage}단계 · ${tree.stage_name||TREE_NAMES[tree.stage-1]}`} onError={()=>setImageFailed(true)} decoding="async" />}
    </div>
    <strong className="repick-current-tree-title">나의 나무</strong>
    <p className="repick-current-tree-copy">AI 분리배출 인증으로 물방울을 모아<br />나무를 키워보세요.</p>
  </div>
}

// 크기·선 두께·색을 맞춘 6개 SVG. 별도 이미지 파일이나 외부 요청이 필요 없습니다.
function RecycleItemIcon({ kind }) {
  let drawing
  switch(kind) {
    case 'PAPER': drawing=<><path d="M40 28h51l25 25v79H40z" fill="#FFFFFF"/><path d="M91 28v25h25" fill="#DDEEDD"/><path d="M40 28h51l25 25v79H40zM91 28v25h25M54 73h48M54 87h48M54 101h31"/></>;break
    case 'CAN': drawing=<><rect x="48" y="34" width="64" height="94" rx="15" fill="#B7D7C0"/><ellipse cx="80" cy="34" rx="32" ry="9" fill="#F5FBF6"/><ellipse cx="80" cy="128" rx="29" ry="7" fill="#DDEEDD"/><ellipse cx="80" cy="34" rx="11" ry="3"/><path d="M62 56v48M99 57v47M49 113h62"/></>;break
    case 'PET': drawing=<><path d="M68 40h24v17l11 15c4 6 6 12 6 20v35q0 8-8 8H59q-8 0-8-8V92c0-8 2-14 6-20l11-15z" fill="#D8EEEB"/><rect x="67" y="26" width="26" height="15" rx="4" fill="#4C9A6A"/><path d="M53 90h54v24H53" fill="#FFFFFF"/><path d="M64 67h32M63 123h34"/></>;break
    case 'PLASTIC': drawing=<><path d="M38 57h84l-9 70H47z" fill="#CDE5D3"/><rect x="34" y="47" width="92" height="14" rx="5" fill="#F7FCF7"/><path d="M54 80h52M53 99h54"/><path d="M65 47v-8h30v8" fill="#FFFFFF"/></>;break
    case 'VINYL': drawing=<><path d="M44 40h23v28h26V40h23v88H44z" fill="#E1EEE2"/><path d="M44 40h23v28h26V40h23v88H44zM44 58l10 17M116 58l-10 17M57 110l12-14M103 111L91 96"/><path d="M69 84h22v24H69z" fill="#FFFFFF" stroke="none"/></>;break
    default: drawing=<><rect x="42" y="44" width="32" height="83" rx="7" fill="#DCE9DE"/><rect x="86" y="33" width="32" height="94" rx="7" fill="#B7D7C0"/><path d="M51 44v-8h14v8M95 33v-8h14v8" fill="#F5FBF6"/><path d="M43 69h30M87 61h30M102 79v18M93 88h18M50 92h16"/></>
  }
  return <svg className="repick-recycle-item-icon" viewBox="0 0 160 160" fill="none" stroke="#2F7850" strokeWidth="3.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{drawing}</svg>
}

export function RecycleShowcase({ active=true }) {
  const [index,setIndex] = useState(0)
  const [paused,setPaused] = useState(false)
  const [reduced,setReduced] = useState(false)
  useEffect(()=>{
    const preference=window.matchMedia('(prefers-reduced-motion: reduce)')
    const update=()=>setReduced(preference.matches)
    update();preference.addEventListener('change',update)
    return ()=>preference.removeEventListener('change',update)
  },[])
  useEffect(()=>{
    if(!active||paused||reduced)return
    const timer=window.setInterval(()=>{if(!document.hidden)setIndex(n=>(n+1)%ITEMS.length)},1700)
    return ()=>window.clearInterval(timer)
  },[active,paused,reduced])
  const item=ITEMS[index]
  return <div className="repick-result-empty repick-recycle-showcase">
    <div key={item.kind} className="repick-recycle-showcase-picture"><RecycleItemIcon kind={item.kind}/></div>
    <div className="repick-recycle-showcase-label"><strong>{item.label}</strong><span>{item.kind}</span></div>
    <div className="repick-recycle-showcase-controls" role="group" aria-label="재활용 품목 미리보기">
      {ITEMS.map((entry,n)=><button type="button" key={entry.kind} aria-label={`${entry.label} 보기`} aria-pressed={n===index} onClick={()=>{setIndex(n);setPaused(true)}} className={n===index?'is-current':''}><span /></button>)}
      {!reduced&&<button type="button" className="repick-recycle-showcase-pause" onClick={()=>setPaused(value=>!value)} aria-label={paused?'품목 자동 전환 재생':'품목 자동 전환 일시정지'}>{paused?'재생':'일시정지'}</button>}
    </div>
    <strong className="repick-recycle-showcase-title">오늘은 물방울과 포인트를<br />얼마나 모을까요?</strong>
    <p>사진을 분석하고 이번에 받을 보상을 확인해 보세요.</p>
  </div>
}


// AI 인증으로 받는 6개 품목의 보상만 안내합니다. 실제 지급은 서버 응답을 따릅니다.
export function RewardsEarningGuide({ afterAnalysis=false }) {
  const rewards = [
    {kind:'PAPER',label:'종이',drops:1,points:10},
    {kind:'CAN',label:'캔',drops:3,points:30},
    {kind:'PET',label:'페트병',drops:1,points:10},
    {kind:'PLASTIC',label:'플라스틱',drops:1,points:10},
    {kind:'VINYL',label:'비닐',drops:1,points:10},
    {kind:'BATTERY',label:'건전지',drops:4,points:40},
  ]
  return <article className={`repick-card repick-earning-guide${afterAnalysis?' is-after-analysis':''}`} aria-label="AI 인증 물방울과 포인트 보상 안내">
    <h3>AI 인증으로 물방울과 포인트를 모아보세요</h3>
    <p className="repick-earning-guide-intro">인식한 품목에 따라 받을 수 있는 보상을 확인해 보세요.</p>
    <table style={{width:'100%',borderCollapse:'collapse',fontSize:13,textAlign:'left'}}>
      <thead><tr style={{color:'#59685e',fontSize:12}}>
        <th scope="col" style={{padding:'0 8px 10px 0',fontWeight:600}}>품목</th>
        <th scope="col" style={{padding:'0 8px 10px',fontWeight:600,textAlign:'right'}}>물방울</th>
        <th scope="col" style={{padding:'0 0 10px 8px',fontWeight:600,textAlign:'right'}}>포인트</th>
      </tr></thead>
      <tbody>{rewards.map(item=><tr key={item.kind}>
        <th scope="row" style={{padding:'8px 8px 8px 0',fontWeight:700,color:'#244a32'}}>{item.label}</th>
        <td style={{padding:'8px',textAlign:'right',color:'#2e7d4f',whiteSpace:'nowrap'}}>💧 {item.drops}개</td>
        <td style={{padding:'8px 0 8px 8px',textAlign:'right',color:'#2e7d4f',fontWeight:700,whiteSpace:'nowrap'}}>{item.points}P</td>
      </tr>)}</tbody>
    </table>
    <p className="repick-earning-guide-intro" style={{margin:'16px 0 0'}}>한 사진에 여러 품목이 있으면 가장 높은 보상 한 번만 적립돼요.<br />적립은 하루 5회이며, 이후에도 AI 분석은 계속할 수 있어요.</p>
  </article>
}
