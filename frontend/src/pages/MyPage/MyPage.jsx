import { useState } from 'react'
import { Link } from 'react-router-dom'
import { DropIcon } from '../../components/Icons'
import Logo from '../../components/Logo'
import useIsPc from '../../lib/useIsPc'
import useMyPage, { GU_LIST, ago, fullDate, shortDate } from './useMyPage'
import './mypage.css'

/*
  마이페이지 — claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교의 "마이페이지 시안 2" (PC v45p_My2 · 모바일 v45pm_My2).
  PC: 프로필 줄 → [쿠폰함 | 내 활동] 2단 → 로그아웃 / 모바일: 위 막대(로고·잔액) → 한 줄씩
  담당: 오지원
*/

// 나의 나무선물 아이콘 (나의 숲 ForestGifts와 같은 그림)
function GiftIcon({ kind }) {
  let shape
  switch (kind) {
    case 'notebook': shape = <><rect x="13" y="8" width="32" height="42" rx="4" fill="#FFFFFF" /><path d="M20 9v40M9 17h8M9 27h8M9 37h8M27 22h11M27 30h9" /></>; break
    case 'bag': shape = <><path d="M12 20h32l4 29H8z" fill="#FFFFFF" /><path d="M20 24V15a8 8 0 0 1 16 0v9" /><path d="M23 35c8-8 14-5 11 2-2 5-9 5-11-2zm1 6 7-8" fill="#DDEDDC" /></>; break
    case 'tumbler': shape = <><path d="M17 15h23l-3 35H20z" fill="#FFFFFF" /><rect x="14" y="9" width="29" height="7" rx="3" fill="#DDEDDC" /><path d="M25 9V5h12M20 25h18M21 40h16" /></>; break
    default: shape = <><path d="M8 13h40v10a6 6 0 0 0 0 12v10H8V35a6 6 0 0 0 0-12z" fill="#FFFFFF" /><path d="M34 14v6m0 5v6m0 5v8" strokeDasharray="2 3" /><path d="m17 29 4 4 7-9" /></>
  }
  return <svg viewBox="0 0 56 56" width="40" height="40" fill="none" stroke="#397B4E" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">{shape}</svg>
}

// 쿠폰 뒷면 색 (사은품마다)
const COUPON_BG = { coupon: '#1D4C7A', notebook: '#7A4F2A', bag: '#12804A', tumbler: '#5B3E8C' }

/** 쿠폰 번호로 그리는 시연용 바코드 (번호가 같으면 늘 같은 무늬, 이미지 파일 없음) */
function Barcode({ code }) {
  const widths = []
  for (const ch of code.replace('RP-', '')) {
    const n = ch.charCodeAt(0)
    widths.push(1 + (n % 3), 1 + ((n >> 2) % 2), 1 + ((n >> 3) % 3), 1)
  }
  return (
    <span className="mp-barcode" aria-hidden="true">
      {widths.map((w, i) => <span key={i} style={{ width: w, background: i % 2 === 0 ? '#121614' : '#FFFFFF' }} />)}
    </span>
  )
}

/** 쿠폰 카드: 앞면 = 나의 나무선물, 누르면 뒤집혀 바코드 */
function CouponCard({ coupon }) {
  const [flipped, setFlipped] = useState(false)
  const trees = `${coupon.trees_spent}그루`
  return (
    <button type="button" className="mp-coupon" onClick={() => setFlipped(!flipped)} aria-pressed={flipped}
      aria-label={`${coupon.item} 쿠폰 (${trees}) · ${flipped ? '앞면으로 돌리기' : '눌러서 바코드 보기'}`}>
      <span className={'mp-couponInner' + (flipped ? ' mp-flipped' : '')}>
        <span className="mp-couponFace mp-couponFront">
          <span className="mp-couponTag">나의 나무선물</span>
          <span className="mp-couponTrees">{trees}</span>
          <span className="mp-couponIcon"><GiftIcon kind={coupon.kind} /></span>
          <b className="mp-couponItem">{coupon.item}</b>
          <span className="mp-couponHint">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 12a8 8 0 0 1 14-5.3L20 9M20 4v5h-5" /><path d="M20 12a8 8 0 0 1-14 5.3L4 15M4 20v-5h5" /></svg>
            눌러서 바코드 보기
          </span>
        </span>
        <span className="mp-couponFace mp-couponBack" style={{ background: COUPON_BG[coupon.kind] || COUPON_BG.coupon }}>
          <span className="mp-couponBackHead"><span>RePick 교환 쿠폰</span><span className="mp-couponBackTrees">{trees}</span></span>
          <b className="mp-couponItem">{coupon.item}</b>
          <span className="mp-couponCode"><Barcode code={coupon.code} /><span>{coupon.code}</span></span>
          <span className="mp-couponDate">{fullDate(coupon.created_at)} 발급</span>
        </span>
      </span>
    </button>
  )
}

