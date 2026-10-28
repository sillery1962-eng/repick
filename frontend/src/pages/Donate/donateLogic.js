import { api } from '../../api/client'
import { DCLogic } from '../../lib/dc'

/*
  기부하기 화면의 로직 (PC·모바일 공용). 담당: 오지원
  - 기부처 목록·모인 포인트: GET /donations/campaigns (backend/data/campaigns.json)
  - 내 포인트 잔액: GET /donations/me 의 points_balance
  - 기부: POST /donations { points, campaign_id } → 서버가 통장에 point −N 한 줄 (포인트가 모자라면 400)
  - 나의 기부 내역(화면 맨 아래): GET /donations/me 의 items·total (마이페이지에서 옮겨 옴)
  - 로그아웃 상태(props.loggedIn = false): 기부처 목록만 불러와 둘러보기, [로그인하고 기부하기] → props.onLogin()
  - props.campaignId: 주소 /donate?campaign=번호 (홈 기부 목록에서 누름) → 그 기부처를 고른 상태로 시작, 없거나 틀리면 첫 기부처
  화면(JSX)에서는 renderVals()가 돌려준 값을 V.이름 으로 씁니다.
*/

// 기부처마다 사진·색 (글자는 서버의 campaigns.json에 있음)
const LOOKS = {
  1: { img: '/design/0111d49b8ba700679becc1d1474445b2.jpg', alt: '바다와 해변 사진', soft: '#E6F0FB', deep: '#1D4C7A', bar: '#4D8FD6' },
  2: { img: '/design/b63cdf73553f9bc43f841aeee16da0c6.jpg', alt: '올려다본 숲 사진', soft: '#E8F3E4', deep: '#1F5C3F', bar: '#3F9B5E' },
  3: { img: '/design/ff18d2fbf891033bf82b9595a8865072.jpg', alt: '들판 위 노을 사진', soft: '#FFEEE6', deep: '#8A3A22', bar: '#FF7A59' },
  4: { img: '/design/ec6bcbc9324d2d97bcc52e97947dd34b.jpg', alt: '잎이 무성한 큰 나무 사진', soft: '#E8F3E4', deep: '#1F5C3F', bar: '#12804A' },
  5: { img: '/design/1bf518cba1e99295c3037341afced4a2.jpg', alt: '색깔별 분리수거함 사진', soft: '#FFF6DB', deep: '#7A5A00', bar: '#E0A800' },
  // 6 저소득층 난방비 지원 (10/28 추가): 맞는 사진이 없어 우선 홈 시안의 노을 사진(3번과 같음) — 사진이 생기면 바꾸기
  6: { img: '/design/ff18d2fbf891033bf82b9595a8865072.jpg', alt: '들판 위 노을 사진', soft: '#FFF1E0', deep: '#8A4B12', bar: '#F08A24' },
}
const DEFAULT_LOOK = LOOKS[1]

const LIST_SIZE = 4 // "기부처 둘러보기"에 처음 보여 줄 개수 (나머지는 더보기)
const HISTORY_SIZE = 5 // "나의 기부 내역"에 처음 보여 줄 개수 (나머지는 더보기)

