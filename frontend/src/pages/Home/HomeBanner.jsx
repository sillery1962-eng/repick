/* 홈 맨 위 배너 슬라이드 (PC·모바일 공통, mobile로 크기만 다름)
   1 줍깅 챌린지 → 2 RePick 프렌즈 → 3 나의 숲 시즌 1 (원래 배너), 자동으로 넘어감 (줍깅만 6초, 나머지 3초)
   2·3번 시안: claude.ai 캔버스 "POTEN 앱 첫 화면 시안" v4.5 실사 비교 → v45p_CampaignV5.dc.html (캠페인 배너 새 시안 v5)
   - 양쪽 화살표로 이전·다음, 마우스를 올리면 멈춤, 폰은 옆으로 밀어서도 넘김
   - 줍깅 챌린지 → 커뮤니티(/community), RePick 프렌즈 → 나의 숲(/forest) */
import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import './HomeBanner.css'

const SLIDE_COUNT = 3
// 슬라이드마다 보여 주는 시간 (아래 slides 순서): 줍깅 6초(카메라 모션 3초 × 2번) · RePick 프렌즈 3초 · 나의 숲 3초
const DURATION_MS = [6000, 3000, 3000]

// 시안 크기 (PC 676 × 340 / 모바일 357 × 351)
const SIZE = {
  pc: { w: 676, h: 340, radius: 30 },
  mobile: { w: 357, h: 351, radius: 26 },
}

// 줍깅 인증 피드 사진 (public/design) — 시안 사진 2장 + 10/28 바꾼 사진 3장
// 5장 = PC 한 바퀴에 필요한 수(처음 보이는 3장 + 찍는 2장) → 배너가 한 번 도는 동안 같은 사진이 다시 안 나옴
const FEED = [
  { src: '/design/c99579a56d1fa59464773d5ad550238f.png', pos: '35% 50%' },
  { src: '/design/e8b1592792d45a8ff10301428da65a62.png', pos: '50% 40%' },
  { src: '/design/plogging-team.png', pos: '50% 50%' },
  { src: '/design/plogging-dog.png', pos: '45% 40%' },
  { src: '/design/plogging-kids.png', pos: '50% 45%' },
]
const CAMERA_PHOTO = FEED[3] // 처음 찍히는 사진 (PC 피드에 처음 보이는 3장과 겹치지 않게 4번째)
const SHOT_CYCLE_MS = 3000 // 카메라 모션 한 바퀴 (HomeBanner.css의 pgCam 등 3s와 같게)
const SHOT_ROOM_AT_MS = 1350 // 바퀴의 45% = 사진이 날아가는 동안 피드(필름)를 한 칸 올려 맨 아래에 빈 칸을 만듦 (0.36초 → 내려앉기 전에 끝남)
const SHOT_LAND_AT_MS = 1860 // 바퀴의 62% = 찍은 사진이 피드 칸에 내려앉는 때 (pgShot 62%)
const SHOT_SWAP_AT_MS = 2100 // 바퀴의 70% = 카메라·날아가는 사진이 둘 다 안 보일 때 다음 사진을 고름
// 다음에 찍힐 사진 고르기 (shown = 지금까지 피드에 나온 사진, 순서대로 · 마지막 칸이 방금 찍은 사진)
//  - 아직 한 번도 안 나온 사진이 있으면 그중에서 랜덤
//  - 다 나왔으면 다음 바퀴에도 피드에 보일 사진은 빼고, 가장 오래전에 나온 사진 (사진이 4장뿐이라 그때부터는 차례로 돎)
const pickNextShot = (shown, landSlot) => {
  const unseen = FEED.filter((p) => !shown.includes(p))
  if (unseen.length) return unseen[Math.floor(Math.random() * unseen.length)]
  const staying = shown.slice(-landSlot) // 다음 바퀴에 위로 한 칸 올라가도 보이는 사진
  const candidates = FEED.filter((p) => !staying.includes(p))
  return candidates.reduce((a, b) => (shown.lastIndexOf(a) <= shown.lastIndexOf(b) ? a : b))
}

