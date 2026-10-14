import { useEffect, useReducer, useState } from 'react'

/*
  시안(claude.ai Design 캔버스)의 화면 로직을 React에서 그대로 쓰기 위한 작은 도구입니다.
  시안 파일은 각 화면 로직을 `class Component extends DCLogic { renderVals() {...} }` 형태로 적어 두었는데,
  그 코드를 고치지 않고 붙여 넣어도 동작하게 해 줍니다.

  - this.state / this.setState(...)  : React의 state처럼 동작 (값이 바뀌면 화면 다시 그림)
  - componentDidMount / componentWillUnmount : 화면이 열릴 때·닫힐 때 한 번씩 실행
  - renderVals()가 돌려준 객체를 화면(JSX)에서 V.이름 으로 꺼내 씁니다.
*/
export class DCLogic {
  constructor(props) {
    this.props = props || {}
    this.state = {}
  }
}

export function useDcLogic(Logic, props) {
  const [, rerender] = useReducer((n) => n + 1, 0)
  // 화면이 처음 열릴 때 한 번만 로직 객체를 만들어 계속 같은 것을 씁니다
  const [inst] = useState(() => {
    const created = new Logic(props || {})
    created.setState = (patch, done) => {
      const next = typeof patch === 'function' ? patch(created.state, created.props) : patch
      created.state = { ...created.state, ...next }
      rerender()
      if (done) done()
    }
    created.forceUpdate = () => rerender()
    return created
  })

  useEffect(() => {
    inst.componentDidMount?.()
    return () => inst.componentWillUnmount?.()
  }, [inst])

  return inst.renderVals()
}

/** 시안에서 문자열로 만든 style("color: red; font-size: 14px")을 React style 객체로 바꿉니다. */
export function css(text) {
  const out = {}
  if (!text) return out
  let depth = 0
  let cur = ''
  const parts = []
  for (const ch of String(text)) {
    if (ch === '(') depth++
    if (ch === ')') depth--
    if (ch === ';' && depth === 0) { parts.push(cur); cur = '' } else cur += ch
  }
  parts.push(cur)
  for (const p of parts) {
    const i = p.indexOf(':')
    if (i < 0) continue
    const key = p.slice(0, i).trim()
    const value = p.slice(i + 1).trim()
    if (!key || !value) continue
    const name = key.startsWith('--')
      ? key
      : key.replace(/^-(webkit|moz|ms)-/, (_, v) => v[0].toUpperCase() + v.slice(1) + '-').replace(/-([a-z])/g, (_, c) => c.toUpperCase())
    out[name] = value
  }
  return out
}
