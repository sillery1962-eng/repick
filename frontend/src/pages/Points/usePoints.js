// 2026-10-20: 그래프를 선택한 뒤 펼칠 때만 해당 구간의 상세내역을 조회합니다.
import { useCallback, useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'
import { useAuth } from '../../lib/AuthContext'
const TYPES = { scan:'AI 인증', attendance:'출석', signup_bonus:'가입 보상', referral:'친구 초대', referral_bonus:'친구 초대 달성', mission:'미션', quiz:'퀴즈', post_verify:'커뮤니티 인증', event:'이벤트', watering:'물주기', convert:'물방울 → 포인트 전환', donate:'기부', tree_reward:'나무 보상', reward:'보상 사용', shop:'제품 사용' }
const number = value => Number(value).toLocaleString('ko-KR')
const SCAN_CLASSES = ['PAPER','CAN','PET','PLASTIC','VINYL','BATTERY']
const isoShift = (date, days) => {
  const value = new Date(`${date}T12:00:00Z`)
  value.setUTCDate(value.getUTCDate() + days)
  return value.toISOString().slice(0,10)
}
function todayKst() {
  const parts = new Intl.DateTimeFormat('en', { timeZone:'Asia/Seoul', year:'numeric', month:'2-digit', day:'2-digit' }).formatToParts(new Date())
  return ['year','month','day'].map(type=>parts.find(p=>p.type===type).value).join('-')
}
const blank = () => ({data:null, loading:true, error:''})
function usePointActivity(flow, version) {
  const today = todayKst()
  const [mode,setMode] = useState('day')
  const [month,setMonth] = useState(()=>todayKst().slice(0,7))
  const [year,setYear] = useState(()=>todayKst().slice(0,4))
  // 일별은 가운데 날짜를 기준으로 앞뒤 3일을 보여 줍니다.
  const [centerDate,setCenterDate] = useState(todayKst)
  const [chart,setChart] = useState(blank)
  const [retryKey,setRetryKey] = useState(0)
  const [detailRetry,setDetailRetry] = useState(0)
  const [selectedKey,setSelectedKey] = useState(null)
  const [expanded,setExpanded] = useState(false)
  const [cursors,setCursors] = useState([null])
  const [detail,setDetail] = useState(()=>({data:null,loading:false,error:''}))
  const chartSequence = useRef(0)
  const detailSequence = useRef(0)
  const locked = useRef(false)
  const page = cursors.length
  const cursor = cursors[page-1]
  const endpoint = `/points/activity?flow=${flow}&mode=${mode}&month=${month}&year=${year}&window=0`
  const dayDates = Array.from({length:7},(_,index)=>isoShift(centerDate,index-3))
  const closeDetail = () => {
    detailSequence.current += 1; locked.current=false
    setSelectedKey(null); setExpanded(false); setCursors([null]); setDetail({data:null,loading:false,error:''})
  }
  const reset = () => { chartSequence.current+=1; setChart(blank()); closeDetail() }
  useEffect(()=>{
    const id=++chartSequence.current
    closeDetail(); setChart(blank())
    const request = mode==='day' ? (()=>{
      const pages = [...new Set(dayDates.filter(date=>date<=today).map(date=>{
        const dateMonth=date.slice(0,7)
        return `/points/activity?flow=${flow}&mode=day&month=${dateMonth}&year=${date.slice(0,4)}&window=${Math.floor((Number(date.slice(-2))-1)/7)}`
      }))]
      return Promise.all(pages.map(url=>api.get(url).then(data=>({url,data})))).then(results=>{
        for(const {data} of results) {
          if(!data || !Array.isArray(data.items) || !Number.isInteger(data.snapshot_id)) throw Error('포인트 현황 API 연결을 확인해 주세요.')
        }
        const byDate = new Map()
        for(const {url,data} of results) for(const item of data.items) {
          byDate.set(String(item.start || item.key).slice(0,10),{...item,_endpoint:url,_snapshot_id:data.snapshot_id})
        }
        const items=dayDates.map(date=>{
          if(date>today) return {key:date,start:date,end:date,label:`${Number(date.slice(-2))}일`,value:0,isFuture:true}
          if(byDate.has(date)) return byDate.get(date)
          const page=results.find(({url})=>url.includes(`month=${date.slice(0,7)}`) && url.endsWith(`window=${Math.floor((Number(date.slice(-2))-1)/7)}`))
          return {key:date,start:date,end:date,label:`${Number(date.slice(-2))}일`,value:0,_endpoint:page?.url,_snapshot_id:page?.data.snapshot_id,isFuture:date>today}
        })
        return {items,total:items.reduce((sum,item)=>sum+Number(item.value||0),0),range:`${dayDates[0]} ~ ${dayDates[6]}`,snapshot_id:results[0].data.snapshot_id}
      })
    })() : api.get(endpoint)
    request.then(data=>{
      if(id!==chartSequence.current)return
      if(!data || !Array.isArray(data.items) || !Number.isInteger(data.snapshot_id) || !Number.isFinite(data.total))throw Error('포인트 현황 API 연결을 확인해 주세요.')
      setChart({data,loading:false,error:''})
    }).catch(error=>{if(id===chartSequence.current)setChart({data:null,loading:false,error:error.message||'현황을 불러오지 못했어요.'})})
    return ()=>{if(id===chartSequence.current)chartSequence.current+=1}
  },[endpoint,centerDate,version,retryKey])
  const selected = chart.data?.items.find(item=>item.key===selectedKey) || null
  useEffect(()=>{
    if(!expanded || !selected || !chart.data)return
    const id=++detailSequence.current
    locked.current=true; setDetail(blank())
    const url=`${selected._endpoint || endpoint}&selected_key=${encodeURIComponent(selected.key)}&include_records=true&snapshot_id=${selected._snapshot_id ?? chart.data.snapshot_id}${cursor==null?'':`&cursor=${cursor}`}`
    api.get(url).then(data=>{
      if(id!==detailSequence.current)return
      if(!Array.isArray(data?.records))throw Error('상세내역 응답을 확인해 주세요.')
      setDetail({data,loading:false,error:''})
    }).catch(error=>{if(id===detailSequence.current)setDetail({data:null,loading:false,error:error.message||'상세내역을 불러오지 못했어요.'})})
      .finally(()=>{if(id===detailSequence.current)locked.current=false})
    return ()=>{if(id===detailSequence.current)detailSequence.current+=1}
  },[endpoint,expanded,selected,chart.data,cursor,detailRetry])
  const changeMode = value => {if(!['day','week','month'].includes(value)||value===mode)return;reset();setMode(value);if(value==='day')setCenterDate(month===today.slice(0,7)?today:`${month}-04`)}
  const changeMonth = value => {if(!/^\d{4}-(0[1-9]|1[0-2])$/.test(value)||value===month)return;reset();setMonth(value);setCenterDate(value===today.slice(0,7)?today:`${value}-04`)}
  const changeYear = value => {if(!/^\d{4}$/.test(value)||value===year)return;reset();setYear(value)}
  const shift = direction => {
    if(mode==='day') {const next=isoShift(centerDate,direction);if(next<'2000-01-01'||next>today)return;reset();setCenterDate(next);setMonth(next.slice(0,7))}
    else if(mode==='week') {const d=new Date(`${month}-01T00:00:00Z`);d.setUTCMonth(d.getUTCMonth()+direction);const next=d.toISOString().slice(0,7);if(next<'2000-01'||next>`${today.slice(0,4)}-12`)return;reset();setMonth(next)}
    else {const next=Number(year)+direction;if(next<2000||next>Number(today.slice(0,4)))return;reset();setYear(String(next))}
  }
  const selectBar = key => {
    if(!chart.data?.items.some(item=>item.key===key&&!item.isFuture))return
    detailSequence.current+=1;locked.current=false
    setSelectedKey(key);setExpanded(false);setCursors([null]);setDetail({data:null,loading:false,error:''})
  }
  const toggleDetail = () => {
    if(!selected)return
    detailSequence.current+=1;locked.current=false
    setExpanded(value=>!value);setCursors([null]);setDetail({data:null,loading:false,error:''})
  }
  const turnPage = forward => {
    if(locked.current||detail.loading||!detail.data||(forward?detail.data.next_cursor==null:page===1))return
    locked.current=true;detailSequence.current+=1;setDetail(blank())
    setCursors(prev=>forward?[...prev,detail.data.next_cursor]:prev.slice(0,-1))
  }
  const max = Math.max(1,...(chart.data?.items||[]).map(item=>item.value))
  return {
    flow,mode,month,year,changeMode,changeMonth,changeYear,shift,
    canBack:mode==='day'?centerDate>'2000-01-01':mode==='month'?Number(year)>2000:month>'2000-01',
    canForward:mode==='day'?centerDate<today:mode==='month'?Number(year)<Number(today.slice(0,4)):month<`${today.slice(0,4)}-12`,
    years:Array.from({length:Number(today.slice(0,4))-2000+1},(_,i)=>String(Number(today.slice(0,4))-i)),
    loading:chart.loading,error:chart.error,retry:()=>{reset();setRetryKey(k=>k+1)},
    range:chart.data?.range||'',total:chart.data?number(chart.data.total):'—',empty:chart.data?.total===0,
    bars:(chart.data?.items||[]).map(item=>({...item,isToday:mode==='day'&&item.start===today,text:number(item.value),height:item.value/max*140})),
    selectedKey,selectBar,expanded,toggleDetail,
    selectedRange:selected?`${selected.start} ~ ${selected.end}`:'',
    detailLoading:detail.loading,detailError:detail.error,
    retryDetail:()=>setDetailRetry(k=>k+1),
    records:(detail.data?.records||[]).map(item=>({id:item.id,title:TYPES[item.type]||'기타 거래',amount:`${item.amount>0?'+':'−'}${number(Math.abs(item.amount))}P`,date:new Date(item.created_at).toLocaleString('ko-KR',{timeZone:'Asia/Seoul',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit'})})),
    page,canPrevious:!detail.loading&&!detail.error&&page>1,canNext:!detail.loading&&detail.data?.next_cursor!=null,
    onPrevious:()=>turnPage(false),onNext:()=>turnPage(true),
  }
}
// 어제 하루의 확정된 기록을 읽습니다. 오늘 적립·사용 및 그래프 조작으로는 재조회하지 않습니다.
function yesterdayKst(today) {
  return new Date(Date.parse(`${today}T00:00:00+09:00`) - 86400000)
    .toLocaleDateString('sv-SE', { timeZone:'Asia/Seoul' })
}
function pointBriefing(earned, spent) {
  if (earned > 0 && spent > 0) return { headline:`어제 ${number(earned)}P를 모으고, ${number(spent)}P를 사용하셨어요.`, message:'포인트를 모으고 사용하는 실천을 이어가셨네요. 오늘도 함께해요.' }
  if (earned > 0) return { headline:`어제 ${number(earned)}P를 모으셨어요.`, message:'작은 실천이 차곡차곡 쌓이고 있어요. 오늘도 포인트를 모아볼까요?' }
  if (spent > 0) return { headline:`어제 ${number(spent)}P를 사용하셨어요.`, message:'모은 포인트를 알차게 사용하셨네요. 오늘은 새로운 포인트를 모아보세요.' }
  return { headline:'오늘의 첫 포인트를 모아볼까요?', message:'AI 인증이나 퀴즈에 참여하고 작은 실천을 포인트로 쌓아보세요.' }
}
function useDailyBriefing() {
  const { user, loading:authLoading } = useAuth()
  const userId = user?.id || null
  const [day,setDay] = useState(todayKst)
  const [retryKey,setRetryKey] = useState(0)
  const [state,setState] = useState(()=>({data:null,loading:true,error:'',userId:null,day:null}))
  // 날짜를 비교하는 일만 수행합니다. 화면 복귀 자체로 API를 다시 부르지 않습니다.
  useEffect(()=>{
    const checkDay=()=>setDay(todayKst())
    const midnight=Date.parse(`${day}T00:00:00+09:00`)+86400000
    const timer=window.setTimeout(checkDay,Math.max(100,midnight-Date.now()+100))
    window.addEventListener('focus',checkDay)
    document.addEventListener('visibilitychange',checkDay)
    return ()=>{window.clearTimeout(timer);window.removeEventListener('focus',checkDay);document.removeEventListener('visibilitychange',checkDay)}
  },[day])
  const yesterday=yesterdayKst(day)
  useEffect(()=>{
    if(authLoading)return
    if(!userId){setState({data:null,loading:false,error:'로그인 후 포인트 브리핑을 확인해 주세요.',userId:null,day});return}
    let alive=true
    setState({data:null,loading:true,error:'',userId,day})
    api.get(`/points/history?currency=point&date=${yesterday}&limit=1&include_summary=true`).then(data=>{
      if(!alive)return
      const summary=data?.summary?.point
      if(!Number.isFinite(summary?.earned)||!Number.isFinite(summary?.spent)||summary.earned<0||summary.spent<0)throw Error('어제의 포인트 합계를 확인하지 못했어요.')
      setState({data:pointBriefing(summary.earned,summary.spent),loading:false,error:'',userId,day})
    }).catch(error=>{if(alive)setState({data:null,loading:false,error:error.message||'브리핑을 불러오지 못했어요.',userId,day})})
    return ()=>{alive=false}
  },[userId,authLoading,day,yesterday,retryKey])
  // 계정이 바뀌거나 날짜가 넘어가면 이전 요약은 잠깐이라도 노출하지 않습니다.
  const current=state.userId===userId&&state.day===day
  return { date:yesterday, headline:current?state.data?.headline||'':'', message:current?state.data?.message||'':'', loading:authLoading||!current||state.loading, error:current?state.error:'', retry:()=>setRetryKey(k=>k+1) }
}

export default function usePoints() {
  const balance=useApi('/points')
  const scans=useApi('/scans/stats')
  const briefing=useDailyBriefing()
  const [version,setVersion]=useState(0)
  const earned=usePointActivity('earned',version),spent=usePointActivity('spent',version)
  const refresh=useCallback(()=>{balance.reload();scans.reload();setVersion(v=>v+1)},[balance.reload,scans.reload])
  useEffect(()=>{window.addEventListener('focus',refresh);return()=>window.removeEventListener('focus',refresh)},[refresh])
  const valid=balance.data&&!balance.data.is_mock&&Number.isFinite(balance.data.points_balance)
  const scanValid=Number.isFinite(scans.data?.total)&&Array.isArray(scans.data?.items)
  const scanCounts=Object.fromEntries(SCAN_CLASSES.map(code=>[code,scanValid?Number(scans.data.items.find(item=>item.class===code)?.count||0):null]))
  return {earned,spent,briefing,refresh,pointsText:valid?number(balance.data.points_balance):'—',dropsText:Number.isFinite(balance.data?.drops_balance)?number(balance.data.drops_balance):'—',balanceLoading:balance.loading,balanceError:balance.error?.message||(!balance.loading&&!valid?'실제 포인트 잔액을 확인해 주세요.':''),scanTotalText:scanValid?number(scans.data.total):'—',scanCounts,scanLoading:scans.loading,scanError:scans.error?.message||(!scans.loading&&!scanValid?'품목 통계를 확인하지 못했어요.':''),retryScans:scans.reload}
}