// 줍깅 배너가 보이는 동안 한 바퀴(3초)마다:
//  ① 찍은 사진이 날아가는 동안 피드(필름)를 한 칸 위로 올림 → 맨 아래(landSlot번째 보이는 칸)에 빈 칸이 생김
//  ② 찍은 사진이 그 빈 칸에 내려앉음 → 새 사진이 피드 끝에 더해진 것처럼 보임 (이미 있던 사진은 그대로)
//  ③ 다음 바퀴에 찍힐 사진을 고름 (pickNextShot: 한 번 나온 사진은 되도록 다시 안 나오게)
const CYCLE_START = { items: FEED, shift: 0, shot: CAMERA_PHOTO }
function usePloggingCycle(active, landSlot) {
  const [cycle, setCycle] = useState(CYCLE_START)
  useEffect(() => {
    if (!active) return undefined
    let timers = []
    const run = () => {
      timers = [
        setTimeout(() => setCycle(({ items, shift, shot }) => {
          const next = items.slice(0, shift + landSlot + 1) // 지금 맨 아래 보이는 칸까지 남기고
          next.push(null) // 그 아래에 빈 칸 하나 (null = 빈 칸)
          return { items: next, shift: shift + 1, shot }
        }), SHOT_ROOM_AT_MS),
        setTimeout(() => setCycle(({ items, shift, shot }) => {
          const next = [...items]
          next[shift + landSlot] = shot // 빈 칸에 찍은 사진
          return { items: next, shift, shot }
        }), SHOT_LAND_AT_MS),
        setTimeout(() => setCycle((c) => ({ ...c, shot: pickNextShot(c.items.slice(0, c.shift + landSlot + 1), landSlot) })), SHOT_SWAP_AT_MS),
      ]
    }
    run()
    const interval = setInterval(run, SHOT_CYCLE_MS)
    return () => {
      timers.forEach(clearTimeout); clearInterval(interval)
      setCycle(CYCLE_START) // 다른 배너로 넘어가면 처음 상태로 (다음에 보일 때 처음부터)
    }
  }, [active, landSlot])
  return { shot: cycle.shot, feed: cycle }
}

