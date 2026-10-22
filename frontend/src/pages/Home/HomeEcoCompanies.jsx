import { Link } from 'react-router-dom'
import { ECO_COMPANIES } from '../../data/ecoCompanies'

// 홈 "친환경 기업 추천"의 기업 4곳 (PC·모바일 공용, 모양은 시안 그대로)
// 목록은 data/ecoCompanies.js — url이 있으면 기업 사이트를 새 탭으로, 없으면 저탄소샵으로
// circle: 사진 원 크기 (PC 96 · 모바일 70), columns: 한 줄 칸 수 (PC 4 · 모바일 2)
const SHOW = 4
const itemStyle = { display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', textAlign: 'center' }

export default function HomeEcoCompanies({ circle, columns = 4 }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`, gap: '16px 10px' }}>
      {ECO_COMPANIES.slice(0, SHOW).map((c) => {
        const body = (
          <>
            <span style={{ width: `${circle}px`, height: `${circle}px`, borderRadius: '50%', background: '#E6E9E2', position: 'relative', overflow: 'hidden', isolation: 'isolate', display: 'block', flexShrink: '0' }}>
              <img src={c.image} alt={c.alt} loading="lazy" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', zIndex: '-1' }} />
            </span>
            <span style={{ fontSize: '14px', fontWeight: '700' }}>{c.name}</span>
            {c.desc ? <span style={{ fontSize: '12px', color: '#454B47', marginTop: '-6px' }}>{c.desc}</span> : null}
          </>
        )
        return c.url ? (
          <a key={c.name} href={c.url} target="_blank" rel="noopener noreferrer" style={itemStyle}>
            {body}
          </a>
        ) : (
          <Link key={c.name} to="/points#shop" style={itemStyle}>
            {body}
          </Link>
        )
      })}
    </div>
  )
}
