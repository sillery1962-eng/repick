// 수확한 나무 한 그루 또는 컬렉션 전체를 일반 커뮤니티 글 한 건으로 공유합니다.
export default function ForestSharePicker({ forest: V }) {
  if (!V.shareChoice) return null
  return (
    <div style={{ position:'fixed', inset:0, zIndex:40, display:'grid', placeItems:'center', padding:16, background:'rgba(18,22,20,.55)' }}>
      <section role="dialog" aria-modal="true" aria-labelledby="forest-share-title" style={{ width:460, maxWidth:'100%', maxHeight:'calc(100dvh - 32px)', overflowY:'auto', padding:20, borderRadius:24, boxSizing:'border-box', background:'#FFFFFF', color:'#121614' }}>
        <h2 id="forest-share-title" style={{ margin:'0 0 8px', fontSize:21 }}>{V.shareStep === 'choose' ? '나의 과일나무 공유하기' : '커뮤니티 업로드'}</h2>
        {V.shareStep === 'choose' ? <>
        <p style={{ margin:'0 0 18px', fontSize:13, lineHeight:1.6, color:'#454B47' }}>공유할 나무를 선택해 주세요.</p>
        <label style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 0', fontWeight:700 }}>
          <input type="radio" name="forest-share-mode" checked={V.shareMode === 'single'} onChange={() => V.onShareMode('single')} disabled={V.shareBusy} /> 원하는 과일나무 한 그루
        </label>
        {V.shareMode === 'single' && (
          <div role="group" aria-label="공유할 과일나무" style={{ display:'grid', gridTemplateColumns:'repeat(3, minmax(0, 1fr))', gridAutoRows:112, gap:8, maxHeight:248, overflowY:'auto', padding:4 }}>
            {(V.harvested || []).map(tree => (
              <button type="button" key={tree.id} disabled={V.shareBusy} aria-pressed={V.shareTreeId === tree.id} onClick={() => V.onShareTreeId(tree.id)} style={{ display:'flex', flexDirection:'column', alignItems:'center', gap:2, padding:6, border:V.shareTreeId === tree.id?'2px solid #2F8F4E':'1px solid #DDE2D9', borderRadius:12, background:'#F7F8F4', cursor:'pointer', minWidth:0 }}>
                <img src={`/images/trees/${tree.f0?'apple':tree.f1?'pear':'persimmon'}.png`} alt="" width="66" height="66" style={{ maxWidth:'100%', objectFit:'contain' }} />
                <strong style={{ fontSize:12 }}>{tree.name}</strong>
                <span style={{ fontSize:10, color:'#5E645F' }}>{tree.date}</span>
              </button>
            ))}
          </div>
        )}
        <label style={{ display:'flex', alignItems:'center', gap:8, padding:'14px 0', fontWeight:700 }}>
          <input type="radio" name="forest-share-mode" checked={V.shareMode === 'all'} onChange={() => V.onShareMode('all')} disabled={V.shareBusy} /> 전체 공유 · {V.harvestCount}그루
        </label>
        {V.shareMode === 'all' && <p style={{ margin:'0 0 16px', padding:12, borderRadius:12, background:'#F1F7EC', fontSize:12, lineHeight:1.6 }}>수확한 나무 {V.harvestCount}그루를 각각 담아 한 장의 이미지로 올려요.</p>}
        </> : <>
          {V.sharePreviewUrl && <img src={V.sharePreviewUrl} alt="커뮤니티에 게시할 나의 과일나무 사진" style={{ display:'block', width:'100%', maxHeight:300, objectFit:'contain', margin:'12px 0', borderRadius:14, background:'#F1F7EC' }} />}
          <label htmlFor="forest-share-text" style={{ display:'block', marginTop:14, fontWeight:700 }}>게시글</label>
          <textarea id="forest-share-text" value={V.shareText} onChange={event => V.onShareText(event.target.value)} disabled={V.shareBusy} maxLength={1000} placeholder="나무를 키운 이야기를 적어 주세요." style={{ boxSizing:'border-box', width:'100%', minHeight:96, padding:12, marginTop:8, resize:'vertical', border:'1px solid #DDE2D9', borderRadius:12, font:'inherit' }} />
          <p style={{ textAlign:'center', fontWeight:700, margin:'16px 0 0' }}>게시하시겠습니까?</p>
        </>}
        {V.shareError && <p role="alert" style={{ color:'#B23232', fontSize:13 }}>{V.shareError}</p>}
        <div style={{ display:'flex', gap:8, marginTop:12 }}>
          {V.shareStep === 'choose' ? <>
            <button type="button" disabled={V.shareBusy} onClick={V.onCloseSharePicker} style={{ flex:1, minHeight:44, border:0, borderRadius:12, background:'#F2F3EE', fontWeight:700 }}>취소</button>
            <button type="button" disabled={V.shareBusy} onClick={V.onPrepareShare} style={{ flex:1, minHeight:44, border:0, borderRadius:12, background:'#CDEB45', fontWeight:800 }}>{V.shareBusy?'사진 준비 중…':'확인'}</button>
          </> : <>
            <button type="button" disabled={V.shareBusy} onClick={V.onCloseSharePicker} style={{ flex:1, minHeight:44, border:0, borderRadius:12, background:'#F2F3EE', fontWeight:700 }}>아니요</button>
            <button type="button" disabled={V.shareBusy} onClick={V.onSubmitShare} style={{ flex:1, minHeight:44, border:0, borderRadius:12, background:'#CDEB45', fontWeight:800 }}>{V.shareBusy?'게시 중…':'예'}</button>
          </>}
        </div>
      </section>
    </div>
  )
}
