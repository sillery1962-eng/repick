// 2026-10-20: DB 007 응답과 5그루 자동 보상을 사용합니다. PC·모바일 공통 상태는 유지합니다.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'

const NAMES = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']
const FRUITS = ['apple', 'pear', 'persimmon']
const FRUIT_NAMES = ['사과나무', '배나무', '감나무']
const GIFT_NAMES = { 1: '친환경 쿠폰', 2: '재활용 노트', 3: '에코백' }
const TREES_PER_PAGE = 8
const pause = ms => new Promise(resolve => window.setTimeout(resolve, ms))

async function loadTreeImage(type) {
  return new Promise((resolve, reject) => {
    const image = new Image()
    image.onload = () => resolve(image)
    image.onerror = () => reject(new Error('나무 이미지를 불러오지 못했어요.'))
    image.src = `/images/trees/${type}.png`
  })
}

function drawForestBackground(ctx, height) {
  const gradient = ctx.createLinearGradient(0, 0, 0, height)
  gradient.addColorStop(0, '#DDF0FB')
  gradient.addColorStop(.7, '#EEF7E6')
  gradient.addColorStop(1, '#F6EEDB')
  ctx.fillStyle = gradient
  ctx.fillRect(0, 0, 960, height)
}

async function canvasFile(canvas, name) {
  const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', .84))
  if (!blob) throw new Error('공유 이미지를 만들지 못했어요.')
  if (blob.size > 5 * 1024 * 1024) throw new Error('이미지가 5MB를 넘어요. 한 그루씩 공유해 주세요.')
  return new File([blob], name, { type: 'image/jpeg' })
}

async function makeSingleTreeImage(tree) {
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = 570
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('공유 이미지를 만들지 못했어요.')
  drawForestBackground(ctx, canvas.height)
  const type = tree.f0 ? 'apple' : tree.f1 ? 'pear' : 'persimmon'
  ctx.drawImage(await loadTreeImage(type), 300, 90, 360, 360)
  ctx.fillStyle = '#173D2A'
  ctx.textAlign = 'center'
  ctx.font = 'bold 38px sans-serif'
  ctx.fillText(tree.name, 480, 70)
  ctx.font = '22px sans-serif'
  ctx.fillText(`${tree.date} 수확 · 나의 과일나무`, 480, 505)
  return canvasFile(canvas, `repick-tree-${tree.id}.jpg`)
}

async function makeCollectionImage(trees) {
  // 전체 공유는 종류별 합계가 아니라 수확 기록 한 건당 카드 하나를 그립니다.
  const columns = 3
  const rows = Math.ceil(trees.length / columns)
  const cardWidth = 280
  const cardHeight = 264
  const gap = 18
  const top = 150
  const height = top + rows * (cardHeight + gap) + 50
  if (height > 16000) throw new Error('수확한 나무가 너무 많아 한 장의 이미지로 만들 수 없어요.')
  const canvas = document.createElement('canvas')
  canvas.width = 960
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('공유 이미지를 만들지 못했어요.')
  drawForestBackground(ctx, height)
  ctx.fillStyle = '#173D2A'
  ctx.textAlign = 'center'
  ctx.font = 'bold 38px sans-serif'
  ctx.fillText('나의 과일나무', 480, 75)
  ctx.font = 'bold 24px sans-serif'
  ctx.fillText(`수확한 나무 ${trees.length}그루`, 480, 115)
  for (const [index, tree] of trees.entries()) {
    const type = tree.f0 ? 'apple' : tree.f1 ? 'pear' : 'persimmon'
    const x = 42 + (index % columns) * (cardWidth + gap)
    const y = top + Math.floor(index / columns) * (cardHeight + gap)
    const cardBackground = ctx.createLinearGradient(x, y, x, y + cardHeight)
    cardBackground.addColorStop(0, '#DDF0FB')
    cardBackground.addColorStop(.7, '#EEF7E6')
    cardBackground.addColorStop(1, '#F6EEDB')
    ctx.fillStyle = cardBackground
    ctx.beginPath()
    ctx.roundRect(x, y, cardWidth, cardHeight, 20)
    ctx.fill()
    const image = await loadTreeImage(type)
    ctx.drawImage(image, x + 44, y + 8, 192, 192)
    ctx.fillStyle = '#173D2A'
    ctx.font = 'bold 19px sans-serif'
    ctx.fillText(tree.name, x + cardWidth / 2, y + 216)
    ctx.font = '15px sans-serif'
    ctx.fillText(`${index + 1}번째 수확 · ${tree.date}`, x + cardWidth / 2, y + 244)
  }
  ctx.fillStyle = '#375B43'
  ctx.font = '18px sans-serif'
  ctx.fillText('물방울로 키운 나의 숲 · RePick', 480, height - 19)
  return canvasFile(canvas, 'repick-my-trees.jpg')
}

