// 성장 이미지만 2초간 미리 봅니다. 물방울·단계·DB를 변경하는 요청은 하지 않습니다.
import { useEffect, useRef, useState } from 'react'

export default function useStagePreview(forest) {
  const actualStage = Math.max(1, Math.min(7, Number(forest.stageNum) || 1))
  const [previewStage,setPreviewStage] = useState(null)
  const timer = useRef(null)
  const clearPreview = () => {
    clearTimeout(timer.current)
    timer.current = null
    setPreviewStage(null)
  }
  // 물주기·수확으로 실제 상태가 바뀌거나 화면을 떠나면 미리보기를 종료합니다.
  useEffect(()=>{
    clearPreview()
    return ()=>clearTimeout(timer.current)
  },[actualStage,forest.drops,forest.splash,forest.busy,forest.loading])
  const validPreview = Number.isInteger(previewStage) && previewStage >= 1 && previewStage < actualStage && !forest.busy && !forest.loading
  const displayStage = validPreview ? previewStage : actualStage
  const previewing = validPreview
  const displayName = previewing ? forest.track?.[displayStage-1]?.name || `${displayStage}단계` : forest.stageName
  const onPreviewStage = stage => {
    if (!Number.isInteger(stage) || stage < 1 || stage > actualStage || forest.busy || forest.loading) return
    clearPreview()
    if (stage === actualStage) return
    setPreviewStage(stage)
    timer.current = setTimeout(()=>{ timer.current=null; setPreviewStage(null) },2000)
  }
  return { displayStage,displayName,previewing,onPreviewStage }
}
