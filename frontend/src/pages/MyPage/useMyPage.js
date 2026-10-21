import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../../api/client'
import { useApi } from '../../api/useApi'
import { supabase } from '../../lib/supabase'

/*
  마이페이지 데이터 (PC·모바일 공용). 담당: 오지원
  - 회원 정보: GET/PATCH /me (닉네임·자치구)
  - 잔액: GET /points (물방울·포인트)
  - 나무 단계·수확한 나무: GET /forest
  - 쿠폰함: GET /me/coupons (나무 수확 보너스로 받은 사은품 = 쿠폰)
  - 내 활동: GET /me/activity (내 글 · 받은 댓글 · 내가 쓴 댓글)
  나의 기부 내역은 기부하기 화면 아래에 있습니다 (GET /donations/me).
*/

export const GU_LIST = ['강남구', '강동구', '강북구', '강서구', '관악구', '광진구', '구로구', '금천구', '노원구', '도봉구', '동대문구', '동작구', '마포구', '서대문구', '서초구', '성동구', '성북구', '송파구', '양천구', '영등포구', '용산구', '은평구', '종로구', '중구', '중랑구']

const fmt = (n) => Number(n || 0).toLocaleString('ko-KR')

/** 2026-10-21T05:00:00Z → "10분 전" · "어제" · "10.19" (한국 시간) */
export function ago(iso) {
  const t = new Date(iso).getTime()
  const min = Math.floor((Date.now() - t) / 60000)
  if (min < 1) return '방금'
  if (min < 60) return `${min}분 전`
  if (min < 60 * 24) return `${Math.floor(min / 60)}시간 전`
  if (min < 60 * 48) return '어제'
  return shortDate(iso)
}

/** "10.19" (한국 날짜) */
export function shortDate(iso) {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000)
  return `${d.getUTCMonth() + 1}.${String(d.getUTCDate()).padStart(2, '0')}`
}

/** "2026.10.20" (한국 날짜) */
export function fullDate(iso) {
  const d = new Date(new Date(iso).getTime() + 9 * 3600 * 1000)
  return `${d.getUTCFullYear()}.${String(d.getUTCMonth() + 1).padStart(2, '0')}.${String(d.getUTCDate()).padStart(2, '0')}`
}

export default function useMyPage() {
  const navigate = useNavigate()
  const me = useApi('/me')
  const points = useApi('/points')
  const forest = useApi('/forest')
  const coupons = useApi('/me/coupons')
  const activity = useApi('/me/activity')

  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editError, setEditError] = useState('')

  const profile = me.data || {}
  const forestData = forest.data || {}
  const stageText = forestData.stage ? `${forestData.stage_name || ''} ${forestData.stage} / 7단계`.trim() : ''

  /** 프로필 저장: 닉네임·자치구 → PATCH /me */
  async function saveProfile({ nickname, region }) {
    const name = nickname.trim()
    if (!name) { setEditError('닉네임을 입력해 주세요.'); return }
    setSaving(true)
    setEditError('')
    try {
      await api.patch('/me', { nickname: name, region })
      me.reload()
      setEditing(false)
    } catch (e) {
      setEditError(e.message)
    } finally {
      setSaving(false)
    }
  }

  /** 로그아웃 → 홈 화면. 홈으로 먼저 옮긴 뒤 로그아웃합니다.
      (마이페이지는 로그인해야 보는 화면이라, 로그아웃이 먼저 되면 문지기 RequireAuth가 로그인 화면으로 보내 버림) */
  async function logout() {
    navigate('/', { replace: true })
    const { error } = await supabase.auth.signOut()
    if (error) console.error('로그아웃 실패:', error)
  }

  return {
    loading: me.loading,
    error: me.error,
    nickname: profile.nickname || '',
    region: profile.region || '',
    subline: [profile.region, stageText].filter(Boolean).join(' · '),
    stats: [
      { label: '포인트', value: points.data ? `${fmt(points.data.points_balance)}P` : '-', go: '포인트', to: '/points', tone: 'ink' },
      { label: '물방울', value: points.data ? `${fmt(points.data.drops_balance)}개` : '-', go: '나의 숲', to: '/forest', tone: 'drop' },
      { label: '수확한 나무', value: forest.data ? `${fmt((forestData.harvested || []).length)}그루` : '-', go: '컬렉션', to: '/forest', tone: 'green' },
    ],
    drops: points.data ? fmt(points.data.drops_balance) : '-',
    pointsShort: points.data ? fmt(points.data.points_balance) : '-',
    coupons: coupons.data?.items || [],
    couponsLoading: coupons.loading,
    couponsError: coupons.error?.message || '',
    activity: activity.data || { posts: [], received_comments: [], my_comments: [] },
    activityLoading: activity.loading,
    activityError: activity.error?.message || '',
    editing, saving, editError,
    openEdit: () => { setEditError(''); setEditing(true) },
    closeEdit: () => setEditing(false),
    saveProfile,
    logout,
  }
}
