// 친환경샵 (포인트 화면 아래 #shop) — 외부 쇼핑몰 링크만, 포인트 차감·구매 기록 없음 (api-spec 8번)
// 카드를 누르면 화면 위 팝업 안(iframe)에서 쇼핑몰을 보여 주고, 구매는 [새 탭에서 열기]로 원래 사이트에서.
// 쇼핑몰이 나중에 다른 사이트 안에 뜨는 걸 막으면 팝업이 빈 화면이 될 수 있어 새 탭 버튼을 늘 같이 둠.
import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'

// 쇼핑몰을 바꾸거나 늘리려면 이 배열만 고치면 돼요.
// 사진은 분위기만 맞춘 무료 사진(CC0, Wikimedia Commons) — 쇼핑몰의 실제 상품 사진이 아님
//   비누: Marseille soap bars (lemon verbena and lavender) / 가방: The recycle bag at the Kabilin Center 1
//   매장: Zero waste section in Gimsel, de Groene Passage 2024-12-03
// - frameWidth: PC 화면 폭이 고정된 쇼핑몰(좌우가 잘려 보임)만. 그 폭으로 띄운 뒤 팝업에 맞게 줄여 보여 줌
//   (동구밭 PC 사이트는 최소 폭 1280px, 폰에서는 모바일 사이트로 바뀌어 줄이지 않음)
const SHOPS = [
  { name: '동구밭', tag: '고체 화장품 · 생활용품', desc: '장애인과 함께 만드는 친환경 고체 비누·샴푸', url: 'https://donggubat.co.kr/', frameWidth: 1280, image: '/design/eco-shop/soap-bars.jpg', alt: '초록·보라색 고체 비누 사진', bg: '#E8F3E4' },
  { name: '플립플롭', tag: '업사이클링', desc: '버려진 소재를 새 디자인 제품으로', url: 'https://flipflop.kr/', image: '/design/eco-shop/upcycled-bag.jpg', alt: '재활용 소재로 만든 가방 사진', bg: '#E6F0FB' },
  { name: '자연상점', tag: '제로웨이스트 · 공정무역', desc: '친환경 생활용품·비건·선물세트 전문몰', url: 'https://onlyeco.co.kr/', image: '/design/eco-shop/zero-waste-store.jpg', alt: '곡물을 덜어 사는 제로웨이스트 매장 사진', bg: '#FFF3D6' },
]

const newTab = { target: '_blank', rel: 'noopener noreferrer' }

// fitWidth가 있으면 iframe을 그 폭으로 만들고, 팝업 폭보다 넓으면 비율대로 줄임 (transform scale)
function ShopFrame({ shop, fitWidth }) {
  const boxRef = useRef(null)
  const [box, setBox] = useState({ width: 0, height: 0 })

  useEffect(() => {
    const el = boxRef.current
    if (!el) return
    const observer = new ResizeObserver(([entry]) => setBox({ width: entry.contentRect.width, height: entry.contentRect.height }))
    observer.observe(el)
    return () => observer.disconnect()
  }, [])

  const scale = fitWidth && box.width && box.width < fitWidth ? box.width / fitWidth : 1
  const frameStyle = scale < 1
    ? { width: fitWidth, height: box.height / scale, transform: `scale(${scale})`, transformOrigin: '0 0' }
    : { width: '100%', height: '100%' }

  return (
    <div ref={boxRef} style={{ flex:1, minHeight:0, position:'relative', overflow:'hidden', background:'#F7F8F4' }}>
      {/* sandbox: 쇼핑몰이 우리 화면(맨 위 창)을 다른 주소로 바꾸지 못하게. 팝업(결제창 등)은 새 창으로 */}
      <iframe title={`${shop.name} 쇼핑몰 화면`} src={shop.url} referrerPolicy="no-referrer" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-popups-to-escape-sandbox" style={{ position:'absolute', top:0, left:0, border:0, ...frameStyle }} />
    </div>
  )
}

