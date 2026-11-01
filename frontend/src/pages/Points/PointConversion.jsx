// 포인트 5P를 물방울 1개로 전환합니다.
// '전환하기'에서는 잔액 변경을 미리 보여주고, 확인창의 '예'에서만 실제 API를 호출합니다.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'

const fmt = n => Number(n).toLocaleString('ko-KR')

// 다른 페이지의 실제 아이콘 파일 경로는 이 파일만으로 확인할 수 없어 임시 이모지를 사용합니다.
// 프로젝트의 공통 물방울·포인트 아이콘을 확인한 뒤 이 두 표현만 교체하면 됩니다.
const DROP_ICON = '💧'
const POINT_ICON = '🪙'

const baseButton = {
  padding: 16, borderRadius: 16, fontSize: 16,
  fontWeight: 800, cursor: 'pointer', fontFamily: 'inherit',
}

export default function PointConversion({ onConverted }) {
  const dialog = useRef(null)
  const lock = useRef(false)
  const input = useRef(null)
  const [balance, setBalance] = useState(null)
  const [amount, setAmount] = useState('1')
  const [busy, setBusy] = useState(false)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [step, setStep] = useState('input') // input: 수량 입력 / confirm: 최종 확인
  const [confirmation, setConfirmation] = useState(null)

  const max = Math.min(100000000, Math.floor((balance?.points_balance || 0) / 5))
  const drops = Number(amount)
  const points = drops * 5
  const valid = /^\d+$/.test(amount) && Number.isSafeInteger(drops) && drops >= 1 && drops <= max

  useEffect(() => () => { dialog.current?.close() }, [])

  async function readBalance() {
    const result = await api.get('/points')
    if (
      result.is_mock ||
      !Number.isFinite(result.points_balance) ||
      !Number.isFinite(result.drops_balance)
    ) {
      throw Error('잔액을 확인하지 못했어요.')
    }
    setBalance(result)
    return result
  }

  async function open() {
    if (lock.current || dialog.current?.open) return
    lock.current = true
    setBusy(true)
    setBalance(null)
    setAmount('1')
    setMessage('')
    setNotice('')
    setStep('input')
    setConfirmation(null)
    dialog.current?.showModal()
    try {
      await readBalance()
    } catch (error) {
      setMessage(error.message || '잔액을 불러오지 못했어요.')
    } finally {
      lock.current = false
      setBusy(false)
      input.current?.focus()
    }
  }

  function requestConfirmation(e) {
    e.preventDefault()
    if (busy || lock.current || !balance || !valid) return
    setMessage('')
    // 확인창에는 클릭 순간의 잔액과 전환 수량을 고정해 보여줍니다.
    setConfirmation({
      drops,
      cost: points,
      beforeDrops: balance.drops_balance,
      beforePoints: balance.points_balance,
    })
    setStep('confirm')
  }

  function cancelConfirmation() {
    if (busy || lock.current) return
    // '아니요'는 서버에 아무 요청도 보내지 않고 입력 화면으로 돌아갑니다.
    setConfirmation(null)
    setStep('input')
  }

  async function confirmConversion() {
    if (lock.current || busy || !confirmation) return
    lock.current = true
    setBusy(true)
    setMessage('')
    try {
      // 실제 차감·적립은 '예'를 누른 뒤 한 번만 서버에서 처리합니다.
      const result = await api.post('/points/convert-to-drops', { drops: confirmation.drops })
      if (!Number.isFinite(result.points_balance) || !Number.isFinite(result.drops_balance)) {
        throw Error('전환 후 잔액 응답을 확인하지 못했어요. 다시 전환하지 말고 잔액을 확인해 주세요.')
      }
      setBalance(result)
      setNotice(`물방울 ${fmt(confirmation.drops)}개로 전환했습니다. 현재 물방울 ${fmt(result.drops_balance)}개 · 포인트 ${fmt(result.points_balance)}P`)
      // 별도 완료 팝업 없이 확인창을 닫고 카드·지갑 정보를 갱신합니다.
      dialog.current?.close()
      onConverted?.()
      window.dispatchEvent(new Event('repick-wallet-updated'))
    } catch (error) {
      // 요청 실패/응답 누락 상태에서 자동으로 재요청하지 않습니다.
      setMessage(error.message || '전환 결과를 확인하지 못했어요. 잔액을 확인해 주세요.')
      setStep('input')
      setConfirmation(null)
      setBalance(null)
      try { await readBalance() } catch { /* 잔액 조회 실패 시 전환 버튼은 비활성화 */ }
      onConverted?.()
      window.dispatchEvent(new Event('repick-wallet-updated'))
    } finally {
      lock.current = false
      setBusy(false)
    }
  }

  function change(value) {
    setAmount(String(value))
    setMessage('')
  }

  function handleCancel(e) {
    if (lock.current) {
      e.preventDefault()
    } else if (step === 'confirm') {
      e.preventDefault()
      cancelConfirmation()
    }
  }

  const rowStyle = { display:'flex', alignItems:'center', justifyContent:'space-between', gap:10, fontSize:14 }

  return <>
    <button
      type="button"
      onClick={open}
      style={{ height:48, borderRadius:14, border:'1.5px solid #A9C9B2', background:'transparent', color:'#1F5C3F', fontSize:15, fontWeight:700, cursor:'pointer', fontFamily:'inherit' }}
    >포인트 전환</button>

    {/* 기존 완료 팝업 대신 짧은 완료 메시지만 표시합니다. */}
    {notice && <p role="status" style={{ margin:'8px 0 0', fontSize:13, lineHeight:1.5, color:'#1F5C3F' }}>{notice}</p>}
    <style>{`.repick-conversion::backdrop { background:rgba(18,22,20,.4); }`}</style>

    <dialog
      ref={dialog}
      className="repick-conversion"
      aria-labelledby="conversion-title"
      onCancel={handleCancel}
      style={{ width:'min(450px, calc(100vw - 32px))', boxSizing:'border-box', maxHeight:'90vh', overflowY:'auto', padding:28, border:'2px solid #121614', borderRadius:30, color:'#121614', background:'#FFF', fontFamily:'inherit' }}
    >
      {step === 'input' ? (
        <form onSubmit={requestConfirmation}>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <h2 id="conversion-title" style={{ margin:0, fontSize:20 }}>물방울로 전환할까요?</h2>
            <button type="button" aria-label="닫기" disabled={busy} onClick={() => dialog.current?.close()} style={{ border:0, background:'transparent', fontSize:24, cursor:'pointer' }}>×</button>
          </div>
          <p style={{ fontSize:13, color:'#53765A' }}>보유 {balance ? `${fmt(balance.points_balance)}P` : '확인 중…'}</p>
          <label htmlFor="conversion-amount" style={{ display:'block', marginTop:20, marginBottom:8, fontSize:14 }}>전환할 물방울 개수</label>
          {/* 기존 직접 입력·−/+ 조절 기능을 그대로 유지합니다. */}
          <div style={{ display:'flex', alignItems:'center', gap:12, border:'1px solid #D6DAD3', borderRadius:18, padding:'12px' }}>
            <button type="button" aria-label="물방울 1개 줄이기" disabled={busy || !balance || !Number.isSafeInteger(drops) || drops <= 1} onClick={() => change(Math.max(1, Math.min(max, drops - 1)))} style={{ flexShrink:0, width:40, height:40, border:'1px solid #D6DAD3', borderRadius:12, background:'#F3F8F4', fontSize:24, color:'#1F5C3F' }}>−</button>
            <input ref={input} id="conversion-amount" type="number" inputMode="numeric" min="1" max={max} step="1" value={amount} onChange={e => change(e.target.value)} disabled={busy || !balance} style={{ width:'100%', minWidth:0, border:0, background:'transparent', textAlign:'center', fontSize:26, fontWeight:700 }} />
            <strong>개</strong>
            <button type="button" aria-label="물방울 1개 늘리기" disabled={busy || !balance || max < 1 || !Number.isSafeInteger(drops) || drops >= max} onClick={() => change(Math.min(max, Math.max(0, drops) + 1))} style={{ flexShrink:0, width:40, height:40, border:'1px solid #D6DAD3', borderRadius:12, background:'#F3F8F4', fontSize:24, color:'#1F5C3F' }}>+</button>
          </div>
          {balance && !valid && <p role="status" style={{ fontSize:13, color:'#A33727' }}>{max < 1 ? '전환하려면 최소 5P가 필요해요.' : `물방울 개수를 1~${fmt(max)} 사이의 정수로 입력해 주세요.`}</p>}
          {message && <p role="alert" style={{ fontSize:14, color:'#A33727', lineHeight:1.6 }}>{message}</p>}
          <button type="submit" disabled={busy || !valid} style={{ ...baseButton, width:'100%', marginTop:20, border:0, background:'#10834B', color:'#FFF', opacity:busy || !valid ? .5 : 1 }}>전환하기</button>
        </form>
      ) : (
        <div>
          <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', gap:12 }}>
            <h2 id="conversion-title" style={{ margin:0, fontSize:19 }}>포인트를 물방울로 전환하시겠습니까?</h2>
            <button type="button" aria-label="닫기" disabled={busy} onClick={cancelConfirmation} style={{ border:0, background:'transparent', fontSize:24, cursor:'pointer' }}>×</button>
          </div>
          <p style={{ fontSize:13, color:'#53765A', lineHeight:1.6 }}>전환 후 보유 잔액이 다음과 같이 변경됩니다.</p>
          <div style={{ padding:16, borderRadius:18, background:'#F3F8F4', display:'grid', gap:14 }}>
            <div style={rowStyle}>
              <span><span aria-hidden="true">{DROP_ICON}</span> 물방울</span>
              <span><span style={{ color:'#66766B' }}>{fmt(confirmation?.beforeDrops)}개</span> → <strong>{fmt(confirmation?.beforeDrops + confirmation?.drops)}개</strong></span>
            </div>
            <div style={{ borderTop:'1px solid #DCE8DE' }} />
            <div style={rowStyle}>
              <span><span aria-hidden="true">{POINT_ICON}</span> 포인트</span>
              <span><span style={{ color:'#66766B' }}>{fmt(confirmation?.beforePoints)}P</span> → <strong>{fmt(confirmation?.beforePoints - confirmation?.cost)}P</strong></span>
            </div>
          </div>
          {message && <p role="alert" style={{ color:'#A33727', fontSize:13 }}>{message}</p>}
          <div style={{ display:'flex', gap:10, marginTop:22 }}>
            <button type="button" disabled={busy} onClick={confirmConversion} style={{ ...baseButton, flex:1, border:0, background:'#10834B', color:'#FFF', opacity:busy ? .5 : 1 }}>{busy ? '처리 중…' : '예'}</button>
            <button type="button" disabled={busy} onClick={cancelConfirmation} style={{ ...baseButton, flex:1, border:'1.5px solid #A9C9B2', background:'#FFF', color:'#1F5C3F' }}>아니요</button>
          </div>
        </div>
      )}
    </dialog>
  </>
}
