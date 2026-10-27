import { useState } from 'react'
import { Link } from 'react-router-dom'
import useIsPc from '../../lib/useIsPc'
import './notice.css'

/*
  공지사항 — PC 푸터 "공지사항"·마이페이지 맨 아래 "공지사항"에서 들어옴. 로그인 없이 볼 수 있음
  공지는 DB 없이 아래 배열에 적어 둠 (친환경샵 상품 목록과 같은 방식). 새 공지는 맨 위에 추가
  숫자·규칙은 docs/api-spec.md 5·6·8번과 같게 맞출 것
  담당: 선영
*/
const NOTICES = [
  {
    id: 5,
    tag: '공지',
    title: 'RePick에 오신 것을 환영해요',
    date: '2026-10-27',
    body: [
      '분리배출한 쓰레기를 사진으로 찍으면 AI가 품목을 알려 주고, 💧물방울과 ⭐포인트를 드려요.',
      '물방울로는 나의 숲 나무를 키우고, 포인트로는 환경 단체에 기부할 수 있어요.',
      '배출 방법이 헷갈리면 언제든 포티에게 물어보세요.',
    ],
  },
  {
    id: 4,
    tag: '안내',
    title: 'AI 인증 적립은 하루 5회까지예요',
    date: '2026-10-27',
    body: [
      'AI 판별은 몇 번이든 할 수 있지만, 물방울·포인트 적립은 품목 상관없이 하루 5회까지예요.',
      '한 사진에 여러 품목이 있으면 보상이 가장 큰 품목 1개 기준으로 한 번 적립돼요.',
      '하루 기준은 한국 시간 0시예요.',
    ],
  },
  {
    id: 3,
    tag: '이벤트',
    title: '이달의 적립왕 순위 보상 안내',
    date: '2026-10-22',
    body: [
      '한 달 동안 받은 포인트가 많은 1~10위에게 다음 달 1일에 포인트를 드려요.',
      '1위 500P · 2위 300P · 3위 200P · 4~10위 100P',
      '물방울은 순위 점수에 들어가지 않아요.',
    ],
  },
  {
    id: 2,
    tag: '이벤트',
    title: '친구 초대하고 물방울 받기',
    date: '2026-10-22',
    body: [
      '친구가 가입할 때 내 초대 코드를 입력하면 친구 1명마다 💧2개를 드려요.',
      '친구가 5명이 될 때마다 1000P를 추가로 드려요.',
      '내 초대 코드는 이벤트 화면의 친구 초대에서 확인할 수 있어요.',
    ],
  },
  {
    id: 1,
    tag: '안내',
    title: '나무 수확 사은품은 쿠폰함에서 확인하세요',
    date: '2026-10-21',
    body: [
      '나무를 다 키워 수확하면 모아 둔 나무 수에 따라 사은품을 받을 수 있어요.',
      '친환경 쿠폰 1그루 · 재활용 노트 2그루 · 에코백 3그루 · 텀블러 5그루(5번째 수확 때 자동)',
      '받은 사은품은 마이페이지 쿠폰함에서 쿠폰 카드로 보여 드려요.',
    ],
  },
]

const dot = (date) => date.slice(5).replace('-', '.') // 2026-10-27 → 10.27

export default function Notice() {
  const isPc = useIsPc()
  const [openId, setOpenId] = useState(NOTICES[0].id) // 맨 위 공지는 펼쳐 둠

  return (
    <div className={'nt ' + (isPc ? 'nt-pc' : 'nt-m')}>
      <div className="nt-wrap">
        <h1 className="nt-title">공지사항</h1>
        <ul className="nt-list">
          {NOTICES.map((n) => {
            const open = openId === n.id
            return (
              <li key={n.id} className="nt-item">
                <button type="button" className="nt-head" aria-expanded={open} onClick={() => setOpenId(open ? null : n.id)}>
                  <span className={'nt-tag nt-tag-' + n.tag}>{n.tag}</span>
                  <span className="nt-itemTitle">{n.title}</span>
                  <span className="nt-date">{dot(n.date)}</span>
                  <svg className={'nt-arrow' + (open ? ' nt-open' : '')} width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M6 9l6 6 6-6" /></svg>
                </button>
                {open && (
                  <div className="nt-body">
                    {n.body.map((line) => <p key={line}>{line}</p>)}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
        <div className="nt-ask">
          <span>궁금한 점이 더 있나요?</span>
          <Link to="/chat" className="nt-askBtn">포티에게 물어보기 ›</Link>
        </div>
      </div>
    </div>
  )
}