export default function useForest(isPc = false) {
  const query = useApi('/forest')
  const [latest, setLatest] = useState(null)
  const [busy, setBusy] = useState(false)
  const [shareBusy, setShareBusy] = useState(false)
  const sharing = useRef(false)
  const [shareChoice, setShareChoice] = useState(null)
  const [shareMode, setShareMode] = useState('single')
  const [shareTreeId, setShareTreeId] = useState(null)
  const [shareError, setShareError] = useState('')
  const [shareStep, setShareStep] = useState('choose')
  const [shareFile, setShareFile] = useState(null)
  const [sharePreviewUrl, setSharePreviewUrl] = useState(null)
  const [shareText, setShareText] = useState('')
  useEffect(() => () => { if (sharePreviewUrl) URL.revokeObjectURL(sharePreviewUrl) }, [sharePreviewUrl])
  const locked = useRef(false)
  const mounted = useRef(true)
  const timer = useRef(null)
  const [toast, setToast] = useState('')
  const [splash, setSplash] = useState(false)
  const [growthStage, setGrowthStage] = useState(null)
  const [pendingGift, setPendingGift] = useState(null)
  const [giftError, setGiftError] = useState('')
  const [harvestResult, setHarvestResult] = useState(null)
  // null이면 최근 수확한 나무가 있는 마지막 페이지를 보여 줍니다.
  const [harvestPage, setHarvestPage] = useState(null)
  const previousHarvestCount = useRef(null)
  // 선물 선택 화면도 PC·모바일 전환 시 그대로 유지합니다.
  const [choosingGift, setChoosingGift] = useState(false)

  useEffect(() => {
    mounted.current = true
    return () => { mounted.current = false; clearTimeout(timer.current) }
  }, [])
  // 다른 화면에서 인증한 뒤 돌아오면 변경된 잔액을 조회합니다.
  useEffect(() => {
    const refresh = () => {
      if (locked.current) return
      setLatest(null)
      query.reload()
    }
    window.addEventListener('focus', refresh)
    return () => window.removeEventListener('focus', refresh)
  }, [query.reload])
  const forest = latest || query.data
  const stage = Math.max(0, Math.min(6, Number(forest?.stage || 1) - 1))
  const progress = Number(forest?.drops_in_stage || 0)
  const cost = Number(forest?.drops_to_next || 0)
  const ready = forest?.harvest_ready === true
  const drops = Number(forest?.drops_balance || 0)
  const remaining = Math.max(55 - Number(forest?.watered_in_cycle || 0), 0)
  const mutationReady = forest?.mutations_ready === true
  // 선물 계산에는 수확 목록 전체를 유지하고, 화면에서만 8그루씩 표시합니다.
  const harvested = (forest?.harvested || []).map(h => ({
    id: h.id, name: FRUIT_NAMES[FRUITS.indexOf(h.tree_type)] || h.tree_type,
    date: new Date(h.harvested_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
    f0: h.tree_type === 'apple', f1: h.tree_type === 'pear', f2: h.tree_type === 'persimmon',
  }))
  const harvestPageCount = Math.max(1, Math.ceil(harvested.length / TREES_PER_PAGE))
  const visibleHarvestPage = harvestPage === null ? harvestPageCount : Math.min(harvestPage, harvestPageCount)
  useEffect(() => {
    if (previousHarvestCount.current !== null && harvested.length > previousHarvestCount.current) {
      setHarvestPage(null)
    }
    previousHarvestCount.current = harvested.length
  }, [harvested.length])

  const say = (message) => {
    if (!mounted.current) return
    setToast(message)
    clearTimeout(timer.current)
    timer.current = setTimeout(() => {
      if (mounted.current) { setToast(''); setSplash(false) }
    }, 2500)
  }
  const run = async (operation) => {
    if (locked.current || query.loading) return
    if (!mutationReady) { say('물주기·수확을 연결할 DB 처리 함수를 확인 중입니다.'); return }
    locked.current = true
    setBusy(true)
    try { await operation() }
    catch (error) {
      // 변경 요청은 자동 재시도하지 않습니다. 서버 상태만 다시 조회합니다.
      setLatest(null)
      query.reload()
      say(error.message || '처리 결과를 확인하지 못했어요. 현재 상태를 다시 불러옵니다.')
    } finally {
      locked.current = false
      if (mounted.current) setBusy(false)
    }
  }
  const water = (amount, all = false) => run(async () => {
    if (!Number.isInteger(amount) || amount <= 0) return
    const fromStage = Number(forest?.stage || 1)
    const result = await api.post('/forest/water', { drops: amount })
    if (!mounted.current) return
    setSplash(true)
    if (all) {
      // 물주기는 서버에 한 번만 요청합니다. 이후 단계 변화는 서버 결과까지의 화면 연출입니다.
      setGrowthStage(1)
      await pause(850)
      if (!mounted.current) return
      setSplash(false)
      const target = Math.max(fromStage, Math.min(7, Number(result.stage || fromStage)))
      const reduceMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches
      if (!reduceMotion) for (let step = 2; step <= target; step++) {
        await pause(480)
        if (!mounted.current) return
        setGrowthStage(step)
      }
      await pause(reduceMotion ? 0 : 700)
      if (!mounted.current) return
      setGrowthStage(null)
    }
    setLatest(result)
    say(result.harvest_ready ? '나무가 모두 자랐어요. 수확해 보세요!' : '물방울을 주었어요. 나무가 자라고 있어요!')
  })
  const harvest = () => run(async () => {
    const result = await api.post('/forest/harvest')
    if (!mounted.current) return
    // DB가 자동 보상을 이미 기록했으므로 추가 교환 요청을 보내지 않습니다.
    setChoosingGift(false)
    setHarvestResult(result)
    setLatest(null)
    query.reload()
  })
  const openSharePicker = (tree) => {
    if (!harvested.length || sharing.current || locked.current) return
    const selected = tree?.id ? tree : harvested[0]
    setShareTreeId(selected.id)
    setShareMode('single')
    setShareError('')
    setShareStep('choose')
    setShareFile(null)
    setSharePreviewUrl(null)
    setShareText('')
    setShareChoice(selected.id)
  }
  const prepareShare = async () => {
    if (sharing.current || locked.current || !shareChoice) return
    const tree = harvested.find(item => item.id === shareTreeId)
    if (shareMode === 'single' && !tree) {
      setShareError('공유할 나무를 선택해 주세요.')
      return
    }
    if (shareMode === 'all' && !harvested.length) return
    sharing.current = true
    setShareBusy(true)
    setShareError('')
    try {
      const file = shareMode === 'all' ? await makeCollectionImage(harvested) : await makeSingleTreeImage(tree)
      if (!mounted.current) return
      setShareFile(file)
      setSharePreviewUrl(URL.createObjectURL(file))
      setShareStep('compose')
    } catch (error) {
      if (mounted.current) setShareError(error.message || '공유 사진을 만들지 못했어요.')
    } finally {
      sharing.current = false
      if (mounted.current) setShareBusy(false)
    }
  }
  const shareHarvestedTree = async () => {
    if (sharing.current || locked.current || !shareChoice || !shareFile || shareStep !== 'compose') return
    if (!shareText.trim()) { setShareError('게시글을 입력해 주세요.'); return }
    sharing.current = true
    setShareBusy(true)
    setShareError('')
    try {
      const body = new FormData()
      body.append('content', shareText.trim())
      body.append('image', shareFile)
      body.append('is_verification', 'false')
      await api.post('/posts', body)
      if (mounted.current) {
        setShareChoice(null)
        setShareFile(null)
        setSharePreviewUrl(null)
        say('커뮤니티에 나무를 공유했어요! 커뮤니티에서 확인해 보세요.')
      }
    } catch (error) {
      if (mounted.current) setShareError(error.message || '커뮤니티에 올리지 못했어요. 다시 시도해 주세요.')
    } finally {
      sharing.current = false
      if (mounted.current) setShareBusy(false)
    }
  }
  const claim = () => run(async () => {
    const tier = pendingGift
    if (![1, 2, 3].includes(tier)) return
    let beforeIds = null
    try {
      const before = await api.get('/me/coupons')
      beforeIds = new Set((before.items || []).map(item => item.id))
    } catch { /* 쿠폰함을 미리 확인할 수 없어도 교환 요청은 진행합니다. */ }
    let result
    try {
      result = await api.post('/forest/rewards', { tier })
    } catch (error) {
      setGiftError(error.message || '쿠폰 카드를 발급하지 못했어요.')
      setLatest(null)
      query.reload()
      return
    }
    if (!mounted.current) return
    setPendingGift(null)
    setLatest(null)
    query.reload()
    setChoosingGift(false)
    setHarvestResult(null)
    // 저장은 POST 성공으로 끝납니다. 조회 실패 시 재요청해서 나무를 또 쓰지 않습니다.
    try {
      const coupons = await api.get('/me/coupons')
      const found = (coupons.items || []).find(item => item.tier === tier && item.item === result.item && item.code && (!beforeIds || !beforeIds.has(item.id)))
      say(found ? `${result.item} 쿠폰 카드가 발행됐어요. 나무 ${result.trees_spent}그루 사용, ${result.saved_trees}그루 남았어요. 마이페이지 쿠폰함에서 확인하세요.` : `${result.item} 교환은 완료됐어요. 쿠폰함에 표시되는지 마이페이지에서 확인해 주세요.`)
    } catch {
      say(`${result.item} 교환은 완료됐어요. 쿠폰함 조회에 실패했으니 마이페이지에서 확인해 주세요.`)
    }
  })
  const fruit = FRUITS.indexOf(harvestResult?.tree_type)
  const flags = Object.fromEntries(NAMES.map((_, index) => ['t' + index, stage === index]))
  const fruitFlags = Object.fromEntries(FRUITS.map((_, index) => ['f' + index, fruit === index]))
  const track = NAMES.map((name, index) => ({
    name, ...Object.fromEntries(NAMES.map((_, k) => ['k' + k, index === k])),
    ring: `width: ${isPc ? 56 : 44}px; height: ${isPc ? 56 : 44}px; border-radius: 50%; display: flex; align-items: center; justify-content: center; background: ${index === stage ? '#FFFFFF' : 'rgba(255,255,255,0.5)'}; ${index === stage ? 'box-shadow: 0 0 0 3px #121614;' : ''} opacity: ${index <= stage ? 1 : 0.45};`,
    label: `font-size: 11px; text-align: center; ${index === stage ? 'font-weight: 800;' : 'color: #5E645F;'}`,
  }))
  return {
    ...flags, ...fruitFlags, track,
    loading: query.loading && !forest, error: query.error,
    retry: () => { setLatest(null); query.reload() },
    // 변경 직후 조회가 끝나기 전에는 이전 상태로 버튼을 다시 누를 수 없게 합니다.
    busy: busy || shareBusy || query.loading, mutationReady, drops, splash, growthStage, ready,
    stageNum: stage + 1, stageName: forest?.stage_name || NAMES[stage],
    caption: ready ? '나무가 모두 자랐어요. 수확하면 나무 종류가 공개됩니다.' : '물방울을 모은 뒤 물주기 버튼으로 키워보세요.',
    pct: cost ? `${Math.min(100, Math.round(progress / cost * 100))}%` : '0%',
    nextLine: ready ? '7단계 완성! 수확하면 랜덤 과일나무가 열려요.' :
      `${stage < 6 ? `다음 단계 ‘${NAMES[stage + 1]}’` : '수확'}까지 물방울 ${Math.max(cost - progress, 0)}개 · 현재 ${progress} / ${cost}`,
    growing: !ready, canHarvest: ready,
    canWater: mutationReady && !busy && !query.loading && !ready && drops > 0,
    onWater: () => water(1),
    onWaterAll: () => water(Math.min(drops, remaining), true),
    onHarvest: harvest,
    modal: !!harvestResult, fruitName: FRUIT_NAMES[fruit] || '',
    fruitTitle: ['탐스러운 사과가 열렸어요!', '탐스러운 배가 열렸어요!', '탐스러운 감이 열렸어요!'][fruit] || '나만의 과일나무가 자랐어요!',
    choosingGift,
    availableGifts: harvestResult?.available_gifts || [],
    onChooseGift: () => setChoosingGift(true),
    onBackToHarvest: () => setChoosingGift(false),
    // 자동 보상은 DB에 기록되어 있습니다. 확인 버튼은 지급 API를 호출하지 않습니다.
    onReceiveAutoReward: () => {
      if (!harvestResult?.auto_reward) return
      say(`${harvestResult.auto_reward.item} 쿠폰 카드가 발행됐어요. 마이페이지 쿠폰함에서 확인하세요.`)
      setChoosingGift(false)
      setHarvestResult(null)
    },
    // 수확 팝업이 닫힐 때까지 자동 보상 결과도 공통 상태에 유지합니다.
    autoReward: harvestResult?.auto_reward || null,
    harvestSavedTrees: Number(harvestResult?.saved_trees || 0),
    onRestart: () => { setChoosingGift(false); setHarvestResult(null) },
    harvested,
    onShareHarvestedTree: openSharePicker,
    shareChoice, shareMode, shareTreeId, shareError, shareStep, sharePreviewUrl, shareText,
    onShareMode: mode => { setShareMode(mode); setShareError('') },
    onShareTreeId: id => { setShareTreeId(id); setShareError('') },
    onShareText: text => { setShareText(text); setShareError('') },
    onPrepareShare: prepareShare,
    onCloseSharePicker: () => { if (!sharing.current) { setShareChoice(null); setShareFile(null); setSharePreviewUrl(null) } },
    onSubmitShare: shareHarvestedTree,
    shareBusy,
    harvestedPageItems: [...harvested].reverse().slice((visibleHarvestPage - 1) * TREES_PER_PAGE, visibleHarvestPage * TREES_PER_PAGE),
    harvestPage: visibleHarvestPage,
    harvestPageCount,
    onPreviousHarvestPage: () => setHarvestPage(page => Math.max(1, (page === null ? harvestPageCount : Math.min(page, harvestPageCount)) - 1)),
    onNextHarvestPage: () => setHarvestPage(page => Math.min(harvestPageCount, (page === null ? harvestPageCount : page) + 1)),
    harvestCount: forest?.harvested?.length || 0,
    savedTrees: Number(forest?.saved_trees || 0),
    pendingGift, pendingGiftName: GIFT_NAMES[pendingGift] || '', giftError,
    onClaim: tier => {
      if (![1, 2, 3].includes(tier)) { say('텀블러는 다섯 번째 수확 때 자동으로 받아요.'); return }
      if (busy || !mutationReady || Number(harvestResult?.saved_trees ?? forest?.saved_trees ?? 0) < tier) return
      setGiftError('')
      setPendingGift(tier)
    },
    onCancelClaim: () => { if (!busy) { setPendingGift(null); setGiftError('') } },
    onConfirmClaim: claim,
    hasToast: !!toast, toast,
  }
}
