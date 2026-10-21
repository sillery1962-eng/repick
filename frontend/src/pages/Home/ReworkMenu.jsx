import { useEffect, useRef, useState } from 'react'
import { createPortal } from 'react-dom'

// 홈 바로가기의 "리워크" 칸 (모양은 시안 그대로). 아직 기능이 없어서 누르면 "준비 중" 팝업만 띄움
// boxSize: 아이콘 칸 크기 (PC 68 · 모바일 60, 시안 그대로)
function ComingSoon({ onClose }) {
  const okRef = useRef(null)
  useEffect(() => {
    okRef.current?.focus()
    const onKey = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return createPortal(
    <div onClick={onClose} style={{ position: 'fixed', inset: '0', zIndex: '1000', background: 'rgba(18, 22, 20, 0.55)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '16px', boxSizing: 'border-box' }}>
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="rework-soon-title"
        onClick={(e) => e.stopPropagation()}
        style={{ width: '100%', maxWidth: '320px', background: '#FFFFFF', borderRadius: '24px', padding: '28px 24px 20px', boxSizing: 'border-box', textAlign: 'center', color: '#121614', fontFamily: 'var(--font-base)', display: 'flex', flexDirection: 'column', gap: '8px' }}
      >
        <strong id="rework-soon-title" style={{ fontSize: '18px', fontWeight: '800' }}>준비 중입니다</strong>
        <span style={{ fontSize: '14px', color: '#454B47', lineHeight: '1.5' }}>리워크 기능은 나중에 만나요.</span>
        <button ref={okRef} type="button" onClick={onClose} style={{ marginTop: '12px', height: '44px', borderRadius: '14px', border: 'none', background: '#121614', color: '#FFFFFF', fontSize: '14px', fontWeight: '700', cursor: 'pointer', fontFamily: 'inherit' }}>
          확인
        </button>
      </div>
    </div>,
    document.body,
  )
}

export default function ReworkMenu({ boxSize }) {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', fontSize: '13px', fontWeight: '500', border: 'none', background: 'none', padding: '0', color: 'inherit', fontFamily: 'inherit', cursor: 'pointer' }}>
        <span style={{ width: `${boxSize}px`, height: `${boxSize}px`, borderRadius: '20px', background: '#F2F3EE', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <svg width="30" height="30" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <ellipse cx="12" cy="21.3" rx="7" ry="1.4" fill="#BFE6D6" />
            <circle cx="13.6" cy="4.2" r="2.4" fill="#17A37B" />
            <path d="M12.6 8.4l-1.6 6.1" stroke="#17A37B" strokeWidth="3.2" strokeLinecap="round" />
            <path d="M11 14.5l-2.8 5.8M11 14.5l3 2.6.4 3.3" stroke="#17A37B" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M12.4 9.2l-3.6 2.4M12.6 9.6l2.4 2.9 2.6.6" stroke="#0E7357" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        리워크
      </button>
      {open ? <ComingSoon onClose={() => setOpen(false)} /> : null}
    </>
  )
}