function ShopViewer({ shop, mobile, onClose }) {
  // Esc로 닫기 + 팝업이 떠 있는 동안 뒤 화면 스크롤 막기
  useEffect(() => {
    const onKey = e => { if (e.key === 'Escape') onClose() }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => { window.removeEventListener('keydown', onKey); document.body.style.overflow = overflow }
  }, [onClose])

  return (
    <div role="dialog" aria-modal="true" aria-label={`${shop.name} 쇼핑몰`} onClick={onClose} style={{ position:'fixed', inset:0, zIndex:1000, background:'rgba(18,22,20,.55)', display:'flex', alignItems:'center', justifyContent:'center', padding:mobile?0:24 }}>
      <div onClick={e=>e.stopPropagation()} style={{ width:'100%', maxWidth:mobile?'none':1100, height:mobile?'100%':'min(860px, 100%)', background:'#FFFFFF', borderRadius:mobile?0:24, overflow:'hidden', display:'flex', flexDirection:'column' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, padding:mobile?'10px 12px':'14px 18px', borderBottom:'1px solid #DDE2D9' }}>
          <div style={{ flex:1, minWidth:0 }}>
            <strong style={{ fontSize:mobile?15:17 }}>{shop.name}</strong>
            <div style={{ fontSize:11, color:'#6B716D', marginTop:2, overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>안 보이거나 구매하려면 새 탭에서 열어 주세요</div>
          </div>
          <a href={shop.url} {...newTab} style={{ flexShrink:0, height:38, padding:'0 14px', borderRadius:12, background:'#121614', color:'#FFFFFF', display:'inline-flex', alignItems:'center', fontSize:13, fontWeight:800 }}>새 탭에서 열기 ↗</a>
          <button type="button" aria-label="닫기" onClick={onClose} style={{ flexShrink:0, width:38, height:38, border:0, borderRadius:12, background:'#F2F3EE', fontSize:18, cursor:'pointer' }}>✕</button>
        </div>
        <ShopFrame shop={shop} fitWidth={mobile ? 0 : shop.frameWidth || 0} />
      </div>
    </div>
  )
}

// 메뉴(/points#shop)로 들어오면 Layout이 한 번 맞춰 주지만, 그 뒤 위쪽 그래프·내역이 불러와지며
// 친환경샵이 아래로 밀려 잘림 → 화면 높이가 바뀌는 동안(최대 5초) 다시 맞춤. 사용자가 스크롤하면 멈춤
function useFollowHash(ref) {
  const { hash, key } = useLocation()
  useEffect(() => {
    if (hash !== '#shop' || !ref.current) return
    // PC 헤더(.pc-header)는 위에 붙어 따라다녀서(sticky) 그 높이만큼 덜 내려가야 가려지지 않음
    const align = () => {
      if (!ref.current) return
      const header = document.querySelector('.pc-header')?.offsetHeight || 0
      window.scrollTo({ top: ref.current.getBoundingClientRect().top + window.scrollY - header - 16 })
    }
    const observer = new ResizeObserver(align)
    // body는 index.css에서 height: 100%라 내용이 길어져도 크기가 안 변함 → 실제로 길어지는 공통 틀(.layout)을 지켜봄
    observer.observe(document.querySelector('.layout') || document.body)
    const stop = () => { observer.disconnect(); clearTimeout(timer); ['wheel', 'touchstart', 'keydown'].forEach(e => window.removeEventListener(e, stop)) }
    const timer = setTimeout(stop, 5000)
    ;['wheel', 'touchstart', 'keydown'].forEach(e => window.addEventListener(e, stop, { passive: true }))
    // Layout의 스크롤(헤더 높이를 안 뺌)이 이 효과보다 나중에 돌아서 다음 화면 그리기 때 한 번 더 맞춤
    const frame = requestAnimationFrame(align)
    return () => { cancelAnimationFrame(frame); stop() }
  }, [hash, key, ref])
}

export default function EcoShop({ mobile = false }) {
  const [open, setOpen] = useState(null)
  const shopRef = useRef(null)
  useFollowHash(shopRef)

  return (
    <div ref={shopRef} id="shop" style={{ background:'#EEF0EA', borderRadius:mobile?22:28, padding:mobile?20:28, boxSizing:'border-box' }}>
      <span style={{ height:26, padding:'0 10px', borderRadius:999, background:'#CDEB45', fontSize:12, fontWeight:800, display:'inline-flex', alignItems:'center' }}>친환경샵 · 외부 쇼핑몰</span>
      <div style={{ fontSize:mobile?20:24, fontWeight:800, lineHeight:1.35, marginTop:12 }}>지구에 좋은 제품을 만나 보세요</div>
      <div style={{ fontSize:14, color:'#454B47', marginTop:6 }}>각 쇼핑몰 사이트로 연결돼요. RePick 포인트로 결제되지는 않아요.</div>
      <div style={{ display:'grid', gridTemplateColumns:mobile?'minmax(0, 1fr)':'repeat(3, minmax(0, 1fr))', gap:12, marginTop:18 }}>
        {SHOPS.map(shop => (
          <button type="button" key={shop.name} onClick={()=>setOpen(shop)} aria-label={`${shop.name} 쇼핑몰 보기`} style={{ border:0, padding:0, textAlign:'left', font:'inherit', color:'inherit', cursor:'pointer', borderRadius:22, background:'#FFFFFF', overflow:'hidden', display:'flex', flexDirection:mobile?'row':'column' }}>
            <span style={{ width:mobile?110:'auto', height:mobile?'auto':150, minHeight:mobile?110:0, flexShrink:0, background:shop.bg, position:'relative', overflow:'hidden', isolation:'isolate' }}>
              <img src={shop.image} alt={shop.alt} style={{ position:'absolute', inset:0, width:'100%', height:'100%', objectFit:'cover', zIndex:-1 }} />
            </span>
            <span style={{ padding:'12px 14px 14px', display:'flex', flexDirection:'column', gap:4, minWidth:0 }}>
              <span style={{ fontSize:12, color:'#5E645F' }}>{shop.tag}</span>
              <span style={{ fontSize:16, fontWeight:800 }}>{shop.name}</span>
              <span style={{ fontSize:13, color:'#454B47' }}>{shop.desc}</span>
              <span style={{ fontSize:12, fontWeight:800, color:'#1F5C3F', marginTop:2 }}>쇼핑몰 보기 ›</span>
            </span>
          </button>
        ))}
      </div>
      {open && <ShopViewer shop={open} mobile={mobile} onClose={()=>setOpen(null)} />}
    </div>
  )
}
