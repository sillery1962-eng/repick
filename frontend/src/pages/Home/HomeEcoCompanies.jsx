import { useState } from 'react'
import { ECO_SHOPS as SHOPS } from '../../data/ecoCompanies'
import { ShopViewer } from '../../features/eco-shop/EcoShop'

// 홈 "친환경 기업 추천" (PC·모바일 공용) = 친환경샵(포인트 화면 #shop)과 같은 쇼핑몰 목록
// 동그라미를 누르면 친환경샵과 같은 쇼핑몰 팝업(화면 안에서 보기 + 새 탭에서 열기)이 바로 뜸
// circle: 사진 원 크기 (PC 96 · 모바일 70), mobile: 팝업을 폰 화면 꽉 차게
export default function HomeEcoCompanies({ circle, mobile = false }) {
  const [open, setOpen] = useState(null)
  return (
    <>
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${SHOPS.length}, minmax(0, 1fr))`, gap: '16px 10px' }}>
        {SHOPS.map((shop) => (
          <button type="button" key={shop.name} onClick={() => setOpen(shop)} aria-label={`${shop.name} 쇼핑몰 보기`} style={{ border: '0', padding: '0', background: 'none', font: 'inherit', color: 'inherit', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }}>
            <span style={{ width: `${circle}px`, height: `${circle}px`, borderRadius: '50%', background: shop.bg || '#E6E9E2', position: 'relative', overflow: 'hidden', isolation: 'isolate', display: 'block', flexShrink: '0' }}>
              <img src={shop.image} alt={shop.alt} loading="lazy" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', zIndex: '-1' }} />
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{shop.name}</span>
            <span style={{ fontSize: '12px', color: '#454B47', marginTop: '-6px' }}>{shop.tag}</span>
          </button>
        ))}
      </div>
      {open && <ShopViewer shop={open} mobile={mobile} onClose={() => setOpen(null)} />}
    </>
  )
}
