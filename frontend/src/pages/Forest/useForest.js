// 2026-10-20: DB 007 응답과 5그루 자동 보상을 사용합니다. PC·모바일 공통 상태는 유지합니다.
import { useEffect, useRef, useState } from 'react'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'

const NAMES = ['새싹', '떡잎', '줄기', '묘목', '어린 나무', '큰 나무', '열매 나무']
const FRUITS = ['apple', 'pear', 'persimmon']
const FRUIT_NAMES = ['사과나무', '배나무', '감나무']

export default function useForest(isPc = false) {
  const query = useApi('/forest')
  const [latest, setLatest] = useState(null)
  const [busy, setBusy] = useState(false)
  const locked = useRef(false)
  const mounted = useRef(true)
  const timer = useRef(null)
  const [toast, setToast] = useState('')
  const [splash, setSplash] = useState(false)
  const [splashN, setSplashN] = useState(0)
  const [harvestResult, setHarvestResult] = useState(null)
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
  const water = (amount) => run(async () => {
    if (!Number.isInteger(amount) || amount <= 0) return
    const result = await api.post('/forest/water', { drops: amount })
    if (!mounted.current) return
    setLatest(result)
    setSplashN(amount)
    setSplash(true)
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
  const claim = (tier) => run(async () => {
    // 텀블러는 수확할 때 DB가 자동 처리합니다. 화면에서도 직접 요청하지 않습니다.
    if (![1, 2, 3].includes(tier)) { say('텀블러는 5그루째 수확할 때 자동으로 처리돼요.'); return }
    if (!window.confirm(`모아 둔 나무 ${Number(forest?.saved_trees || 0)}그루를 모두 사용해 선물 교환을 기록할까요? 실제 선물 전달·쿠폰 발급은 아직 준비 중입니다.`)) return
    const result = await api.post('/forest/rewards', { tier })
    if (!mounted.current) return
    setLatest(null)
    query.reload()
    // 교환 성공 후에만 팝업을 닫습니다. 취소·실패 시 선택 화면을 유지합니다.
    setChoosingGift(false)
    setHarvestResult(null)
    say(`${result.item} 교환 기록을 저장했어요. 나무 ${result.trees_spent}그루를 사용했습니다. 쿠폰 발급·보관은 준비 중이에요.`)
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
    busy: busy || query.loading, mutationReady, drops, splash, splashN, ready,
    stageNum: stage + 1, stageName: forest?.stage_name || NAMES[stage],
    caption: ready ? '나무가 모두 자랐어요. 수확하면 나무 종류가 공개됩니다.' : '물방울을 모은 뒤 물주기 버튼으로 키워보세요.',
    pct: cost ? `${Math.min(100, Math.round(progress / cost * 100))}%` : '0%',
    nextLine: ready ? '7단계 완성! 수확하면 랜덤 과일나무가 열려요.' :
      `${stage < 6 ? `다음 단계 ‘${NAMES[stage + 1]}’` : '수확'}까지 물방울 ${Math.max(cost - progress, 0)}개 · 현재 ${progress} / ${cost}`,
    growing: !ready, canHarvest: ready,
    canWater: mutationReady && !busy && !query.loading && !ready && drops > 0,
    onWater: () => water(1),
    onWaterAll: () => water(Math.min(drops, remaining)),
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
      say(`${harvestResult.auto_reward.item} 보상이 기록되었어요. 실제 선물 전달은 준비 중이에요.`)
      setChoosingGift(false)
      setHarvestResult(null)
    },
    // 수확 팝업이 닫힐 때까지 자동 보상 결과도 공통 상태에 유지합니다.
    autoReward: harvestResult?.auto_reward || null,
    harvestSavedTrees: Number(harvestResult?.saved_trees || 0),
    onRestart: () => { setChoosingGift(false); setHarvestResult(null) },
    harvested: (forest?.harvested || []).map(h => ({
      id: h.id, name: FRUIT_NAMES[FRUITS.indexOf(h.tree_type)] || h.tree_type,
      date: new Date(h.harvested_at).toLocaleDateString('ko-KR', { timeZone: 'Asia/Seoul' }),
      f0: h.tree_type === 'apple', f1: h.tree_type === 'pear', f2: h.tree_type === 'persimmon',
    })),
    harvestCount: forest?.harvested?.length || 0,
    savedTrees: Number(forest?.saved_trees || 0), onClaim: claim,
    hasToast: !!toast, toast,
  }
}
