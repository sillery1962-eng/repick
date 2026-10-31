// 물방울 개수 × 5P를 사용하고, 실제 잔액은 서버 응답으로 갱신합니다.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'

const fmt = n => Number(n).toLocaleString('ko-KR')
export default function PointConversion({ onConverted }) {
  const dialog = useRef(null)
  const lock = useRef(false)
  const [balance, setBalance] = useState(null)
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [success, setSuccess] = useState(false)
  const input = useRef(null)
  const max = Math.min(100000000, Math.floor((balance?.points_balance || 0) / 5))
  // 입력값은 물방울 개수이며, 필요한 포인트는 5배로 계산합니다.
  const drops = Number(amount)
  const points = drops * 5
  const valid = /^\d+$/.test(amount) && Number.isSafeInteger(drops) && drops >= 1 && drops <= max
  useEffect(() => () => { dialog.current?.close() }, [])
  async function readBalance() {
    const result = await api.get('/points')
    if (result.is_mock || !Number.isFinite(result.points_balance) || !Number.isFinite(result.drops_balance)) throw Error('잔액을 확인하지 못했어요.')
    setBalance(result)
  }
  async function open() {
    if (lock.current) return
    lock.current = true; setBusy(true); setBalance(null); setMessage(''); setSuccess(false); setAmount('1')
    dialog.current.showModal()
    try { await readBalance() } catch (e) { setMessage(e.message || '잔액을 불러오지 못했어요.') }
    finally { lock.current = false; setBusy(false); input.current?.focus() }
  }
  async function submit(e) {
    e.preventDefault()
    if (lock.current || !valid || success) return
    lock.current = true; setBusy(true); setMessage('')
    try {
      // 클릭 중복을 막고 차감과 적립을 서버의 한 요청으로 처리합니다.
      const result = await api.post('/points/convert-to-drops', { drops })
      setSuccess(true)
      setBalance(result)
      setMessage(`${fmt(points)}P를 물방울 ${fmt(drops)}개로 전환했어요.`)
      onConverted()
      window.dispatchEvent(new Event('repick-wallet-updated'))
    } catch (error) {
      // 응답을 놓쳤을 때 자동 재전환하지 않고 잔액을 다시 확인합니다.
      setBalance(null)
      setMessage(error.message || '전환 결과를 확인하지 못했어요. 잔액을 확인해 주세요.')
      try { await readBalance() } catch { /* 잔액을 모르면 전환 버튼을 비활성화합니다. */ }
      onConverted()
      window.dispatchEvent(new Event('repick-wallet-updated'))
    } finally { lock.current = false; setBusy(false) }
  }
  const change = value => { setAmount(String(value)); setMessage(''); setSuccess(false) }
  return <>
    <button type="button" onClick={open} style={{ height:48, borderRadius:14, border:'1.5px solid #A9C9B2', background:'transparent', color:'#1F5C3F', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}>포인트 전환</button>
    <style>{`.repick-conversion::backdrop { background:rgba(18,22,20,.4); }`}</style>
    <dialog ref={dialog} className="repick-conversion" aria-labelledby="conversion-title" onCancel={e => { if (lock.current) e.preventDefault() }} style={{ width:'min(450px, calc(100vw - 32px))', boxSizing:'border-box', maxHeight:'90vh', overflowY:'auto', padding:28, border:'2px solid #121614', borderRadius:30, color:'#121614', background:'#FFF', fontFamily:'inherit' }}>
      <form onSubmit={submit}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
          <h2 id="conversion-title" style={{ margin:0, fontSize:20 }}>물방울로 전환할까요?</h2>
          <button type="button" aria-label="닫기" disabled={busy} onClick={()=>dialog.current.close()} style={{ border:0, background:'transparent', fontSize:24, cursor:'pointer' }}>×</button>
        </div>
        <p style={{ fontSize:13, color:'#53765A' }}>보유 {balance ? `${fmt(balance.points_balance)}P` : '확인 중…'} · 5P당 물방울 1개</p>
        <label htmlFor="conversion-amount" style={{ display:'block', marginTop:20, marginBottom:8, fontSize:14 }}>전환할 물방울 개수</label>
        {/* 직접 입력하거나 −/+ 버튼으로 물방울을 한 개씩 조절합니다. */}
        <div style={{ display:'flex', alignItems:'center', gap:12, border:'1px solid #D6DAD3', borderRadius:18, padding:'12px' }}>
          <button type="button" aria-label="물방울 1개 줄이기" disabled={busy || success || !balance || !Number.isSafeInteger(drops) || drops <= 1} onClick={()=>change(Math.max(1, Math.min(max, drops - 1)))} style={{ flexShrink:0, width:40, height:40, border:'1px solid #D6DAD3', borderRadius:12, background:'#F3F8F4', fontSize:24, color:'#1F5C3F' }}>−</button>
          <input ref={input} id="conversion-amount" type="number" inputMode="numeric" min="1" max={max} step="1" value={amount} onChange={e=>change(e.target.value)} disabled={busy || success || !balance} style={{ width:'100%', minWidth:0, border:0, background:'transparent', textAlign:'center', fontSize:26, fontWeight:700 }} /><strong>개</strong>
          <button type="button" aria-label="물방울 1개 늘리기" disabled={busy || success || !balance || max < 1 || !Number.isSafeInteger(drops) || drops >= max} onClick={()=>change(Math.min(max, Math.max(0, drops) + 1))} style={{ flexShrink:0, width:40, height:40, border:'1px solid #D6DAD3', borderRadius:12, background:'#F3F8F4', fontSize:24, color:'#1F5C3F' }}>+</button>
        </div>
        {!success && balance && !valid && <p role="status" style={{ fontSize:13, color:'#A33727' }}>{max < 1 ? '전환하려면 최소 5P가 필요해요.' : `물방울 개수를 1~${fmt(max)} 사이의 정수로 입력해 주세요.`}</p>}
        <div style={{ display:'flex', justifyContent:'space-between', marginTop:20, fontSize:14 }}><span>전환 후 남는 포인트</span><strong>{balance ? `${fmt(balance.points_balance - (!success && valid ? points : 0))}P` : '—'}</strong></div>
        {message && <p role="status" style={{ fontSize:14, lineHeight:1.6 }}>{message}</p>}
        <button type={success?'button':'submit'} onClick={success?()=>dialog.current.close():undefined} disabled={busy || (!success && !valid)} style={{ width:'100%', marginTop:20, padding:18, border:0, borderRadius:20, background:'#10834B', color:'#FFF', fontSize:18, fontWeight:800, opacity:busy || (!success && !valid) ? .5 : 1, cursor:'pointer' }}>{busy?'처리 중…':success?'완료':'전환하기'}</button>
      </form>
    </dialog>
  </>
}