export default function HomeBanner({ mobile = false }) {
  const size = mobile ? SIZE.mobile : SIZE.pc
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const touchX = useRef(null)
  const swiped = useRef(false)

  // 자동 넘김 (index가 바뀌면 시간을 다시 셈 → 손으로 넘긴 직후 바로 넘어가지 않음)
  useEffect(() => {
    if (paused) return undefined
    if (window.matchMedia?.('(prefers-reduced-motion: reduce)').matches) return undefined
    const t = setTimeout(() => setIndex((i) => (i + 1) % SLIDE_COUNT), DURATION_MS[index])
    return () => clearTimeout(t)
  }, [index, paused])

  const go = (step) => setIndex((i) => (i + step + SLIDE_COUNT) % SLIDE_COUNT)

  const onTouchStart = (e) => {
    touchX.current = e.touches[0].clientX
    swiped.current = false
    setPaused(true)
  }
  const onTouchEnd = (e) => {
    if (touchX.current != null) {
      const dx = e.changedTouches[0].clientX - touchX.current
      if (Math.abs(dx) > 40) {
        swiped.current = true // 밀어서 넘길 때는 배너 링크로 이동하지 않음
        go(dx < 0 ? 1 : -1)
      }
    }
    touchX.current = null
    setPaused(false)
  }
  const onClickCapture = (e) => {
    if (swiped.current) {
      e.preventDefault()
      swiped.current = false
    }
  }

  const slides = [PloggingSlide, FriendsSlide, ForestSlide] // 줍깅 챌린지부터 시작

  return (
    <section
      className="hb-root"
      aria-label="홈 배너"
      aria-roledescription="carousel"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocus={(e) => { if (e.target.matches?.(':focus-visible')) setPaused(true) }} // 키보드로 들어올 때만 멈춤 (폰에서 화살표를 눌러도 계속 넘어가게)
      onBlur={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
      onClickCapture={onClickCapture}
      // PC는 옆 "나의 숲" 칸과 같은 높이로 늘어남 (최소 시안 높이 340), 모바일은 시안 높이 그대로
      style={{ position: 'relative', ...(mobile ? { height: `${size.h}px` } : { minHeight: `${size.h}px`, alignSelf: 'stretch' }), borderRadius: `${size.radius}px`, overflow: 'hidden', minWidth: 0, isolation: 'isolate' }}
    >
      <div className="hb-track" style={{ transform: `translateX(-${index * 100}%)` }}>
        {slides.map((Slide, i) => {
          const active = i === index
          return (
            <div key={i} className={`hb-slide${active ? ' hb-play' : ''}`} aria-hidden={!active} aria-roledescription="slide" aria-label={`${i + 1} / ${SLIDE_COUNT}`}>
              <Slide mobile={mobile} size={size} num={i + 1} active={active} tabIndex={active ? undefined : -1} />
            </div>
          )
        })}
      </div>
      <ArrowButton mobile={mobile} dir="prev" onClick={() => go(-1)} />
      <ArrowButton mobile={mobile} dir="next" onClick={() => go(1)} />
    </section>
  )
}

// 이전·다음 화살표 (배너 양쪽 가운데)
function ArrowButton({ mobile, dir, onClick }) {
  const prev = dir === 'prev'
  const size = mobile ? 34 : 42
  return (
    <button
      type="button"
      className="hb-arrow"
      onClick={onClick}
      aria-label={prev ? '이전 배너' : '다음 배너'}
      style={{ position: 'absolute', top: '50%', [prev ? 'left' : 'right']: mobile ? '6px' : '12px', width: `${size}px`, height: `${size}px`, marginTop: `-${size / 2}px`, borderRadius: '50%', border: 'none', padding: '0', background: 'rgba(18,22,20,0.45)', color: '#FFFFFF', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: '2' }}
    >
      <svg width={mobile ? 16 : 20} height={mobile ? 16 : 20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <path d={prev ? 'M15 5l-7 7 7 7' : 'M9 5l7 7-7 7'} />
      </svg>
    </button>
  )
}

// 1. 원래 홈 배너 (나의 숲 시즌 1)
// 나의 숲 배너 새싹 사진 자리 (PC는 왼쪽 기준 1.5배 → 새싹이 글자 오른쪽으로)
const sproutPhotoStyle = (mobile) => ({ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', zIndex: '-1', ...(mobile ? null : { transform: 'scale(1.5)', transformOrigin: '0% 50%' }) })
// 손·새싹 둘레 타원 (사진 안 가운데: 가로 47%·세로 51% — 모바일은 사진 양옆이 잘려 가로 45%), 가장자리는 부드럽게 사라짐
const sproutMask = (mobile) => {
  const mask = `radial-gradient(ellipse ${mobile ? '34% 38%' : '22% 40%'} at ${mobile ? '45%' : '47%'} 52%, #000 45%, transparent 100%)`
  return { WebkitMaskImage: mask, maskImage: mask }
}

function ForestSlide({ mobile, num, tabIndex }) {
  return (
    <Link to="/scan" tabIndex={tabIndex} style={{ position: 'relative', display: 'block', height: '100%', background: '#1F5C3F', color: '#FFFFFF', padding: mobile ? '22px' : '38px 40px', boxSizing: 'border-box', isolation: 'isolate' }}>
      {/* 두 손에 흙과 새싹 사진 (줍깅 배너의 숲길 사진과 겹치지 않게 바꿈)
          PC는 왼쪽 기준으로 1.5배 키워 새싹을 글자 오른쪽으로 보냄, 모바일은 글자 아래 가운데라 그대로 */}
      <img src="/design/29dc258bfabee1c7152647d049e64ef8.jpg" alt="두 손에 흙과 새싹을 담은 사진" style={sproutPhotoStyle(mobile)} />
      <span style={{ position: 'absolute', inset: '0', zIndex: '-1', background: 'linear-gradient(90deg, rgba(14,38,24,0.70) 0%, rgba(14,38,24,0.38) 55%, rgba(14,38,24,0.08) 100%)' }} />
      {/* 가운데(손·새싹)를 밝게: 같은 사진을 한 장 더 겹쳐 색감 필터(밝기·대비·채도·연두 쪽 색상)를 걸고 — 대비를 올려 뿌옇지 않게,
          손 둘레 타원 모양만 보이게 가림(mask) → 덮개 위에 올라와서 어둡게 눌리지 않음 (사진 파일은 원본 그대로) */}
      <img src="/design/29dc258bfabee1c7152647d049e64ef8.jpg" alt="" aria-hidden="true" style={{ ...sproutPhotoStyle(mobile), filter: 'brightness(1.35) contrast(1.3) saturate(1.45) hue-rotate(-8deg)', ...sproutMask(mobile) }} />
      <span style={{ display: 'inline-flex', height: '28px', padding: '0 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.16)', fontSize: '12px', fontWeight: '700', alignItems: 'center' }}>
        RePick 나의 숲 시즌 1
      </span>
      <div style={{ fontSize: mobile ? '24px' : '40px', fontWeight: '800', lineHeight: '1.25', marginTop: '14px', position: 'relative', zIndex: '1' }}>
        잘 버리는 순간,
        <br />
        나의 숲이 자라요
      </div>
      <div style={{ fontSize: mobile ? '13px' : '16px', color: '#D7EBDD', marginTop: '10px', lineHeight: '1.5', width: mobile ? '230px' : '420px', position: 'relative', zIndex: '1' }}>
        AI로 인증하고 물방울을 모아
        <br />
        나만의 과일나무를 키워보세요.
      </div>
      {mobile ? null : (
        <span style={{ position: 'absolute', left: '40px', bottom: '36px', height: '50px', padding: '0 22px', borderRadius: '999px', background: '#CDEB45', color: '#121614', fontSize: '15px', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px' }}>
          AI로 인증 시작하기 ›
        </span>
      )}
      <Counter mobile={mobile} num={num} />
    </Link>
  )
}

// 2. 줍깅 챌린지 (실제 카메라 화면 모션) → 커뮤니티
function PloggingSlide({ mobile, size, num, active, tabIndex }) {
  const { shot, feed } = usePloggingCycle(active, mobile ? 1 : 2) // 찍히는 사진 + 피드 (사진이 내려앉는 칸: 모바일 2번째·PC 3번째)
  const m = mobile
  return (
    <Link to="/community" tabIndex={tabIndex} style={{ position: 'relative', display: 'block', height: '100%', background: '#0E6E68', color: '#FFFFFF', padding: m ? '22px' : '38px 40px', boxSizing: 'border-box', isolation: 'isolate' }}>
      <img src="/design/73cb4d1a9860ddc5f95bf1a70f49edf3.jpg" alt="햇살 가득한 밝은 숲길 사진" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', zIndex: '-2' }} />
      {/* 검은 덮개: 글자 뒤(왼쪽)만 살짝 어둡게, 오른쪽은 투명 → 아래 초록 AI 인증 카드와 구분되고 숲 사진은 또렷하게
          (시안은 청록 덮개 + 오른쪽 끝 연두 0.18) */}
      <span style={{ position: 'absolute', inset: '0', zIndex: '-1', background: 'linear-gradient(115deg, rgba(0,0,0,0.62) 0%, rgba(0,0,0,0.38) 38%, rgba(0,0,0,0) 70%)' }} />
      <span style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
        <span style={{ display: 'inline-flex', height: '26px', padding: '0 11px', borderRadius: '999px', background: '#121614', color: '#FFFFFF', fontSize: '12px', fontWeight: '800', alignItems: 'center' }}>
          {/* 아래 [인증 글 올리기] 버튼(연두)과 헷갈리지 않게 태그는 검정 */}
          NEW 챌린지
        </span>
        {/* 해시태그 두 개는 한 묶음이라 사이를 더 좁게 (NEW 챌린지와는 6px) */}
        <span style={{ display: 'inline-flex', gap: '3px', alignItems: 'center' }}>
          <span style={{ display: 'inline-flex', height: '26px', padding: '0 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '800', alignItems: 'center' }}>
            #플로깅
          </span>
          <span style={{ display: 'inline-flex', height: '26px', padding: '0 11px', borderRadius: '999px', background: 'rgba(255,255,255,0.2)', fontSize: '12px', fontWeight: '800', alignItems: 'center' }}>
            #줍깅 인증
          </span>
        </span>
      </span>
      <div style={{ fontSize: m ? '30px' : '46px', fontWeight: '800', lineHeight: '1.15', marginTop: '12px', letterSpacing: '-1px', textShadow: '0 3px 12px rgba(0,0,0,0.25)' }}>
        줍깅 챌린지
      </div>
      <div style={{ fontSize: m ? '13.5px' : '17px', fontWeight: '700', lineHeight: '1.5', marginTop: '8px', width: m ? '230px' : '340px', textShadow: '0 2px 8px rgba(0,0,0,0.25)' }}>
        줍깅 챌린지를 게시판에 올리고
        <br />
        물방울을 받아보세요!
      </div>
      <span style={{ position: 'absolute', left: m ? '22px' : '40px', bottom: m ? '20px' : '36px', height: m ? '40px' : '52px', padding: m ? '0 16px' : '0 24px', fontSize: m ? '13.5px' : '16px', borderRadius: '999px', background: '#CDEB45', color: '#121614', fontWeight: '800', display: 'flex', alignItems: 'center', gap: '6px', zIndex: '1' }}>
        인증 글 올리기 ›
      </span>
      {/* 움직이는 그림: 시안 좌표 그대로 쓰려고 시안 크기 상자를 오른쪽·세로 가운데에 붙임 (배너가 길어져도 가운데) */}
      <span aria-hidden="true" style={{ position: 'absolute', top: '50%', marginTop: `-${size.h / 2}px`, right: '0', width: `${size.w}px`, height: `${size.h}px`, pointerEvents: 'none' }}>
        {m ? (
          <>
            <PhoneCamera left={175} top={153} scale={84 / 128} photo={shot} />
            <Snap left={145} top={159} fontSize={15} />
            <Feed left={267} top={46} width={76} height={132} gap={8} step={-70} card={{ w: 76, h: 62, font: 9 }} feed={feed} />
            <Shot left={179} top={186} dx={88} dy={-70} s0={1.04} card={{ w: 76, h: 62, font: 9 }} photo={shot} />
          </>
        ) : (
          <>
            <PhoneCamera left={402} top={84} scale={1} photo={shot} />
            <Snap left={458} top={52} fontSize={22} />
            <Feed left={548} top={24} width={104} height={288} gap={12} step={-100} card={{ w: 104, h: 88, font: 11 }} feed={feed} />
            <Shot left={414} top={137} dx={134} dy={87} s0={1.15} card={{ w: 104, h: 88, font: 11 }} photo={shot} />
          </>
        )}
      </span>
      <Counter mobile={m} num={num} plus />
    </Link>
  )
}

// 3. RePick 프렌즈 (실사 지구 · 빛남 · 화살표 회전) → 나의 숲
function FriendsSlide({ mobile, num, tabIndex }) {
  const m = mobile
  return (
    <Link to="/forest" tabIndex={tabIndex} style={{ position: 'relative', display: 'block', height: '100%', background: '#2B6CB0', color: '#FFFFFF', padding: m ? '22px 22px 0' : '38px 40px', boxSizing: 'border-box', isolation: 'isolate' }}>
      <span style={{ display: 'inline-flex', height: m ? '24px' : '28px', padding: m ? '0 10px' : '0 12px', borderRadius: '999px', background: 'rgba(255,255,255,0.22)', fontSize: m ? '11px' : '12px', fontWeight: '800', alignItems: 'center' }}>
        RePick 프렌즈
      </span>
      <div style={{ fontSize: m ? '25px' : '34px', fontWeight: '800', lineHeight: m ? '1.32' : '1.3', marginTop: m ? '10px' : '14px', textShadow: '0 2px 8px rgba(0,0,0,0.15)' }}>
        RePick 프렌즈와
        <br />
        365일 지구 지키기
      </div>
      <div style={{ fontSize: m ? '12.5px' : '15px', marginTop: m ? '6px' : '10px', lineHeight: m ? '1.45' : '1.5', width: m ? 'auto' : '280px', opacity: '0.95' }}>
        오늘의 작은 분리배출이 내일의 숲이 돼요
      </div>
      <FriendsArt
        // 시안보다 크게: PC 1.25배(360→450), 모바일 1.15배(300→345, 글자와 안 겹치게 조금 아래로)
        width={m ? 345 : 450}
        height={m ? 259 : 338}
        style={m ? { left: '50%', bottom: '-20px', marginLeft: '-172.5px' } : { right: '-30px', bottom: '0' }} // PC: 글자와 떨어지게 오른쪽으로 40px
      />
      {/* 화살표 가운데 빛나는 지구 사진 (PC는 오른쪽 기준, 모바일은 가운데 / 화살표 그림처럼 아래 기준) */}
      {m ? (
        <GlowEarth glow={182} earth={125} glowStyle={{ left: '50%', marginLeft: '-91px', bottom: '4px' }} earthStyle={{ left: '50%', marginLeft: '-62.5px', bottom: '32px' }} scale={0.97} />
      ) : (
        <GlowEarth glow={236} earth={162} glowStyle={{ right: '77px', bottom: '31px' }} earthStyle={{ right: '114px', bottom: '68px' }} scale={1.25} />
      )}
      {/* 반짝이 별·점: 글자와 겹치지 않게 빈 곳(오른쪽 위·왼쪽 아래)에 따로 둠 */}
      {m ? (
        <>
          <Sparkle kind="star" size={22} style={{ right: '26px', top: '26px' }} />
          <Sparkle kind="star" size={14} opacity={0.8} style={{ right: '64px', top: '92px' }} />
          <Sparkle kind="dot" size={8} style={{ left: '26px', bottom: '70px' }} />
          <Sparkle kind="dot" size={6} style={{ right: '30px', top: '190px' }} />
        </>
      ) : (
        <>
          <Sparkle kind="star" size={30} style={{ right: '70px', top: '40px' }} />
          <Sparkle kind="star" size={20} opacity={0.8} style={{ right: '250px', top: '64px' }} />
          <Sparkle kind="dot" size={10} style={{ left: '70px', bottom: '70px' }} />
          <Sparkle kind="dot" size={7} style={{ left: '200px', bottom: '130px' }} />
        </>
      )}
      <Counter mobile={m} num={num} plus />
    </Link>
  )
}

// 슬라이드 번호 (1 / 3)
function Counter({ mobile, num, plus = false }) {
  if (!plus) {
    // 원래 배너 자리 (오른쪽 위)
    return (
      <span style={{ position: 'absolute', right: mobile ? '16px' : '24px', top: mobile ? '16px' : '24px', height: '26px', padding: '0 10px', borderRadius: '999px', background: 'rgba(0,0,0,0.25)', fontSize: '12px', display: 'flex', alignItems: 'center' }}>
        {num} / {SLIDE_COUNT}
      </span>
    )
  }
  return (
    <span style={{ position: 'absolute', right: mobile ? '14px' : '20px', bottom: mobile ? '14px' : '20px', height: '28px', padding: '0 12px', borderRadius: '999px', background: 'rgba(18,22,20,0.55)', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', zIndex: '1' }}>
      {mobile ? `${num}/${SLIDE_COUNT}` : `${num} / ${SLIDE_COUNT}`} <span aria-hidden="true" style={{ fontSize: '16px', lineHeight: '1' }}>+</span>
    </span>
  )
}

// 스마트폰 카메라 촬영 화면 (PC 128 × 232 기준, 모바일은 scale로 줄임)
function PhoneCamera({ left, top, scale: s, photo = CAMERA_PHOTO }) {
  const r = (n) => Math.round(n * s * 10) / 10
  return (
    <span className="pg-cam" style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${r(128)}px`, height: `${r(232)}px`, filter: 'drop-shadow(0 12px 20px rgba(0,0,0,0.35))' }}>
      <span style={{ position: 'absolute', inset: '0', borderRadius: `${Math.round(22 * s)}px`, background: '#15181B', boxShadow: 'inset 0 0 0 1px #3A4047' }} />
      <span style={{ position: 'absolute', left: `${r(4)}px`, top: `${r(4)}px`, right: `${r(4)}px`, bottom: `${r(4)}px`, borderRadius: `${Math.round(18 * s)}px`, background: '#000000', overflow: 'hidden' }}>
        <img src={photo.src} alt="" style={{ position: 'absolute', left: '0', top: `${r(26)}px`, width: `${r(120)}px`, height: `${r(134)}px`, objectFit: 'cover', objectPosition: photo.pos }} />
        <img src={FEED[0].src} alt="" style={{ position: 'absolute', left: `${r(11)}px`, top: `${r(190)}px`, width: `${Math.round(18 * s)}px`, height: `${Math.round(18 * s)}px`, borderRadius: `${Math.round(4 * s)}px`, objectFit: 'cover', border: '1px solid rgba(255,255,255,0.8)', boxSizing: 'border-box' }} />
      </span>
      <svg width={r(128)} height={r(232)} viewBox="0 0 128 232" style={{ position: 'absolute', inset: '0' }}>
        <g stroke="#FFFFFF" strokeOpacity="0.28" strokeWidth="0.5"><path d="M44 30v134M84 30v134M4 74.7h120M4 119.3h120" /></g>
        <path d="M16 42v-6h6M112 42v-6h-6M16 152v6h6M112 152v6h-6" stroke="#FFFFFF" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" fill="none" />
        <path d="M44 78v-8h8M84 78v-8h-8M44 110v8h8M84 110v8h-8" stroke="#FFD60A" strokeWidth="1.4" fill="none" />
        <path d="M64 70v-3M64 118v3M44 94h-3M84 94h3" stroke="#FFD60A" strokeWidth="1.4" />
        <circle cx="92" cy="88" r="2.4" fill="#FFD60A" />
        <path d="M92 82.5v1.6M92 91.9v1.6M86.5 88h1.6M95.9 88h1.6" stroke="#FFD60A" strokeWidth="0.9" strokeLinecap="round" />
        <path d="M92 95v14" stroke="#FFD60A" strokeWidth="0.7" />
        <rect x="45" y="149" width="38" height="12" rx="6" fill="#000000" fillOpacity="0.35" />
        <text x="52" y="157.2" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5.5" fontWeight="700" fill="#FFFFFF">.5</text>
        <circle cx="64" cy="155" r="5.2" fill="#000000" fillOpacity="0.55" />
        <text x="64" y="157.2" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5.5" fontWeight="800" fill="#FFD60A">1×</text>
        <text x="76" y="157.2" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="5.5" fontWeight="700" fill="#FFFFFF">2</text>
        <rect x="50" y="9" width="28" height="8" rx="4" fill="#000000" />
        <path d="M14.5 15.5l3-6h2.4l-1.6 3.4h2.4l-4 6.2 1-3.6z" fill="#FFFFFF" />
        <circle cx="113" cy="15" r="4.2" stroke="#FFFFFF" strokeWidth="1" fill="none" />
        <circle cx="113" cy="15" r="1.6" fill="#FFFFFF" />
        <rect x="54" y="20.5" width="20" height="6" rx="3" fill="#FFFFFF" fillOpacity="0.16" />
        <text x="64" y="25.2" textAnchor="middle" fontFamily="Noto Sans KR, sans-serif" fontSize="4.6" fontWeight="700" fill="#FFFFFF">HDR</text>
        <text y="178" fontFamily="Noto Sans KR, sans-serif" fontSize="6.6" fontWeight="700" textAnchor="middle">
          <tspan x="38" fill="#FFFFFF" fillOpacity="0.7">동영상</tspan>
          <tspan x="64" fill="#FFD60A">사진</tspan>
          <tspan x="88" fill="#FFFFFF" fillOpacity="0.7">인물</tspan>
        </text>
        <circle cx="64" cy="203" r="15" stroke="#FFFFFF" strokeWidth="2.4" fill="none" />
        <circle className="pg-btn" cx="64" cy="203" r="11.6" fill="#FFFFFF" />
        <circle cx="104" cy="203" r="9" fill="#FFFFFF" fillOpacity="0.16" />
        <path d="M99.5 201.5a4.8 4.8 0 0 1 8.6-1.6M108.5 204.5a4.8 4.8 0 0 1-8.6 1.6" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" fill="none" />
        <path d="M108.8 197.6v2.8h-2.8M99.2 208.4v-2.8h2.8" stroke="#FFFFFF" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" fill="none" />
      </svg>
      <span className="pg-flash" style={{ position: 'absolute', left: `${r(4)}px`, top: `${r(30)}px`, width: `${r(120)}px`, height: `${r(134)}px`, background: '#FFFFFF' }} />
    </span>
  )
}

function Snap({ left, top, fontSize }) {
  return (
    <span className="pg-snap" style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, fontSize: `${fontSize}px`, fontWeight: '800', color: '#FFFFFF', textShadow: '0 2px 8px rgba(0,0,0,0.35)' }}>
      찰칵!
    </span>
  )
}

// 줍깅 인증 사진 카드 한 장 (photo가 null이면 사진이 들어올 빈 칸)
function FeedCard({ photo, card }) {
  if (!photo) {
    return <span style={{ display: 'block', width: `${card.w}px`, height: `${card.h}px`, borderRadius: '10px', border: '2px dashed rgba(255,255,255,0.7)', boxSizing: 'border-box', flexShrink: '0', background: 'rgba(255,255,255,0.12)' }} />
  }
  return (
    <span style={{ position: 'relative', display: 'block', width: `${card.w}px`, height: `${card.h}px`, borderRadius: '10px', overflow: 'hidden', border: '2px solid #FFFFFF', boxSizing: 'border-box', flexShrink: '0', background: '#2E7A4E' }}>
      <img src={photo.src} alt="" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%', objectFit: 'cover', objectPosition: photo.pos }} />
      <span style={{ position: 'absolute', left: '4px', bottom: '4px', padding: '1px 6px', borderRadius: '999px', background: 'rgba(18,22,20,0.6)', color: '#FFFFFF', fontSize: `${card.font}px`, fontWeight: '700', whiteSpace: 'nowrap' }}>
        #줍깅인증
      </span>
    </span>
  )
}

// 오른쪽 인증 피드: 사진을 찍을 때마다 한 칸씩 위로 올라가고 맨 아래에 새 사진이 더해짐 (feed = usePloggingCycle 값)
function Feed({ left, top, width, height, gap, step, card, feed }) {
  return (
    <span style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, width: `${width}px`, height: `${height}px`, overflow: 'hidden', borderRadius: '12px' }}>
      <span className="pg-feed" style={{ display: 'flex', flexDirection: 'column', gap: `${gap}px`, transform: `translateY(${feed.shift * step}px)`, ...(feed.shift === 0 ? { transition: 'none' } : null) }}> {/* 처음으로 돌아갈 때는 움직임 없이 바로 */}
        {feed.items.map((photo, i) => <FeedCard key={i} photo={photo} card={card} />)}
      </span>
    </span>
  )
}

// 방금 찍은 사진이 피드로 날아감
function Shot({ left, top, dx, dy, s0, card, photo = CAMERA_PHOTO }) {
  return (
    <span className="pg-shot" style={{ position: 'absolute', left: `${left}px`, top: `${top}px`, '--dx': `${dx}px`, '--dy': `${dy}px`, '--s0': s0 }}>
      <FeedCard photo={photo} card={card} />
    </span>
  )
}

// 빛나는 지구: 뒤에서 숨 쉬듯 퍼지는 빛 + 사진 위로 지나가는 반짝임
function GlowEarth({ glow, earth, glowStyle, earthStyle, scale: s }) {
  const r = (n) => Math.round(n * s)
  return (
    <>
      <span className="rp-glow" style={{ position: 'absolute', width: `${glow}px`, height: `${glow}px`, borderRadius: '50%', zIndex: '-2', background: 'radial-gradient(circle, rgba(190,240,255,0.95) 0%, rgba(120,210,255,0.55) 38%, rgba(120,210,255,0) 70%)', ...glowStyle }} />
      <span style={{ position: 'absolute', width: `${earth}px`, height: `${earth}px`, borderRadius: '50%', overflow: 'hidden', zIndex: '-1', boxShadow: `0 0 ${r(23)}px ${r(5)}px rgba(170,230,255,0.9), 0 ${r(13)}px ${r(26)}px rgba(10,40,90,0.35)`, ...earthStyle }}>
        <img src="/design/d3c8739eb119617dcd76dc47ab88773e.png" alt="빛나는 지구 사진" style={{ position: 'absolute', inset: '0', width: '100%', height: '100%' }} />
        <span style={{ position: 'absolute', inset: '0', borderRadius: '50%', background: 'radial-gradient(circle at 32% 28%, rgba(255,255,255,0.55) 0%, rgba(255,255,255,0.12) 22%, rgba(255,255,255,0) 45%)', boxShadow: `inset 0 0 ${r(14)}px rgba(200,240,255,0.95), inset -${r(12)}px -${r(13)}px ${r(26)}px rgba(0,25,70,0.45)` }} />
        <span className="rp-shine" style={{ position: 'absolute', top: '-20%', left: '-60%', width: '40%', height: '140%', background: 'linear-gradient(90deg, rgba(255,255,255,0) 0%, rgba(255,255,255,0.45) 50%, rgba(255,255,255,0) 100%)', transform: 'rotate(20deg)' }} />
      </span>
    </>
  )
}

// 도는 재활용 화살표 + 반짝이 (지구는 GlowEarth 사진)
// 반짝이 하나 (star = 네 갈래 별, dot = 작은 점)
function Sparkle({ kind, size, opacity = kind === 'star' ? 0.9 : 0.7, style }) {
  return (
    <svg width={size} height={size} viewBox={kind === 'star' ? '19 40 22 22' : '0 0 8 8'} aria-hidden="true" style={{ position: 'absolute', zIndex: '-1', opacity, ...style }}>
      {kind === 'star'
        ? <path d="M30 40l3 8 8 3-8 3-3 8-3-8-8-3 8-3z" fill="#FFFFFF" />
        : <circle cx="4" cy="4" r="4" fill="#FFFFFF" />}
    </svg>
  )
}

function FriendsArt({ width, height, style }) {
  return (
    <svg width={width} height={height} viewBox="0 0 320 240" fill="none" aria-hidden="true" style={{ position: 'absolute', zIndex: '-1', ...style }}>
      <ellipse cx="160" cy="228" rx="110" ry="9" fill="#1E4F86" opacity="0.25" />
      <g className="rp-spin">
        <path d="M176.6 51.7 A80 80 0 0 1 239.6 138.4" stroke="#2F8F4E" strokeWidth="20" strokeLinecap="round" fill="none" />
        <path d="M261.4 140.7 L236.8 164.2 L217.7 136.1z" fill="#2F8F4E" stroke="#2F8F4E" strokeWidth="4" strokeLinejoin="round" />
        <path d="M219.5 183.5 A80 80 0 0 1 113.0 194.7" stroke="#1F5C3F" strokeWidth="20" strokeLinecap="round" fill="none" />
        <path d="M100.0 212.5 L91.9 179.4 L125.9 176.9z" fill="#1F5C3F" stroke="#1F5C3F" strokeWidth="4" strokeLinejoin="round" />
        <path d="M83.9 154.7 A80 80 0 0 1 127.5 56.9" stroke="#2F8F4E" strokeWidth="20" strokeLinecap="round" fill="none" />
        <path d="M118.5 36.8 L151.2 46.3 L136.4 77.0z" fill="#2F8F4E" stroke="#2F8F4E" strokeWidth="4" strokeLinejoin="round" />
      </g>
    </svg>
  )
}
