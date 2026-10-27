import { Link } from 'react-router-dom'
import Logo from './Logo'

// PC 아래쪽 푸터 (시안 그대로). [ ] 값은 아직 정하지 않은 회사 정보입니다.
const COLUMNS = [
  { title: '서비스', links: [['/scan', 'AI 분리배출 인증'], ['/forest', '나의 숲'], ['/community', '커뮤니티'], ['/map', '수거함 찾기']] },
  { title: '리워드', links: [['/points', '포인트'], ['/donate', '기부하기'], ['/events', '이벤트 · 챌린지'], ['/points#shop', '친환경샵']] },
  { title: '고객지원', links: [['/notice', '공지사항'], ['/chat', '자주 묻는 질문'],['#contact', '1:1 문의']] },
]

const SNS = ['인스타그램', '유튜브', '블로그', '카카오톡 채널']

function SnsIcon({ name }) {
  switch (name) {
    case '인스타그램':
      return <><rect x="3" y="3" width="18" height="18" rx="5" /><circle cx="12" cy="12" r="4" /><circle cx="17.5" cy="6.5" r="1" fill="currentColor" /></>
    case '유튜브':
      return <><rect x="2.5" y="5.5" width="19" height="13" rx="4" /><path d="M10.5 9.5v5l4.2-2.5z" fill="currentColor" stroke="none" /></>
    case '블로그':
      return <><path d="M4 20h4L19 9l-4-4L4 16z" /><path d="M13.5 6.5l4 4" /></>
    default:
      return <path d="M12 4C6.5 4 2 7.5 2 11.8c0 2.8 1.9 5.2 4.7 6.6l-1 3.6 4.2-2.8c.7.1 1.4.2 2.1.2 5.5 0 10-3.5 10-7.8S17.5 4 12 4z" fill="currentColor" stroke="none" />
  }
}

function FooterLink({ to, children, className }) {
  return to.startsWith('#') ? <a href={to} className={className}>{children}</a> : <Link to={to} className={className}>{children}</Link>
}

export default function PcFooter() {
  return (
    <footer className="pc-footer">
      <div className="pc-footer-in">
        <div className="pc-footer-top">
          <div className="pc-footer-brand">
            <Link to="/" aria-label="RePick"><Logo size={28} /></Link>
            <div className="pc-footer-slogan">버리는 순간,<br />나의 숲이 자라요</div>
            <div className="pc-sns">
              {SNS.map((label) => (
                <a key={label} href={`#${label}`} aria-label={label}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><SnsIcon name={label} /></svg>
                </a>
              ))}
            </div>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title} className="pc-footer-col">
              <b>{col.title}</b>
              {col.links.map(([to, label]) => <FooterLink key={label} to={to}>{label}</FooterLink>)}
            </div>
          ))}
          <div className="pc-footer-partner">
            <span className="pc-footer-partner-tag">PARTNER</span>
            <span className="pc-footer-partner-title">리사이클 파트너가<br />되어주세요</span>
            <span className="pc-footer-partner-sub">참여기업은 고객 포인트 2배 적립</span>
            <a href="#partner">제휴 문의하기 ›</a>
          </div>
        </div>
        <div className="pc-footer-bottom">
          <div>
            <div className="pc-footer-legal">
              <a href="#terms">이용약관</a>
              <a href="#privacy" className="strong">개인정보처리방침</a>
              <a href="#location">위치기반서비스 이용약관</a>
            </div>
            <div className="pc-footer-company">
              상호 [회사명] · 대표 [대표자명] · 사업자등록번호 [000-00-00000]<br />
              주소 [주소] · 고객센터 [0000-0000] · 이메일 [hello@repick.kr]
            </div>
          </div>
          <div className="pc-footer-copy">© 2026 RePick. All rights reserved.</div>
        </div>
      </div>
    </footer>
  )
}
