import { useSyncExternalStore } from 'react'

// 화면 폭이 이 값 이상이면 PC 시안, 미만이면 모바일 시안을 보여 줍니다.
export const PC_MIN_WIDTH = 1024
const query = `(min-width: ${PC_MIN_WIDTH}px)`

function subscribe(onChange) {
  const mq = window.matchMedia(query)
  mq.addEventListener('change', onChange)
  return () => mq.removeEventListener('change', onChange)
}

/** 지금 화면이 PC 폭인지 true/false. 창 크기를 바꾸면 자동으로 다시 계산됩니다. */
export default function useIsPc() {
  return useSyncExternalStore(subscribe, () => window.matchMedia(query).matches, () => false)
}