function Coupons({ V }) {
  return (
    <section className="mp-card" aria-labelledby="mp-coupons">
      <div className="mp-cardHead">
        <h2 id="mp-coupons">쿠폰함</h2>
        <span className="mp-sub">나의 나무선물로 받은 쿠폰 · 눌러서 바코드 보기</span>
      </div>
      {V.couponsLoading ? <p className="mp-empty">불러오는 중…</p>
        : V.couponsError ? <p className="mp-empty">{V.couponsError}</p>
        : V.coupons.length === 0 ? (
          <p className="mp-empty">아직 받은 쿠폰이 없어요. <Link to="/forest">나의 숲</Link>에서 나무를 수확하면 선물을 고를 수 있어요.</p>
        ) : (
          <div className="mp-coupons">{V.coupons.map((c) => <CouponCard key={c.id} coupon={c} />)}</div>
        )}
    </section>
  )
}

const THUMBS = ['#7FB59A', '#9DB8D6', '#C9B37E']
const AVATARS = ['#3F9B5E', '#4D8FD6', '#E0A800', '#C25E8C']

function Activity({ V }) {
  const [tab, setTab] = useState('posts')
  const { posts, received_comments: received, my_comments: mine } = V.activity
  const tabs = [['posts', `내 글 ${posts.length}`], ['received', `받은 댓글 ${received.length}`], ['written', `내가 쓴 댓글 ${mine.length}`]]
  const rows = tab === 'received' ? received : mine
  return (
    <section className="mp-card" aria-labelledby="mp-activity">
      <div className="mp-cardHead">
        <h2 id="mp-activity">내 활동</h2>
        <Link to="/community" className="mp-more">커뮤니티 ›</Link>
      </div>
      <div className="mp-tabs" role="tablist" aria-label="내 활동">
        {tabs.map(([id, label]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} className={'mp-tab' + (tab === id ? ' mp-tabOn' : '')} onClick={() => setTab(id)}>{label}</button>
        ))}
      </div>
      {V.activityLoading ? <p className="mp-empty">불러오는 중…</p>
        : V.activityError ? <p className="mp-empty">{V.activityError}</p>
        : tab === 'posts' ? (
          posts.length === 0 ? <p className="mp-empty">아직 쓴 글이 없어요. <Link to="/community">커뮤니티</Link>에 첫 글을 남겨 보세요.</p> : (
            <ul className="mp-list">
              {posts.map((p, i) => (
                <li key={p.id}>
                  <Link to="/community" className="mp-post">
                    <span className="mp-thumb" style={{ background: THUMBS[i % THUMBS.length] }}>
                      {p.image_url ? <img src={p.image_url} alt="" loading="lazy" /> : (
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><rect x="3" y="5" width="18" height="14" rx="3" /><circle cx="9" cy="10" r="1.8" /><path d="M21 16l-5-5-8 8" /></svg>
                      )}
                    </span>
                    <span className="mp-postText">
                      <span className="mp-postTitle">{p.content}</span>
                      <span className="mp-meta">좋아요 {p.like_count} · 댓글 {p.comment_count} · {shortDate(p.created_at)}</span>
                    </span>
                    {p.is_verification && <span className="mp-badge">인증</span>}
                  </Link>
                </li>
              ))}
            </ul>
          )
        ) : rows.length === 0 ? (
          <p className="mp-empty">{tab === 'received' ? '아직 받은 댓글이 없어요.' : '아직 쓴 댓글이 없어요.'}</p>
        ) : (
          <ul className="mp-list">
            {rows.map((c, i) => {
              const who = tab === 'received' ? c.nickname : V.nickname
              return (
                <li key={c.id} className="mp-comment">
                  <span className="mp-avatar" style={{ background: tab === 'received' ? AVATARS[i % AVATARS.length] : '#12804A' }} aria-hidden="true">{(who || '?').slice(0, 1)}</span>
                  <span className="mp-postText">
                    <span className="mp-meta"><b>{who}</b> · {ago(c.created_at)}</span>
                    <span className="mp-commentText">{c.content}</span>
                    <span className="mp-target">{tab === 'received' ? `내 글 · ${c.post_excerpt}` : `${c.post_author} 님의 글 · ${c.post_excerpt}`}</span>
                  </span>
                </li>
              )
            })}
          </ul>
        )}
    </section>
  )
}