const fmt = (n) => Number(n).toLocaleString('ko-KR')
// "2026.10.20" (한국 날짜)
const dateText = (iso) => { const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000); return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}` }
// 기부는 1P 단위 (10/23 변경 — 전: 100P 단위). 인증글 ⭐1 등으로 생긴 끝자리까지 기부할 수 있게 소수점만 버림
const unit = (v) => Math.floor(v)

export class DonateLogic extends DCLogic {
  constructor(props) {
    super(props)
    this.state = { campaigns: [], selectedId: null, balance: 0, amount: 0, done: false, last: 0, loadError: '', error: '', busy: false, showAll: false, history: [], historyTotal: 0, historyAll: false }
  }

  componentDidMount() {
    this.load()
  }

  // 처음 고를 기부처: 주소로 받은 번호가 목록에 있으면 그것, 아니면 첫 기부처
  firstId(items) {
    const wanted = items.find((c) => c.id === this.props.campaignId)
    return (wanted ?? items[0])?.id ?? null
  }

  async load() {
    try {
      if (!this.props.loggedIn) { // 둘러보기: 기부처 목록만 (로그인 없이 되는 API)
        const list = await api.get('/donations/campaigns')
        this.setState({ campaigns: list.items, selectedId: this.firstId(list.items), loadError: '' })
        return
      }
      const [list, mine] = await Promise.all([api.get('/donations/campaigns'), api.get('/donations/me')])
      const balance = mine.points_balance
      this.setState({ campaigns: list.items, selectedId: this.firstId(list.items), balance, amount: unit(Math.min(1000, balance)), loadError: '', history: mine.items, historyTotal: mine.total })
    } catch (e) {
      this.setState({ loadError: e.message })
    }
  }

  async donate() {
    const { amount, selectedId, busy } = this.state
    const give = unit(amount)
    if (give <= 0 || busy) return
    this.setState({ busy: true, error: '' })
    try {
      const res = await api.post('/donations', { points: give, campaign_id: selectedId })
      const balance = res.points_balance
      const campaigns = this.state.campaigns.map((c) => (c.id === selectedId ? { ...c, raised: c.raised + give } : c))
      const title = campaigns.find((c) => c.id === selectedId)?.title
      const history = [{ campaign_id: selectedId, title, points: give, created_at: new Date().toISOString() }, ...this.state.history]
      this.setState({ campaigns, balance, last: give, amount: unit(Math.min(1000, balance)), done: true, busy: false, history, historyTotal: this.state.historyTotal + give })
    } catch (e) {
      this.setState({ error: e.message, busy: false })
    }
  }

  renderVals() {
    const { campaigns, selectedId, balance, amount, done, last, loadError, error, busy, showAll, history, historyTotal, historyAll } = this.state
    const clamp = (v) => Math.max(0, Math.min(balance, Math.round(Number(v) || 0)))
    const chips = [['+100', 100], ['+500', 500], ['+1,000', 1000], ['전액', -1]].map(([label, v]) => ({ label, add: () => this.setState({ amount: unit(v < 0 ? balance : clamp(this.state.amount + v)) }) }))

    const picked = campaigns.find((c) => c.id === selectedId)
    const campaign = picked ? { ...picked, look: LOOKS[picked.id] || DEFAULT_LOOK } : null
    // 기부처 둘러보기: 늘 같은 순서로, 지금 보는 기부처는 selected 표시. 처음엔 LIST_SIZE개만, 더보기를 누르면 전부
    const all = campaigns.map((c) => ({ ...c, look: LOOKS[c.id] || DEFAULT_LOOK, selected: c.id === selectedId,
      pick: () => { this.setState({ selectedId: c.id, error: '' }); window.scrollTo({ top: 0, behavior: 'smooth' }) } }))
    const list = showAll ? all : all.slice(0, LIST_SIZE)
    const moreCount = Math.max(0, all.length - LIST_SIZE)
    const percent = campaign && campaign.goal ? Math.min(100, Math.round((campaign.raised / campaign.goal) * 100)) : 0

    // 나의 기부 내역: 처음엔 HISTORY_SIZE개, 더보기를 누르면 전부
    const historyRows = (historyAll ? history : history.slice(0, HISTORY_SIZE)).map((h, i) => ({ key: `${h.created_at}-${i}`, title: h.title || '기부', dateText: dateText(h.created_at), pointsText: `${fmt(h.points)}P`, look: LOOKS[h.campaign_id] || DEFAULT_LOOK }))
    const historyMore = Math.max(0, history.length - HISTORY_SIZE)
    const guest = !this.props.loggedIn
    const donateText = guest ? '로그인하고 기부하기' : busy ? '기부하는 중…' : balance < 1 ? '포인트를 모으면 기부할 수 있어요' : `${fmt(amount)}P 기부하기`

    return { balance, amount, chips, done, campaign, list, moreCount, showAll, total: all.length, percent, loadError, error, busy,
      historyRows, historyMore, historyAll, historyEmpty: history.length === 0, historyCount: history.length,
      historyTotalLabel: guest ? '-' : `${fmt(historyTotal)}P`,
      historyEmptyText: guest ? '로그인하면 나의 기부 내역을 볼 수 있어요.' : '아직 기부한 내역이 없어요. 위에서 첫 기부를 해 보세요.',
      onToggleHistory: () => this.setState({ historyAll: !historyAll }),
      onToggleMore: () => this.setState({ showAll: !showAll }),
      guest, donateText,
      canDonate: guest || (unit(amount) > 0 && !busy),
      balanceText: fmt(balance), amountText: fmt(amount), doneText: fmt(last),
      balanceLabel: guest ? '로그인 후 확인' : `${fmt(balance)}P`, leftLabel: guest ? '-' : `${fmt(balance - amount)}P`,
      raisedText: campaign ? fmt(campaign.raised) : '0', goalText: campaign ? fmt(campaign.goal || 0) : '0',
      onInput: (e) => this.setState({ amount: clamp(e.target.value) }),
      onBlur: () => this.setState({ amount: unit(amount) }),
      onDonate: () => (guest ? this.props.onLogin?.() : this.donate()),
      onClose: () => this.setState({ done: false }) }
  }
}
