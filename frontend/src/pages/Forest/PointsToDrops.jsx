// 2026-10-30: 나의 숲에서 5P를 물방울 1개로 전환합니다.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'

export default function PointsToDrops({ disabled, onConverted }) {
  const [opened, setOpened] = useState(false)
  const [points, setPoints] = useState(null)
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const locked = useRef(false)
  const mounted = useRef(true)
  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false }
  }, [])
  const quantity = Number(amount)
  const valid = /^\d+$/.test(amount) && Number.isSafeInteger(quantity) && quantity > 0 && quantity <= 100000000
  const cost = valid ? quantity * 5 : 0
  const refreshBalance = async () => {
    const result = await api.get('/points')
    if (!Number.isFinite(result.points_balance) || result.is_mock) throw Error('포인트 잔액을 확인하지 못했어요.')
    if (mounted.current) setPoints(result.points_balance)
  }
  const open = async () => {
    if (locked.current || disabled) return
    locked.current = true; setBusy(true); setMessage(''); setPoints(null); setOpened(true)
    try { await refreshBalance() }
    catch (error) { if (mounted.current) setMessage(error.message || '잔액을 불러오지 못했어요.') }
    finally { locked.current = false; if (mounted.current) setBusy(false) }
  }
  const convert = async event => {
    event.preventDefault()
    if (locked.current || disabled || !valid || points === null || cost > points) return
    locked.current = true; setBusy(true); setMessage('')
    try {
      // 중복 클릭은 막고, 차감·적립은 서버의 한 요청으로 처리합니다.
      const result = await api.post('/points/convert-to-drops', { drops: quantity })
      if (!mounted.current) return
      setPoints(result.points_balance)
      setMessage(`${cost.toLocaleString('ko-KR')}P를 물방울 ${quantity.toLocaleString('ko-KR')}개로 전환했어요.`)
      onConverted()
    } catch (error) {
      if (!mounted.current) return
      // 응답을 놓친 경우 자동 재요청하지 않고 실제 잔액을 확인합니다.
      setMessage(error.message || '처리 결과를 확인하지 못했어요. 잔액을 확인해 주세요.')
      setPoints(null)
      try { await refreshBalance() } catch { /* 잔액 미확인 상태에서는 재전환을 막습니다. */ }
      if (mounted.current) onConverted()
    } finally { locked.current = false; if (mounted.current) setBusy(false) }
  }
  const buttonStyle = { padding:'10px 14px', borderRadius:12, border:'1px solid #B7D7C0', background:'#FFF', color:'#1F5C3F', cursor:'pointer' }
  return <div style={{ marginBottom:12, padding:12, background:'#FFF', borderRadius:14 }}>
    <button type="button" onClick={open} disabled={disabled || busy} aria-expanded={opened} style={buttonStyle}>⭐ 포인트 전환 · 5P → 💧 1개</button>
    {opened && <form onSubmit={convert} style={{ marginTop:12 }}>
      <p style={{ margin:'0 0 10px', fontSize:13 }}>보유 포인트: {points === null ? '확인 중' : `${points.toLocaleString('ko-KR')}P`}</p>
      <label style={{ display:'flex', flexWrap:'wrap', alignItems:'center', gap:8, fontSize:13 }}>
        받을 물방울
        <input type="number" min="1" max={Math.max(1, Math.floor((points || 0)/5))} step="1" value={amount} onChange={e=>setAmount(e.target.value)} disabled={busy || disabled} style={{ width:90, padding:8, borderRadius:8, border:'1px solid #B7D7C0' }} />개
      </label>
      <p style={{ fontSize:12 }}>사용할 포인트: {cost.toLocaleString('ko-KR')}P</p>
      {points !== null && cost > points && <p role="status">포인트가 부족해요.</p>}
      <button type="submit" disabled={busy || disabled || !valid || points === null || cost > points} style={buttonStyle}>{busy ? '처리 중…' : '포인트로 물방울 받기'}</button>
      <button type="button" onClick={()=>setOpened(false)} disabled={busy} style={{...buttonStyle,marginLeft:8}}>닫기</button>
    </form>}
    {message && <p role="status" style={{ fontSize:13, lineHeight:1.6 }}>{message}</p>}
  </div>
}