function EditProfile({ V }) {
  const [nickname, setNickname] = useState(V.nickname)
  const [region, setRegion] = useState(V.region || '강서구')
  const submit = (e) => { e.preventDefault(); V.saveProfile({ nickname, region }) }
  return (
    <div className="mp-modalBack" role="presentation" onClick={V.closeEdit}>
      <form className="mp-modal" role="dialog" aria-modal="true" aria-labelledby="mp-edit-title" onClick={(e) => e.stopPropagation()} onSubmit={submit}
        onKeyDown={(e) => e.key === 'Escape' && V.closeEdit()}>
        <b id="mp-edit-title" className="mp-modalTitle">프로필 편집</b>
        <label htmlFor="mp-nick">닉네임 (최대 20자)</label>
        <input id="mp-nick" value={nickname} maxLength={20} onChange={(e) => setNickname(e.target.value)} autoFocus />
        <label htmlFor="mp-region">자치구</label>
        <select id="mp-region" value={region} onChange={(e) => setRegion(e.target.value)}>
          {GU_LIST.map((g) => <option key={g} value={g}>{g}</option>)}
        </select>
        {V.editError && <p className="mp-error" role="alert">{V.editError}</p>}
        <div className="mp-modalBtns">
          <button type="button" className="mp-btnGhost" onClick={V.closeEdit}>취소</button>
          <button type="submit" className="mp-btnGreen" disabled={V.saving}>{V.saving ? '저장 중…' : '저장'}</button>
        </div>
      </form>
    </div>
  )
}

export default function MyPage() {
  const isPc = useIsPc()
  const V = useMyPage()

  const profile = (
    <section className="mp-card mp-profile" aria-label="내 정보">
      <div className="mp-who">
        <span className="mp-sprout" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="#1F5C3F" strokeWidth="1.8" strokeLinecap="round"><path d="M12 21v-7" /><path d="M12 14c-4 0-6-2.5-6-6 3.5 0 6 2 6 6z" /><path d="M12 12c0-4 2.5-6.5 6-6.5 0 3.8-2.4 6.5-6 6.5z" /></svg>
        </span>
        <span className="mp-whoText">
          <span className="mp-nameRow">
            <span className="mp-name">{V.loading ? '불러오는 중…' : `${V.nickname || '회원'} 님`}</span>
            <button type="button" className="mp-editBtn" onClick={V.openEdit} disabled={V.loading}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M4 20h4L19 9l-4-4L4 16z" /></svg>
              프로필 편집
            </button>
          </span>
          {V.subline && <span className="mp-subline">{V.subline}</span>}
          {V.error && <span className="mp-error" role="alert">{V.error.message}</span>}
        </span>
      </div>
      <div className="mp-stats">
        {V.stats.map((s) => (
          <Link key={s.label} to={s.to} className="mp-stat">
            <span className="mp-statLabel">{s.label}</span>
            <b className={'mp-statValue mp-tone-' + s.tone}>{s.value}</b>
            <span className="mp-statGo">{s.go} ›</span>
          </Link>
        ))}
      </div>
    </section>
  )

  const logout = (
    <div className="mp-logoutRow">
      <button type="button" className="mp-logout" onClick={V.logout}>로그아웃</button>
    </div>
  )

  return (
    <div className={'mp ' + (isPc ? 'mp-pc' : 'mp-m')}>
      {!isPc && (
        <div className="mp-topbar">
          <Link to="/" aria-label="홈으로"><Logo size={22} /></Link>
          <span className="mp-wallet">
            <Link to="/forest" className="mp-pill mp-pillDrop" aria-label={`물방울 ${V.drops}개`}><DropIcon size={16} />{V.drops}</Link>
            <Link to="/points" className="mp-pill" aria-label={`포인트 ${V.pointsShort}`}><span className="mp-p" aria-hidden="true">P</span>{V.pointsShort}</Link>
          </span>
        </div>
      )}
      <div className="mp-wrap">
        {isPc && <h1 className="mp-title">마이페이지</h1>}
        {profile}
        {isPc ? (
          <div className="mp-grid">
            <Coupons V={V} />
            <Activity V={V} />
          </div>
        ) : (
          <>
            <Coupons V={V} />
            <Activity V={V} />
          </>
        )}
        {logout}
      </div>
      {V.editing && <EditProfile V={V} />}
    </div>
  )
}
